@echo off
chcp 65001 >nul
cls

echo.
echo ================================
echo  🚀 LightGBM App - Production Mode
echo ================================
echo.

REM Set optimization environment variables
set AI_THRESHOLD=0.5
set PYTHONOPTIMIZE=2

REM Get app directory
cd /d "%~dp0"

echo 📂 Directory: %cd%
echo ⚙️  Mode: Production (no auto-reload)
echo 🔧 Settings:
echo    - Threshold: 0.5
echo    - Page Fetching: OFF by default
echo    - Workers: 2
echo.

echo 🔄 Starting server...
echo 📍 Access at: http://127.0.0.1:8000
echo.

python -O -m uvicorn app:app --host 127.0.0.1 --port 8000 --workers 2 --loop uvloop

echo.
echo ❌ Server stopped
pause
