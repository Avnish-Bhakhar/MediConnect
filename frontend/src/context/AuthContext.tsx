import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Doctor } from '../types';
import api from '../api/axios';

interface AuthContextType {
  user: User | null;
  token: string | null;
  doctorProfile: Doctor | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

interface RegisterData {
  name: string; email: string; password: string; role: string; phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('mediconnect_token');
    const savedUser = localStorage.getItem('mediconnect_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      fetchMe(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchMe = async (t: string) => {
    try {
      const res = await api.get('/auth/me', { headers: { Authorization: `Bearer ${t}` } });
      setUser(res.data.user);
      if (res.data.doctorProfile) setDoctorProfile(res.data.doctorProfile);
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: t, user: u, doctorProfile: dp } = res.data;
    setToken(t); setUser(u);
    if (dp) setDoctorProfile(dp);
    localStorage.setItem('mediconnect_token', t);
    localStorage.setItem('mediconnect_user', JSON.stringify(u));
  };

  const register = async (data: RegisterData) => {
    const res = await api.post('/auth/register', data);
    const { token: t, user: u } = res.data;
    setToken(t); setUser(u);
    localStorage.setItem('mediconnect_token', t);
    localStorage.setItem('mediconnect_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null); setToken(null); setDoctorProfile(null);
    localStorage.removeItem('mediconnect_token');
    localStorage.removeItem('mediconnect_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, doctorProfile, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
