#!/usr/bin/env python3
"""
Tesla Stock Prediction Dashboard Setup Script
Comprehensive setup and configuration for the web application
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def print_banner():
    """Print the application banner"""
    banner = """
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║        🚗⚡ TESLA STOCK PREDICTION DASHBOARD ⚡🚗        ║
    ║                                                              ║
    ║    Advanced AI-Powered Stock Analysis & Prediction Platform  ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
    """
    print(banner)

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Error: Python 3.8 or higher is required")
        print(f"   Current version: {version.major}.{version.minor}.{version.micro}")
        sys.exit(1)
    else:
        print(f"✅ Python version: {version.major}.{version.minor}.{version.micro}")

def create_virtual_environment():
    """Create a virtual environment for the project"""
    venv_path = Path("venv")
    
    if venv_path.exists():
        print("📁 Virtual environment already exists")
        return str(venv_path)
    
    print("🔨 Creating virtual environment...")
    try:
        subprocess.run([sys.executable, "-m", "venv", "venv"], check=True)
        print("✅ Virtual environment created successfully")
        return str(venv_path)
    except subprocess.CalledProcessError:
        print("❌ Failed to create virtual environment")
        sys.exit(1)

def get_pip_command(venv_path):
    """Get the pip command for the virtual environment"""
    if platform.system() == "Windows":
        return os.path.join(venv_path, "Scripts", "pip")
    else:
        return os.path.join(venv_path, "bin", "pip")

def get_python_command(venv_path):
    """Get the python command for the virtual environment"""
    if platform.system() == "Windows":
        return os.path.join(venv_path, "Scripts", "python")
    else:
        return os.path.join(venv_path, "bin", "python")

def install_requirements(venv_path):
    """Install required packages"""
    pip_cmd = get_pip_command(venv_path)
    
    print("📦 Installing required packages...")
    try:
        # Upgrade pip first
        subprocess.run([pip_cmd, "install", "--upgrade", "pip"], check=True)
        
        # Install requirements
        subprocess.run([pip_cmd, "install", "-r", "requirements.txt"], check=True)
        print("✅ All packages installed successfully")
    except subprocess.CalledProcessError:
        print("❌ Failed to install packages")
        print("💡 Try running: pip install -r requirements.txt manually")
        sys.exit(1)

def create_directories():
    """Create necessary directories"""
    directories = [
        "static",
        "templates", 
        "data",
        "logs",
        "models"
    ]
    
    print("📁 Creating project directories...")
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"   ✓ {directory}/")

def create_config_file():
    """Create configuration file"""
    config_content = """# Tesla Stock Prediction Dashboard Configuration

# Flask Configuration
DEBUG = True
SECRET_KEY = 'your-secret-key-change-this-in-production'
HOST = '0.0.0.0'
PORT = 5000

# Data Configuration
STOCK_SYMBOL = 'TSLA'
DATA_UPDATE_INTERVAL = 300  # seconds (5 minutes)
PREDICTION_DAYS = 30

# Model Configuration
LSTM_EPOCHS = 50
LSTM_BATCH_SIZE = 32
SEQUENCE_LENGTH = 60

# API Configuration
NEWS_API_KEY = 'your-news-api-key-here'
ALPHA_VANTAGE_API_KEY = 'your-alpha-vantage-key-here'

# Logging Configuration
LOG_LEVEL = 'INFO'
LOG_FILE = 'logs/dashboard.log'

# Cache Configuration
CACHE_TIMEOUT = 300  # seconds
"""
    
    config_path = Path("config.py")
    if not config_path.exists():
        print("⚙️ Creating configuration file...")
        with open(config_path, "w") as f:
            f.write(config_content)
        print("✅ Configuration file created: config.py")
    else:
        print("📄 Configuration file already exists")

def create_env_file():
    """Create environment variables file"""
    env_content = """# Tesla Stock Prediction Dashboard Environment Variables

# Flask Settings
FLASK_ENV=development
FLASK_DEBUG=1

# API Keys (Replace with your actual keys)
NEWS_API_KEY=your_news_api_key_here
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
YAHOO_FINANCE_API_KEY=your_yahoo_finance_key_here

# Database (if using)
DATABASE_URL=sqlite:///tesla_dashboard.db

# Security
SECRET_KEY=your-super-secret-key-change-this

# Cache Settings
REDIS_URL=redis://localhost:6379/0
"""
    
    env_path = Path(".env")
    if not env_path.exists():
        print("🔐 Creating environment file...")
        with open(env_path, "w") as f:
            f.write(env_content)
        print("✅ Environment file created: .env")
        print("⚠️  Please update .env with your actual API keys")
    else:
        print("📄 Environment file already exists")

def create_startup_scripts():
    """Create startup scripts for different platforms"""
    
    # Windows batch script
    windows_script = """@echo off
echo Starting Tesla Stock Prediction Dashboard...
cd /d "%~dp0"
call venv\\Scripts\\activate.bat
python app.py
pause
"""
    
    # Unix shell script
    unix_script = """#!/bin/bash
echo "Starting Tesla Stock Prediction Dashboard..."
cd "$(dirname "$0")"
source venv/bin/activate
python app.py
"""
    
    print("🚀 Creating startup scripts...")
    
    # Create Windows script
    with open("start_dashboard.bat", "w") as f:
        f.write(windows_script)
    
    # Create Unix script
    with open("start_dashboard.sh", "w") as f:
        f.write(unix_script)
    
    # Make Unix script executable
    if platform.system() != "Windows":
        os.chmod("start_dashboard.sh", 0o755)
    
    print("✅ Startup scripts created")

def create_docker_files():
    """Create Docker configuration files"""
    
    dockerfile_content = """# Tesla Stock Prediction Dashboard Dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    g++ \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p logs data models

# Expose port
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Run the application
CMD ["python", "app.py"]
"""
    
    docker_compose_content = """version: '3.8'

services:
  tesla-dashboard:
    build: .
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - SECRET_KEY=your-production-secret-key
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    restart: unless-stopped
    
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - tesla-dashboard
    restart: unless-stopped
"""
    
    print("🐳 Creating Docker configuration...")
    
    with open("Dockerfile", "w") as f:
        f.write(dockerfile_content)
    
    with open("docker-compose.yml", "w") as f:
        f.write(docker_compose_content)
    
    print("✅ Docker files created")

def print_next_steps():
    """Print next steps for the user"""
    next_steps = """
    ╔══════════════════════════════════════════════════════════════╗
    ║                        SETUP COMPLETE! 🎉                   ║
    ╚══════════════════════════════════════════════════════════════╝
    
    📋 NEXT STEPS:
    
    1. 🔑 Configure API Keys:
       • Edit .env file with your actual API keys
       • Get free API keys from:
         - NewsAPI: https://newsapi.org/
         - Alpha Vantage: https://www.alphavantage.co/
    
    2. 🚀 Start the Dashboard:
       
       Option A - Using startup script:
       • Windows: Double-click start_dashboard.bat
       • Linux/Mac: ./start_dashboard.sh
       
       Option B - Manual start:
       • Activate virtual environment:
         - Windows: venv\\Scripts\\activate
         - Linux/Mac: source venv/bin/activate
       • Run: python app.py
       
       Option C - Using Docker:
       • Run: docker-compose up -d
    
    3. 🌐 Access the Dashboard:
       • Open your browser to: http://localhost:5000
       • The dashboard will automatically fetch Tesla stock data
       • All ML models will be trained on first run
    
    4. ⚙️ Customize Configuration:
       • Edit config.py for application settings
       • Modify model parameters in app.py
       • Adjust refresh intervals and data sources
    
    📚 FEATURES INCLUDED:
    ✓ Real-time Tesla stock data fetching
    ✓ ARIMA, LSTM, and Hybrid prediction models
    ✓ Technical indicators (RSI, Moving Averages, Volatility)
    ✓ News sentiment analysis
    ✓ Interactive charts and visualizations
    ✓ Comprehensive data tables
    ✓ Trading signals and recommendations
    ✓ Risk analysis and insights
    ✓ Mobile-responsive design
    ✓ Export functionality
    
    🆘 TROUBLESHOOTING:
    • Check logs in logs/dashboard.log
    • Ensure all API keys are configured
    • Verify Python version (3.8+ required)
    • Check firewall settings for port 5000
    
    📖 For detailed documentation, see README.md
    
    Happy Trading! 📈🚀
    """
    print(next_steps)

def main():
    """Main setup function"""
    print_banner()
    
    print("🔍 Checking system requirements...")
    check_python_version()
    
    print("\n📦 Setting up project environment...")
    venv_path = create_virtual_environment()
    install_requirements(venv_path)
    
    print("\n📁 Setting up project structure...")
    create_directories()
    create_config_file()
    create_env_file()
    
    print("\n🛠️ Creating utility scripts...")
    create_startup_scripts()
    create_docker_files()
    
    print_next_steps()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Setup failed with error: {e}")
        sys.exit(1)