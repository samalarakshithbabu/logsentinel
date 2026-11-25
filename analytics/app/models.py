from sqlalchemy import Column, Integer, String, Text, DateTime, Enum as SQLEnum
from .database import Base
import enum

class ErrorSeverity(enum.Enum):
    CRITICAL = 'critical'
    HIGH = 'high'
    MEDIUM = 'medium'
    LOW = 'low'
    INFO = 'info'

class ErrorStatus(enum.Enum):
    NEW = 'new'
    INVESTIGATING = 'investigating'
    RESOLVED = 'resolved'
    IGNORED = 'ignored'

# Note: For analytics, we typically use raw SQL for better performance
# These models are for reference; actual queries use raw SQL with pandas