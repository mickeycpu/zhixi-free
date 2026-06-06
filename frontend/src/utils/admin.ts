import type { UserInfo } from '../types';

export const SUPER_ADMIN_EMAIL = '15871427062@163.com';

export function withAdminFallback(user: UserInfo, fallbackEmail?: string): UserInfo {
  const email = (user.email || fallbackEmail || '').toLowerCase();
  if (email !== SUPER_ADMIN_EMAIL) return user;

  return {
    ...user,
    email: user.email || fallbackEmail,
    role: 'super_admin',
    is_banned: false,
  };
}

export function isAdminUser(user: UserInfo | null): boolean {
  return ['admin', 'super_admin'].includes(user?.role || '');
}
