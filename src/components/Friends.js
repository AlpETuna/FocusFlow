import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, UserPlus, Search, MessageCircle } from 'lucide-react';

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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 50%, #f0fff0 100%)'
    }}>

      <div className="container" style={{ padding: '32px 16px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '8px', color: 'var(--primary)' }}>
            <Users style={{ display: 'inline-block', marginRight: '12px', verticalAlign: 'middle' }} size={40} />
            Friends
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
            Connect with study buddies and grow together
          </p>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
            {/* Friends List */}
            <div>
              <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>Your Friends ({friends.length})</h2>
                  <button
                    onClick={() => setShowAddFriend(true)}
                    className="btn btn-primary"
                    style={{ fontSize: '14px', padding: '8px 16px' }}
                  >
                    <UserPlus size={16} />
                    Add Friend
                  </button>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                  <Search style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)'
                  }} size={20} />
                  <input
                    type="text"
                    placeholder="Search friends..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '40px', fontSize: '14px' }}
                  />
                </div>

                {/* Friends Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {filteredFriends.map(friend => (
                    <div key={friend.id} className="card" style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="friend-avatar">
                            {friend.name.charAt(0)}
                          </div>
                          <div>
                            <h3 style={{ fontWeight: '600', color: 'var(--primary)' }}>{friend.name}</h3>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{friend.email}</p>
                          </div>
                        </div>
                        <span className={`friend-status ${getStatusColor(friend.status)}`}>
                          {friend.status}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div className="stat-card">
                          <div className="stat-value">L{friend.treeLevel}</div>
                          <div className="stat-label">Tree Level</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-value">{friend.focusStreak}</div>
                          <div className="stat-label">Day Streak</div>
                        </div>
                      </div>

                      {friend.status === 'studying' && friend.currentSession && (
                        <div style={{ fontSize: '14px', color: 'var(--primary)', marginBottom: '8px' }}>
                          📚 Studying: {friend.currentSession}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Last seen: {friend.lastSeen}</span>
                        <button className="btn btn-outline" style={{ fontSize: '12px', padding: '4px 8px' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Friend Requests */}
              {friendRequests.length > 0 && (
                <div className="card">
                  <h3 style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '16px' }}>Friend Requests</h3>
                  {friendRequests.map(request => (
                    <div key={request.id} className="card" style={{ padding: '12px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div className="friend-avatar" style={{ fontSize: '14px' }}>
                          {request.name.charAt(0)}
                        </div>
                        <div>
                          <h4 style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '14px' }}>{request.name}</h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Tree Level {request.treeLevel}</p>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{request.mutualFriends} mutual friends</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="btn btn-primary"
                          style={{ fontSize: '12px', padding: '6px 12px', flex: 1 }}
                        >
                          Accept
                        </button>
                        <button className="btn btn-outline" style={{ fontSize: '12px', padding: '6px 12px', flex: 1 }}>
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Stats */}
              <div className="card">
                <h3 style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '16px' }}>Your Stats</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="stat-card">
                    <div className="stat-value">L{user?.level || 1}</div>
                    <div className="stat-label">Tree Level</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{user?.focusStreak || 0}</div>
                    <div className="stat-label">Day Streak</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{Math.floor((user?.totalFocusTime || 0) / 60)}h</div>
                    <div className="stat-label">Total Focus Time</div>
                  </div>
                </div>
              </div>

              {/* Study Groups */}
              <div className="card">
                <h3 style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '16px' }}>Study Groups</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center', padding: '16px 0' }}>
                    <Users size={24} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                    No study groups yet
                  </div>
                  <button className="btn btn-outline" style={{ fontSize: '14px', width: '100%' }}>
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
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '448px',
              width: '100%',
              margin: '0 16px'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '16px' }}>Add Friend</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label">Friend's Email</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    className="form-input"
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => handleAddFriend('example@email.com')}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    Send Request
                  </button>
                  <button
                    onClick={() => setShowAddFriend(false)}
                    className="btn btn-outline"
                    style={{ flex: 1 }}
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