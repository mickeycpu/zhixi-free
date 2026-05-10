import client from './client';
import type {
  ApiResponse,
  OverviewData,
  CategoryRanking,
  ProductRanking,
  TrendPoint,
  TimeSlotData,
  WeekdayData,
  CustomerAnalysis,
} from '../types';

export async function getOverview(): Promise<ApiResponse<OverviewData>> {
  const resp = await client.get('/api/analytics/overview');
  return resp.data;
}

export async function getCategories(): Promise<ApiResponse<CategoryRanking[]>> {
  const resp = await client.get('/api/analytics/categories');
  return resp.data;
}

export async function getProducts(): Promise<ApiResponse<ProductRanking>> {
  const resp = await client.get('/api/analytics/products');
  return resp.data;
}

export async function getTrends(granularity: 'day' | 'week' | 'month' = 'day'): Promise<ApiResponse<TrendPoint[]>> {
  const resp = await client.get('/api/analytics/trends', { params: { granularity } });
  return resp.data;
}

export async function getTimeSlots(): Promise<ApiResponse<TimeSlotData[]>> {
  const resp = await client.get('/api/analytics/time-slots');
  return resp.data;
}

export async function getWeekdays(): Promise<ApiResponse<WeekdayData[]>> {
  const resp = await client.get('/api/analytics/weekdays');
  return resp.data;
}

export async function getCustomers(): Promise<ApiResponse<CustomerAnalysis>> {
  const resp = await client.get('/api/analytics/customers');
  return resp.data;
}
