# Solana Pump Bot Deployment Script for PowerShell
Write-Host "🚀 Starting Solana Pump Bot Deployment..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check Node.js version
$majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
if ($majorVersion -lt 18) {
    Write-Host "❌ Node.js version 18+ is required. Current version: $nodeVersion" -ForegroundColor Red
    exit 1
}

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
npm install

# Build backend
Write-Host "🔨 Building backend..." -ForegroundColor Yellow
npm run build

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install

# Build frontend
Write-Host "🔨 Building frontend..." -ForegroundColor Yellow
npm run build

Set-Location ..

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "📝 Please edit .env file with your configuration before running the bot." -ForegroundColor Yellow
}

Write-Host "✅ Deployment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env file with your configuration"
Write-Host "2. Start the backend bot: npm start"
Write-Host "3. Serve the frontend from frontend/dist directory"
Write-Host ""
Write-Host "🌐 Frontend serving options:" -ForegroundColor Cyan
Write-Host "   - Python 3: python -m http.server 8080 --directory frontend/dist"
Write-Host "   - Node.js: npx serve frontend/dist -p 8080"
Write-Host "   - IIS: Point IIS to frontend/dist directory"
