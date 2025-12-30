# 🚀 Solana Pump Bot Simple Deployment Script

Write-Host "🚀 Starting Solana Pump Bot Deployment..." -ForegroundColor Green

# Check if backend is running
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method Get -TimeoutSec 5
    Write-Host "✅ Backend API Server is running" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Backend API Server is not running" -ForegroundColor Red
    Write-Host "   Please start backend with: npm run start:api" -ForegroundColor Yellow
    exit 1
}

# Check frontend build
Write-Host "🔨 Checking frontend build..." -ForegroundColor Yellow
if (Test-Path "frontend\dist\index.html") {
    Write-Host "✅ Frontend is built" -ForegroundColor Green
} else {
    Write-Host "🔨 Building frontend..." -ForegroundColor Yellow
    Set-Location "frontend"
    npm run build
    Set-Location ".."
}

# Display deployment status
Write-Host "🎉 Deployment Status:" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:3001 - ✅ Running" -ForegroundColor White
Write-Host "Frontend: Built and ready for deployment" -ForegroundColor White
Write-Host "Status: ✅ Ready for Vercel deployment" -ForegroundColor Green

Write-Host ""
Write-Host "📊 Available API Endpoints:" -ForegroundColor Yellow
Write-Host "Health: http://localhost:3001/api/health" -ForegroundColor White
Write-Host "Pump.fun: http://localhost:3001/api/pumpfun/start" -ForegroundColor White
Write-Host "Sniper: http://localhost:3001/api/sniper/start" -ForegroundColor White
Write-Host "Volume: http://localhost:3001/api/volume/start" -ForegroundColor White

Write-Host ""
Write-Host "🌐 To deploy frontend to Vercel:" -ForegroundColor Yellow
Write-Host "1. cd frontend" -ForegroundColor White
Write-Host "2. vercel --prod" -ForegroundColor White
Write-Host "3. Follow the prompts" -ForegroundColor White

Write-Host ""
Write-Host "🐳 To deploy backend with Docker:" -ForegroundColor Yellow
Write-Host "1. docker build -f Dockerfile.production -t solana-pump-bot ." -ForegroundColor White
Write-Host "2. docker run -p 3001:3001 --env-file .env solana-pump-bot" -ForegroundColor White

Write-Host ""
Write-Host "🚀 Your Solana Pump Bot is ready for deployment!" -ForegroundColor Green
