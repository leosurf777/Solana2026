import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// API Configuration for Solana Trading Bot
export const API_CONFIG = {
  // Solana RPC Endpoints
  solanaRPC: process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com',
  heliusRPC: process.env.HELIUS_RPC || 'https://rpc.helius.xyz/?api-key=YOUR_HELIUS_KEY',
  
  // Price Tracking APIs
  coingeckoAPI: process.env.COINGECKO_API || 'YOUR_COINGECKO_API_KEY',
  dexScreenerAPI: process.env.DEXSCREENER_API || 'https://api.dexscreener.com/latest/dex',
  
  // On-Chain Analytics APIs
  solscanAPI: process.env.SOLSCAN_API || 'YOUR_SOLSCAN_API_KEY',
  birdeyeAPI: process.env.BIRDEYE_API || 'YOUR_BIRDEYE_API_KEY',
  
  // Social Media APIs
  twitterAPI: process.env.TWITTER_API || 'YOUR_TWITTER_API_KEY',
  telegramAPI: process.env.TELEGRAM_API || 'YOUR_TELEGRAM_BOT_TOKEN',
};

// Recommended API Providers for Profitable Trading:

/*
1. HELIUS RPC (Premium)
   - Fast, reliable Solana RPC
   - WebSocket support for real-time data
   - Get API key: https://www.helius.dev/
   
2. BIRDEYE API (Premium)
   - Comprehensive token analytics
   - Real-time price data
   - Volume and liquidity tracking
   - Get API key: https://birdeye.so/
   
3. COINGECKO API (Free/Premium)
   - Price tracking
   - Market data
   - Historical data
   - Get API key: https://www.coingecko.com/en/api
   
4. DEXSCREENER API (Free)
   - DEX data aggregation
   - Real-time price feeds
   - Liquidity pools data
   - Get API key: https://dexscreener.com/
   
5. SOLSCAN API (Free/Premium)
   - On-chain analytics
   - Transaction tracking
   - Holder information
   - Get API key: https://solscan.io/
   
6. TWITTER API v2 (Premium)
   - Social sentiment analysis
   - Trend detection
   - Get API key: https://developer.twitter.com/
   
7. JUPITER AGGREGATOR API (Free)
   - DEX aggregation
   - Best route finding
   - Swap execution
   - Get API key: https://jup.ag/
   
8. RAYDIUM SDK (Free)
   - Direct DEX integration
   - Liquidity pool operations
   - Get SDK: https://raydium.io/
*/

export const TRADING_CONFIG = {
  // Trading parameters
  maxSlippage: 3.0, // 3% max slippage
  minLiquidity: 10000, // $10k minimum liquidity
  maxGasPrice: 0.00001, // Maximum gas price in SOL
  minHolders: 50, // Minimum token holders
  
  // Risk management
  maxPositionSize: 1.0, // 1 SOL max per trade
  maxDailyTrades: 50, // Maximum trades per day
  stopLoss: 10.0, // 10% stop loss
  takeProfit: 50.0, // 50% take profit
  
  // Signal thresholds
  buySignalThreshold: 70, // Minimum signal strength to buy
  sellSignalThreshold: 30, // Maximum signal strength to sell
  
  // Time intervals (milliseconds)
  scanInterval: 5000, // Scan every 5 seconds
  priceUpdateInterval: 1000, // Update prices every 1 second
  signalCheckInterval: 30000, // Check signals every 30 seconds
};

// Recommended API Key Setup Instructions:

/*
1. HELIUS RPC
   - Sign up at https://www.helius.dev/
   - Choose a plan (Free tier available)
   - Get your RPC URL
   - Add to .env: HELIUS_RPC=https://rpc.helius.xyz/?api-key=YOUR_KEY
   
2. BIRDEYE API
   - Sign up at https://birdeye.so/
   - Get API key from dashboard
   - Add to .env: BIRDEYE_API=YOUR_API_KEY
   
3. COINGECKO API
   - Sign up at https://www.coingecko.com/en/api
   - Get free API key
   - Add to .env: COINGECKO_API=YOUR_API_KEY
   
4. TWITTER API
   - Apply for developer account at https://developer.twitter.com/
   - Create app and get API keys
   - Add to .env: TWITTER_API=YOUR_API_KEY
   
5. SOLSCAN API
   - Sign up at https://solscan.io/
   - Get API key from dashboard
   - Add to .env: SOLSCAN_API=YOUR_API_KEY
*/

export default API_CONFIG;
