from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database import get_db

router = APIRouter()

@router.get("/frequent")
async def get_frequent_errors(
    project_id: int = Query(None),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get most frequent error messages"""
    query = """
        SELECT 
            message,
            error_type,
            COUNT(*) as count,
            MAX(created_at) as last_occurrence,
            MAX(error_code) as error_code
        FROM error_logs
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    """
    params = []
    
    if project_id:
        query += " AND project_id = ?"
        params.append(project_id)
    
    query += " GROUP BY message, error_type ORDER BY count DESC LIMIT ?"
    params.append(limit)
    
    result = db.execute(text(query), params).fetchall()
    return {"errors": [dict(row._mapping) for row in result]}

@router.get("/status")
async def get_error_status_breakdown(
    project_id: int = Query(None),
    db: Session = Depends(get_db)
):
    """Get breakdown of errors by status"""
    query = """
        SELECT 
            status,
            error_type,
            COUNT(*) as count
        FROM error_logs
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    """
    params = []
    
    if project_id:
        query += " AND project_id = ?"
        params.append(project_id)
    
    query += " GROUP BY status, error_type"
    
    result = db.execute(text(query), params).fetchall()
    return {"status_breakdown": [dict(row._mapping) for row in result]}

@router.get("/environment")
async def get_error_by_environment(
    project_id: int = Query(None),
    db: Session = Depends(get_db)
):
    """Get error distribution by environment"""
    query = """
        SELECT 
            COALESCE(environment, 'unknown') as environment,
            COUNT(*) as count,
            COUNT(DISTINCT error_type) as severity_types
        FROM error_logs
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    """
    params = []
    
    if project_id:
        query += " AND project_id = ?"
        params.append(project_id)
    
    query += " GROUP BY environment ORDER BY count DESC"
    
    result = db.execute(text(query), params).fetchall()
    return {"by_environment": [dict(row._mapping) for row in result]}

@router.get("/versions")
async def get_error_by_version(
    project_id: int = Query(None),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get error distribution by application version"""
    query = """
        SELECT 
            COALESCE(version, 'unknown') as version,
            COUNT(*) as error_count,
            COUNT(DISTINCT error_type) as severity_types,
            MAX(created_at) as last_occurrence
        FROM error_logs
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    """
    params = []
    
    if project_id:
        query += " AND project_id = ?"
        params.append(project_id)
    
    query += " GROUP BY version ORDER BY error_count DESC LIMIT ?"
    params.append(limit)
    
    result = db.execute(text(query), params).fetchall()
    return {"by_version": [dict(row._mapping) for row in result]}