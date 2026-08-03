import { Component, inject } from '@angular/core';
import { ProductListComponent } from '../../features/products/product-list/product-list.component';
import { ProductsService } from '../../features/products/products.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-main-page',
  imports: [ProductListComponent, RouterLink],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css',
})
export class MainPageComponent {
  protected readonly productsService = inject(ProductsService);
  protected readonly products = this.productsService.productCards;
}
