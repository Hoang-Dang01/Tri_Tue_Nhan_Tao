# Production Mode Startup Script
# Tắt auto-reload và optimize performance

Write-Host "================================" -ForegroundColor Green
Write-Host "🚀 LightGBM App - Production Mode" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Set optimization environment variables
$env:AI_THRESHOLD = "0.5"
$env:PYTHONOPTIMIZE = "2"  # Maximum optimization

# Navigate to app directory
$appDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $appDir

Write-Host "📂 Directory: $appDir" -ForegroundColor Cyan
Write-Host "⚙️  Mode: Production (no auto-reload)" -ForegroundColor Cyan
Write-Host "🔧 Settings:" -ForegroundColor Cyan
Write-Host "   - Threshold: 0.5" -ForegroundColor Gray
Write-Host "   - Page Fetching: OFF by default" -ForegroundColor Gray
Write-Host "   - Workers: 2" -ForegroundColor Gray
Write-Host ""

# Start the app
Write-Host "🔄 Starting server..." -ForegroundColor Yellow
Write-Host "📍 Access at: http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host ""

python -O -m uvicorn app:app `
    --host 127.0.0.1 `
    --port 8000 `
    --workers 2 `
    --loop uvloop

Write-Host ""
Write-Host "❌ Server stopped" -ForegroundColor Red
