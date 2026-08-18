export type DiscountTheme = 70 | 60 | 50;

export type UpdateProductData = Pick<ProductData, 'title' | 'description' | 'price' | 'oldPrice'>;
export interface ProductData {
  title: string;
  description: string;
  price: number;
  oldPrice: number;
  imageUrl: string;
  galleryImages: string[];
  rating: string;
}
export interface Product extends ProductData {
  id: string;
  sortOrder: number;
}
export interface ProductCard extends Product {
  discountPercent: number;
  discountTheme: DiscountTheme;
  isMain: boolean;
}
