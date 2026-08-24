import { Injectable, computed, effect, signal, inject } from '@angular/core';
import type { ProductCard } from '../products/product';
import { ProductsService } from '../products/products.service';
export interface CartItem {
  product: ProductCard;
  quantity: number;
}

interface StoredCartItem {
  productId: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly storageKey = 'cartItems';

  private readonly productsService = inject(ProductsService);

  private readonly storedItems = signal<StoredCartItem[]>(this.loadCartItems());

  readonly items = computed<CartItem[]>(() => {
    const products = this.productsService.productCards();
    const productById = new Map(products.map((product) => [product.id, product]));

    return this.storedItems().flatMap((storedItem) => {
      const product = productById.get(storedItem.productId);
      if (!product) {
        return [];
      }
      return { product, quantity: storedItem.quantity };
    });
  });

  private readonly orderSubmitted = signal(false);

  readonly isOrderSubmitted = this.orderSubmitted.asReadonly();

  markOrderAsSubmitted(): void {
    this.orderSubmitted.set(true);
  }

  resetOrderSubmission(): void {
    this.orderSubmitted.set(false);
  }

  readonly totalQuantity = computed(() =>
    this.items().reduce((total, item) => total + item.quantity, 0),
  );

  readonly totalPrice = computed(() =>
    this.items().reduce((total, item) => total + item.product.price * item.quantity, 0),
  );

  constructor() {
    effect(() => {
      localStorage.setItem(this.storageKey, JSON.stringify(this.storedItems()));
    });
  }

  addToCart(product: ProductCard, quantity = 1): void {
    const safeQuantity = Math.max(1, quantity);

    this.storedItems.update((items) => {
      const existingItem = items.find((item) => item.productId === product.id);

      if (!existingItem) {
        return [...items, { productId: product.id, quantity: safeQuantity }];
      }

      return items.map((item) =>
        item.productId === product.id ? { ...item, quantity: item.quantity + safeQuantity } : item,
      );
    });
  }

  private loadCartItems(): StoredCartItem[] {
    const savedCart = localStorage.getItem(this.storageKey);

    if (!savedCart) {
      return [];
    }

    try {
      const parsedCart: unknown = JSON.parse(savedCart);

      if (!Array.isArray(parsedCart)) {
        return [];
      }

      return parsedCart.filter((item) => this.isStoredCartItem(item));
    } catch {
      return [];
    }
  }

  private isStoredCartItem(value: unknown): value is StoredCartItem {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const item = value as Record<string, unknown>;

    return (
      typeof item['productId'] === 'string' &&
      typeof item['quantity'] === 'number' &&
      item['quantity'] > 0
    );
  }

  updateQuantity(productId: string, quantity: number): void {
    const safeQuantity = Math.max(1, Math.floor(quantity));

    this.storedItems.update((items) =>
      items.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: safeQuantity,
            }
          : item,
      ),
    );
  }

  removeFromCart(productId: string): void {
    this.storedItems.update((items) => items.filter((item) => item.productId !== productId));
  }

  clearCart(): void {
    this.storedItems.set([]);
  }
}
