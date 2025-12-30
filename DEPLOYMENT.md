# Deployment Guide

## Prerequisites
- Docker and Docker Compose installed
- Server with at least 2GB RAM and 1 CPU core
- Domain name (optional)

## Environment Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit environment variables:**
   ```bash
   nano .env
   ```
   Configure your Solana RPC endpoints, wallet private key, and Telegram bot token.

## Deployment Options

### Option 1: Docker Compose (Recommended)

1. **Build and start containers:**
   ```bash
   docker-compose up -d --build
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f
   ```

3. **Stop containers:**
   ```bash
   docker-compose down
   ```

### Option 2: Manual Deployment

#### Backend Deployment
```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start the bot
npm start
```

#### Frontend Deployment
```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Serve with any web server (nginx, apache, etc.)
# The built files are in the 'dist' directory
```

### Option 3: Cloud Deployment

#### Vercel (Frontend only)
```bash
cd frontend
npm install -g vercel
vercel --prod
```

#### Railway/Render (Full stack)
1. Connect your GitHub repository
2. Set environment variables in the dashboard
3. Deploy automatically

## Environment Variables

Required variables in `.env`:
- `SOLANA_RPC_URL`: Solana RPC endpoint
- `PRIVATE_KEY`: Your wallet private key
- `TELEGRAM_BOT_TOKEN`: Telegram bot token
- `TELEGRAM_CHAT_ID`: Telegram chat ID for notifications

## Monitoring

- Check backend logs: `docker-compose logs backend`
- Check frontend logs: `docker-compose logs frontend`
- Monitor resource usage: `docker stats`

## Security Notes

- Never commit your `.env` file to version control
- Use a read-only wallet for the bot when possible
- Enable firewall rules to restrict access
- Regularly update dependencies

## Troubleshooting

1. **Build fails**: Check Node.js version (requires 18+)
2. **Bot doesn't start**: Verify environment variables
3. **Frontend not accessible**: Check port 80 is available
4. **Solana connection issues**: Verify RPC URL is valid

## Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificate installed (if using domain)
- [ ] Backup strategy in place
- [ ] Monitoring and alerting set up
- [ ] Security audit completed
