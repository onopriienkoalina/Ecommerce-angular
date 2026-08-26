export type UserRole = 'customer' | 'admin' | 'owner';

export function isUserRole(value: unknown): value is UserRole {
  return value === 'customer' || value === 'admin' || value === 'owner';
}
