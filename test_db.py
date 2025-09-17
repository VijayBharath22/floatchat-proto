#!/usr/bin/env python3
"""
Simple database test and setup script
"""

import psycopg2
from sqlalchemy import create_engine, text
import sys

# Database connection parameters
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'floatchat',
    'user': 'floatchat',
    'password': 'floatchat123'
}

def test_connection():
    """Test database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("✅ Database connection successful!")
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def create_tables():
    """Create basic tables"""
    try:
        # Create SQLAlchemy engine
        engine = create_engine(f"postgresql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}")
        
        # Create a simple test table
        with engine.connect() as conn:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS argo_profiles (
                    profile_id SERIAL PRIMARY KEY,
                    platform_number VARCHAR(20) NOT NULL,
                    cycle_number INTEGER NOT NULL,
                    latitude FLOAT NOT NULL,
                    longitude FLOAT NOT NULL,
                    measurement_date TIMESTAMP NOT NULL,
                    temperature FLOAT[],
                    salinity FLOAT[],
                    pressure_levels FLOAT[],
                    mixed_layer_depth FLOAT,
                    max_depth FLOAT,
                    ocean_region VARCHAR(50)
                );
            """))
            conn.commit()
        
        print("✅ Database tables created successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False

if __name__ == "__main__":
    print("🌊 FloatChat Database Setup")
    print("=" * 30)
    
    if test_connection():
        create_tables()
    else:
        print("Please check your database configuration and try again.")
        sys.exit(1)
