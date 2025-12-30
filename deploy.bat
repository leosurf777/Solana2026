@echo off
echo 🚀 Deploying Solana Pump Bot...
echo.

echo 📊 Checking backend status...
curl -s http://localhost:3001/api/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend API Server is running
) else (
    echo ❌ Backend API Server is not running
    echo Please start backend with: npm run start:api
    pause
    exit /b 1
)

echo.
echo 🔨 Checking frontend build...
if exist "frontend\dist\index.html" (
    echo ✅ Frontend is built
) else (
    echo 🔨 Building frontend...
    cd frontend
    npm run build
    cd ..
)

echo.
echo 🌐 Deploying to Vercel...
cd frontend
echo Please follow the Vercel deployment prompts...
echo.
vercel --prod

echo.
echo 🎉 Deployment Complete!
echo.
echo Backend API: http://localhost:3001
echo Frontend: Check Vercel output for URL
echo.
echo 📊 Test your deployment at the provided Vercel URL
pause
