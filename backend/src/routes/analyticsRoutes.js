const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get analytics data
router.get('/hourly', analyticsController.getHourlyErrors);
router.get('/daily', analyticsController.getDailyErrors);
router.get('/routes', analyticsController.getRouteDistribution);
router.get('/severity', analyticsController.getSeverityDistribution);
router.get('/spikes', analyticsController.detectSpikes);
router.get('/top-routes', analyticsController.getTopFailingRoutes);
router.get('/comparison', analyticsController.comparePeriods);

module.exports = router;