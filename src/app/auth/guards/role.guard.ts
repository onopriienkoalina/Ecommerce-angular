import { type CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AccessService } from '../access.service';
import type { UserRole } from '../user-role';

export const roleGuard = (...allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const accessService = inject(AccessService);
    const router = inject(Router);

    if (accessService.hasRole(...allowedRoles)) {
      return true;
    }
    return router.createUrlTree(['/']);
  };
};
