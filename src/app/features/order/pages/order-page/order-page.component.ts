import { Component, inject, signal, computed } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { CartService } from '../../../cart/cart.service';
import { Router } from '@angular/router';

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
  private readonly router = inject(Router);
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
      country: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)],
      }),
      city: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)],
      }),
      street: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)],
      }),
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

  constructor() {
    const deliveryControls = this.orderForm.controls.delivery.controls;
    const optionControl = deliveryControls.option;
    const customDateControl = deliveryControls.customDate;

    optionControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((option) => {
      if (option === 'custom') {
        customDateControl.addValidators(Validators.required);
      } else {
        customDateControl.removeValidators(Validators.required);
        customDateControl.setValue('');
      }
      customDateControl.updateValueAndValidity();
    });
  }
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
    if (this.cartItems().length === 0 || this.orderForm.invalid) {
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

    this.cartService.markOrderAsSubmitted();
    this.cartService.clearCart();
    void this.router.navigate(['/order/thank-you']);
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
        return this.orderForm.controls.delivery.valid;
      default:
        return true;
    }
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

  protected decreaseCartItem(productId: number, quantity: number): void {
    if (quantity === 1) {
      this.cartService.removeFromCart(productId);
      return;
    }
    this.cartService.updateQuantity(productId, quantity - 1);
  }

  protected removeCartItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }
}
