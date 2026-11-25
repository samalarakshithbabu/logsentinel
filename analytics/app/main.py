from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from .database import test_connection, get_db, SessionLocal
from .routes import analytics, errors
from .config import APP_CONFIG
import uvicorn

app = FastAPI(
    title="Error Logging Analytics Service",
    description="Advanced analytics and spike detection for error logs",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(errors.router, prefix="/api/errors", tags=["errors"])

# Health check
@app.get("/health")
async def health_check():
    """Check service health"""
    db_status = "connected" if test_connection() else "disconnected"
    return {
        "status": "healthy",
        "database": db_status,
        "service": "analytics"
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Error Logging Analytics",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=APP_CONFIG['host'],
        port=APP_CONFIG['port'],
        reload=APP_CONFIG['debug']
    )