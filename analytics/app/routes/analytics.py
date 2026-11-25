from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..services import analytics_service, anomaly_detection

router = APIRouter()

@router.get("/hourly")
async def get_hourly_errors(
    project_id: int = Query(None, description="Filter by project ID"),
    hours: int = Query(24, ge=1, le=168, description="Number of hours to analyze"),
    db: Session = Depends(get_db)
):
    """Get hourly error distribution by severity"""
    return analytics_service.get_hourly_errors(project_id, hours)

@router.get("/daily")
async def get_daily_errors(
    project_id: int = Query(None, description="Filter by project ID"),
    days: int = Query(7, ge=1, le=90, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Get daily error distribution by severity"""
    return analytics_service.get_daily_errors(project_id, days)

@router.get("/routes")
async def get_route_distribution(
    project_id: int = Query(None, description="Filter by project ID"),
    limit: int = Query(10, ge=1, le=100, description="Number of routes to return"),
    db: Session = Depends(get_db)
):
    """Get error distribution by route"""
    return analytics_service.get_route_distribution(project_id, limit)

@router.get("/severity")
async def get_severity_distribution(
    project_id: int = Query(None, description="Filter by project ID"),
    db: Session = Depends(get_db)
):
    """Get error count by severity level"""
    return analytics_service.get_severity_distribution(project_id)

@router.get("/top-routes")
async def get_top_failing_routes(
    project_id: int = Query(None, description="Filter by project ID"),
    limit: int = Query(10, ge=1, le=50, description="Number of routes to return"),
    db: Session = Depends(get_db)
):
    """Get routes with most errors"""
    return analytics_service.get_top_failing_routes(project_id, limit)

@router.get("/spikes")
async def detect_spikes(
    project_id: int = Query(None, description="Filter by project ID"),
    db: Session = Depends(get_db)
):
    """Detect error rate spikes using statistical analysis"""
    return anomaly_detection.detect_spikes(project_id)

@router.get("/trend")
async def get_trend_analysis(
    project_id: int = Query(None, description="Filter by project ID"),
    days: int = Query(14, ge=7, le=90, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Analyze error trends over time"""
    return anomaly_detection.get_trend_analysis(project_id, days)

@router.get("/summary")
async def get_statistics_summary(
    project_id: int = Query(None, description="Filter by project ID"),
    db: Session = Depends(get_db)
):
    """Get overall statistics summary"""
    return analytics_service.get_statistics_summary(project_id)

@router.get("/comparison")
async def compare_periods(
    project_id: int = Query(None, description="Filter by project ID"),
    db: Session = Depends(get_db)
):
    """Compare current period with previous period"""
    current = analytics_service.get_daily_errors(project_id, 7)
    previous = analytics_service.get_daily_errors(project_id, 14)
    
    # Extract totals for comparison
    current_total = current.get('total', 0)
    previous_total = previous.get('total', 0) - current_total
    
    change = 0
    if previous_total > 0:
        change = ((current_total - previous_total) / previous_total) * 100
    
    return {
        "current_period": {
            "total": current_total,
            "by_severity": current.get('datasets', {})
        },
        "previous_period": {
            "total": max(0, previous_total),
            "by_severity": previous.get('datasets', {})
        },
        "change": {
            "total": round(change, 1),
            "critical": "0%",
            "high": "0%",
            "medium": "0%",
            "low": "0%",
            "info": "0%"
        }
    }