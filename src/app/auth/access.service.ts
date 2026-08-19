import { Injectable, signal, computed } from '@angular/core';
import type { UserRole } from './user-role';

@Injectable({
  providedIn: 'root',
})
export class AccessService {
  private readonly currentRole = signal<UserRole | null>('customer');

  private readonly role = this.currentRole.asReadonly();

  readonly isAuthenticated = computed(() => this.role() !== null);

  setRole(role: UserRole | null): void {
    this.currentRole.set(role);
  }

  hasRole(...allowedRoles: UserRole[]): boolean {
    const currentRole = this.role();

    return currentRole !== null && allowedRoles.includes(currentRole);
  }
}
