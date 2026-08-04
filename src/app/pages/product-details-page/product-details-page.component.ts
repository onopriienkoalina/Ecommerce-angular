import { Component, inject, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged, map, tap } from 'rxjs';
import { ProductsService } from '../../features/products/products.service';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../features/cart/cart.service';

@Component({
  selector: 'app-product-details-page',
  imports: [CurrencyPipe],
  templateUrl: './product-details-page.component.html',
  styleUrl: './product-details-page.component.css',
})
export class ProductDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly productsService = inject(ProductsService);
  protected readonly selectedImage = signal<string | null>(null);
  protected readonly quantity = signal<number>(1);
  private readonly cartService = inject(CartService);

  private readonly productId = toSignal(
    this.route.paramMap.pipe(
      map((params) => Number(params.get('id'))),
      distinctUntilChanged(),
      tap(() => {
        this.selectedImage.set(null);
        this.quantity.set(1);
      }),
    ),
    { initialValue: 0 },
  );

  protected readonly product = computed(() =>
    this.productsService.getProductById(this.productId()),
  );

  protected readonly currentImage = computed(() => {
    const product = this.product();

    if (!product) {
      return '';
    }
    const selectedImage = this.selectedImage();

    if (selectedImage && product.galleryImages.includes(selectedImage)) {
      return selectedImage;
    }

    return product.galleryImages[0] ?? product.imageUrl ?? '';
  });

  protected selectImage(imageUrl: string): void {
    this.selectedImage.set(imageUrl);
  }
  protected showNextImage(images: readonly string[]): void {
    if (images.length === 0) {
      return;
    }
    const currentIndex = images.findIndex((image) => image === this.currentImage());
    const nextIndex =
      currentIndex === -1 || currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    const nextImage = images[nextIndex];

    if (nextImage) {
      this.selectedImage.set(nextImage);
    }
  }

  protected showPreviousImage(images: readonly string[]): void {
    if (images.length === 0) {
      return;
    }

    const currentIndex = images.findIndex((image) => image === this.currentImage());
    const previousIndex = currentIndex <= 0 ? images.length - 1 : currentIndex - 1;
    const previousImage = images[previousIndex];

    if (previousImage) {
      this.selectedImage.set(previousImage);
    }
  }

  protected increaseQuantity(): void {
    this.quantity.update((value) => value + 1);
  }

  protected decreaseQuantity(): void {
    this.quantity.update((value) => Math.max(value - 1, 1));
  }

  protected addToCart(): void {
    const product = this.product();
    if (!product) {
      return;
    }
    this.cartService.addToCart(product, this.quantity());
  }
}
