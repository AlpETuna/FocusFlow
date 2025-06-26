import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Play, TrendingUp, Clock, Target, Users, Trophy, TreePine, ArrowRight } from 'lucide-react';
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
      value: user?.treeLevel || 1,
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-secondary">
          Ready to grow your focus tree today?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 mb-6">
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
      <div className="grid grid-cols-3 gap-6">
        {/* Tree Visualization */}
        <div className="col-span-2">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold mb-1">Your Focus Tree</h2>
                <p className="text-secondary text-sm">
                  Level {user?.treeLevel || 1} • Keep growing!
                </p>
              </div>
              <Link to="/focus" className="btn btn-primary">
                <Play size={16} />
                Start Session
              </Link>
            </div>
            
            <div className="tree-container">
              <TreeVisualization level={user?.treeLevel || 1} />
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-secondary mb-2">
                <span>Progress to Level {(user?.treeLevel || 1) + 1}</span>
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
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className="block p-4 rounded-lg border border-gray-200 hover:border-primary transition-all hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-${action.color} bg-opacity-10 text-${action.color}`}>
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{action.title}</h4>
                      <p className="text-sm text-secondary">{action.description}</p>
                    </div>
                    <ArrowRight size={20} className="text-gray-400 mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-secondary">Completed 45min focus session</span>
                <span className="text-xs text-gray-400 ml-auto">2h ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-secondary">Joined "Study Squad" group</span>
                <span className="text-xs text-gray-400 ml-auto">5h ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-warning rounded-full"></div>
                <span className="text-secondary">Reached Level 5!</span>
                <span className="text-xs text-gray-400 ml-auto">1d ago</span>
              </div>
            </div>
          </div>

          {/* Friends Online */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Friends Online</h3>
              <Link to="/friends" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-2">
              <div className="friend-item">
                <div className="friend-avatar text-sm">A</div>
                <div className="friend-info">
                  <div className="friend-name">Alex Chen</div>
                  <div className="friend-status">Studying now</div>
                </div>
                <div className="w-2 h-2 bg-success rounded-full"></div>
              </div>
              <div className="friend-item">
                <div className="friend-avatar text-sm">S</div>
                <div className="friend-info">
                  <div className="friend-name">Sarah Johnson</div>
                  <div className="friend-status">Online</div>
                </div>
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;