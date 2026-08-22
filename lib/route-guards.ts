/**
 * Role-based route authorization and navigation redirection helpers
 */

export type UserRole = 'ADMIN' | 'EMPLOYEE' | 'HR_MANAGER';

export interface RoutePermission {
  path: string;
  allowedRoles: UserRole[];
  requireAuth: boolean;
}

export const ROUTE_PERMISSIONS: RoutePermission[] = [
  { path: '/dashboard', allowedRoles: ['ADMIN', 'EMPLOYEE', 'HR_MANAGER'], requireAuth: true },
  { path: '/payroll', allowedRoles: ['ADMIN', 'HR_MANAGER'], requireAuth: true },
  { path: '/attendance', allowedRoles: ['ADMIN', 'EMPLOYEE', 'HR_MANAGER'], requireAuth: true },
  { path: '/leave', allowedRoles: ['ADMIN', 'EMPLOYEE', 'HR_MANAGER'], requireAuth: true },
  { path: '/admin', allowedRoles: ['ADMIN'], requireAuth: true },
];

export function canAccessRoute(path: string, userRole?: UserRole | null): boolean {
  const route = ROUTE_PERMISSIONS.find(r => path.startsWith(r.path));
  if (!route) return true; // public route
  if (!userRole) return false;
  return route.allowedRoles.includes(userRole);
}

export function getDefaultRedirectForRole(role?: UserRole): string {
  if (role === 'ADMIN') return '/dashboard';
  if (role === 'EMPLOYEE') return '/dashboard';
  return '/sign-in';
}
