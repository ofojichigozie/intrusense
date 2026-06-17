import client from './client';
import type { ApiResponse, Settings, SystemStatus } from '@/types';

export const getStatus = () => client.get<ApiResponse<SystemStatus>>('/settings/status');

export const getSettings = () => client.get<ApiResponse<Settings>>('/settings');

export const updateSettings = (updates: Partial<Settings>) =>
  client.put<ApiResponse<Settings>>('/settings', updates);
