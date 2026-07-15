import { Injectable, computed, effect, signal } from '@angular/core';
import type { ProductCard } from '../products/product';

export interface CartItem {
  product: ProductCard;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly storageKey = 'cartItems';

  private readonly cartItems = signal<CartItem[]>(this.loadCartItems());

  readonly items = this.cartItems.asReadonly();

  readonly totalQuantity = computed(() =>
    this.cartItems().reduce((total, item) => total + item.quantity, 0),
  );

  readonly totalPrice = computed(() =>
    this.cartItems().reduce((total, item) => total + item.product.price * item.quantity, 0),
  );

  constructor() {
    effect(() => {
      localStorage.setItem(this.storageKey, JSON.stringify(this.cartItems()));
    });
  }

  addToCart(product: ProductCard, quantity = 1): void {
    const safeQuantity = Math.max(1, quantity);

    this.cartItems.update((items) => {
      const existingItem = items.find((item) => item.product.id === product.id);

      if (!existingItem) {
        return [...items, { product, quantity: safeQuantity }];
      }

      return items.map((item) =>
        item.product.id === product.id ? { ...item, quantity: item.quantity + safeQuantity } : item,
      );
    });
  }

  private loadCartItems(): CartItem[] {
    const savedCart = localStorage.getItem(this.storageKey);

    if (!savedCart) {
      return [];
    }

    try {
      const parsedCart: unknown = JSON.parse(savedCart);

      if (!Array.isArray(parsedCart)) {
        return [];
      }

      return parsedCart.filter((item) => this.isCartItem(item));
    } catch {
      return [];
    }
  }

  private isCartItem(value: unknown): value is CartItem {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const item = value as Record<string, unknown>;
    const product = item['product'];

    if (typeof product !== 'object' || product === null) {
      return false;
    }

    const productData = product as Record<string, unknown>;

    return (
      typeof productData['id'] === 'number' &&
      typeof item['quantity'] === 'number' &&
      item['quantity'] > 0
    );
  }

  updateQuantity(productId: number, quantity: number): void {
    const safeQuantity = Math.max(1, Math.floor(quantity));

    this.cartItems.update((items) =>
      items.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity: safeQuantity,
            }
          : item,
      ),
    );
  }

  removeFromCart(prductId: number): void {
    this.cartItems.update((items) => items.filter((item) => item.product.id !== prductId));
  }
}
