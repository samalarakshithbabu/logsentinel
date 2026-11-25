import os
from dotenv import load_dotenv

load_dotenv()

# Database Configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'password'),
    'database': os.getenv('DB_NAME', 'error_logging_platform')
}

# Application Configuration
APP_CONFIG = {
    'host': os.getenv('ANALYTICS_HOST', '0.0.0.0'),
    'port': int(os.getenv('ANALYTICS_PORT', 8000)),
    'debug': os.getenv('ANALYTICS_DEBUG', 'false').lower() == 'true'
}

# Spike Detection Configuration
SPIKE_CONFIG = {
    'threshold_multiplier': float(os.getenv('SPIKE_THRESHOLD_MULTIPLIER', '3.0')),
    'min_error_count': int(os.getenv('SPIKE_MIN_ERROR_COUNT', '10')),
    'baseline_hours': int(os.getenv('SPIKE_BASELINE_HOURS', '24')),
    'spike_window_minutes': int(os.getenv('SPIKE_WINDOW_MINUTES', '60'))
}