import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, UserPlus, Search, MessageCircle, Trophy, Clock } from 'lucide-react';

function Friends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [friendRequests, setFriendRequests] = useState([]);
  const [showAddFriend, setShowAddFriend] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockFriends = [
      {
        id: 1,
        name: 'Alex Chen',
        email: 'alex@example.com',
        treeLevel: 8,
        focusStreak: 12,
        status: 'studying',
        lastSeen: 'Now',
        totalFocusTime: 480,
        currentSession: 'Mathematics'
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        treeLevel: 6,
        focusStreak: 8,
        status: 'online',
        lastSeen: '5 minutes ago',
        totalFocusTime: 360,
        currentSession: null
      },
      {
        id: 3,
        name: 'Mike Davis',
        email: 'mike@example.com',
        treeLevel: 10,
        focusStreak: 20,
        status: 'offline',
        lastSeen: '2 hours ago',
        totalFocusTime: 600,
        currentSession: null
      },
      {
        id: 4,
        name: 'Emma Wilson',
        email: 'emma@example.com',
        treeLevel: 5,
        focusStreak: 5,
        status: 'studying',
        lastSeen: 'Now',
        totalFocusTime: 300,
        currentSession: 'Physics'
      }
    ];

    const mockRequests = [
      {
        id: 5,
        name: 'John Smith',
        email: 'john@example.com',
        treeLevel: 3,
        mutualFriends: 2
      }
    ];

    setFriends(mockFriends);
    setFriendRequests(mockRequests);
  }, []);

  const handleAddFriend = (email) => {
    // Mock API call
    console.log('Adding friend:', email);
    setShowAddFriend(false);
  };

  const handleAcceptRequest = (requestId) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (request) {
      setFriends([...friends, { ...request, status: 'offline', lastSeen: 'Just joined' }]);
      setFriendRequests(friendRequests.filter(r => r.id !== requestId));
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'studying': return 'studying';
      case 'online': return 'online';
      default: return 'offline';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-blue to-grass-green">
      <div className="grass-background"></div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <Users className="inline-block mr-3" size={40} />
            Friends
          </h1>
          <p className="text-lg text-cream">
            Connect with study buddies and grow together
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Friends List */}
            <div className="lg:col-span-2">
              <div className="compact-card mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-forest-green">Your Friends ({friends.length})</h2>
                  <button
                    onClick={() => setShowAddFriend(true)}
                    className="btn btn-primary text-sm px-4 py-2"
                  >
                    <UserPlus size={16} />
                    Add Friend
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-leaf-green" size={20} />
                  <input
                    type="text"
                    placeholder="Search friends..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-input pl-10 text-sm"
                  />
                </div>

                {/* Friends Grid */}
                <div className="friends-grid">
                  {filteredFriends.map(friend => (
                    <div key={friend.id} className="friend-card">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="friend-avatar">
                            {friend.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-forest-green">{friend.name}</h3>
                            <p className="text-sm text-leaf-green">{friend.email}</p>
                          </div>
                        </div>
                        <span className={`friend-status ${getStatusColor(friend.status)}`}>
                          {friend.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="compact-stat">
                          <div className="compact-stat-value">L{friend.treeLevel}</div>
                          <div className="compact-stat-label">Tree Level</div>
                        </div>
                        <div className="compact-stat">
                          <div className="compact-stat-value">{friend.focusStreak}</div>
                          <div className="compact-stat-label">Day Streak</div>
                        </div>
                      </div>

                      {friend.status === 'studying' && friend.currentSession && (
                        <div className="text-sm text-forest-green mb-2">
                          📚 Studying: {friend.currentSession}
                        </div>
                      )}

                      <div className="flex justify-between items-center text-sm text-leaf-green">
                        <span>Last seen: {friend.lastSeen}</span>
                        <button className="btn btn-outline text-xs px-2 py-1">
                          <MessageCircle size={12} />
                          Chat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Friend Requests */}
              {friendRequests.length > 0 && (
                <div className="compact-card">
                  <h3 className="font-bold text-forest-green mb-4">Friend Requests</h3>
                  {friendRequests.map(request => (
                    <div key={request.id} className="friend-card mb-3">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="friend-avatar text-sm">
                          {request.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-forest-green text-sm">{request.name}</h4>
                          <p className="text-xs text-leaf-green">Tree Level {request.treeLevel}</p>
                          <p className="text-xs text-leaf-green">{request.mutualFriends} mutual friends</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="btn btn-primary text-xs px-3 py-1 flex-1"
                        >
                          Accept
                        </button>
                        <button className="btn btn-outline text-xs px-3 py-1 flex-1">
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Stats */}
              <div className="compact-card">
                <h3 className="font-bold text-forest-green mb-4">Your Stats</h3>
                <div className="space-y-3">
                  <div className="compact-stat">
                    <div className="compact-stat-value">L{user?.treeLevel || 1}</div>
                    <div className="compact-stat-label">Tree Level</div>
                  </div>
                  <div className="compact-stat">
                    <div className="compact-stat-value">{user?.focusStreak || 0}</div>
                    <div className="compact-stat-label">Day Streak</div>
                  </div>
                  <div className="compact-stat">
                    <div className="compact-stat-value">{Math.floor((user?.totalFocusTime || 0) / 60)}h</div>
                    <div className="compact-stat-label">Total Focus Time</div>
                  </div>
                </div>
              </div>

              {/* Study Groups */}
              <div className="compact-card">
                <h3 className="font-bold text-forest-green mb-4">Study Groups</h3>
                <div className="space-y-2">
                  <div className="text-sm text-leaf-green text-center py-4">
                    <Users size={24} className="mx-auto mb-2 opacity-50" />
                    No study groups yet
                  </div>
                  <button className="btn btn-outline text-sm w-full">
                    <UserPlus size={16} />
                    Create Group
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Friend Modal */}
        {showAddFriend && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-forest-green mb-4">Add Friend</h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Friend's Email</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    className="form-input"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleAddFriend('example@email.com')}
                    className="btn btn-primary flex-1"
                  >
                    Send Request
                  </button>
                  <button
                    onClick={() => setShowAddFriend(false)}
                    className="btn btn-outline flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Friends;