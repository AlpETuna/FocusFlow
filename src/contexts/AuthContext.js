import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication token
    const initializeAuth = async () => {
      try {
        // Check if we have a stored token
        const token = api.getToken();
        if (token) {
          // Verify token by fetching user profile
          const response = await api.getProfile();
          if (response.user) {
            setUser(response.user);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Invalid token, clear it
        api.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.login(email, password);
      
      if (response.user) {
        setUser(response.user);
        return { success: true };
      }
      
      return { success: false, error: 'Login failed' };
    } catch (error) {
      return { success: false, error: error.message || 'Invalid email or password' };
    }
  };

  const register = async (email, password, name) => {
    try {
      const response = await api.register(email, password, name);
      
      if (response.user) {
        setUser(response.user);
        return { success: true };
      }
      
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const updateUser = async (updates) => {
    try {
      const response = await api.updateProfile(updates);
      
      if (response.user) {
        setUser(response.user);
        return { success: true };
      }
      
      return { success: false, error: 'Update failed' };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: error.message };
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.getProfile();
      if (response.user) {
        setUser(response.user);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}