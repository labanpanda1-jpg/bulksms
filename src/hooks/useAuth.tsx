import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@/types';
import { api } from '@/services/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('abancool_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.auth.me();
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        localStorage.removeItem('abancool_token');
      }
    } catch {
      localStorage.removeItem('abancool_token');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback((token: string, userData: User) => {
    localStorage.setItem('abancool_token', token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    api.auth.logout().catch(() => {});
    localStorage.removeItem('abancool_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
