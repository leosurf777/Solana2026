# 🚀 Render Backend Deployment Guide

## 📋 **Quick Steps to Deploy Backend**

### **Step 1: Create Render Account**
1. Go to: https://render.com
2. Click "Sign Up" 
3. Sign up with GitHub (recommended)

### **Step 2: Create New Web Service**
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select: `leosurf777/Solana2026`
4. Click "Connect Repository"

### **Step 3: Configure Service**
Use these exact settings:

#### **Basic Configuration**
- **Name**: `solana-pump-bot-api`
- **Branch**: `master`
- **Root Directory**: `.` (leave empty)
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:api`

#### **Environment Variables**
Add these environment variables:
```
NODE_VERSION=20
PORT=10000
RPC_URL=https://api.mainnet-beta.solana.com
PRIVATE_KEY=153,38,36,184,228,227,172,221,87,6,54,61,66,179,150,178,116,100,53,22,244,229,190,26,191,81,140,236,1,251,138,178,85,41,196,222,167,71,65,225,86,232,92,209,86,200,46,162,186,73,76,91,249,90,198,58,86,213,29,26,203,68,231,142
TOKEN_MINT=So11111111111111111111111111111111111111112
PUMP_PROGRAM_ID=6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P
MIN_SOL_AMOUNT=0.1
SLIPPAGE=1.0
```

#### **Advanced Settings**
- **Instance Type**: `Free` (to start)
- **Health Check Path**: `/api/health`
- **Auto-Deploy**: ✅ Enabled

### **Step 4: Deploy**
1. Click "Create Web Service"
2. Wait for build and deployment (2-3 minutes)
3. Copy your backend URL

### **Step 5: Update Frontend**
1. Go to Vercel Dashboard: https://vercel.com/leos-projects-15c3af6c/frontend/settings/environment-variables
2. Update `VITE_API_URL` to your Render URL
3. Redeploy frontend

## 🎯 **Expected Backend URL Format**
```
https://solana-pump-bot-api.onrender.com
```

## 📊 **Testing Your Deployment**

### **Check Backend Health**
```bash
curl https://your-backend-url.onrender.com/api/health
```

### **Test Frontend Connection**
Visit: https://www.uniquelypuzzled.com
- Should load real data from backend
- All trading features should work
- No more connection errors

## 🔧 **Troubleshooting**

### **Common Issues**
1. **Build Fails**: Check Node version (use 20)
2. **Port Issues**: Ensure PORT=10000
3. **Environment Variables**: Double-check all variables
4. **Health Check**: Ensure `/api/health` returns 200

### **Logs**
- Check Render logs for errors
- Look for "All services initialized successfully"
- Verify wallet address loads correctly

## 🚀 **After Deployment**

### **What You'll Have**
- ✅ Live backend API
- ✅ Real trading functionality
- ✅ Working frontend integration
- ✅ Professional trading bot

### **Next Steps**
1. Test all API endpoints
2. Verify frontend connects properly
3. Test trading features
4. Monitor performance

---

## 🎉 **Ready to Deploy!**

**Follow these steps and your Solana pump bot backend will be live on Render!**

Your frontend at https://www.uniquelypuzzled.com will then connect to your real backend for full trading functionality.
