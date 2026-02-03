'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api';
import type { User, AuthState } from '@/types';

interface RegisterResult {
  welcomeEmailSent?: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<RegisterResult | void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.getMe() as { success: boolean; user: User };
      if (response.success && response.user) {
        setState({
          user: response.user,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password) as { success: boolean; user: User };
    if (response.success && response.user) {
      setState({
        user: response.user,
        isLoading: false,
        isAuthenticated: true,
      });
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    const response = await api.register(email, password, name) as { success: boolean; user: User; welcomeEmailSent?: boolean };
    if (response.success && response.user) {
      setState({
        user: response.user,
        isLoading: false,
        isAuthenticated: true,
      });
      return { welcomeEmailSent: response.welcomeEmailSent };
    }
    return {};
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
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
