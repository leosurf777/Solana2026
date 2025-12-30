@echo off
echo 🚀 Solana Pump Bot - Quick Render Deployment
echo.
echo 📋 Follow these exact steps:
echo.
echo 1️⃣ Open browser and go to: https://render.com
echo 2️⃣ Click "Sign Up" → "Sign up with GitHub"
echo 3️⃣ Authorize GitHub access
echo 4️⃣ Click "New +" → "Web Service"
echo 5️⃣ Click "Connect a Git repository"
echo 6️⃣ Select: leosurf777/Solana2026
echo 7️⃣ Click "Connect Repository"
echo.
echo ⚙️  Configure Service:
echo    Name: solana-pump-bot-api
echo    Branch: master
echo    Runtime: Node
echo    Build Command: npm install && npm run build
echo    Start Command: npm run start:api
echo.
echo 🌍 Add Environment Variables:
echo    NODE_VERSION=20
echo    PORT=10000
echo    RPC_URL=https://api.mainnet-beta.solana.com
echo    PRIVATE_KEY=153,38,36,184,228,227,172,221,87,6,54,61,66,179,150,178,116,100,53,22,244,229,190,26,191,81,140,236,1,251,138,178,85,41,196,222,167,71,65,225,86,232,92,209,86,200,46,162,186,73,76,91,249,90,198,58,86,213,29,26,203,68,231,142
echo    TOKEN_MINT=So11111111111111111111111111111111111111112
echo    PUMP_PROGRAM_ID=6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P
echo    MIN_SOL_AMOUNT=0.1
echo    SLIPPAGE=1.0
echo.
echo 🏥 Health Check Path: /api/health
echo 💰 Instance Type: Free (to start)
echo.
echo 🚀 Click "Create Web Service"
echo ⏳ Wait 2-3 minutes for deployment
echo.
echo 📋 After deployment:
echo 1. Copy your backend URL (https://solana-pump-bot-api.onrender.com)
echo 2. Update Vercel environment variable VITE_API_URL
echo 3. Test at https://www.uniquelypuzzled.com
echo.
echo 🎉 Your trading bot will be fully functional!
echo.
pause
