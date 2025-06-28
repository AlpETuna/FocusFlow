// API service for Root Focus backend communication

class RootFocusAPI {
  constructor(baseURL = process.env.REACT_APP_API_URL || 'https://your-api-gateway-url.amazonaws.com') {
    // Fix double /dev issue - remove any trailing /dev or /dev/dev
    let cleanURL = baseURL;
    
    // Remove multiple /dev patterns
    cleanURL = cleanURL.replace(/\/dev\/dev$/g, '');
    cleanURL = cleanURL.replace(/\/dev$/g, '');
    
    // Add single /dev at the end
    this.baseURL = `${cleanURL}/dev`;
    
    this.user = this.getStoredUser();
    console.log('🚀 Raw Environment URL:', process.env.REACT_APP_API_URL);
    console.log('🔧 Cleaned Base URL:', this.baseURL);
  }

  // Set user data (replaces token-based auth)
  setUser(user) {
    this.user = user;
    if (user) {
      localStorage.setItem('focusflow_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('focusflow_user');
    }
  }

  // Get stored user data
  getStoredUser() {
    try {
      const stored = localStorage.getItem('focusflow_user');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  }

  // Get user ID for headers
  getUserId() {
    return this.user?.userId || null;
  }

  // Make authenticated request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const userId = this.getUserId();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Use x-user-id header instead of Authorization Bearer token
    if (userId) {
      config.headers['x-user-id'] = userId;
    }

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        // Token expired or invalid
        this.setToken(null);
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Test method to check API connectivity
  async testConnection() {
    try {
      console.log('🔍 Testing API connection...');
      console.log('🌐 Base URL:', this.baseURL);
      console.log('🌐 Full URL:', `${this.baseURL}/auth/register`);
      
      // Try a simple OPTIONS request first to test CORS
      const testResponse = await fetch(`${this.baseURL}/auth/register`, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('✅ OPTIONS response status:', testResponse.status);
      console.log('✅ OPTIONS response headers:', Object.fromEntries(testResponse.headers.entries()));
      
      return { success: true, status: testResponse.status };
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Authentication methods
  async register(email, password, name) {
    // Test connection first
    await this.testConnection();
    
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    if (response.user) {
      this.setUser(response.user);
    }

    return response;
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.user) {
      this.setUser(response.user);
    }

    return response;
  }

  async getProfile() {
    return await this.request('/auth/profile');
  }

  async updateProfile(updates) {
    return await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  logout() {
    this.setUser(null);
  }

  // Focus session methods
  async startFocusSession(groupId = null, goal = 'Focus session') {
    return await this.request('/sessions/start', {
      method: 'POST',
      body: JSON.stringify({ groupId, goal }),
    });
  }

  async endFocusSession(sessionId) {
    return await this.request('/sessions/stop', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }

  async getFocusSessions(limit = 20, lastEvaluatedKey = null) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (lastEvaluatedKey) params.append('lastEvaluatedKey', lastEvaluatedKey);

    return await this.request(`/sessions?${params}`);
  }

  // Screen analysis methods
  async analyzeScreen(screenDescription, sessionId, timestamp = null) {
    return await this.request('/analysis/screen', {
      method: 'POST',
      body: JSON.stringify({
        screenDescription,
        sessionId,
        timestamp: timestamp || new Date().toISOString()
      }),
    });
  }

  // Group methods
  async createGroup(name, description = '', dailyGoalMinutes = 60) {
    return await this.request('/groups', {
      method: 'POST',
      body: JSON.stringify({ name, description, dailyGoalMinutes }),
    });
  }

  async getUserGroups() {
    return await this.request('/groups');
  }

  async getGroup(groupId) {
    return await this.request(`/groups/${groupId}`);
  }

  async joinGroup(groupId) {
    return await this.request(`/groups/${groupId}/join`, {
      method: 'POST',
    });
  }

  // Leaderboard methods
  async getLeaderboard(limit = 50, period = 'all') {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (period) params.append('period', period);

    return await this.request(`/leaderboard?${params}`);
  }

  async getFriendsLeaderboard(limit = 20) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);

    return await this.request(`/leaderboard/friends?${params}`);
  }

  // Friends methods
  async addFriend(email) {
    return await this.request('/friends/add', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getFriends() {
    return await this.request('/friends');
  }

  // Utility methods
  isAuthenticated() {
    return !!this.getUserId();
  }

  // Health check
  async healthCheck() {
    try {
      // Try to get profile as a health check
      if (this.isAuthenticated()) {
        await this.getProfile();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
const api = new RootFocusAPI();

export default api;

// Export class for testing or multiple instances
export { RootFocusAPI };