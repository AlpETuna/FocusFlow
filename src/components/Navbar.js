import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TreePine, Home, Target, Users, Trophy, UserCircle, LogOut, Users2 } from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/focus', label: 'Focus', icon: Target },
    { path: '/groups', label: 'Groups', icon: Users2 },
    { path: '/friends', label: 'Friends', icon: Users },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/dashboard" className="navbar-brand">
          <TreePine size={24} />
          FocusFlow
        </Link>

        <div className="navbar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}

          <div className="ml-4 pl-4 border-l border-gray-200 flex items-center gap-2">
            <Link
              to="/profile"
              className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
            >
              <UserCircle size={18} />
              <span className="hidden md:inline">{user?.name || 'Profile'}</span>
            </Link>
            
            <button
              onClick={logout}
              className="nav-link text-danger hover:bg-red-50"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;