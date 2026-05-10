import client from './client';
import type { ApiResponse, UploadRecord, UploadResult } from '../types';

export async function uploadFile(file: File): Promise<ApiResponse<UploadResult>> {
  const form = new FormData();
  form.append('file', file);
  const resp = await client.post('/api/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  });
  return resp.data;
}

export async function getUploadHistory(): Promise<ApiResponse<UploadRecord[]>> {
  const resp = await client.get('/api/upload/history');
  return resp.data;
}
