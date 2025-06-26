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

  const getRankClass = (rank) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'rank-other';
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
    <div className="min-h-screen bg-gradient-to-b from-sky-blue to-grass-green">
      <div className="grass-background"></div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <Trophy className="inline-block mr-3" size={40} />
            Leaderboard
          </h1>
          <p className="text-lg text-cream">
            Compete with friends and climb the rankings
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Leaderboard */}
            <div className="lg:col-span-3">
              <div className="compact-card mb-6">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <label className="form-label text-sm">Time Period</label>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="form-input text-sm"
                    >
                      {periods.map(period => (
                        <option key={period.value} value={period.value}>
                          {period.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="form-label text-sm">Metric</label>
                    <select
                      value={selectedMetric}
                      onChange={(e) => setSelectedMetric(e.target.value)}
                      className="form-input text-sm"
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
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {leaderboardData.slice(0, 3).map((item, index) => (
                    <div
                      key={item.id}
                      className={`text-center ${index === 0 ? 'order-2' : index === 1 ? 'order-1' : 'order-3'}`}
                    >
                      <div className={`podium-step ${index === 0 ? 'h-24' : index === 1 ? 'h-20' : 'h-16'} bg-gradient-to-t from-sage-green to-light-green rounded-t-lg mb-4 flex items-end justify-center pb-2`}>
                        <div className="text-white font-bold text-2xl">
                          {index + 1}
                        </div>
                      </div>
                      <div className="friend-avatar mx-auto mb-2">
                        {item.avatar}
                      </div>
                      <h3 className="font-bold text-forest-green text-sm">{item.name}</h3>
                      <p className="text-xs text-leaf-green">{getMetricValue(item)}</p>
                      {index === 0 && <Trophy className="mx-auto mt-1 text-yellow-500" size={20} />}
                      {index === 1 && <Medal className="mx-auto mt-1 text-gray-400" size={20} />}
                      {index === 2 && <Award className="mx-auto mt-1 text-orange-600" size={20} />}
                    </div>
                  ))}
                </div>

                {/* Full Leaderboard */}
                <div className="space-y-2">
                  <h3 className="font-bold text-forest-green mb-4">
                    Full Rankings - {getMetricLabel()}
                  </h3>
                  {leaderboardData.map((item, index) => (
                    <div
                      key={item.id}
                      className={`leaderboard-item ${item.isCurrentUser ? 'bg-light-green bg-opacity-20 border-2 border-light-green' : ''}`}
                    >
                      <div className={`leaderboard-rank ${getRankClass(item.rank)}`}>
                        {item.rank}
                      </div>
                      
                      <div className="friend-avatar mr-4">
                        {item.avatar}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-forest-green">
                              {item.name} {item.isCurrentUser && '(You)'}
                            </h4>
                            <p className="text-sm text-leaf-green">Tree Level {item.treeLevel}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-forest-green">
                              {getMetricValue(item)}
                            </div>
                            <div className={`text-xs ${item.change.startsWith('+') ? 'text-green-600' : item.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'}`}>
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
            <div className="space-y-6">
              {/* Your Rank */}
              <div className="compact-card">
                <h3 className="font-bold text-forest-green mb-4">Your Ranking</h3>
                <div className="text-center">
                  <div className="friend-avatar mx-auto mb-3">
                    {(user?.name || 'Y').charAt(0)}
                  </div>
                  <div className="text-2xl font-bold text-forest-green mb-1">#{leaderboardData.find(item => item.isCurrentUser)?.rank || 5}</div>
                  <div className="text-sm text-leaf-green mb-3">out of {leaderboardData.length} friends</div>
                  <div className="text-xs text-green-600">↗ +3 this week</div>
                </div>
              </div>

              {/* Achievement Badges */}
              <div className="compact-card">
                <h3 className="font-bold text-forest-green mb-4">Recent Achievements</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Trophy size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-forest-green">First Place</div>
                      <div className="text-xs text-leaf-green">Weekly focus time</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <Award size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-forest-green">Streak Master</div>
                      <div className="text-xs text-leaf-green">7 day streak</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                      <TreePine size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-forest-green">Tree Grower</div>
                      <div className="text-xs text-leaf-green">Reached level 5</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Competitive Challenges */}
              <div className="compact-card">
                <h3 className="font-bold text-forest-green mb-4">Active Challenges</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-light-green bg-opacity-20 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-forest-green">Weekly Sprint</span>
                      <span className="text-xs text-leaf-green">3 days left</span>
                    </div>
                    <div className="text-xs text-leaf-green mb-2">Beat your friends this week</div>
                    <div className="w-full bg-sage-green bg-opacity-30 rounded-full h-2">
                      <div className="bg-light-green h-2 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                  <button className="btn btn-outline text-sm w-full">
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