import {
  Injectable,
  inject,
  computed,
  EnvironmentInjector,
  runInInjectionContext,
} from '@angular/core';
import { isUserRole, type UserRole } from './user-role';
import { toSignal } from '@angular/core/rxjs-interop';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import {
  catchError,
  filter,
  from,
  map,
  type Observable,
  of,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AccessService {
  private readonly firestore = inject(Firestore);
  private readonly authService = inject(AuthService);
  private readonly injector = inject(EnvironmentInjector);
  private readonly role$ = this.authService.user$.pipe(
    switchMap((user) => {
      if (!user) {
        return of<UserRole | null>(null);
      }
      const roleRequest = runInInjectionContext(this.injector, () => {
        const userDocument = doc(this.firestore, 'users', user.uid);
        return getDoc(userDocument);
      });

      return from(roleRequest).pipe(
        map((snapshot): UserRole | null => {
          if (!snapshot.exists()) {
            return null;
          }
          const data: unknown = snapshot.data();
          if (typeof data !== 'object' || data === null) {
            return null;
          }
          const role = (data as Record<string, unknown>)['role'];
          return isUserRole(role) ? role : null;
        }),
        catchError((error: unknown) => {
          console.error('Failed to load user role:', error);
          return of<UserRole | null>(null);
        }),
        startWith(undefined),
      );
    }),
    shareReplay({
      bufferSize: 1,
      refCount: true,
    }),
  );
  private readonly userRole = toSignal(this.role$, {
    initialValue: undefined,
  });
  readonly isRoleReady = computed(() => this.userRole() !== undefined);

  hasRole(...allowedRoles: UserRole[]): boolean {
    const role = this.userRole();
    return role !== undefined && role !== null && allowedRoles.includes(role);
  }
  hasRole$(...allowedRoles: UserRole[]): Observable<boolean> {
    return this.role$.pipe(
      filter((role): role is UserRole | null => role !== undefined),
      map((role) => role !== null && allowedRoles.includes(role)),
    );
  }
}
