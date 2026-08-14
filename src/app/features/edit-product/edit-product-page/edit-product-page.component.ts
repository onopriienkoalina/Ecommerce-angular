import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../products/products.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, filter, distinctUntilChanged, switchMap, take, tap } from 'rxjs';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { createProductForm } from '../../products/product-form';
import type { UpdateProductData } from '../../products/product';

@Component({
  selector: 'app-edit-product-page',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-product-page.component.html',
  styleUrls: ['./edit-product-page.component.css', '../../../shared/styles/product-shared.css'],
})
export class EditProductPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductsService);
  private readonly formBuilder = inject(FormBuilder);
  protected readonly editProductForm = createProductForm(this.formBuilder);
  protected readonly isSaving = signal(false);
  protected readonly isDeleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);
  protected readonly saveError = signal<string | null>(null);
  protected readonly product = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('id')),
      filter((id): id is string => id !== null),
      distinctUntilChanged(),
      switchMap((id) => this.productService.getProductById(id).pipe(take(1))),
      tap((product) => {
        if (!product) {
          return;
        }
        this.editProductForm.patchValue({
          title: product.title,
          description: product.description,
          price: product.price,
          oldPrice: product.oldPrice,
        });
      }),
    ),
    {
      initialValue: undefined,
    },
  );

  protected async saveProduct(): Promise<void> {
    if (this.isDeleting() || this.isSaving()) {
      return;
    }
    if (this.editProductForm.invalid) {
      this.editProductForm.markAllAsTouched();
      return;
    }
    const product = this.product();
    if (!product) {
      this.saveError.set('Product not found.');
      return;
    }
    const formValue = this.editProductForm.getRawValue();

    const updatedData: UpdateProductData = {
      title: formValue.title,
      description: formValue.description,
      price: formValue.price,
      oldPrice: formValue.oldPrice,
    };

    this.isSaving.set(true);
    this.saveError.set(null);

    try {
      await this.productService.updateProduct(product.id, updatedData);
      void this.router.navigate(['/']);
    } catch (error: unknown) {
      console.error('Failed to save product:', error);
      this.saveError.set('Failed to save product.');
    } finally {
      this.isSaving.set(false);
    }
  }
  protected async deleteProduct(): Promise<void> {
    if (this.isDeleting() || this.isSaving()) {
      return;
    }
    const product = this.product();
    if (!product) {
      this.deleteError.set('Product not found.');
      return;
    }
    const confirmed = window.confirm('Are you sure you want to delete this product?');
    if (!confirmed) {
      return;
    }

    this.isDeleting.set(true);
    this.deleteError.set(null);

    try {
      await this.productService.deleteProduct(product.id);
      void this.router.navigate(['/']);
    } catch (error: unknown) {
      console.error('Failed to delete product:', error);
      this.deleteError.set('Failed to delete product.');
    } finally {
      this.isDeleting.set(false);
    }
  }
}
