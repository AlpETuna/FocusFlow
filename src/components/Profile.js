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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #87ceeb, #228b22)'
    }}>
      <div className="grass-background"></div>
      
      <div className="container" style={{ padding: '32px 16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
              Your Profile 👤
            </h1>
            <p style={{ fontSize: '1.125rem', color: '#fef3c7' }}>
              Track your progress and celebrate your achievements
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
            {/* Profile Info */}
            <div>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <h2 className="card-title">Profile Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn btn-outline"
                      style={{ padding: '8px' }}
                    >
                      <Edit3 size={16} />
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handleEditSubmit}
                        className="btn btn-primary"
                        style={{ padding: '8px' }}
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="btn btn-outline"
                        style={{ padding: '8px' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <User size={20} style={{ color: '#228b22' }} />
                      <div>
                        <div style={{ fontWeight: '500', color: '#228b22' }}>{user?.name}</div>
                        <div style={{ fontSize: '14px', color: '#32cd32' }}>Name</div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Mail size={20} style={{ color: '#228b22' }} />
                      <div>
                        <div style={{ fontWeight: '500', color: '#228b22' }}>{user?.email}</div>
                        <div style={{ fontSize: '14px', color: '#32cd32' }}>Email</div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Calendar size={20} style={{ color: '#228b22' }} />
                      <div>
                        <div style={{ fontWeight: '500', color: '#228b22' }}>{getJoinDate()}</div>
                        <div style={{ fontSize: '14px', color: '#32cd32' }}>Member since</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tree Status */}
                <div style={{
                  marginTop: '24px',
                  padding: '16px',
                  backgroundColor: 'rgba(143, 188, 143, 0.2)',
                  borderRadius: '8px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#228b22', marginBottom: '4px' }}>
                      {getTreeLevelDescription()}
                    </div>
                    <div style={{ fontSize: '14px', color: '#32cd32' }}>
                      Level {user?.treeLevel || 1} Focus Tree
                    </div>
                  </div>
                </div>
              </div>

              {/* Tree Visualization */}
              <div className="card" style={{ marginTop: '24px' }}>
                <div className="card-header">
                  <h3 className="card-title">Your Focus Tree</h3>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <TreeVisualization level={user?.treeLevel || 1} animated={false} />
                </div>
              </div>
            </div>

            {/* Stats and Achievements */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Statistics */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Your Statistics</h2>
                  <p className="card-subtitle">Track your focus journey</p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {stats.map((stat, index) => (
                    <div key={index} style={{
                      padding: '16px',
                      backgroundColor: 'rgba(143, 188, 143, 0.2)',
                      borderRadius: '8px'
                    }}>
                      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center', color: stat.color === 'text-leaf-green' ? '#32cd32' : stat.color === 'text-forest-green' ? '#228b22' : stat.color === 'text-sage-green' ? '#9CAF88' : '#90EE90' }}>
                        {stat.icon}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#228b22' }}>
                          {stat.value}
                        </div>
                        <div style={{ fontSize: '14px', color: '#32cd32' }}>
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress to Next Level */}
                <div style={{ marginTop: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#32cd32', marginBottom: '8px' }}>
                    <span>Progress to Level {(user?.treeLevel || 1) + 1}</span>
                    <span>
                      {Math.min(((user?.totalFocusTime || 0) % 60) / 60 * 100, 100).toFixed(0)}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    backgroundColor: 'rgba(143, 188, 143, 0.3)',
                    borderRadius: '9999px',
                    height: '12px'
                  }}>
                    <div
                      style={{
                        background: 'linear-gradient(to right, #32cd32, #228b22)',
                        height: '12px',
                        borderRadius: '9999px',
                        transition: 'all 0.5s',
                        width: `${Math.min(((user?.totalFocusTime || 0) % 60) / 60 * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                  <div style={{ fontSize: '12px', textAlign: 'center', color: '#32cd32', marginTop: '4px' }}>
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
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      style={{
                        padding: '16px',
                        borderRadius: '8px',
                        border: '2px solid',
                        transition: 'all 0.3s',
                        background: achievement.unlocked ? 'linear-gradient(to right, #32cd32, #228b22)' : 'rgba(143, 188, 143, 0.2)',
                        color: achievement.unlocked ? 'white' : 'inherit',
                        borderColor: achievement.unlocked ? '#228b22' : 'rgba(143, 188, 143, 0.5)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ fontSize: '1.5rem' }}>{achievement.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', color: achievement.unlocked ? 'white' : '#228b22' }}>
                            {achievement.name}
                          </div>
                          <div style={{ fontSize: '14px', color: achievement.unlocked ? '#fef3c7' : '#32cd32' }}>
                            {achievement.description}
                          </div>
                          {achievement.unlocked && (
                            <div style={{ fontSize: '12px', color: '#fef3c7', marginTop: '4px', fontWeight: '500' }}>
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
              <div className="card" style={{ background: 'linear-gradient(to right, #32cd32, #228b22)', color: 'white' }}>
                <div className="card-header">
                  <h2 className="card-title" style={{ color: 'white' }}>💡 Focus Tips</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span>🌱</span>
                    <span>Start with shorter sessions (15-25 minutes) and gradually increase duration.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span>🌿</span>
                    <span>Take regular breaks to maintain focus quality throughout the day.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span>🌳</span>
                    <span>Consistency is key - daily short sessions beat occasional long ones.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
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