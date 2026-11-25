-- Error Logging Platform - Sample Data
-- This file contains sample data for development

USE error_logging_platform;

-- Insert sample users
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@example.com', '$2a$10$XQxBtZrMmUj9Y5Y5Y5Y5YOEzT5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5YO', 'Admin User', 'admin'),
('developer@example.com', '$2a$10$XQxBtZrMmUj9Y5Y5Y5Y5YOEzT5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5YO', 'Developer', 'developer'),
('viewer@example.com', '$2a$10$XQxBtZrMmUj9Y5Y5Y5Y5YOEzT5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5YO', 'Viewer', 'viewer');

-- Insert sample projects
INSERT INTO projects (name, description, api_key, owner_id) VALUES
('Web Application', 'Main web application', 'pk_live_abc123def456', 1),
('Mobile App', 'iOS and Android mobile application', 'pk_live_xyz789ghi012', 2),
('API Service', 'Backend API service', 'pk_live_mno345pqr678', 1);

-- Insert sample error logs
INSERT INTO error_logs (project_id, error_code, error_type, message, stack_trace, status, environment, version, fingerprint) VALUES
(1, 'ERR001', 'critical', 'Database connection failed', 'Error: Connection refused\n    at Pool.<anonymous> (/app/node_modules/mysql2/lib/pool.js:123)', 'new', 'production', '1.0.0', 'fingerprint_001'),
(1, 'ERR002', 'high', 'Authentication token expired', 'JwtExpiredError: jwt expired\n    at verifyToken (/app/src/middleware/auth.js:45)', 'investigating', 'production', '1.0.0', 'fingerprint_002'),
(1, 'ERR003', 'medium', 'Invalid input validation failed', 'ValidationError: Email must be valid', 'new', 'development', '1.0.1', 'fingerprint_003'),
(2, 'ERR004', 'critical', 'Push notification failed', 'FirebaseError: FCM error', 'new', 'production', '2.1.0', 'fingerprint_004'),
(2, 'ERR005', 'low', 'Optional feature disabled', 'FeatureNotEnabledError: Feature flag is disabled', 'resolved', 'staging', '2.1.0', 'fingerprint_005'),
(3, 'ERR006', 'high', 'Rate limit exceeded', 'TooManyRequestsError: Rate limit exceeded', 'investigating', 'production', '3.0.0', 'fingerprint_006');

-- Insert sample error events
INSERT INTO error_events (error_log_id, count) VALUES
(1, 15),
(2, 8),
(3, 25),
(4, 3),
(5, 1),
(6, 42);

-- Insert sample comments
INSERT INTO comments (error_log_id, user_id, content) VALUES
(2, 1, 'This is happening frequently, need to investigate'),
(4, 2, 'Looking into this with the Firebase team');