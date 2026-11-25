const axios = require('axios');
const config = require('../config');

const analyticsClient = axios.create({
  baseURL: config.analytics.url,
  timeout: 30000
});

const getHourlyErrors = async (projectId, hours = 24) => {
  try {
    const response = await analyticsClient.get('/api/analytics/hourly', {
      params: { projectId, hours }
    });
    return response.data;
  } catch (error) {
    console.error('Analytics service error:', error.message);
    return { error: true, message: 'Failed to fetch hourly analytics' };
  }
};

const getDailyErrors = async (projectId, days = 7) => {
  try {
    const response = await analyticsClient.get('/api/analytics/daily', {
      params: { projectId, days }
    });
    return response.data;
  } catch (error) {
    console.error('Analytics service error:', error.message);
    return { error: true, message: 'Failed to fetch daily analytics' };
  }
};

const getRouteDistribution = async (projectId) => {
  try {
    const response = await analyticsClient.get('/api/analytics/routes', {
      params: { projectId }
    });
    return response.data;
  } catch (error) {
    console.error('Analytics service error:', error.message);
    return { error: true, message: 'Failed to fetch route distribution' };
  }
};

const getSeverityDistribution = async (projectId) => {
  try {
    const response = await analyticsClient.get('/api/analytics/severity', {
      params: { projectId }
    });
    return response.data;
  } catch (error) {
    console.error('Analytics service error:', error.message);
    return { error: true, message: 'Failed to fetch severity distribution' };
  }
};

const detectSpikes = async (projectId) => {
  try {
    const response = await analyticsClient.get('/api/analytics/spikes', {
      params: { projectId }
    });
    return response.data;
  } catch (error) {
    console.error('Analytics service error:', error.message);
    return { error: true, message: 'Failed to detect spikes' };
  }
};

const getTopFailingRoutes = async (projectId, limit = 10) => {
  try {
    const response = await analyticsClient.get('/api/analytics/top-routes', {
      params: { projectId, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Analytics service error:', error.message);
    return { error: true, message: 'Failed to fetch top routes' };
  }
};

module.exports = {
  getHourlyErrors,
  getDailyErrors,
  getRouteDistribution,
  getSeverityDistribution,
  detectSpikes,
  getTopFailingRoutes
};