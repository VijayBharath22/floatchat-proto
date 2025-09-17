#!/usr/bin/env python3
"""
FloatChat Startup Script
Run this script to start the complete FloatChat application
"""

import subprocess
import sys
import os
import time
import signal
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import streamlit
        import fastapi
        import uvicorn
        import pandas
        import numpy
        import plotly
        print("✅ All dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def start_database():
    """Start the database using docker-compose"""
    print("🐳 Starting PostgreSQL database...")
    try:
        subprocess.run(["docker-compose", "up", "-d", "postgres"], check=True)
        print("✅ Database started successfully")
        time.sleep(5)  # Wait for database to be ready
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to start database. Make sure Docker is running.")
        return False
    except FileNotFoundError:
        print("❌ Docker not found. Please install Docker or start PostgreSQL manually.")
        return False

def setup_database():
    """Setup database tables"""
    print("🗄️ Setting up database tables...")
    try:
        subprocess.run([sys.executable, "scripts/setup_db.py"], check=True)
        print("✅ Database setup completed")
        return True
    except subprocess.CalledProcessError:
        print("❌ Database setup failed")
        return False

def generate_sample_data():
    """Generate sample data"""
    print("📊 Generating sample data...")
    try:
        subprocess.run([sys.executable, "scripts/sample_data.py"], check=True)
        print("✅ Sample data generated")
        return True
    except subprocess.CalledProcessError:
        print("❌ Sample data generation failed")
        return False

def start_api_server():
    """Start the FastAPI server"""
    print("🚀 Starting API server...")
    try:
        # Start API server in background
        api_process = subprocess.Popen([
            sys.executable, "-m", "src.api.main"
        ])
        print("✅ API server started on http://localhost:8000")
        return api_process
    except Exception as e:
        print(f"❌ Failed to start API server: {e}")
        return None

def start_frontend():
    """Start the Streamlit frontend"""
    print("🎨 Starting Streamlit frontend...")
    try:
        # Start Streamlit in background
        frontend_process = subprocess.Popen([
            sys.executable, "-m", "streamlit", "run", "src/frontend/app.py",
            "--server.port", "8501",
            "--server.address", "localhost"
        ])
        print("✅ Frontend started on http://localhost:8501")
        return frontend_process
    except Exception as e:
        print(f"❌ Failed to start frontend: {e}")
        return None

def cleanup_processes(processes):
    """Clean up running processes"""
    print("\n🛑 Shutting down services...")
    for process in processes:
        if process and process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
    print("✅ All services stopped")

def main():
    """Main startup function"""
    print("🌊 Welcome to FloatChat - AI Ocean Data Explorer!")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Check if .env file exists
    if not os.path.exists(".env"):
        print("⚠️  .env file not found. Creating from template...")
        if os.path.exists("env.example"):
            import shutil
            shutil.copy("env.example", ".env")
            print("✅ Created .env file from template")
            print("📝 Please edit .env file with your API keys")
        else:
            print("❌ env.example file not found")
            sys.exit(1)
    
    # Start database
    if not start_database():
        print("⚠️  Continuing without database (using mock data)")
    
    # Setup database
    setup_database()
    
    # Generate sample data
    generate_sample_data()
    
    # Start services
    processes = []
    
    # Start API server
    api_process = start_api_server()
    if api_process:
        processes.append(api_process)
        time.sleep(3)  # Wait for API to start
    
    # Start frontend
    frontend_process = start_frontend()
    if frontend_process:
        processes.append(frontend_process)
    
    if not processes:
        print("❌ Failed to start any services")
        sys.exit(1)
    
    print("\n🎉 FloatChat is now running!")
    print("=" * 50)
    print("🌐 Frontend: http://localhost:8501")
    print("🔌 API: http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    print("=" * 50)
    print("Press Ctrl+C to stop all services")
    
    try:
        # Wait for processes
        while True:
            time.sleep(1)
            # Check if any process has died
            for i, process in enumerate(processes):
                if process and process.poll() is not None:
                    print(f"❌ Process {i} has stopped unexpectedly")
                    cleanup_processes(processes)
                    sys.exit(1)
    except KeyboardInterrupt:
        cleanup_processes(processes)
        print("\n👋 FloatChat stopped. Thank you for exploring the oceans!")

if __name__ == "__main__":
    main()





