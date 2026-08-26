import { Component, inject, signal } from '@angular/core';
import { ProductListComponent } from '../../features/products/product-list/product-list.component';
import { ProductsService } from '../../features/products/products.service';
import { RouterLink } from '@angular/router';
import { AccessService } from '../../auth/access.service';
import { AuthModalComponent } from '../../auth/auth-modal/auth-modal.component';
import { AuthService } from '../../auth/auth.service';
@Component({
  selector: 'app-main-page',
  imports: [ProductListComponent, RouterLink, AuthModalComponent],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css', '../../shared/styles/product-shared.css'],
})
export class MainPageComponent {
  protected readonly productsService = inject(ProductsService);
  protected readonly products = this.productsService.productCards;
  protected readonly accessService = inject(AccessService);
  protected readonly authService = inject(AuthService);
  protected readonly isAuthModalOpen = signal(false);

  protected openAuthModal(): void {
    this.isAuthModalOpen.set(true);
  }

  protected closeAuthModal(): void {
    this.isAuthModalOpen.set(false);
  }
  protected async signOut(): Promise<void> {
    await this.authService.signOut();
  }
}
