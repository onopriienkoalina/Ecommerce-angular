import { Component, inject, signal, computed } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { CartService } from '../../../cart/cart.service';
type PaymentMethod = 'card' | 'paypal' | 'cash';
type DeliveryOption = 'today' | 'tomorrow' | 'custom';

@Component({
  selector: 'app-order-page',
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
  templateUrl: './order-page.component.html',
  styleUrl: './order-page.component.css',
})
export class OrderPageComponent {
  private readonly cartService = inject(CartService);
  protected readonly currentStep = signal(1);
  protected readonly cartItems = this.cartService.items;
  protected readonly cartTotalQuantity = this.cartService.totalQuantity;
  protected readonly cartTotalPrice = this.cartService.totalPrice;

  protected readonly orderForm = new FormGroup({
    product: new FormGroup({
      productId: new FormControl<number | null>(this.cartItems()[0]?.product.id ?? null, {
        validators: [Validators.required],
      }),
    }),

    address: new FormGroup({
      country: new FormControl(''),
      city: new FormControl(''),
      street: new FormControl(''),
    }),

    payment: new FormGroup({
      method: new FormControl<PaymentMethod>('card', {
        nonNullable: true,
      }),
    }),

    delivery: new FormGroup({
      option: new FormControl<DeliveryOption>('today', {
        nonNullable: true,
      }),
      customDate: new FormControl('', {
        nonNullable: true,
      }),
    }),
  });

  protected readonly selectedProductId = toSignal(
    this.orderForm.controls.product.controls.productId.valueChanges.pipe(
      startWith(this.orderForm.controls.product.controls.productId.value),
    ),
    {
      initialValue: this.orderForm.controls.product.controls.productId.value,
    },
  );

  protected readonly selectedCartItem = computed(() => {
    const productId = this.selectedProductId();
    return this.cartItems().find((item) => item.product.id === productId) ?? null;
  });

  protected readonly deliveryOption = toSignal(
    this.orderForm.controls.delivery.controls.option.valueChanges.pipe(
      startWith(this.orderForm.controls.delivery.controls.option.value),
    ),
    {
      initialValue: this.orderForm.controls.delivery.controls.option.value,
    },
  );

  protected shouldShowCustomDate(): boolean {
    return this.deliveryOption() === 'custom';
  }

  protected goToNextStep(): void {
    if (!this.isCurrentStepValid()) {
      this.markCurrentStepAsTouched();
      return;
    }
    this.currentStep.update((step) => Math.min(step + 1, 5));
  }

  protected goToPreviousStep(): void {
    this.currentStep.update((step) => Math.max(step - 1, 1));
  }

  protected submitOrder(): void {
    if (this.cartItems().length === 0 || this.orderForm.invalid || !this.isDeliveryStepValid()) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const formValue = this.orderForm.getRawValue();

    const orderData = {
      items: this.cartItems().map((item) => ({
        productId: item.product.id,
        title: item.product.title,
        quantity: item.quantity,
        unitPrice: item.product.price,
      })),
      address: formValue.address,
      payment: formValue.payment,
      delivery: formValue.delivery,
      totalQuantity: this.cartTotalQuantity(),
      totalPrice: this.cartTotalPrice(),
    };
    console.log('Submitted order:', orderData);
  }

  private isCurrentStepValid(): boolean {
    switch (this.currentStep()) {
      case 1:
        return this.cartItems().length > 0 && this.orderForm.controls.product.valid;
      case 2:
        return this.orderForm.controls.address.valid;
      case 3:
        return this.orderForm.controls.payment.valid;
      case 4:
        return this.isDeliveryStepValid();
      default:
        return true;
    }
  }

  private isDeliveryStepValid(): boolean {
    const delivery = this.orderForm.controls.delivery.getRawValue();

    if (delivery.option !== 'custom') {
      return true;
    }

    return delivery.customDate.trim().length > 0;
  }

  private markCurrentStepAsTouched(): void {
    switch (this.currentStep()) {
      case 1:
        this.orderForm.controls.product.markAllAsTouched();
        break;

      case 2:
        this.orderForm.controls.address.markAllAsTouched();
        break;

      case 3:
        this.orderForm.controls.payment.markAllAsTouched();
        break;

      case 4:
        this.orderForm.controls.delivery.markAllAsTouched();
        break;
    }
  }

  protected increaseCartItem(productId: number, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity + 1);
  }

  protected decreaseCartItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }
}
