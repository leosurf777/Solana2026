# 🚀 Solana Pump Bot Deployment Script
# PowerShell script for quick deployment

Write-Host "🚀 Starting Solana Pump Bot Deployment..." -ForegroundColor Green

# Check if backend is running
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method Get -TimeoutSec 5
    Write-Host "✅ Backend API Server is running" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Cyan
    Write-Host "   Wallet: $($response.services.wallet)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Backend API Server is not running" -ForegroundColor Red
    Write-Host "   Starting backend..." -ForegroundColor Yellow
    
    # Start backend in background
    Start-Process -FilePath "npm" -ArgumentList "run", "start:api" -WorkingDirectory "." -WindowStyle Hidden
    
    # Wait for backend to start
    Write-Host "   Waiting for backend to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method Get -TimeoutSec 5
        Write-Host "✅ Backend started successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to start backend" -ForegroundColor Red
        exit 1
    }
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
    
    if (Test-Path "frontend\dist\index.html") {
        Write-Host "✅ Frontend built successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend build failed" -ForegroundColor Red
        exit 1
    }
}

# Check Vercel CLI
Write-Host "🔍 Checking Vercel CLI..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found" -ForegroundColor Red
    Write-Host "   Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Deploy to Vercel
Write-Host "🌐 Deploying to Vercel..." -ForegroundColor Yellow
Set-Location "frontend"

try {
    $deployResult = vercel --prod --yes
    Write-Host "✅ Frontend deployed successfully!" -ForegroundColor Green
    
    # Extract deployment URL from result
    if ($deployResult -match "https://([^ ]+)\.vercel\.app") {
        $deployUrl = $matches[0]
        Write-Host "🌐 Deployed URL: $deployUrl" -ForegroundColor Cyan
        
        # Update environment file with deployed URL
        $envContent = "VITE_API_URL=https://your-backend-url.com"
        Set-Content -Path ".env.production" -Value $envContent
        Write-Host "📝 Environment file updated" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Vercel deployment failed" -ForegroundColor Red
    Write-Host "   Please run 'vercel --prod' manually in frontend directory" -ForegroundColor Yellow
}

Set-Location ".."

# Display deployment summary
Write-Host "🎉 Deployment Summary:" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:3001" -ForegroundColor White
Write-Host "Frontend: $deployUrl" -ForegroundColor White
Write-Host "Status: ✅ Ready for use" -ForegroundColor Green

Write-Host ""
Write-Host "📊 Available API Endpoints:" -ForegroundColor Yellow
Write-Host "Health: http://localhost:3001/api/health" -ForegroundColor White
Write-Host "Pump.fun: http://localhost:3001/api/pumpfun/start" -ForegroundColor White
Write-Host "Sniper: http://localhost:3001/api/sniper/start" -ForegroundColor White
Write-Host "Volume: http://localhost:3001/api/volume/start" -ForegroundColor White

Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update frontend environment with your backend URL" -ForegroundColor White
Write-Host "2. Configure production environment variables" -ForegroundColor White
Write-Host "3. Test all API endpoints" -ForegroundColor White
Write-Host "4. Monitor bot performance" -ForegroundColor White

Write-Host ""
Write-Host "🚀 Your Solana Pump Bot is deployed!" -ForegroundColor Green
