import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import './App.css';

function AppContent() {
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
      <Routes>
        <Route
          path="/launch"
          element={!user ? <LaunchPage /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/launch" />}
        />
        <Route
          path="/focus"
          element={user ? <FocusSession /> : <Navigate to="/launch" />}
        />
        <Route
          path="/groups"
          element={user ? <GroupTree /> : <Navigate to="/launch" />}
        />
        <Route
          path="/friends"
          element={user ? <Friends /> : <Navigate to="/launch" />}
        />
        <Route
          path="/leaderboard"
          element={user ? <Leaderboard /> : <Navigate to="/launch" />}
        />
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/launch" />}
        />
        <Route
          path="/"
          element={<Navigate to={user ? "/dashboard" : "/launch"} />}
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;