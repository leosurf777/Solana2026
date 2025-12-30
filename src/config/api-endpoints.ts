// Free Solana API Endpoints Configuration
export const API_ENDPOINTS = {
  // Solana RPC Endpoints (Free Tiers)
  SOLANA_RPC: {
    // Primary: Helius (100k requests/day free)
    HELIUS: 'https://rpc.helius.xyz/?api-key=YOUR_API_KEY',
    
    // Backup: QuickNode (2M requests/month free)
    QUICKNODE: 'https://YOUR_ENDPOINT.solana-mainnet.quiknode.pro/YOUR_API_KEY',
    
    // Tertiary: Alchemy (300k compute units/month free)
    ALCHEMY: 'https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY',
    
    // Public: Solana Public RPC (rate limited)
    PUBLIC: 'https://api.mainnet-beta.solana.com',
    
    // Triton (Free tier)
    TRITON: 'https://rpc.triton.one',
    
    // Ankr (Free tier)
    ANKR: 'https://rpc.ankr.com/solana',
  },

  // Pump.fun APIs
  PUMPFUN: {
    // Official Pump.fun API
    API: 'https://frontend-api.pump.fun',
    
    // Alternative endpoints
    BACKUP: 'https://pump.fun/api',
    
    // Real-time WebSocket
    WS: 'wss://frontend-api.pump.fun/ws',
  },

  // Volume & Market Data APIs
  MARKET_DATA: {
    // Birdeye (Free tier)
    BIRDEYE: 'https://public-api.birdeye.so',
    
    // DexScreener (Free)
    DEXSCREENER: 'https://api.dexscreener.com/latest/dex',
    
    // CoinGecko (Free)
    COINGECKO: 'https://api.coingecko.com/api/v3',
    
    // Solana Token List (Free)
    TOKEN_LIST: 'https://token-list-api.solana.cloud',
  },

  // Sniper & Trading APIs
  TRADING: {
    // Jupiter API (Free)
    JUPITER: 'https://quote-api.jup.ag/v6',
    
    // Raydium API (Free)
    RAYDIUM: 'https://api.raydium.io',
    
    // Orca API (Free)
    ORCA: 'https://api.orca.so',
    
    // 1inch (Free tier)
    ONEINCH: 'https://api.1inch.dev/swap/v5.2',
  },

  // Analytics & Volume APIs
  ANALYTICS: {
    // Solscan API (Free tier)
    SOLSCAN: 'https://public-api.solscan.io',
    
    // SolanaFM API (Free)
    SOLANAFM: 'https://api.solana.fm',
    
    // Step Finance (Free)
    STEPFINANCE: 'https://api.step.finance',
  },

  // Wallet & Transaction APIs
  WALLET: {
    // Solana Beach (Free)
    SOLANABEACH: 'https://api.solanabeach.io/v1',
    
    // Solana Explorer (Free)
    SOLANA_EXPLORER: 'https://explorer-api.solana.com',
  }
};

// API Rate Limits (Free Tier)
export const RATE_LIMITS = {
  HELIUS: { requests: 100000, per: 'day' },
  QUICKNODE: { requests: 2000000, per: 'month' },
  ALCHEMY: { requests: 300000, per: 'month' },
  BIRDEYE: { requests: 1000, per: 'minute' },
  DEXSCREENER: { requests: 300, per: 'minute' },
  JUPITER: { requests: 100, per: 'second' },
};

// Fallback Configuration
export const FALLBACK_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 10000,
  fallbackChain: ['HELIUS', 'QUICKNODE', 'ALCHEMY', 'PUBLIC'],
};

export default API_ENDPOINTS;
