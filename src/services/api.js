// API service for Root Focus backend communication

class RootFocusAPI {
  constructor(baseURL = process.env.REACT_APP_API_URL || 'https://your-api-gateway-url.amazonaws.com/dev') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('focusflow_token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('focusflow_token', token);
    } else {
      localStorage.removeItem('focusflow_token');
    }
  }

  // Get authentication token
  getToken() {
    return this.token || localStorage.getItem('focusflow_token');
  }

  // Make authenticated request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

  // Authentication methods
  async register(email, password, name) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.token) {
      this.setToken(response.token);
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
    this.setToken(null);
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
    return !!this.getToken();
  }

  // Health check
  async healthCheck() {
    try {
      // Try to get profile as a health check
      await this.getProfile();
      return true;
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