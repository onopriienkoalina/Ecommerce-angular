import { Component, inject } from '@angular/core';
import { ProductListComponent } from '../../features/products/product-list/product-list.component';
import { ProductsService } from '../../features/products/products.service';
import { RouterLink } from '@angular/router';
import { AccessService } from '../../auth/access.service';

@Component({
  selector: 'app-main-page',
  imports: [ProductListComponent, RouterLink],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css', '../../shared/styles/product-shared.css'],
})
export class MainPageComponent {
  protected readonly productsService = inject(ProductsService);
  protected readonly products = this.productsService.productCards;
  protected readonly accessService = inject(AccessService);
}
