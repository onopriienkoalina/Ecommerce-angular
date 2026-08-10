import { Injectable, computed, signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  addDoc,
  collection,
  collectionData,
  Firestore,
  doc,
  docData,
  orderBy,
  query,
} from '@angular/fire/firestore';
import type { Product, DiscountTheme, ProductCard, ProductData } from './product';
import { Observable, catchError, map, of, tap } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly firestore = inject(Firestore);
  private readonly productsCollection = collection(this.firestore, 'products');
  private readonly productsQuery = query(this.productsCollection, orderBy('sortOrder', 'asc'));

  private readonly loading = signal(true);
  private readonly error = signal<string | null>(null);

  readonly isLoading = this.loading.asReadonly();
  readonly errorMessage = this.error.asReadonly();

  private readonly products$ = (
    collectionData(this.productsQuery, { idField: 'id' }) as Observable<Product[]>
  ).pipe(
    tap(() => {
      this.loading.set(false);
      this.error.set(null);
    }),
    catchError((error: unknown) => {
      this.loading.set(false);
      this.error.set('Failed to load products.');
      console.error('Error loading products:', error);
      return of<Product[]>([]);
    }),
  );

  private readonly productItems = toSignal(this.products$, { initialValue: [] });

  readonly productCards = computed<ProductCard[]>(() =>
    this.productItems().map((product, index) => this.mapToProductCard(product, index === 0)),
  );

  private mapToProductCard(product: Product, isMain: boolean): ProductCard {
    const discountPercent = this.calculateDiscountPercent(product);

    return {
      ...product,
      discountPercent,
      discountTheme: this.getDiscountTheme(discountPercent),
      isMain,
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

  getProductById(id: string): Observable<ProductCard | undefined> {
    const productDocument = doc(this.firestore, 'products', id);
    const product$ = docData(productDocument, { idField: 'id' }) as Observable<Product | undefined>;

    return product$.pipe(
      map((product) => (product ? this.mapToProductCard(product, false) : undefined)),
    );
  }

  async addProduct(product: ProductData): Promise<string> {
    const nextSortOrder =
      this.productItems().reduce(
        (maxOrder, currentProduct) => Math.max(maxOrder, currentProduct.sortOrder),
        0,
      ) + 1;
    const docRef = await addDoc(this.productsCollection, { ...product, sortOrder: nextSortOrder });
    return docRef.id;
  }
}
