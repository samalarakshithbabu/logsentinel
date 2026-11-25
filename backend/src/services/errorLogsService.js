const crypto = require('crypto');
const pool = require('../config/database');
const { format } = require('sqlstring');

// Generate fingerprint for duplicate detection
const generateFingerprint = (error) => {
  const data = `${error.message}|${error.route}|${error.errorType}`;
  return crypto.createHash('md5').update(data).digest('hex');
};

// Get all logs with pagination and filtering
const getAllLogs = async (filters = {}, pagination = {}) => {
  const { page = 1, limit = 50 } = pagination;
  const offset = (page - 1) * limit;
  
  let whereClause = '1=1';
  const params = [];
  
  if (filters.level) {
    whereClause += ' AND el.error_type = ?';
    params.push(filters.level);
  }
  if (filters.status) {
    whereClause += ' AND el.status = ?';
    params.push(filters.status);
  }
  if (filters.route) {
    whereClause += ' AND el.route LIKE ?';
    params.push(`%${filters.route}%`);
  }
  if (filters.startDate) {
    whereClause += ' AND el.created_at >= ?';
    params.push(new Date(filters.startDate));
  }
  if (filters.endDate) {
    whereClause += ' AND el.created_at <= ?';
    params.push(new Date(filters.endDate));
  }
  if (filters.projectId) {
    whereClause += ' AND el.project_id = ?';
    params.push(filters.projectId);
  }
  if (filters.search) {
    whereClause += ' AND (el.message LIKE ? OR el.error_code LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  
  const countQuery = `SELECT COUNT(*) as total FROM error_logs el WHERE ${whereClause}`;
  const [countResult] = await pool.query(countQuery, params);
  
  const dataQuery = `
    SELECT el.*, p.name as project_name, u.name as assigned_user_name
    FROM error_logs el
    LEFT JOIN projects p ON el.project_id = p.id
    LEFT JOIN users u ON el.assigned_to = u.id
    WHERE ${whereClause}
    ORDER BY el.created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  const [rows] = await pool.query(dataQuery, [...params, limit, offset]);
  
  return {
    data: rows,
    pagination: {
      page,
      limit,
      total: countResult[0].total,
      totalPages: Math.ceil(countResult[0].total / limit)
    }
  };
};

// Get single log by ID
const getLogById = async (id) => {
  const query = `
    SELECT el.*, p.name as project_name, u.name as assigned_user_name
    FROM error_logs el
    LEFT JOIN projects p ON el.project_id = p.id
    LEFT JOIN users u ON el.assigned_to = u.id
    WHERE el.id = ?
  `;
  const [rows] = await pool.query(query, [id]);
  return rows[0] || null;
};

// Create new log
const createLog = async (logData) => {
  const fingerprint = generateFingerprint(logData);
  
  // Check for duplicate fingerprint
  const [existing] = await pool.query(
    'SELECT id FROM error_logs WHERE fingerprint = ?',
    [fingerprint]
  );
  
  if (existing.length > 0) {
    // Increment occurrence count
    await pool.query(
      'UPDATE error_logs SET occurrence_count = occurrence_count + 1, last_occurrence = NOW() WHERE id = ?',
      [existing[0].id]
    );
    return { ...existing[0], isDuplicate: true };
  }
  
  const query = `
    INSERT INTO error_logs (
      project_id, error_code, error_type, message, stack_trace,
      request_url, request_method, user_id, user_agent, ip_address,
      request_params, request_headers, environment, version,
      fingerprint, metadata
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    logData.projectId || null,
    logData.errorCode || generateErrorCode(),
    logData.level || 'medium',
    logData.message,
    logData.stack || null,
    logData.route || null,
    logData.method || null,
    logData.userId || null,
    logData.userAgent || null,
    logData.ipAddress || null,
    logData.requestParams ? JSON.stringify(logData.requestParams) : null,
    logData.requestHeaders ? JSON.stringify(logData.requestHeaders) : null,
    logData.environment || null,
    logData.version || null,
    fingerprint,
    logData.metadata ? JSON.stringify(logData.metadata) : null
  ];
  
  const [result] = await pool.execute(query, params);
  return { id: result.insertId, isDuplicate: false };
};

// Update log status
const updateLogStatus = async (id, status, userId) => {
  let query = 'UPDATE error_logs SET status = ?';
  const params = [status];
  
  if (status === 'resolved') {
    query += ', resolved_at = NOW()';
  }
  
  if (userId) {
    query += ', assigned_to = ?';
    params.push(userId);
  }
  
  query += ' WHERE id = ?';
  params.push(id);
  
  await pool.execute(query, params);
  return getLogById(id);
};

// Get log statistics
const getStatistics = async (projectId = null, days = 7) => {
  let whereClause = 'el.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)';
  const params = [days];
  
  if (projectId) {
    whereClause += ' AND el.project_id = ?';
    params.push(projectId);
  }
  
  const query = `
    SELECT 
      COUNT(*) as total_errors,
      SUM(CASE WHEN error_type = 'critical' THEN 1 ELSE 0 END) as critical_count,
      SUM(CASE WHEN error_type = 'high' THEN 1 ELSE 0 END) as high_count,
      SUM(CASE WHEN error_type = 'medium' THEN 1 ELSE 0 END) as medium_count,
      SUM(CASE WHEN error_type = 'low' THEN 1 ELSE 0 END) as low_count,
      SUM(CASE WHEN error_type = 'info' THEN 1 ELSE 0 END) as info_count,
      COUNT(DISTINCT fingerprint) as unique_errors,
      COUNT(DISTINCT request_url) as affected_routes
    FROM error_logs el
    WHERE ${whereClause}
  `;
  
  const [rows] = await pool.query(query, params);
  return rows[0];
};

const generateErrorCode = () => {
  return `ERR-${Date.now().toString(36).toUpperCase()}`;
};

module.exports = {
  getAllLogs,
  getLogById,
  createLog,
  updateLogStatus,
  getStatistics,
  generateFingerprint
};