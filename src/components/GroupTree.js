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
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-primary mb-2">Group Trees</h1>
        <p className="text-secondary">Grow trees together with your study groups</p>
      </div>

      {/* Groups List */}
      <div className="grid grid-cols-3 mb-4">
        <div className="col-span-1">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Your Groups</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary btn-sm"
              >
                <Plus size={16} />
                Create
              </button>
            </div>

            <div className="space-y-2">
              {groups.map(group => (
                <div
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedGroup?.id === group.id
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{group.name}</h3>
                      <p className={`text-sm ${
                        selectedGroup?.id === group.id ? 'text-white opacity-80' : 'text-secondary'
                      }`}>
                        {group.members.length} members • {group.streak} day streak
                      </p>
                    </div>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
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
          <div className="col-span-2">
            <div className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedGroup.name}</h2>
                  <p className="text-secondary">{selectedGroup.goal}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="btn btn-outline btn-sm"
                  >
                    <Plus size={16} />
                    Invite
                  </button>
                  <button className="btn btn-outline btn-sm">
                    <Settings size={16} />
                  </button>
                </div>
              </div>

              {/* Tree Health Warning */}
              {selectedGroup.treeHealth < 70 && (
                <div className="bg-warning bg-opacity-10 border border-warning rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={20} className="text-warning" />
                    <p className="text-sm">
                      Your group tree needs attention! {
                        selectedGroup.members.filter(m => !m.isActive).length
                      } members haven't studied today.
                    </p>
                  </div>
                </div>
              )}

              {/* Group Tree Visualization */}
              <div className="group-tree-container mb-4">
                <div className="relative w-full h-full">
                  {/* Central Tree */}
                  <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    style={{
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
                        <div className="text-xs text-secondary">
                          {member.focusTime}h today
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tree Health Bar */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white bg-opacity-90 rounded-lg p-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold">Tree Health</span>
                      <span>{selectedGroup.treeHealth}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${selectedGroup.treeHealth}%`,
                          backgroundColor: getHealthColor(selectedGroup.treeHealth)
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Group Stats */}
              <div className="grid grid-cols-4 gap-3 mb-4">
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
                <h3 className="font-semibold mb-3">Members</h3>
                <div className="space-y-2">
                  {selectedGroup.members.map(member => (
                    <div key={member.id} className="friend-item">
                      <div className="friend-avatar">{member.avatar}</div>
                      <div className="friend-info">
                        <div className="friend-name">{member.name}</div>
                        <div className="friend-status">
                          {member.isActive ? '🟢 Studying now' : '⚪ Last seen 2h ago'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{member.focusTime}h</div>
                        <div className="text-xs text-secondary">today</div>
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
                className="btn btn-outline btn-sm"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
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

              <div className="flex gap-3">
                <button
                  onClick={handleCreateGroup}
                  className="btn btn-primary flex-1"
                  disabled={!groupName || !groupGoal}
                >
                  <Check size={16} />
                  Create Group
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-outline flex-1"
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
                className="btn btn-outline btn-sm"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
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

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  When all members maintain their daily focus goals, the group tree thrives. 
                  If members skip days, the tree's health decreases!
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleInviteMember}
                  className="btn btn-primary flex-1"
                  disabled={!inviteEmail}
                >
                  <Plus size={16} />
                  Send Invite
                </button>
                <button
                  onClick={() => setShowInviteModal(false)}
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
  );
};

export default GroupTree;