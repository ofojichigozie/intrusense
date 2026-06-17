import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Admin } from '@/types';
import { disconnectSocket } from '@/services/socket';
import { getMe } from '@/services/auth';

interface AuthState {
  token: string | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  setAuth: (token: string, admin: Admin) => void;
  updateStoredAdmin: (updates: Partial<Admin>) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [admin, setAdmin] = useState<Admin | null>(() => {
    const stored = localStorage.getItem('admin');
    return stored ? (JSON.parse(stored) as Admin) : null;
  });

  const setAuth = (t: string, a: Admin) => {
    localStorage.setItem('token', t);
    localStorage.setItem('admin', JSON.stringify(a));
    setToken(t);
    setAdmin(a);
  };

  const updateStoredAdmin = (updates: Partial<Admin>) => {
    setAdmin((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('admin', JSON.stringify(updated));
      return updated;
    });
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setToken(null);
    setAdmin(null);
    disconnectSocket();
  };

  useEffect(() => {
    if (!token) return;
    getMe()
      .then((res) => setAuth(token, res.data.data.admin))
      .catch(() => {});
  }, [token]);

  return (
    <AuthContext.Provider
      value={{ token, admin, isAuthenticated: !!token, setAuth, updateStoredAdmin, clearAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
