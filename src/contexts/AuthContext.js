import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock authentication - provide sample user data for development
    const initializeAuth = async () => {
      try {
        // Check if we have a stored user or create a mock one
        const mockUser = localStorage.getItem('rootfocus_mock_user');
        if (mockUser) {
          setUser(JSON.parse(mockUser));
        } else {
          // Create a mock user for development
          const sampleUser = {
            id: 'mock-user-1',
            name: 'Demo User',
            email: 'demo@rootfocus.com',
            totalFocusTime: 245, // minutes
            focusStreak: 7,
            treeLevel: 5,
            sessionsToday: 3,
            joinedDate: new Date().toISOString()
          };
          localStorage.setItem('rootfocus_mock_user', JSON.stringify(sampleUser));
          setUser(sampleUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    // Add a slight delay to show the loading animation
    setTimeout(initializeAuth, 2000);
  }, []);

  const login = async (email, password) => {
    try {
      // Mock login - simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: 'mock-user-1',
        name: 'Demo User',
        email: email,
        totalFocusTime: 245,
        focusStreak: 7,
        treeLevel: 5,
        sessionsToday: 3,
        joinedDate: new Date().toISOString()
      };
      
      localStorage.setItem('rootfocus_mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, name) => {
    try {
      // Mock registration - simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: `mock-user-${Date.now()}`,
        name: name,
        email: email,
        totalFocusTime: 0,
        focusStreak: 0,
        treeLevel: 1,
        sessionsToday: 0,
        joinedDate: new Date().toISOString()
      };
      
      localStorage.setItem('rootfocus_mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('rootfocus_mock_user');
    setUser(null);
  };

  const updateUser = async (updates) => {
    try {
      // Mock update - simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = { ...user, ...updates };
      localStorage.setItem('rootfocus_mock_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: error.message };
    }
  };

  const refreshUser = async () => {
    try {
      // Mock refresh - get from localStorage
      const mockUser = localStorage.getItem('rootfocus_mock_user');
      if (mockUser) {
        setUser(JSON.parse(mockUser));
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