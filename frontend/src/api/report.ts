import client from './client';
import type { ApiResponse, AIReport } from '../types';

export async function generateReport(): Promise<ApiResponse<AIReport>> {
  const resp = await client.post('/api/reports/generate', null, { timeout: 60000 });
  return resp.data;
}

export async function getReports(): Promise<ApiResponse<AIReport[]>> {
  const resp = await client.get('/api/reports');
  return resp.data;
}

export async function getReportById(id: string): Promise<ApiResponse<AIReport>> {
  const resp = await client.get(`/api/reports/${id}`);
  return resp.data;
}
