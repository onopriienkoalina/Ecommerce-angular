import { Injectable, computed, signal } from '@angular/core';
import type { Product, DiscountTheme, ProductCard } from './product';
import { products as initialProducts } from '../../../assets/products.data';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly productItems = signal<Product[]>([...initialProducts]);

  readonly productCards = computed<ProductCard[]>(() =>
    this.productItems().map((product, index) => this.mapToProductCard(product, index)),
  );

  private mapToProductCard(product: Product, index: number): ProductCard {
    const discountPercent = this.calculateDiscountPercent(product);

    return {
      ...product,
      discountPercent,
      discountTheme: this.getDiscountTheme(discountPercent),
      isMain: index === 0,
    };
  }

  private calculateDiscountPercent(product: Product): number {
    return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
  }

  private getDiscountTheme(discountPercent: number): DiscountTheme {
    if (discountPercent >= 70) {
      return 70;
    }

    if (discountPercent >= 60) {
      return 60;
    }

    return 50;
  }

  getProductById(id: number): ProductCard | undefined {
    return this.productCards().find((product) => product.id === id);
  }

  addProduct(product: Product): void {
    this.productItems.update((currentProducts) => [...currentProducts, product]);
  }
}
