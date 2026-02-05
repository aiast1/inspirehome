import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiLogin } from '@/lib/adminApi';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isTokenValid(): boolean {
  const token = localStorage.getItem('admin_token');
  const expiry = localStorage.getItem('admin_token_expiry');
  if (!token || !expiry) return false;
  return Date.now() < parseInt(expiry);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsAuthenticated(isTokenValid());
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const { token, expiresIn } = await apiLogin(username, password);
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_token_expiry', String(Date.now() + expiresIn * 1000));
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_token_expiry');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
