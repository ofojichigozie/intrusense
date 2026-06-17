import client from './client';
import type { ApiResponse, Admin } from '@/types';

interface LoginResponse {
  token: string;
  admin: Admin;
}

export interface UpdateMePayload {
  username?: string;
  password?: string;
  telegramChatId?: string;
}

export const login = (email: string, password: string) =>
  client.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });

export const getMe = () => client.get<ApiResponse<{ admin: Admin }>>('/auth/me');

export const updateMe = (data: UpdateMePayload) =>
  client.patch<ApiResponse<{ admin: Admin }>>('/auth/me', data);
