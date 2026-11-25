import pandas as pd
from datetime import datetime, timedelta
from sqlalchemy import text
from ..database import engine
from ..config import SPIKE_CONFIG

def get_error_data_for_spike(hours: int = 72) -> pd.DataFrame:
    """Get hourly error counts for spike detection"""
    query = """
        SELECT 
            HOUR(created_at) as hour_of_day,
            DATE(created_at) as date,
            error_type,
            COUNT(*) as count
        FROM error_logs
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        GROUP BY date, hour_of_day, error_type
        ORDER BY date, hour_of_day
    """
    
    try:
        with engine.connect() as conn:
            result = conn.execute(text(query), [hours])
            rows = result.fetchall()
            if rows:
                columns = result.keys()
                return pd.DataFrame(rows, columns=columns)
            return pd.DataFrame()
    except Exception as e:
        print(f"Error fetching spike data: {e}")
        return pd.DataFrame()

def calculate_baseline(df: pd.DataFrame) -> dict:
    """Calculate baseline error rates per hour and error type"""
    if df.empty:
        return {}
    
    # Group by hour_of_day and error_type
    grouped = df.groupby(['hour_of_day', 'error_type'])['count'].agg(['mean', 'std']).reset_index()
    grouped.columns = ['hour_of_day', 'error_type', 'mean', 'std']
    
    # Fill missing values
    grouped['std'] = grouped['std'].fillna(0)
    grouped['mean'] = grouped['mean'].replace(0, 0.1)  # Avoid division by zero
    
    baseline = {}
    for _, row in grouped.iterrows():
        key = f"{int(row['hour_of_day'])}-{row['error_type']}"
        baseline[key] = {
            'mean': float(row['mean']),
            'std': float(row['std']),
            'threshold': float(row['mean'] + SPIKE_CONFIG['threshold_multiplier'] * row['std'])
        }
    
    return baseline

def detect_spikes(project_id: int = None) -> dict:
    """Detect error rate spikes using statistical analysis"""
    df = get_error_data_for_spike(hours=SPIKE_CONFIG['baseline_hours'] * 3)
    
    if df.empty:
        return {
            "spikes": [],
            "summary": {
                "total_spikes": 0,
                "critical_spikes": 0,
                "high_spikes": 0,
                "anomaly_score": 0
            }
        }
    
    baseline = calculate_baseline(df)
    
    # Get recent data (last hour)
    recent_query = """
        SELECT 
            HOUR(created_at) as hour_of_day,
            DATE(created_at) as date,
            error_type,
            COUNT(*) as count
        FROM error_logs
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    """
    
    params = []
    if project_id:
        recent_query += " AND project_id = ?"
        params.append(project_id)
    
    recent_query += " GROUP BY date, hour_of_day, error_type"
    
    try:
        with engine.connect() as conn:
            result = conn.execute(text(recent_query), params)
            rows = result.fetchall()
            recent_df = pd.DataFrame(rows, columns=result.keys()) if rows else pd.DataFrame()
    except Exception as e:
        print(f"Error fetching recent data: {e}")
        recent_df = pd.DataFrame()
    
    spikes = []
    total_spikes = 0
    critical_spikes = 0
    high_spikes = 0
    
    if not recent_df.empty:
        for _, row in recent_df.iterrows():
            key = f"{int(row['hour_of_day'])}-{row['error_type']}"
            current_count = int(row['count'])
            
            if key in baseline:
                threshold = baseline[key]['threshold']
                mean = baseline[key]['mean']
                
                if current_count > threshold and current_count >= SPIKE_CONFIG['min_error_count']:
                    spike_severity = 'high'
                    multiplier = current_count / mean if mean > 0 else 0
                    
                    if row['error_type'] == 'critical':
                        spike_severity = 'critical'
                        critical_spikes += 1
                    elif row['error_type'] == 'high':
                        high_spikes += 1
                    
                    spikes.append({
                        "timestamp": datetime.now().isoformat(),
                        "error_type": row['error_type'],
                        "current_count": current_count,
                        "baseline_mean": round(mean, 2),
                        "threshold": round(threshold, 2),
                        "multiplier": round(multiplier, 2),
                        "severity": spike_severity,
                        "message": f"{row['error_type'].upper()} error spike detected: {current_count} errors (baseline: {mean:.1f})"
                    })
                    total_spikes += 1
    
    # Sort by severity
    severity_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3, 'info': 4}
    spikes.sort(key=lambda x: (severity_order.get(x['severity'], 5), -x['multiplier']))
    
    return {
        "spikes": spikes[:20],  # Limit to top 20
        "summary": {
            "total_spikes": total_spikes,
            "critical_spikes": critical_spikes,
            "high_spikes": high_spikes,
            "anomaly_score": min(100, total_spikes * 10 + critical_spikes * 20)
        }
    }

def get_trend_analysis(project_id: int = None, days: int = 14) -> dict:
    """Analyze error trends over time"""
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
    
    try:
        with engine.connect() as conn:
            result = conn.execute(text(query), params)
            rows = result.fetchall()
            if rows:
                columns = result.keys()
                df = pd.DataFrame(rows, columns=columns)
            else:
                return {"trend": "stable", "change_percent": 0, "prediction": "no data"}
    except Exception as e:
        print(f"Error in trend analysis: {e}")
        return {"trend": "unknown", "change_percent": 0, "prediction": "error"}
    
    if df.empty:
        return {"trend": "stable", "change_percent": 0, "prediction": "no data"}
    
    # Split into two periods
    midpoint = days // 2
    first_half = df[df['date'] < df['date'].max() - timedelta(days=midpoint)]
    second_half = df[df['date'] >= df['date'].max() - timedelta(days=midpoint)]
    
    first_total = first_half['count'].sum() if not first_half.empty else 0
    second_total = second_half['count'].sum() if not second_half.empty else 0
    
    if first_total == 0:
        return {"trend": "unknown", "change_percent": 0, "prediction": "insufficient data"}
    
    change_percent = ((second_total - first_total) / first_total) * 100
    
    trend = "increasing" if change_percent > 10 else "decreasing" if change_percent < -10 else "stable"
    
    # Simple prediction (linear extrapolation)
    daily_rate = second_total / midpoint if midpoint > 0 else second_total
    prediction = f"Expected {int(daily_rate)} errors/day for next 7 days"
    
    return {
        "trend": trend,
        "change_percent": round(change_percent, 1),
        "first_period_total": int(first_total),
        "second_period_total": int(second_total),
        "prediction": prediction
    }