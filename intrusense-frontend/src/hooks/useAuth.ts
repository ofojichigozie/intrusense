import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import notify from '@/utils/notify';
import * as authApi from '@/services/auth';
import type { UpdateMePayload } from '@/services/auth';
import { useAuthContext } from '@/context/AuthContext';

export function useAuth() {
  const { token, admin, isAuthenticated, setAuth, updateStoredAdmin, clearAuth } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const { token, admin } = res.data.data;
      setAuth(token, admin);
      notify.success(`Welcome back, ${admin.username}!`);
      navigate('/');
    } catch {
      notify.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: UpdateMePayload) => {
    setUpdatingProfile(true);
    try {
      const res = await authApi.updateMe(data);
      const { admin: updated } = res.data.data;
      updateStoredAdmin({
        username: updated.username,
        telegramChatId: updated.telegramChatId,
      });
      notify.success('Profile updated');
    } catch {
      notify.error('Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const logout = () => {
    clearAuth();
    navigate('/login');
  };

  return { token, admin, isAuthenticated, login, logout, loading, updateProfile, updatingProfile };
}
