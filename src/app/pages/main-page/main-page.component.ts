import { Component, signal } from '@angular/core';
import { ProductCardComponent } from '../../features/products/product-card/product-card.component';
import { products } from '../../features/products/products.data';
import { Product } from '../../features/products/product';

@Component({
  selector: 'app-main-page',
  imports: [ProductCardComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent {
  protected readonly products = signal<Product[]>(products);
}
