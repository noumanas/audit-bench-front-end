'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as api from './api';
import { User } from './types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  loginWithOAuthCode: (code: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    api.clearToken();
    setUser(null);
    router.push('/login');
  }, [router]);

  useEffect(() => {
    api.registerUnauthorizedHandler(logout);
  }, [logout]);

  useEffect(() => {
    if (!api.getToken()) {
      setLoading(false);
      return;
    }
    api
      .getMe()
      .then(setUser)
      .catch(() => api.clearToken())
      .finally(() => setLoading(false));
  }, []);

  const applySession = (res: api.AuthResponse) => {
    api.setToken(res.accessToken);
    setUser(res.user);
  };

  const login = async (email: string, password: string) => {
    applySession(await api.login(email, password));
  };

  const signup = async (email: string, password: string, name?: string) => {
    applySession(await api.signup(email, password, name));
  };

  const loginWithOAuthCode = async (code: string) => {
    applySession(await api.exchangeOAuthCode(code));
  };

  const refreshUser = async () => {
    const me = await api.getMe();
    setUser(me);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithOAuthCode, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
