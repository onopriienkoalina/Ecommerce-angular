import { Component, inject, signal, ElementRef, HostListener, viewChild } from '@angular/core';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { CartService } from './features/cart/cart.service';
import { AuthModalComponent } from './auth/auth-modal/auth-modal.component';
import { AuthService } from './auth/auth.service';
@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet, AuthModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  protected readonly authService = inject(AuthService);
  protected readonly cartCount = this.cartService.totalQuantity;
  protected readonly isAccountMenuOpen = signal(false);
  protected readonly isAuthModalOpen = signal(false);
  protected readonly account = viewChild<ElementRef<HTMLElement>>('account');

  protected openAuthModal(): void {
    this.isAuthModalOpen.set(true);
  }

  protected closeAuthModal(): void {
    this.isAuthModalOpen.set(false);
  }
  protected handleAuthClick(): void {
    if (!this.authService.isAuthReady()) {
      return;
    }

    if (this.authService.isAuthenticated()) {
      this.isAccountMenuOpen.update((isOpen) => !isOpen);
      return;
    }

    this.openAuthModal();
  }
  protected async signOut(): Promise<void> {
    await this.authService.signOut();

    this.isAccountMenuOpen.set(false);

    await this.router.navigate(['/']);
  }
  @HostListener('document:click', ['$event'])
  protected handleDocumentClick(event: MouseEvent): void {
    const accountElement = this.account()?.nativeElement;

    if (!accountElement) {
      return;
    }

    const target = event.target;

    if (!(target instanceof Node)) {
      return;
    }

    if (!accountElement.contains(target)) {
      this.isAccountMenuOpen.set(false);
    }
  }
  @HostListener('document:keydown.escape')
  protected closeAccountMenu(): void {
    this.isAccountMenuOpen.set(false);
  }
}
