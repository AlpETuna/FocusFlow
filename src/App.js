import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import LaunchPage from './components/LaunchPage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import FocusSession from './components/FocusSession';
import Profile from './components/Profile';
import Friends from './components/Friends';
import Leaderboard from './components/Leaderboard';
import GroupTree from './components/GroupTree';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TimerProvider } from './contexts/TimerContext';
import './App.css';

function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-sky-clouds"></div>
        <div className="loading-tree-container">
          <div className="loading-tree-trunk"></div>
          <div className="loading-tree-crown"></div>
          <div className="loading-tree-leaves"></div>
        </div>
        <div className="loading-text">Growing your Focus Tree...</div>
        <div className="loading-progress">
          <div className="loading-progress-bar"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {user && <Navbar />}
      <Outlet />
    </div>
  );
}

function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/launch" replace />;
}

function RequireNoAuth({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/dashboard" replace />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthProvider>
        <TimerProvider>
          <AppLayout />
        </TimerProvider>
      </AuthProvider>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'launch',
        element: <RequireNoAuth><LaunchPage /></RequireNoAuth>
      },
      {
        path: 'login',
        element: <RequireNoAuth><Login /></RequireNoAuth>
      },
      {
        path: 'dashboard',
        element: <RequireAuth><Dashboard /></RequireAuth>
      },
      {
        path: 'focus',
        element: <RequireAuth><FocusSession /></RequireAuth>
      },
      {
        path: 'groups',
        element: <RequireAuth><GroupTree /></RequireAuth>
      },
      {
        path: 'friends',
        element: <RequireAuth><Friends /></RequireAuth>
      },
      {
        path: 'leaderboard',
        element: <RequireAuth><Leaderboard /></RequireAuth>
      },
      {
        path: 'profile',
        element: <RequireAuth><Profile /></RequireAuth>
      }
    ]
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

function App() {
  return <RouterProvider router={router} />;
}

export default App;