import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { CartService } from '../../cart/cart.service';

export const orderSubmittedGuard: CanActivateFn = () => {
  const cartService = inject(CartService);
  const router = inject(Router);

  if (cartService.isOrderSubmitted()) {
    return true;
  }

  return router.createUrlTree(['/']);
};
