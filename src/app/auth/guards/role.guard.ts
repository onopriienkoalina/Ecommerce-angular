import { type CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AccessService } from '../access.service';
import type { UserRole } from '../user-role';
import { map, take } from 'rxjs';

export const roleGuard = (...allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const accessService = inject(AccessService);
    const router = inject(Router);

    return accessService.hasRole$(...allowedRoles).pipe(
      take(1),
      map((hasAccess) => {
        if (hasAccess) {
          return true;
        }

        return router.createUrlTree(['/']);
      }),
    );
  };
};
