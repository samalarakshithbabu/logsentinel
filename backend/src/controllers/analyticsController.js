const analyticsService = require('../services/analyticsService');

// Get hourly error trends
const getHourlyErrors = async (req, res, next) => {
  try {
    const projectId = req.query.projectId;
    const hours = parseInt(req.query.hours, 10) || 24;
    
    const data = await analyticsService.getHourlyErrors(projectId, hours);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// Get daily error trends
const getDailyErrors = async (req, res, next) => {
  try {
    const projectId = req.query.projectId;
    const days = parseInt(req.query.days, 10) || 7;
    
    const data = await analyticsService.getDailyErrors(projectId, days);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// Get route distribution
const getRouteDistribution = async (req, res, next) => {
  try {
    const projectId = req.query.projectId;
    const data = await analyticsService.getRouteDistribution(projectId);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// Get severity distribution
const getSeverityDistribution = async (req, res, next) => {
  try {
    const projectId = req.query.projectId;
    const data = await analyticsService.getSeverityDistribution(projectId);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// Detect spikes
const detectSpikes = async (req, res, next) => {
  try {
    const projectId = req.query.projectId;
    const data = await analyticsService.detectSpikes(projectId);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// Get top failing routes
const getTopFailingRoutes = async (req, res, next) => {
  try {
    const projectId = req.query.projectId;
    const limit = parseInt(req.query.limit, 10) || 10;
    
    const data = await analyticsService.getTopFailingRoutes(projectId, limit);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// Compare periods
const comparePeriods = async (req, res, next) => {
  try {
    // Placeholder for period comparison
    res.json({
      message: 'Period comparison feature',
      currentPeriod: { total: 0, critical: 0, high: 0, medium: 0, low: 0, info: 0 },
      previousPeriod: { total: 0, critical: 0, high: 0, medium: 0, low: 0, info: 0 },
      change: { total: '0%', critical: '0%', high: '0%', medium: '0%', low: '0%', info: '0%' }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHourlyErrors,
  getDailyErrors,
  getRouteDistribution,
  getSeverityDistribution,
  detectSpikes,
  getTopFailingRoutes,
  comparePeriods
};