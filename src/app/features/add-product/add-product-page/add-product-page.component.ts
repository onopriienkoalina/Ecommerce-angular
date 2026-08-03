import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { ProductsService } from '../../products/products.service';
import type { Product } from '../../products/product';

@Component({
  selector: 'app-add-product-page',
  imports: [ReactiveFormsModule, FileUploadModule],
  templateUrl: './add-product-page.component.html',
  styleUrl: './add-product-page.component.css',
})
export class AddProductPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly productsService = inject(ProductsService);
  private readonly router = inject(Router);

  protected readonly mainImagePreview = signal<string | null>(null);
  protected readonly galleryImagesPreview = signal<string[]>([]);

  protected readonly mainImageError = signal<string | null>(null);
  protected readonly galleryImagesError = signal<string | null>(null);

  protected readonly addProductForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    oldPrice: [0, [Validators.required, Validators.min(0.01)]],
  });

  protected async selectMainImage(event: FileSelectEvent): Promise<void> {
    const file = event.files[0];

    if (!file) {
      return;
    }
    this.mainImageError.set(null);

    try {
      const imageUrl = await this.readFileAsDataURL(file);
      this.mainImagePreview.set(imageUrl);
    } catch {
      this.mainImageError.set('Failed to read the main image file.');
    }
  }

  protected async selectGalleryImages(event: FileSelectEvent): Promise<void> {
    const files = Array.from(event.files);
    if (!event.files || event.files.length === 0) {
      return;
    }
    this.galleryImagesError.set(null);

    try {
      const previews = await Promise.all(files.map((file) => this.readFileAsDataURL(file)));

      this.galleryImagesPreview.set(previews);
    } catch {
      this.galleryImagesError.set('Failed to read one or more gallery image files.');
    }
  }

  private readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }
        reject(new Error('Failed to read file as Data URL.'));
      });
      reader.addEventListener('error', () => {
        reject(new Error('Error reading file.'));
      });
      reader.readAsDataURL(file);
    });
  }

  protected clearMainImage(): void {
    this.mainImagePreview.set(null);
  }

  protected clearGalleryImages(): void {
    this.galleryImagesPreview.set([]);
  }

  protected submitForm(): void {
    if (this.addProductForm.invalid) {
      this.addProductForm.markAllAsTouched();
    }

    if (!this.mainImagePreview()) {
      this.mainImageError.set('Main image is required.');
    }

    if (this.galleryImagesPreview().length === 0) {
      this.galleryImagesError.set('At least one gallery image is required.');
    }

    if (
      this.addProductForm.invalid ||
      !this.mainImagePreview() ||
      this.galleryImagesPreview().length === 0
    ) {
      return;
    }

    const formValue = this.addProductForm.getRawValue();
    const mainImage = this.mainImagePreview();

    if (!mainImage) {
      this.mainImageError.set('Main image is required.');
      return;
    }

    const newProduct: Product = {
      id: this.createProductId(),
      title: formValue.title,
      description: formValue.description,
      price: formValue.price,
      oldPrice: formValue.oldPrice,
      imageUrl: mainImage,
      galleryImages: this.galleryImagesPreview(),
      rating: '/rating.svg',
    };

    this.productsService.addProduct(newProduct);
    void this.router.navigate(['/']);
  }

  private createProductId(): number {
    const productIds = this.productsService.productCards().map((product) => product.id);
    return productIds.length > 0 ? Math.max(...productIds) + 1 : 1;
  }
}
