import client from './client';
import type { ApiResponse, PaginatedReadings, Reading } from '@/types';

interface GetReadingsParams {
  page?: number;
  pageSize?: number;
  intrusion?: boolean;
}

export const getReadings = (params: GetReadingsParams = {}) =>
  client.get<ApiResponse<PaginatedReadings>>('/readings', { params });

export const deleteReading = (id: string) => client.delete<ApiResponse<Reading>>(`/readings/${id}`);
