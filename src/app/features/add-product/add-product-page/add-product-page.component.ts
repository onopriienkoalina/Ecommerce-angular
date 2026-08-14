import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FileSelectEvent, FileUploadModule, FileRemoveEvent } from 'primeng/fileupload';
import { ProductsService } from '../../products/products.service';
import type { ProductData } from '../../products/product';
import { createProductForm } from '../../products/product-form';

interface ImagePreview {
  file: File;
  previewUrl: string;
}
@Component({
  selector: 'app-add-product-page',
  imports: [ReactiveFormsModule, FileUploadModule],
  templateUrl: './add-product-page.component.html',
  styleUrl: '../../../shared/styles/product-shared.css',
})
export class AddProductPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly productsService = inject(ProductsService);
  private readonly router = inject(Router);

  protected readonly mainImagePreview = signal<string | null>(null);
  protected readonly galleryImagesPreview = signal<ImagePreview[]>([]);

  protected readonly mainImageError = signal<string | null>(null);
  protected readonly galleryImagesError = signal<string | null>(null);

  protected readonly isSubmitting = signal(false);
  protected readonly submissionError = signal<string | null>(null);

  protected readonly addProductForm = createProductForm(this.formBuilder);
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
    if (event.files.length === 0) {
      return;
    }

    const files = Array.from(event.files);

    this.galleryImagesError.set(null);

    try {
      const previews = await Promise.all(
        files.map(async (file): Promise<ImagePreview> => ({
          file,
          previewUrl: await this.readFileAsDataURL(file),
        })),
      );

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
    this.mainImageError.set(null);
  }

  protected clearGalleryImages(): void {
    this.galleryImagesPreview.set([]);
    this.galleryImagesError.set(null);
  }

  protected removeGalleryImage(event: FileRemoveEvent): void {
    this.galleryImagesPreview.update((previews) =>
      previews.filter((preview) => preview.file !== event.file),
    );

    this.galleryImagesError.set(null);
  }

  protected async submitForm(): Promise<void> {
    if (this.isSubmitting()) {
      return;
    }

    const mainImage = this.mainImagePreview();
    const galleryImages = this.galleryImagesPreview();

    if (this.addProductForm.invalid) {
      this.addProductForm.markAllAsTouched();
    }

    if (!mainImage) {
      this.mainImageError.set('Main image is required.');
    }

    if (galleryImages.length === 0) {
      this.galleryImagesError.set('At least one gallery image is required.');
    }

    if (this.addProductForm.invalid || !mainImage || galleryImages.length === 0) {
      return;
    }

    const formValue = this.addProductForm.getRawValue();

    const newProduct: ProductData = {
      title: formValue.title,
      description: formValue.description,
      price: formValue.price,
      oldPrice: formValue.oldPrice,
      imageUrl: mainImage,
      galleryImages: galleryImages.map((image) => image.previewUrl),
      rating: '/rating.svg',
    };

    this.isSubmitting.set(true);
    this.submissionError.set(null);

    try {
      await this.productsService.addProduct(newProduct);
      void this.router.navigate(['/']);
    } catch (error: unknown) {
      console.error('Failed to add product:', error);
      this.submissionError.set('Failed to add product.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
