import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Medal, Award, Clock, TreePine, Users, TrendingUp } from 'lucide-react';

function Leaderboard() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [selectedMetric, setSelectedMetric] = useState('focusTime');
  const [leaderboardData, setLeaderboardData] = useState([]);

  // Mock data for demonstration
  useEffect(() => {
    const mockData = [
      {
        id: 1,
        name: 'Mike Davis',
        email: 'mike@example.com',
        treeLevel: 10,
        focusTime: 8400, // in minutes
        sessionsCount: 120,
        streak: 20,
        avatar: 'M',
        rank: 1,
        change: '+2'
      },
      {
        id: 2,
        name: 'Alex Chen',
        email: 'alex@example.com',
        treeLevel: 8,
        focusTime: 7200,
        sessionsCount: 98,
        streak: 15,
        avatar: 'A',
        rank: 2,
        change: '0'
      },
      {
        id: 3,
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        treeLevel: 7,
        focusTime: 6800,
        sessionsCount: 85,
        streak: 12,
        avatar: 'S',
        rank: 3,
        change: '-1'
      },
      {
        id: 4,
        name: 'Emma Wilson',
        email: 'emma@example.com',
        treeLevel: 6,
        focusTime: 5400,
        sessionsCount: 72,
        streak: 8,
        avatar: 'E',
        rank: 4,
        change: '+1'
      },
      {
        id: 5,
        name: user?.name || 'You',
        email: user?.email || 'you@example.com',
        treeLevel: user?.treeLevel || 3,
        focusTime: user?.totalFocusTime || 300,
        sessionsCount: user?.sessionsToday || 5,
        streak: user?.focusStreak || 2,
        avatar: (user?.name || 'Y').charAt(0),
        rank: 5,
        change: '+3',
        isCurrentUser: true
      },
      {
        id: 6,
        name: 'David Kim',
        email: 'david@example.com',
        treeLevel: 5,
        focusTime: 4200,
        sessionsCount: 55,
        streak: 6,
        avatar: 'D',
        rank: 6,
        change: '-2'
      }
    ];

    setLeaderboardData(mockData);
  }, [user]);

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getMetricValue = (item) => {
    switch (selectedMetric) {
      case 'focusTime':
        return formatTime(item.focusTime);
      case 'sessions':
        return item.sessionsCount;
      case 'streak':
        return `${item.streak} days`;
      case 'treeLevel':
        return `L${item.treeLevel}`;
      default:
        return formatTime(item.focusTime);
    }
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'focusTime':
        return 'Focus Time';
      case 'sessions':
        return 'Sessions';
      case 'streak':
        return 'Streak';
      case 'treeLevel':
        return 'Tree Level';
      default:
        return 'Focus Time';
    }
  };

  const periods = [
    { value: 'daily', label: 'Today' },
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
    { value: 'allTime', label: 'All Time' }
  ];

  const metrics = [
    { value: 'focusTime', label: 'Focus Time', icon: Clock },
    { value: 'sessions', label: 'Sessions', icon: TrendingUp },
    { value: 'streak', label: 'Streak', icon: Award },
    { value: 'treeLevel', label: 'Tree Level', icon: TreePine }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 50%, #f0fff0 100%)'
    }}>
      <div className="container" style={{ padding: '32px 16px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '8px', color: 'var(--primary)' }}>
            <Trophy style={{ display: 'inline-block', marginRight: '12px', verticalAlign: 'middle' }} size={40} />
            Leaderboard
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
            Compete with friends and climb the rankings
          </p>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '32px' }}>
            {/* Main Leaderboard */}
            <div>
              <div className="card" style={{ marginBottom: '24px' }}>
                {/* Filters */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '14px' }}>Time Period</label>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="form-input"
                      style={{ fontSize: '14px' }}
                    >
                      {periods.map(period => (
                        <option key={period.value} value={period.value}>
                          {period.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '14px' }}>Metric</label>
                    <select
                      value={selectedMetric}
                      onChange={(e) => setSelectedMetric(e.target.value)}
                      className="form-input"
                      style={{ fontSize: '14px' }}
                    >
                      {metrics.map(metric => (
                        <option key={metric.value} value={metric.value}>
                          {metric.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Podium */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                  {leaderboardData.slice(0, 3).map((item, index) => (
                    <div
                      key={item.id}
                      style={{
                        textAlign: 'center',
                        order: index === 0 ? 2 : index === 1 ? 1 : 3
                      }}
                    >
                      <div style={{
                        height: index === 0 ? '96px' : index === 1 ? '80px' : '64px',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        paddingBottom: '8px',
                        background: 'linear-gradient(to top, var(--accent), var(--accent-light))'
                      }}>
                        <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem' }}>
                          {index + 1}
                        </div>
                      </div>
                      <div className="friend-avatar" style={{ margin: '0 auto 8px auto' }}>
                        {item.avatar}
                      </div>
                      <h3 style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '14px' }}>{item.name}</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{getMetricValue(item)}</p>
                      {index === 0 && <Trophy style={{ margin: '4px auto 0 auto', color: '#eab308' }} size={20} />}
                      {index === 1 && <Medal style={{ margin: '4px auto 0 auto', color: '#9ca3af' }} size={20} />}
                      {index === 2 && <Award style={{ margin: '4px auto 0 auto', color: '#ea580c' }} size={20} />}
                    </div>
                  ))}
                </div>

                {/* Full Leaderboard */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h3 style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '16px' }}>
                    Full Rankings - {getMetricLabel()}
                  </h3>
                  {leaderboardData.map((item, index) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '16px',
                        borderRadius: '8px',
                        transition: 'all 0.3s',
                        backgroundColor: item.isCurrentUser ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                        border: item.isCurrentUser ? '2px solid var(--success)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!item.isCurrentUser) {
                          e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!item.isCurrentUser) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        marginRight: '16px',
                        backgroundColor: item.rank <= 3 ? 'var(--primary)' : 'var(--text-secondary)'
                      }}>
                        {item.rank}
                      </div>
                      
                      <div className="friend-avatar" style={{ marginRight: '16px' }}>
                        {item.avatar}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <h4 style={{ fontWeight: '600', color: 'var(--primary)' }}>
                              {item.name} {item.isCurrentUser && '(You)'}
                            </h4>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Tree Level {item.treeLevel}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                              {getMetricValue(item)}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: item.change.startsWith('+') ? '#16a34a' : item.change.startsWith('-') ? '#dc2626' : '#6b7280'
                            }}>
                              {item.change !== '0' && (item.change.startsWith('+') ? '↗' : '↘')} {item.change}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Your Rank */}
              <div className="card">
                <h3 style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '16px' }}>Your Ranking</h3>
                <div style={{ textAlign: 'center' }}>
                  <div className="friend-avatar" style={{ margin: '0 auto 12px auto' }}>
                    {(user?.name || 'Y').charAt(0)}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>#{leaderboardData.find(item => item.isCurrentUser)?.rank || 5}</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>out of {leaderboardData.length} friends</div>
                  <div style={{ fontSize: '12px', color: '#16a34a' }}>↗ +3 this week</div>
                </div>
              </div>

              {/* Achievement Badges */}
              <div className="card">
                <h3 style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '16px' }}>Recent Achievements</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: 'linear-gradient(135deg, #fbbf24, #ea580c)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Trophy size={16} style={{ color: 'white' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary)' }}>First Place</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Weekly focus time</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: 'linear-gradient(135deg, #4ade80, #3b82f6)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Award size={16} style={{ color: 'white' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary)' }}>Streak Master</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>7 day streak</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: 'linear-gradient(135deg, #a78bfa, #ec4899)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <TreePine size={16} style={{ color: 'white' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary)' }}>Tree Grower</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Reached level 5</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Competitive Challenges */}
              <div className="card">
                <h3 style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '16px' }}>Active Challenges</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    padding: '12px',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary)' }}>Weekly Sprint</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>3 days left</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Beat your friends this week</div>
                    <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '8px' }}>
                      <div style={{ backgroundColor: 'var(--success)', height: '8px', borderRadius: '9999px', width: '70%' }}></div>
                    </div>
                  </div>
                  <button className="btn btn-outline" style={{ fontSize: '14px', width: '100%' }}>
                    <Users size={16} />
                    Join Challenge
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;