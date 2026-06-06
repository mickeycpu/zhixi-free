import client from './client';
import type { AdminOverview, AdminUser, ApiResponse } from '../types';

export async function getAdminOverview(): Promise<ApiResponse<AdminOverview>> {
  const resp = await client.get('/api/admin/overview');
  return resp.data;
}

export async function getAdminUsers(): Promise<ApiResponse<AdminUser[]>> {
  const resp = await client.get('/api/admin/users');
  return resp.data;
}

export async function setUserRole(
  userId: string,
  role: 'user' | 'admin',
): Promise<ApiResponse<AdminUser>> {
  const resp = await client.patch(`/api/admin/users/${userId}/role`, { role });
  return resp.data;
}

export async function setUserBan(
  userId: string,
  isBanned: boolean,
  banReason?: string,
): Promise<ApiResponse<AdminUser>> {
  const resp = await client.patch(`/api/admin/users/${userId}/ban`, {
    is_banned: isBanned,
    ban_reason: banReason,
  });
  return resp.data;
}
