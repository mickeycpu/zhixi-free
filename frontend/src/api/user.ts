import client from './client';
import type { ApiResponse, UserUsage } from '../types';

export async function getUserUsage(): Promise<ApiResponse<UserUsage>> {
  const resp = await client.get('/api/auth/user/usage');
  return resp.data;
}
