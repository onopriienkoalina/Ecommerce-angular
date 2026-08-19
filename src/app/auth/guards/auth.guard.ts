import { type CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AccessService } from '../access.service';

export const authGuard: CanActivateFn = () => {
  const accessService = inject(AccessService);
  const router = inject(Router);

  if (accessService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/']);
};
