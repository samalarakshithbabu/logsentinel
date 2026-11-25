import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const ANALYTICS_URL = process.env.REACT_APP_ANALYTICS_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (data) => {
    const response = await api.post('/api/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => localStorage.getItem('token')
};

// Error Logs API
export const errorLogsAPI = {
  getAll: async (params = {}) => {
    const { page = 1, limit = 50, level, status, route, startDate, endDate, search } = params;
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(level && { level }),
      ...(status && { status }),
      ...(route && { route }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(search && { search })
    });
    
    const response = await api.get(`/api/error-logs?${queryParams}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/error-logs/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/api/error-logs', data);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/api/error-logs/${id}/status`, { status });
    return response.data;
  },

  getSummary: async (projectId) => {
    const url = projectId 
      ? `/api/error-logs/summary?projectId=${projectId}`
      : '/api/error-logs/summary';
    const response = await api.get(url);
    return response.data;
  },

  addComment: async (id, content) => {
    const response = await api.post(`/api/error-logs/${id}/comments`, { content });
    return response.data;
  },

  getComments: async (id) => {
    const response = await api.get(`/api/error-logs/${id}/comments`);
    return response.data;
  }
};

// Analytics API (Python service)
export const analyticsAPI = {
  getHourly: async (projectId, hours = 24) => {
    const url = projectId 
      ? `${ANALYTICS_URL}/api/analytics/hourly?projectId=${projectId}&hours=${hours}`
      : `${ANALYTICS_URL}/api/analytics/hourly?hours=${hours}`;
    const response = await axios.get(url);
    return response.data;
  },

  getDaily: async (projectId, days = 7) => {
    const url = projectId 
      ? `${ANALYTICS_URL}/api/analytics/daily?projectId=${projectId}&days=${days}`
      : `${ANALYTICS_URL}/api/analytics/daily?days=${days}`;
    const response = await axios.get(url);
    return response.data;
  },

  getRoutes: async (projectId, limit = 10) => {
    const url = projectId 
      ? `${ANALYTICS_URL}/api/analytics/routes?projectId=${projectId}&limit=${limit}`
      : `${ANALYTICS_URL}/api/analytics/routes?limit=${limit}`;
    const response = await axios.get(url);
    return response.data;
  },

  getSeverity: async (projectId) => {
    const url = projectId 
      ? `${ANALYTICS_URL}/api/analytics/severity?projectId=${projectId}`
      : `${ANALYTICS_URL}/api/analytics/severity`;
    const response = await axios.get(url);
    return response.data;
  },

  getSpikes: async (projectId) => {
    const url = projectId 
      ? `${ANALYTICS_URL}/api/analytics/spikes?projectId=${projectId}`
      : `${ANALYTICS_URL}/api/analytics/spikes`;
    const response = await axios.get(url);
    return response.data;
  },

  getTopRoutes: async (projectId, limit = 10) => {
    const url = projectId 
      ? `${ANALYTICS_URL}/api/analytics/top-routes?projectId=${projectId}&limit=${limit}`
      : `${ANALYTICS_URL}/api/analytics/top-routes?limit=${limit}`;
    const response = await axios.get(url);
    return response.data;
  },

  getTrend: async (projectId, days = 14) => {
    const url = projectId 
      ? `${ANALYTICS_URL}/api/analytics/trend?projectId=${projectId}&days=${days}`
      : `${ANALYTICS_URL}/api/analytics/trend?days=${days}`;
    const response = await axios.get(url);
    return response.data;
  },

  getSummary: async (projectId) => {
    const url = projectId 
      ? `${ANALYTICS_URL}/api/analytics/summary?projectId=${projectId}`
      : `${ANALYTICS_URL}/api/analytics/summary`;
    const response = await axios.get(url);
    return response.data;
  }
};

export default api;