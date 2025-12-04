import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { authAPI } from '../services/api';
import type { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updateUserOnServer: (data: { location?: any; interests?: string[] }) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Fetch fresh user data
          const response = await authAPI.getMe();
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          console.error('Failed to fetch user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    console.log("LOGIN CALLED", email, password);
    try {
      console.log("Making login API call...");
      const response = await authAPI.login({ email, password });
      console.log("Login API response received:", response.data);
      const data: AuthResponse = response.data;

      if (!data.token) {
        throw new Error("No token received from server");
      }

      setToken(data.token);
      localStorage.setItem('token', data.token);

      console.log("Fetching user data...");
      const meResponse = await authAPI.getMe();
      const userData = meResponse.data;
      console.log("User data received:", userData);

      setUser({
        _id: userData._id,
        email: userData.email,
        name: userData.name,
        hasCompletedOnboarding: userData.hasCompletedOnboarding,
        location: userData.location,
        interests: userData.interests,
        freeEventsCreated: userData.freeEventsCreated || 0,
      });

      localStorage.setItem('user', JSON.stringify(userData));

      console.log("LOGIN SUCCESS - User authenticated");
      return;
    } catch (error: any) {
      console.error("LOGIN ERROR:", {
        error,
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      });
      
      // Clear any partial state
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      const errorMessage = error?.response?.data?.message || error?.message || 'Login failed';
      throw new Error(errorMessage);
    }
  };


  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await authAPI.register({ email, password, name });
      const data: AuthResponse = response.data;

      setToken(data.token);
      
      // Fetch full user data
      const meResponse = await authAPI.getMe();
      const userData = meResponse.data;
      
      setUser({
        _id: userData._id,
        email: userData.email,
        name: userData.name,
        hasCompletedOnboarding: userData.hasCompletedOnboarding,
        freeEventsCreated: userData.freeEventsCreated || 0,
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const updateUserOnServer = async (data: { location?: any; interests?: string[] }) => {
    try {
      const response = await authAPI.updateUser(data);
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, updateUserOnServer }}>
      {children}
    </AuthContext.Provider>
  );
};