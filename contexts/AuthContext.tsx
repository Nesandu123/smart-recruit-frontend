'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  role: 'admin' | 'user';
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, username: string, password: string, full_name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    const response = await authApi.getMe();
    if (response.data) {
      setUser(response.data);
    } else {
      localStorage.removeItem('access_token');
    }
    setLoading(false);
  };

  const login = async (username: string, password: string) => {
    const response = await authApi.login({ username, password });
    
    if (response.error) {
      return { success: false, error: response.error };
    }

    if (response.data?.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      await checkAuth();
      return { success: true };
    }

    return { success: false, error: 'Invalid response' };
  };

  const signup = async (email: string, username: string, password: string, full_name?: string) => {
    const response = await authApi.signup({ email, username, password, full_name });
    
    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    router.push('/');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
