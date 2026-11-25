-- Error Logging Platform - Archive Procedures
-- Stored procedures for archiving old error logs

USE error_logging_platform;

-- Procedure to archive old error logs (older than 90 days)
DELIMITER //

CREATE PROCEDURE archive_old_errors(IN days_old INT)
BEGIN
    DECLARE archived_count INT DEFAULT 0;
    
    -- Create archive table if not exists
    CREATE TABLE IF NOT EXISTS error_logs_archive LIKE error_logs;
    
    -- Move old error logs to archive
    INSERT INTO error_logs_archive 
    SELECT * FROM error_logs 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL days_old DAY)
    AND status = 'resolved';
    
    SET archived_count = ROW_COUNT();
    
    -- Delete from original table
    DELETE FROM error_logs 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL days_old DAY)
    AND status = 'resolved';
    
    -- Return count
    SELECT CONCAT('Archived ', archived_count, ' error logs') as result;
END //

-- Procedure to generate daily error summary
CREATE PROCEDURE generate_daily_summary(IN report_date DATE)
BEGIN
    SELECT 
        project_id,
        error_type,
        COUNT(*) as count,
        COUNT(DISTINCT fingerprint) as unique_errors
    FROM error_logs
    WHERE DATE(created_at) = report_date
    GROUP BY project_id, error_type;
END //

-- Procedure to get error statistics by hour
CREATE PROCEDURE get_errors_by_hour(IN days INT)
BEGIN
    SELECT 
        HOUR(created_at) as hour,
        error_type,
        COUNT(*) as count
    FROM error_logs
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL days DAY)
    GROUP BY HOUR(created_at), error_type
    ORDER BY hour;
END //

DELIMITER ;

-- Schedule archive job (run daily at 2 AM)
-- This would typically be handled by a cron job or MySQL Event Scheduler
-- SET GLOBAL event_scheduler = ON;
-- CREATE EVENT IF NOT EXISTS daily_archive
-- ON SCHEDULE EVERY 1 DAY STARTS '2024-01-01 02:00:00'
-- DO CALL archive_old_errors(90);