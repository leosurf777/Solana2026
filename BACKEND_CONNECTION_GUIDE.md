# Backend Connection Guide

## 🚀 Quick Setup

### 1. Start the Backend API Server

**Option A: Development Mode**
```bash
cd ..
npm run dev:api
```

**Option B: Production Mode**
```bash
cd ..
npm run start:api
```

The API server will run on `http://localhost:3001`

### 2. Configure Frontend Environment

**For Local Development:**
Create `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:3001
```

**For Production:**
Update `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-url.com
```

### 3. Redeploy Frontend

```bash
cd frontend
vercel --prod --yes
```

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

### Bot Status
```
GET /api/bot/status
```

### Get Trades
```
GET /api/trades
```

### Execute Trade
```
POST /api/trade
{
  "type": "buy" | "sell",
  "tokenAddress": "string",
  "amount": number
}
```

### Get Market Data
```
GET /api/market
```

## 🔧 Backend Deployment Options

### Option 1: Local Development
```bash
npm run dev:api
```

### Option 2: Production Server
```bash
# Build the project
npm run build

# Start production server
npm run start:api
```

### Option 3: Docker Deployment
```bash
docker-compose up backend
```

### Option 4: Cloud Deployment (Railway/Render)
1. Push code to GitHub
2. Connect repository to Railway/Render
3. Set environment variables:
   - `PORT=3001`
   - `NODE_ENV=production`
   - Your Solana configuration

## 🌐 Production Backend URLs

### Railway Example
```
https://your-app-name.up.railway.app
```

### Render Example
```
https://your-app-name.onrender.com
```

### Vercel Serverless (Advanced)
Create `api/index.ts` for serverless functions

## ⚙️ Environment Variables

Backend `.env`:
```env
SOLANA_RPC_URL=https://your-rpc-url.com
PRIVATE_KEY=your-private-key
TELEGRAM_BOT_TOKEN=your-telegram-token
TELEGRAM_CHAT_ID=your-chat-id
PORT=3001
```

Frontend `.env.production`:
```env
VITE_API_URL=https://your-backend-url.com
```

## 🧪 Testing the Connection

1. Start backend: `npm run dev:api`
2. Test health endpoint: `curl http://localhost:3001/api/health`
3. Start frontend: `npm run dev`
4. Check browser console for API calls

## 🔍 Troubleshooting

### CORS Issues
- Backend CORS is configured for all origins in development
- For production, update CORS origins in `api-server.ts`

### Connection Refused
- Ensure backend is running on port 3001
- Check firewall settings
- Verify VITE_API_URL is correct

### API Errors
- Check backend logs: `npm run dev:api`
- Verify environment variables
- Check network tab in browser dev tools

## 📊 Monitoring

### Backend Logs
```bash
npm run dev:api  # Development
docker logs backend  # Docker
```

### Frontend API Calls
- Browser Network tab
- Console logs for errors
- Vercel Function Logs

## 🚀 Next Steps

1. Deploy backend to Railway/Render
2. Update frontend environment variable
3. Redeploy frontend to Vercel
4. Test full integration
5. Set up monitoring and alerts
