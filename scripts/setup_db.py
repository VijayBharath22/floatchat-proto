#!/usr/bin/env python3
"""
Database setup script for FloatChat
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from src.database.models import Base
from src.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_database():
    """Create database tables"""
    try:
        engine = create_engine(settings.DATABASE_URL)
        Base.metadata.create_all(engine)
        logger.info("Database tables created successfully!")
        
    except Exception as e:
        logger.error(f"Error setting up database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    setup_database()



