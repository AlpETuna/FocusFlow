import React, { useState, useEffect } from 'react';
import { Users, Plus, Settings, AlertCircle, Check, X, TreePine } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const GroupTree = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupGoal, setGroupGoal] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    const mockGroups = [
      {
        id: 1,
        name: 'Study Squad',
        goal: 'Complete 100 hours of focused study',
        members: [
          { id: 1, name: 'You', email: user?.email, focusTime: 45, isActive: true, avatar: 'Y' },
          { id: 2, name: 'Alex Chen', email: 'alex@example.com', focusTime: 38, isActive: true, avatar: 'A' },
          { id: 3, name: 'Sarah J.', email: 'sarah@example.com', focusTime: 52, isActive: false, avatar: 'S' },
          { id: 4, name: 'Mike D.', email: 'mike@example.com', focusTime: 41, isActive: true, avatar: 'M' }
        ],
        treeHealth: 85,
        totalFocusTime: 176,
        createdAt: '2025-01-15',
        dailyGoal: 8, // hours per day
        streak: 5
      },
      {
        id: 2,
        name: 'Finals Warriors',
        goal: 'Ace our final exams together',
        members: [
          { id: 1, name: 'You', email: user?.email, focusTime: 32, isActive: false, avatar: 'Y' },
          { id: 5, name: 'Emma W.', email: 'emma@example.com', focusTime: 28, isActive: true, avatar: 'E' }
        ],
        treeHealth: 65,
        totalFocusTime: 60,
        createdAt: '2025-01-20',
        dailyGoal: 6,
        streak: 2
      }
    ];
    setGroups(mockGroups);
    setSelectedGroup(mockGroups[0]);
  }, [user]);

  const calculateTreeSize = (health) => {
    const baseSize = 100;
    return baseSize + (health * 2);
  };

  const getMemberPosition = (index, total) => {
    const angle = (index * 360) / total;
    const radius = 120;
    const x = 50 + radius * Math.cos((angle - 90) * Math.PI / 180) * 0.4;
    const y = 50 + radius * Math.sin((angle - 90) * Math.PI / 180) * 0.4;
    return { x: `${x}%`, y: `${y}%` };
  };

  const getHealthColor = (health) => {
    if (health >= 80) return '#22c55e';
    if (health >= 60) return '#f59e0b';
    if (health >= 40) return '#fb923c';
    return '#ef4444';
  };

  const handleCreateGroup = () => {
    // API call to create group
    console.log('Creating group:', { name: groupName, goal: groupGoal });
    setShowCreateModal(false);
    setGroupName('');
    setGroupGoal('');
  };

  const handleInviteMember = () => {
    // API call to invite member
    console.log('Inviting member:', inviteEmail);
    setShowInviteModal(false);
    setInviteEmail('');
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>Group Trees</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Grow trees together with your study groups</p>
      </div>

      {/* Groups List */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', marginBottom: '32px' }}>
        <div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Your Groups</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
                style={{ fontSize: '14px', padding: '6px 12px' }}
              >
                <Plus size={16} />
                Create
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {groups.map(group => (
                <div
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    backgroundColor: selectedGroup?.id === group.id ? 'var(--primary)' : 'transparent',
                    color: selectedGroup?.id === group.id ? 'white' : 'inherit',
                    ':hover': {
                      backgroundColor: selectedGroup?.id === group.id ? 'var(--primary)' : '#f9fafb'
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (selectedGroup?.id !== group.id) {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedGroup?.id !== group.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontWeight: '600' }}>{group.name}</h3>
                      <p style={{
                        fontSize: '14px',
                        color: selectedGroup?.id === group.id ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-secondary)'
                      }}>
                        {group.members.length} members • {group.streak} day streak
                      </p>
                    </div>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: getHealthColor(group.treeHealth),
                        color: 'white'
                      }}
                    >
                      {group.treeHealth}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Group Details */}
        {selectedGroup && (
          <div>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{selectedGroup.name}</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>{selectedGroup.goal}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="btn btn-outline"
                    style={{ fontSize: '14px', padding: '6px 12px' }}
                  >
                    <Plus size={16} />
                    Invite
                  </button>
                  <button className="btn btn-outline" style={{ fontSize: '14px', padding: '6px 12px' }}>
                    <Settings size={16} />
                  </button>
                </div>
              </div>

              {/* Tree Health Warning */}
              {selectedGroup.treeHealth < 70 && (
                <div style={{
                  backgroundColor: 'rgba(251, 146, 60, 0.1)',
                  border: '1px solid #fb923c',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={20} style={{ color: '#fb923c' }} />
                    <p style={{ fontSize: '14px' }}>
                      Your group tree needs attention! {
                        selectedGroup.members.filter(m => !m.isActive).length
                      } members haven't studied today.
                    </p>
                  </div>
                </div>
              )}

              {/* Group Tree Visualization */}
              <div className="group-tree-container" style={{ marginBottom: '16px' }}>
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  {/* Central Tree */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: `${calculateTreeSize(selectedGroup.treeHealth)}px`,
                      height: `${calculateTreeSize(selectedGroup.treeHealth)}px`
                    }}
                  >
                    <TreePine
                      size={calculateTreeSize(selectedGroup.treeHealth)}
                      color={getHealthColor(selectedGroup.treeHealth)}
                      strokeWidth={1.5}
                    />
                  </div>

                  {/* Member Avatars */}
                  {selectedGroup.members.map((member, index) => {
                    const position = getMemberPosition(index, selectedGroup.members.length);
                    return (
                      <div
                        key={member.id}
                        className="group-member"
                        style={{ left: position.x, top: position.y }}
                      >
                        <div className="group-member-avatar">
                          {member.avatar}
                          <div className={`group-member-status ${
                            member.isActive ? 'status-focusing' : 'status-inactive'
                          }`} />
                        </div>
                        <div className="group-member-name">
                          {member.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {member.focusTime}h today
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tree Health Bar */}
                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  right: '16px'
                }}>
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    padding: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600' }}>Tree Health</span>
                      <span>{selectedGroup.treeHealth}%</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          transition: 'all 0.5s',
                          width: `${selectedGroup.treeHealth}%`,
                          backgroundColor: getHealthColor(selectedGroup.treeHealth)
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Group Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div className="stat-card">
                  <div className="stat-value">{selectedGroup.totalFocusTime}h</div>
                  <div className="stat-label">Total Focus</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{selectedGroup.dailyGoal}h</div>
                  <div className="stat-label">Daily Goal</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{selectedGroup.streak}</div>
                  <div className="stat-label">Day Streak</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{selectedGroup.members.length}</div>
                  <div className="stat-label">Members</div>
                </div>
              </div>

              {/* Members List */}
              <div>
                <h3 style={{ fontWeight: '600', marginBottom: '12px' }}>Members</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedGroup.members.map(member => (
                    <div key={member.id} className="friend-item">
                      <div className="friend-avatar">{member.avatar}</div>
                      <div className="friend-info">
                        <div className="friend-name">{member.name}</div>
                        <div className="friend-status">
                          {member.isActive ? '🟢 Studying now' : '⚪ Last seen 2h ago'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '600' }}>{member.focusTime}h</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>today</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Study Group</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-outline"
                style={{ fontSize: '14px', padding: '6px 12px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g., Study Squad"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Group Goal</label>
                <input
                  type="text"
                  value={groupGoal}
                  onChange={(e) => setGroupGoal(e.target.value)}
                  placeholder="e.g., Complete 100 hours of focused study"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleCreateGroup}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={!groupName || !groupGoal}
                >
                  <Check size={16} />
                  Create Group
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
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

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Invite to {selectedGroup?.name}</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="btn btn-outline"
                style={{ fontSize: '14px', padding: '6px 12px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Friend's Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="form-input"
                />
              </div>

              <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '12px'
              }}>
                <p style={{ fontSize: '14px', color: '#1e40af' }}>
                  When all members maintain their daily focus goals, the group tree thrives.
                  If members skip days, the tree's health decreases!
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleInviteMember}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={!inviteEmail}
                >
                  <Plus size={16} />
                  Send Invite
                </button>
                <button
                  onClick={() => setShowInviteModal(false)}
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
  );
};

export default GroupTree;