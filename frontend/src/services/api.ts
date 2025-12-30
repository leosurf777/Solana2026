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
  async getHealth() {
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

  // Pump.fun endpoints
  async startPumpFunScanner() {
    const response = await api.get('/api/pumpfun/start');
    return response.data;
  },

  async stopPumpFunScanner() {
    const response = await api.get('/api/pumpfun/stop');
    return response.data;
  },

  async getPumpFunTargets() {
    const response = await api.get('/api/pumpfun/targets');
    return response.data;
  },

  async getPumpFunTokens() {
    const response = await api.get('/api/pumpfun/tokens');
    return response.data;
  },

  // Volume trader endpoints
  async startVolumeTrader() {
    const response = await api.get('/api/volume/start');
    return response.data;
  },

  async stopVolumeTrader() {
    const response = await api.get('/api/volume/stop');
    return response.data;
  },

  async getVolumeData() {
    const response = await api.get('/api/volume/data');
    return response.data;
  },

  async getVolumeTrades() {
    const response = await api.get('/api/volume/trades');
    return response.data;
  },

  async getVolumePerformance() {
    const response = await api.get('/api/volume/performance');
    return response.data;
  },

  // Sniper bot endpoints
  async startSniperBot() {
    const response = await api.get('/api/sniper/start');
    return response.data;
  },

  async stopSniperBot() {
    const response = await api.get('/api/sniper/stop');
    return response.data;
  },

  async getSniperTargets() {
    const response = await api.get('/api/sniper/targets');
    return response.data;
  },

  async getSniperPositions() {
    const response = await api.get('/api/sniper/positions');
    return response.data;
  },

  async getSniperConfig() {
    const response = await api.get('/api/sniper/config');
    return response.data;
  },

  async updateSniperConfig(config: any) {
    const response = await api.post('/api/sniper/config', config);
    return response.data;
  },

  async getSniperPerformance() {
    const response = await api.get('/api/sniper/performance');
    return response.data;
  },

  // Multi-wallet endpoints
  async createWalletBatch(count: number, batchName: string, prefix: string) {
    const response = await api.post('/api/wallets/create', {
      count,
      batchName,
      prefix,
    });
    return response.data;
  },

  async getWalletBatches() {
    const response = await api.get('/api/wallets/batches');
    return response.data;
  },
};

export default api;
