const errorLogsService = require('../services/errorLogsService');
const { validationResult } = require('express-validator');

// Get all error logs
const getAllLogs = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const filters = {
      level: req.query.level,
      status: req.query.status,
      route: req.query.route,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      projectId: req.query.projectId,
      search: req.query.search
    };
    
    const pagination = {
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 50
    };
    
    const result = await errorLogsService.getAllLogs(filters, pagination);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get single log
const getById = async (req, res, next) => {
  try {
    const log = await errorLogsService.getLogById(req.params.id);
    
    if (!log) {
      return res.status(404).json({ message: 'Error log not found' });
    }
    
    res.json(log);
  } catch (error) {
    next(error);
  }
};

// Create new log
const create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const logData = {
      level: req.body.level,
      message: req.body.message,
      stack: req.body.stack,
      route: req.body.route,
      method: req.body.method,
      projectId: req.body.projectId,
      userId: req.body.userId,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection?.remoteAddress,
      requestParams: req.body.requestParams,
      requestHeaders: req.body.requestHeaders,
      environment: req.body.environment || process.env.NODE_ENV,
      version: req.body.version,
      metadata: req.body.metadata
    };
    
    const result = await errorLogsService.createLog(logData);
    
    if (result.isDuplicate) {
      return res.status(200).json({
        message: 'Duplicate error - occurrence count increased',
        logId: result.id,
        isDuplicate: true
      });
    }
    
    res.status(201).json({
      message: 'Error log created successfully',
      logId: result.id,
      isDuplicate: false
    });
  } catch (error) {
    next(error);
  }
};

// Update log status
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'investigating', 'resolved', 'ignored'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const log = await errorLogsService.updateLogStatus(
      req.params.id,
      status,
      req.user.id
    );
    
    if (!log) {
      return res.status(404).json({ message: 'Error log not found' });
    }
    
    res.json({ message: 'Status updated successfully', log });
  } catch (error) {
    next(error);
  }
};

// Add comment
const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }
    
    const pool = require('../config/database');
    const [result] = await pool.execute(
      'INSERT INTO comments (error_log_id, user_id, content) VALUES (?, ?, ?)',
      [req.params.id, req.user.id, content.trim()]
    );
    
    res.status(201).json({
      message: 'Comment added successfully',
      commentId: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

// Get comments
const getComments = async (req, res, next) => {
  try {
    const pool = require('../config/database');
    const [rows] = await pool.query(
      `SELECT c.*, u.name as user_name 
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.error_log_id = ? 
       ORDER BY c.created_at DESC`,
      [req.params.id]
    );
    
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

// Get summary statistics
const getSummary = async (req, res, next) => {
  try {
    const projectId = req.query.projectId;
    const statistics = await errorLogsService.getStatistics(projectId);
    
    // Get recent high-severity errors
    const pool = require('../config/database');
    const [recentCritical] = await pool.query(`
      SELECT * FROM error_logs 
      WHERE error_type IN ('critical', 'high') 
      ${projectId ? 'AND project_id = ?' : ''}
      ORDER BY created_at DESC 
      LIMIT 5
    `, projectId ? [projectId] : []);
    
    res.json({
      statistics,
      recentCritical
    });
  } catch (error) {
    next(error);
  }
};

// Delete log
const delete = async (req, res, next) => {
  try {
    const pool = require('../config/database');
    
    // Only admin can delete logs
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    const [result] = await pool.execute(
      'DELETE FROM error_logs WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Error log not found' });
    }
    
    res.json({ message: 'Error log deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllLogs,
  getById,
  create,
  updateStatus,
  addComment,
  getComments,
  getSummary,
  delete
};