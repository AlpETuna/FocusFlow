import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Play, Clock, Target, Users, Trophy, TreePine, ArrowRight } from 'lucide-react';
import TreeVisualization from './TreeVisualization';

function Dashboard() {
  const { user } = useAuth();

  const stats = [
    {
      icon: <Clock size={20} />,
      label: 'Total Focus Time',
      value: `${Math.floor((user?.totalFocusTime || 0) / 60)}h ${(user?.totalFocusTime || 0) % 60}m`,
      color: '#10b981',
      bgColor: '#10b98120'
    },
    {
      icon: <Target size={20} />,
      label: 'Focus Streak',
      value: `${user?.focusStreak || 0} days`,
      color: '#3b82f6',
      bgColor: '#3b82f620'
    },
    {
      icon: <TreePine size={20} />,
      label: 'Tree Level',
      value: user?.level || 1,
      color: '#f59e0b',
      bgColor: '#f59e0b20'
    },
    {
      icon: <Trophy size={20} />,
      label: 'Sessions Today',
      value: user?.sessionsToday || 0,
      color: '#8b5cf6',
      bgColor: '#8b5cf620'
    }
  ];

  const quickActions = [
    {
      title: 'Start Focus Session',
      description: 'Begin a new AI-monitored study session',
      icon: <Play size={24} />,
      link: '/focus',
      color: 'primary'
    },
    {
      title: 'Join Group Tree',
      description: 'Study with friends and grow together',
      icon: <Users size={24} />,
      link: '/groups',
      color: 'secondary'
    }
  ];

  return (
    <div className="page-container">
      {/* Welcome Section */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '8px' }}>
          Welcome back, {user?.name}! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Ready to grow your focus tree today?
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div 
              className="stat-icon"
              style={{ backgroundColor: stat.bgColor, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Tree Visualization */}
        <div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '4px' }}>Your Focus Tree</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Level {user?.level || 1} • Keep growing!
                </p>
              </div>
              <Link to="/focus" className="btn btn-primary">
                <Play size={16} />
                Start Session
              </Link>
            </div>
            
            <div className="tree-container">
              <TreeVisualization level={user?.level || 1} />
            </div>

            {/* Progress Bar */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <span>Progress to Level {(user?.level || 1) + 1}</span>
                <span>{Math.round(((user?.totalFocusTime || 0) % 60) / 60 * 100)}%</span>
              </div>
              <div className="timer-progress">
                <div 
                  className="timer-progress-bar"
                  style={{ width: `${Math.min(((user?.totalFocusTime || 0) % 60) / 60 * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Quick Actions */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '16px' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  style={{
                    display: 'block',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.boxShadow = 'var(--shadow)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: action.color === 'primary' ? 'rgba(45, 80, 22, 0.1)' : 'rgba(135, 206, 235, 0.1)',
                      color: action.color === 'primary' ? 'var(--primary)' : 'var(--secondary)'
                    }}>
                      {action.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>{action.title}</h4>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{action.description}</p>
                    </div>
                    <ArrowRight size={20} style={{ color: '#9ca3af', marginTop: '4px' }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '16px' }}>Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--success)', borderRadius: '50%' }}></div>
                <span style={{ color: 'var(--text-secondary)' }}>Completed 45min focus session</span>
                <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>2h ago</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--primary)', borderRadius: '50%' }}></div>
                <span style={{ color: 'var(--text-secondary)' }}>Joined "Study Squad" group</span>
                <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>5h ago</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--warning)', borderRadius: '50%' }}></div>
                <span style={{ color: 'var(--text-secondary)' }}>Reached Level 5!</span>
                <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>1d ago</span>
              </div>
            </div>
          </div>

          {/* Friends Online */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Friends Online</h3>
              <Link to="/friends" style={{ fontSize: '14px', color: 'var(--primary)', textDecoration: 'none' }}>
                View all
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="friend-item">
                <div className="friend-avatar" style={{ fontSize: '14px' }}>A</div>
                <div className="friend-info">
                  <div className="friend-name">Alex Chen</div>
                  <div className="friend-status">Studying now</div>
                </div>
                <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--success)', borderRadius: '50%' }}></div>
              </div>
              <div className="friend-item">
                <div className="friend-avatar" style={{ fontSize: '14px' }}>S</div>
                <div className="friend-info">
                  <div className="friend-name">Sarah Johnson</div>
                  <div className="friend-status">Online</div>
                </div>
                <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--primary)', borderRadius: '50%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;