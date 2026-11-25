-- ==============================================================================
-- ERROR LOGGING PLATFORM - DATABASE SCHEMA
-- MySQL 8.0+
-- ==============================================================================
-- This schema is optimized for:
-- - High-volume error logging
-- - Fast filtering and pagination
-- - Analytics and trend analysis
-- - Duplicate detection via fingerprinting
-- - Spike detection and alerting
-- ==============================================================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS error_logging_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE error_logging_platform;

-- ==============================================================================
-- 1. USER MANAGEMENT
-- ==============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'developer', 'viewer') DEFAULT 'developer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    api_key VARCHAR(64) NOT NULL UNIQUE,
    owner_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_projects_owner (owner_id),
    INDEX idx_projects_api_key (api_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Error logs table
CREATE TABLE IF NOT EXISTS error_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    error_code VARCHAR(50) NOT NULL,
    error_type ENUM('critical', 'high', 'medium', 'low', 'info') DEFAULT 'medium',
    message TEXT NOT NULL,
    stack_trace TEXT,
    request_url VARCHAR(500),
    request_method VARCHAR(10),
    user_id VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    request_params JSON,
    request_headers JSON,
    environment VARCHAR(50),
    version VARCHAR(50),
    fingerprint VARCHAR(64),
    status ENUM('new', 'investigating', 'resolved', 'ignored') DEFAULT 'new',
    assigned_to INT,
    metadata JSON,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_error_logs_project (project_id),
    INDEX idx_error_logs_error_code (error_code),
    INDEX idx_error_logs_error_type (error_type),
    INDEX idx_error_logs_status (status),
    INDEX idx_error_logs_fingerprint (fingerprint),
    INDEX idx_error_logs_created_at (created_at),
    INDEX idx_error_logs_assigned (assigned_to),
    INDEX idx_error_logs_environment (environment),
    FULLTEXT INDEX idx_error_logs_message (message)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Error events table (for tracking occurrences)
CREATE TABLE IF NOT EXISTS error_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    error_log_id INT NOT NULL,
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    count INT DEFAULT 1,
    last_occurrence TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    FOREIGN KEY (error_log_id) REFERENCES error_logs(id) ON DELETE CASCADE,
    INDEX idx_error_events_log (error_log_id),
    INDEX idx_error_events_occurred (occurred_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    error_log_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (error_log_id) REFERENCES error_logs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_comments_error (error_log_id),
    INDEX idx_comments_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('email', 'slack', 'webhook') NOT NULL,
    config JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_logs_user (user_id),
    INDEX idx_audit_logs_action (action),
    INDEX idx_audit_logs_resource (resource_type, resource_id),
    INDEX idx_audit_logs_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- View for error statistics
CREATE OR REPLACE VIEW error_statistics AS
SELECT
    project_id,
    error_type,
    DATE(created_at) as date,
    COUNT(*) as count,
    COUNT(DISTINCT fingerprint) as unique_errors
FROM error_logs
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY project_id, error_type, DATE(created_at);

-- Trigger for updating updated_at timestamp on users table
DELIMITER //
CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users
FOR EACH ROW SET NEW.updated_at = CURRENT_TIMESTAMP; //
DELIMITER ;

-- Trigger for updating updated_at timestamp on projects table
DELIMITER //
CREATE TRIGGER update_projects_timestamp BEFORE UPDATE ON projects
FOR EACH ROW SET NEW.updated_at = CURRENT_TIMESTAMP; //
DELIMITER ;

-- Trigger for updating updated_at timestamp on error_logs table
DELIMITER //
CREATE TRIGGER update_error_logs_timestamp BEFORE UPDATE ON error_logs
FOR EACH ROW SET NEW.updated_at = CURRENT_TIMESTAMP; //
DELIMITER ;