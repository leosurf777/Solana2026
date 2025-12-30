import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import type { Trade, MarketToken, BotStatus } from '../services/api';
import type { TokenInfo, WalletInfo, BotSettings, PriceAlert, TransactionHistory } from '../types/trading';

// Convert API types to component types
const convertMarketToken = (token: MarketToken): TokenInfo => ({
  address: token.address,
  name: token.name,
  symbol: token.symbol,
  decimals: 9, // Default, should be fetched from token metadata
  supply: '0', // Should be fetched from token metadata
  price: token.price,
  marketCap: token.marketCap,
  volume24h: token.volume24h,
  change24h: 0 // Should be calculated
});

const convertTrade = (trade: any): Trade => ({
  ...trade,
  timestamp: new Date(trade.timestamp)
});

const mockSettings: BotSettings = {
  enabled: true,
  minBuyAmount: 0.1,
  maxBuyAmount: 5.0,
  slippage: 1.0,
  autoSell: true,
  takeProfit: 50.0,
  stopLoss: 10.0,
  maxPositions: 5,
  cooldownPeriod: 10000,
  monitorTokens: ['So11111111111111111111111111111111111111112'],
  telegramNotifications: true,
  tradingMode: 'hybrid'
};

export const useTradingData = () => {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [wallet] = useState<WalletInfo | null>(null);
  const [settings, setSettings] = useState<BotSettings>(mockSettings);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [transactions] = useState<TransactionHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);

  // Load initial data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load market data
        const marketData = await apiClient.getMarketData();
        const convertedTokens = marketData.tokens.map(convertMarketToken);
        setTokens(convertedTokens);
        
        // Load trades
        const tradesData = await apiClient.getTrades();
        setTrades(tradesData);
        
        // Load bot status
        const status = await apiClient.getBotStatus();
        setBotStatus(status);
        
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to connect to backend');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    // Set up polling for real-time updates
    const interval = setInterval(loadData, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  const executeTrade = async (type: 'buy' | 'sell', token: TokenInfo, amount: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const newTrade = await apiClient.executeTrade(type, token.address, amount);
      setTrades(prev => [convertTrade(newTrade), ...prev]);
      
      // Refresh trades after a delay to get updated status
      setTimeout(async () => {
        try {
          const updatedTrades = await apiClient.getTrades();
          setTrades(updatedTrades);
        } catch (err) {
          console.error('Failed to refresh trades:', err);
        }
        setLoading(false);
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Trade execution failed');
      setLoading(false);
    }
  };

  const updateSettings = (newSettings: Partial<BotSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addAlert = (alert: Omit<PriceAlert, 'id'>) => {
    const newAlert: PriceAlert = {
      ...alert,
      id: Date.now().toString()
    };
    setAlerts(prev => [...prev, newAlert]);
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  return {
    tokens,
    trades,
    wallet,
    settings,
    alerts,
    transactions,
    loading,
    error,
    botStatus,
    executeTrade,
    updateSettings,
    addAlert,
    removeAlert
  };
};
