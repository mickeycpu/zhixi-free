import client from './client';
import type { ApiResponse, AlertItem } from '../types';

export async function getAlerts(): Promise<ApiResponse<AlertItem[]>> {
  const resp = await client.get('/api/alerts');
  return resp.data;
}

export async function markAlertRead(alertId: string): Promise<ApiResponse<null>> {
  const resp = await client.put(`/api/alerts/${alertId}/read`);
  return resp.data;
}
