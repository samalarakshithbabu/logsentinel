import pandas as pd
from datetime import datetime, timedelta
from sqlalchemy import text
from ..database import engine
from ..config import SPIKE_CONFIG

def get_error_data(query: str, params: list = None) -> pd.DataFrame:
    """Execute query and return DataFrame"""
    try:
        with engine.connect() as conn:
            if params:
                result = conn.execute(text(query), params)
            else:
                result = conn.execute(text(query))
            
            rows = result.fetchall()
            if rows:
                columns = result.keys()
                return pd.DataFrame(rows, columns=columns)
            return pd.DataFrame()
    except Exception as e:
        print(f"Error executing query: {e}")
        return pd.DataFrame()

def get_hourly_errors(project_id: int = None, hours: int = 24) -> dict:
    """Get error counts per hour"""
    query = """
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') as hour,
            error_type,
            COUNT(*) as count
        FROM error_logs
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
    """
    params = [hours]
    
    if project_id:
        query += " AND project_id = ?"
        params.append(project_id)
    
    query += " GROUP BY hour, error_type ORDER BY hour"
    
    df = get_error_data(query, params)
    
    if df.empty:
        return {
            "labels": [],
            "datasets": {
                "critical": [],
                "high": [],
                "medium": [],
                "low": [],
                "info": []
            },
            "total": 0
        }
    
    # Pivot and format for charting
    df['hour'] = pd.to_datetime(df['hour'])
    all_hours = pd.date_range(
        end=datetime.now(),
        periods=hours,
        freq='H'
    )
    
    result = {
        "labels": [h.strftime('%Y-%m-%d %H:00') for h in all_hours],
        "datasets": {level: [0] * hours for level in ['critical', 'high', 'medium', 'low', 'info']},
        "total": int(df['count'].sum())
    }
    
    for _, row in df.iterrows():
        hour_str = row['hour'].strftime('%Y-%m-%d %H:00')
        if hour_str in result['labels']:
            idx = result['labels'].index(hour_str)
            result['datasets'][row['error_type']][idx] = int(row['count'])
    
    return result

def get_daily_errors(project_id: int = None, days: int = 7) -> dict:
    """Get error counts per day"""
    query = """
        SELECT 
            DATE(created_at) as date,
            error_type,
            COUNT(*) as count
        FROM error_logs
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    """
    params = [days]
    
    if project_id:
        query += " AND project_id = ?"
        params.append(project_id)
    
    query += " GROUP BY date, error_type ORDER BY date"
    
    df = get_error_data(query, params)
    
    if df.empty:
        return {
            "labels": [],
            "datasets": {},
            "total": 0
        }
    
    df['date'] = pd.to_datetime(df['date'])
    all_dates = pd.date_range(end=datetime.now(), periods=days, freq='D')
    
    result = {
        "labels": [d.strftime('%Y-%m-%d') for d in all_dates],
        "datasets": {level: [0] * days for level in ['critical', 'high', 'medium', 'low', 'info']},
        "total": int(df['count'].sum())
    }
    
    for _, row in df.iterrows():
        date_str = row['date'].strftime('%Y-%m-%d')
        if date_str in result['labels']:
            idx = result['labels'].index(date_str)
            result['datasets'][row['error_type']][idx] = int(row['count'])
    
    return result

def get_route_distribution(project_id: int = None, limit: int = 10) -> dict:
    """Get top failing routes"""
    query = """
        SELECT 
            COALESCE(request_url, 'Unknown') as route,
            error_type,
            COUNT(*) as count,
            COUNT(DISTINCT fingerprint) as unique_errors
        FROM error_logs
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    """
    params = []
    
    if project_id:
        query += " AND project_id = ?"
        params.append(project_id)
    
    query += " GROUP BY route, error_type ORDER BY count DESC LIMIT ?"
    params.append(limit)
    
    df = get_error_data(query, params)
    
    if df.empty:
        return {"routes": [], "total": 0}
    
    return {
        "routes": df.to_dict('records'),
        "total": int(df['count'].sum())
    }

def get_severity_distribution(project_id: int = None) -> dict:
    """Get distribution by severity level"""
    query = """
        SELECT 
            error_type,
            COUNT(*) as count,
            ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM error_logs 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                {project_condition}), 2) as percentage
        FROM error_logs
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        {project_condition}
        GROUP BY error_type
        ORDER BY 
            CASE error_type
                WHEN 'critical' THEN 1
                WHEN 'high' THEN 2
                WHEN 'medium' THEN 3
                WHEN 'low' THEN 4
                WHEN 'info' THEN 5
            END
    """
    
    project_condition = "AND project_id = :pid" if project_id else ""
    query = query.format(project_condition=project_condition)
    
    params = [project_id] if project_id else []
    
    df = get_error_data(query, params)
    
    if df.empty:
        return {"distribution": [], "total": 0}
    
    return {
        "distribution": df.to_dict('records'),
        "total": int(df['count'].sum())
    }

def get_top_failing_routes(project_id: int = None, limit: int = 10) -> dict:
    """Get routes with most errors"""
    query = """
        SELECT 
            request_url as route,
            COUNT(*) as error_count,
            MAX(created_at) as last_occurrence,
            MAX(CASE WHEN error_type = 'critical' THEN 1 ELSE 0 END) as has_critical,
            MAX(CASE WHEN error_type = 'high' THEN 1 ELSE 0 END) as has_high
        FROM error_logs
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    """
    params = []
    
    if project_id:
        query += " AND project_id = ?"
        params.append(project_id)
    
    query += " GROUP BY request_url ORDER BY error_count DESC LIMIT ?"
    params.append(limit)
    
    df = get_error_data(query, params)
    
    if df.empty:
        return {"routes": [], "total": 0}
    
    return {
        "routes": df.to_dict('records'),
        "total": int(df['error_count'].sum())
    }

def get_statistics_summary(project_id: int = None) -> dict:
    """Get overall statistics summary"""
    query = """
        SELECT 
            COUNT(*) as total_errors,
            COUNT(DISTINCT fingerprint) as unique_errors,
            COUNT(DISTINCT request_url) as affected_routes,
            SUM(CASE WHEN error_type = 'critical' THEN 1 ELSE 0 END) as critical_count,
            SUM(CASE WHEN error_type = 'high' THEN 1 ELSE 0 END) as high_count,
            SUM(CASE WHEN error_type = 'medium' THEN 1 ELSE 0 END) as medium_count,
            SUM(CASE WHEN error_type = 'low' THEN 1 ELSE 0 END) as low_count,
            SUM(CASE WHEN error_type = 'info' THEN 1 ELSE 0 END) as info_count,
            COUNT(CASE WHEN status = 'new' THEN 1 END) as open_count,
            COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count
        FROM error_logs
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    """
    
    params = [project_id] if project_id else []
    
    df = get_error_data(query, params)
    
    if df.empty:
        return {
            "total_errors": 0,
            "unique_errors": 0,
            "affected_routes": 0,
            "by_severity": {},
            "by_status": {}
        }
    
    row = df.iloc[0]
    return {
        "total_errors": int(row['total_errors']),
        "unique_errors": int(row['unique_errors']),
        "affected_routes": int(row['affected_routes']),
        "by_severity": {
            "critical": int(row['critical_count']),
            "high": int(row['high_count']),
            "medium": int(row['medium_count']),
            "low": int(row['low_count']),
            "info": int(row['info_count'])
        },
        "by_status": {
            "open": int(row['open_count']),
            "resolved": int(row['resolved_count'])
        }
    }