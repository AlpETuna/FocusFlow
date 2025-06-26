import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Calendar, Trophy, Target, Clock, TrendingUp, Edit3, Save, X } from 'lucide-react';
import TreeVisualization from './TreeVisualization';

function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateUser(editForm);
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || ''
    });
    setIsEditing(false);
  };

  const getJoinDate = () => {
    if (user?.createdAt) {
      return new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'Recently';
  };

  const getTreeLevelDescription = () => {
    const level = user?.treeLevel || 1;
    if (level === 1) return "🌱 Seedling - Just getting started!";
    if (level <= 3) return "🌿 Sapling - Building good habits!";
    if (level <= 5) return "🌳 Young Tree - Growing strong!";
    if (level <= 8) return "🌲 Mature Tree - Excellent focus!";
    return "🌳 Mighty Oak - Focus Master!";
  };

  const achievements = [
    {
      id: 'first_session',
      name: 'First Steps',
      description: 'Complete your first focus session',
      icon: '🌱',
      unlocked: (user?.totalFocusTime || 0) > 0
    },
    {
      id: 'hour_focused',
      name: 'Focused Hour',
      description: 'Accumulate 1 hour of focus time',
      icon: '⏰',
      unlocked: (user?.totalFocusTime || 0) >= 60
    },
    {
      id: 'level_5',
      name: 'Growing Strong',
      description: 'Reach tree level 5',
      icon: '🌳',
      unlocked: (user?.treeLevel || 1) >= 5
    },
    {
      id: 'week_streak',
      name: 'Consistent Focus',
      description: 'Maintain a 7-day focus streak',
      icon: '🔥',
      unlocked: (user?.focusStreak || 0) >= 7
    },
    {
      id: 'ten_hours',
      name: 'Dedication',
      description: 'Accumulate 10 hours of focus time',
      icon: '💪',
      unlocked: (user?.totalFocusTime || 0) >= 600
    },
    {
      id: 'level_10',
      name: 'Focus Master',
      description: 'Reach tree level 10',
      icon: '👑',
      unlocked: (user?.treeLevel || 1) >= 10
    }
  ];

  const stats = [
    {
      label: 'Total Focus Time',
      value: `${Math.floor((user?.totalFocusTime || 0) / 60)}h ${(user?.totalFocusTime || 0) % 60}m`,
      icon: <Clock size={20} />,
      color: 'text-leaf-green'
    },
    {
      label: 'Current Streak',
      value: `${user?.focusStreak || 0} days`,
      icon: <Target size={20} />,
      color: 'text-forest-green'
    },
    {
      label: 'Tree Level',
      value: user?.treeLevel || 1,
      icon: <TrendingUp size={20} />,
      color: 'text-sage-green'
    },
    {
      label: 'Sessions Today',
      value: user?.sessionsToday || 0,
      icon: <Trophy size={20} />,
      color: 'text-light-green'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-blue to-grass-green">
      <div className="grass-background"></div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Your Profile 👤
            </h1>
            <p className="text-lg text-cream">
              Track your progress and celebrate your achievements
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-1">
              <div className="card">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="card-title">Profile Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn btn-outline p-2"
                    >
                      <Edit3 size={16} />
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleEditSubmit}
                        className="btn btn-primary p-2"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="btn btn-outline p-2"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div className="form-group">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="form-input"
                        required
                      />
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User size={20} className="text-forest-green" />
                      <div>
                        <div className="font-medium text-forest-green">{user?.name}</div>
                        <div className="text-sm text-leaf-green">Name</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail size={20} className="text-forest-green" />
                      <div>
                        <div className="font-medium text-forest-green">{user?.email}</div>
                        <div className="text-sm text-leaf-green">Email</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar size={20} className="text-forest-green" />
                      <div>
                        <div className="font-medium text-forest-green">{getJoinDate()}</div>
                        <div className="text-sm text-leaf-green">Member since</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tree Status */}
                <div className="mt-6 p-4 bg-sage-green bg-opacity-20 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-forest-green mb-1">
                      {getTreeLevelDescription()}
                    </div>
                    <div className="text-sm text-leaf-green">
                      Level {user?.treeLevel || 1} Focus Tree
                    </div>
                  </div>
                </div>
              </div>

              {/* Tree Visualization */}
              <div className="card mt-6">
                <div className="card-header">
                  <h3 className="card-title">Your Focus Tree</h3>
                </div>
                <div className="flex justify-center">
                  <TreeVisualization level={user?.treeLevel || 1} animated={false} />
                </div>
              </div>
            </div>

            {/* Stats and Achievements */}
            <div className="lg:col-span-2 space-y-8">
              {/* Statistics */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Your Statistics</h2>
                  <p className="card-subtitle">Track your focus journey</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="p-4 bg-sage-green bg-opacity-20 rounded-lg">
                      <div className={`${stat.color} mb-2 flex justify-center`}>
                        {stat.icon}
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-forest-green">
                          {stat.value}
                        </div>
                        <div className="text-sm text-leaf-green">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress to Next Level */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-leaf-green mb-2">
                    <span>Progress to Level {(user?.treeLevel || 1) + 1}</span>
                    <span>
                      {Math.min(((user?.totalFocusTime || 0) % 60) / 60 * 100, 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-sage-green bg-opacity-30 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-leaf-green to-forest-green h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(((user?.totalFocusTime || 0) % 60) / 60 * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-center text-leaf-green mt-1">
                    {60 - ((user?.totalFocusTime || 0) % 60)} minutes to next level
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Achievements</h2>
                  <p className="card-subtitle">
                    {achievements.filter(a => a.unlocked).length} of {achievements.length} unlocked
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        achievement.unlocked
                          ? 'bg-gradient-to-r from-leaf-green to-forest-green text-white border-forest-green'
                          : 'bg-sage-green bg-opacity-20 border-sage-green border-opacity-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <div className={`font-bold ${
                            achievement.unlocked ? 'text-white' : 'text-forest-green'
                          }`}>
                            {achievement.name}
                          </div>
                          <div className={`text-sm ${
                            achievement.unlocked ? 'text-cream' : 'text-leaf-green'
                          }`}>
                            {achievement.description}
                          </div>
                          {achievement.unlocked && (
                            <div className="text-xs text-cream mt-1 font-medium">
                              ✓ Unlocked
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Focus Tips */}
              <div className="card bg-gradient-to-r from-leaf-green to-forest-green text-white">
                <div className="card-header">
                  <h2 className="card-title text-white">💡 Focus Tips</h2>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <span>🌱</span>
                    <span>Start with shorter sessions (15-25 minutes) and gradually increase duration.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span>🌿</span>
                    <span>Take regular breaks to maintain focus quality throughout the day.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span>🌳</span>
                    <span>Consistency is key - daily short sessions beat occasional long ones.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span>🌲</span>
                    <span>Remove distractions and create a dedicated focus environment.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;