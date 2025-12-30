#!/bin/bash

# Solana Pump Bot Deployment Script
echo "🚀 Starting Solana Pump Bot Deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Build backend
echo "🔨 Building backend..."
npm run build

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

# Build frontend
echo "🔨 Building frontend..."
npm run build

cd ..

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env file with your configuration before running the bot."
fi

echo "✅ Deployment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start the backend bot: npm start"
echo "3. Serve the frontend from frontend/dist directory"
echo ""
echo "🌐 Frontend serving options:"
echo "   - Python 3: python -m http.server 8080 --directory frontend/dist"
echo "   - Node.js: npx serve frontend/dist -p 8080"
echo "   - Nginx: Point nginx to frontend/dist directory"
