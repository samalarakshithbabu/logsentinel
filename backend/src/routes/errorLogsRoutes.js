const express = require('express');
const router = express.Router();
const errorLogsController = require('../controllers/errorLogsController');
const { auth } = require('../middleware/auth');
const { createLogValidation, paginationValidation } = require('../middleware/validation');

// All routes require authentication
router.use(auth);

// Get all logs with pagination and filtering
router.get('/', paginationValidation, errorLogsController.getAllLogs);

// Get log statistics/summary
router.get('/summary', errorLogsController.getSummary);

// Get single log by ID
router.get('/:id', errorLogsController.getById);

// Create new log
router.post('/', createLogValidation, errorLogsController.create);

// Update log status
router.patch('/:id/status', errorLogsController.updateStatus);

// Add comment to log
router.post('/:id/comments', errorLogsController.addComment);

// Get comments for a log
router.get('/:id/comments', errorLogsController.getComments);

// Delete log (admin only)
router.delete('/:id', errorLogsController.delete);

module.exports = router;