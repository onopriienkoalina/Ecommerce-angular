import { type CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, take } from 'rxjs';
import { AuthService } from '../auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    map((user) => {
      if (user) {
        return true;
      }
      return router.createUrlTree(['/']);
    }),
  );
};
