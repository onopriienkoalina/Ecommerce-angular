export interface Product {
  id: number;
  title: string;
  price: number;
  oldPrice?: number;
  discount?: string;
  imageUrl: string;
  rating: string;
}
