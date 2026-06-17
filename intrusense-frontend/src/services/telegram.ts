import client from './client';
import type { ApiResponse } from '@/types';

export const getBotInfo = () =>
  client.get<ApiResponse<{ botUsername: string | null }>>('/telegram');

export const requestVerifyCode = () =>
  client.post<ApiResponse<{ code: string }>>('/telegram/generate-code');

export const confirmVerifyCode = () =>
  client.post<ApiResponse<{ chatId: string }>>('/telegram/confirm-code');
