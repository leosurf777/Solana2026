import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Trade {
  id: string;
  type: 'buy' | 'sell';
  token: string;
  amount: number;
  price: number;
  timestamp: Date;
  signature: string;
  status: 'pending' | 'confirmed' | 'failed';
  profit?: number;
}

export interface MarketToken {
  address: string;
  name: string;
  symbol: string;
  creator: string;
  price: number;
  marketCap: number;
  volume24h: number;
  liquidity: number;
  holders: number;
  createdAt: Date;
  bondingCurve: number;
}

export interface MarketData {
  tokens: MarketToken[];
  stats: {
    totalTokens: number;
    newTokens: number;
    avgLiquidity: number;
    totalVolume: number;
  };
}

export interface BotStatus {
  running: boolean;
  lastUpdate: string;
  config: {
    tokenMint: string;
    minSolAmount: number;
    slippage: number;
  };
}

// API Functions
export const apiClient = {
  // Health check
  async healthCheck() {
    const response = await api.get('/api/health');
    return response.data;
  },

  // Bot status
  async getBotStatus(): Promise<BotStatus> {
    const response = await api.get('/api/bot/status');
    return response.data;
  },

  // Trades
  async getTrades(): Promise<Trade[]> {
    const response = await api.get('/api/trades');
    return response.data;
  },

  async executeTrade(type: 'buy' | 'sell', tokenAddress: string, amount: number): Promise<Trade> {
    const response = await api.post('/api/trade', {
      type,
      tokenAddress,
      amount,
    });
    return response.data;
  },

  // Market data
  async getMarketData(): Promise<MarketData> {
    const response = await api.get('/api/market');
    return response.data;
  },
};

export default api;
