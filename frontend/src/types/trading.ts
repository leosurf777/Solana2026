export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  supply: string;
  price: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
}

export interface Trade {
  id: string;
  type: 'buy' | 'sell';
  token: TokenInfo;
  amount: number;
  price: number;
  timestamp: Date;
  signature: string;
  status: 'pending' | 'confirmed' | 'failed';
  profit?: number;
}

export interface BotSettings {
  enabled: boolean;
  minBuyAmount: number;
  maxBuyAmount: number;
  slippage: number;
  autoSell: boolean;
  takeProfit: number;
  stopLoss: number;
  maxPositions: number;
  cooldownPeriod: number;
  monitorTokens: string[];
  telegramNotifications: boolean;
  tradingMode: 'manual' | 'auto' | 'hybrid';
}

export interface WalletInfo {
  address: string;
  balance: number;
  tokens: TokenInfo[];
}

export interface PriceAlert {
  id: string;
  token: string;
  type: 'above' | 'below';
  price: number;
  enabled: boolean;
}

export interface TransactionHistory {
  signature: string;
  type: string;
  amount: number;
  timestamp: Date;
  status: 'success' | 'failed' | 'pending';
  fee: number;
}
