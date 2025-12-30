import axios from 'axios';
import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';

// API Configuration
export interface APIConfig {
  solanaRPC: string;
  heliusRPC: string;
  coingeckoAPI: string;
  dexScreenerAPI: string;
  solscanAPI: string;
  birdeyeAPI: string;
  twitterAPI: string;
  telegramAPI: string;
}

// Token data from various APIs
export interface TokenData {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  supply: string;
  price: number;
  marketCap: number;
  volume24h: number;
  liquidity: number;
  holders: number;
  change24h: number;
  change1h: number;
  change7d: number;
  createdAt: Date;
  creator: string;
  description?: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  image?: string;
  socialScore?: number;
  holderDistribution?: {
    top10: number;
    top100: number;
    total: number;
  };
  onChainMetrics?: {
    transactions24h: number;
    activeAddresses: number;
    totalTransactions: number;
  };
}

// Trading signals
export interface TradingSignal {
  type: 'buy' | 'sell' | 'hold';
  strength: number; // 0-100
  reason: string;
  confidence: number; // 0-100
  timestamp: Date;
  indicators: {
    volume: boolean;
    price: boolean;
    social: boolean;
    technical: boolean;
    onchain: boolean;
  };
}

export class SolanaTradingAPIs {
  private config: APIConfig;
  private connection: Connection;
  private wallet: Keypair;

  constructor(config: APIConfig, wallet: Keypair) {
    this.config = config;
    this.connection = new Connection(config.solanaRPC, 'confirmed');
    this.wallet = wallet;
  }

  // ============= SOLANA RPC API =============
  async getAccountInfo(publicKey: string) {
    try {
      const account = await this.connection.getAccountInfo(new PublicKey(publicKey));
      return account;
    } catch (error) {
      console.error('Error getting account info:', error);
      return null;
    }
  }

  async getTokenSupply(tokenMint: string) {
    try {
      const supply = await this.connection.getTokenSupply(new PublicKey(tokenMint));
      return supply;
    } catch (error) {
      console.error('Error getting token supply:', error);
      return null;
    }
  }

  // ============= HELIUS RPC API =============
  async getHeliusTokenData(tokenMint: string) {
    try {
      const response = await axios.post(`${this.config.heliusRPC}/v0/token-metadata`, {
        mintAccounts: [tokenMint]
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting Helius token data:', error);
      return null;
    }
  }

  // ============= COINGECKO API =============
  async getCoinGeckoTokenData(tokenId: string) {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${tokenId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
        {
          headers: {
            'x-cg-demo-api-key': this.config.coingeckoAPI
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting CoinGecko data:', error);
      return null;
    }
  }

  // ============= DEXSCREENER API =============
  async getDexScreenerPairs(tokenAddress: string) {
    try {
      const response = await axios.get(
        `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting DexScreener data:', error);
      return null;
    }
  }

  // ============= SOLSCAN API =============
  async getSolscanTokenInfo(tokenAddress: string) {
    try {
      const response = await axios.get(
        `https://public-api.solscan.io/token/meta?tokenAddress=${tokenAddress}`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting Solscan token info:', error);
      return null;
    }
  }

  // ============= BIRDEYE API =============
  async getBirdeyeTokenOverview(tokenAddress: string) {
    try {
      const response = await axios.get(
        `https://public-api.birdeye.so/defi/token_overview`,
        {
          params: { address: tokenAddress },
          headers: {
            'X-API-KEY': this.config.birdeyeAPI,
            'accept': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting Birdeye token overview:', error);
      return null;
    }
  }

  // ============= SOCIAL SENTIMENT ANALYSIS =============
  async getTwitterSentiment(query: string) {
    try {
      // Mock sentiment data for now
      return {
        sentiment: 0.7,
        mentions: 156,
        positive: 89,
        negative: 23,
        neutral: 44,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error getting Twitter sentiment:', error);
      return null;
    }
  }

  // ============= COMPREHENSIVE TOKEN ANALYSIS =============
  async analyzeToken(tokenAddress: string): Promise<TokenData | null> {
    try {
      const [dexscreenerData, solscanData, birdeyeData] = await Promise.allSettled([
        this.getDexScreenerPairs(tokenAddress),
        this.getSolscanTokenInfo(tokenAddress),
        this.getBirdeyeTokenOverview(tokenAddress)
      ]);

      const tokenData: TokenData = {
        address: tokenAddress,
        name: 'Unknown Token',
        symbol: 'UNKNOWN',
        decimals: 9,
        supply: '0',
        price: 0,
        marketCap: 0,
        volume24h: 0,
        liquidity: 0,
        holders: 0,
        change24h: 0,
        change1h: 0,
        change7d: 0,
        createdAt: new Date(),
        creator: '',
        socialScore: 0
      };

      // Process DexScreener data
      if (dexscreenerData.status === 'fulfilled' && dexscreenerData.value?.pairs?.length > 0) {
        const pair = dexscreenerData.value.pairs[0];
        tokenData.name = pair.baseToken.name;
        tokenData.symbol = pair.baseToken.symbol;
        tokenData.price = parseFloat(pair.priceUsd);
        tokenData.marketCap = pair.fdv;
        tokenData.volume24h = pair.volume?.h24 || 0;
        tokenData.liquidity = pair.liquidity?.usd || 0;
        tokenData.change24h = pair.priceChange?.h24 || 0;
        tokenData.change1h = pair.priceChange?.h1 || 0;
      }

      // Process Solscan data
      if (solscanData.status === 'fulfilled') {
        tokenData.holders = solscanData.value?.holder || 0;
        tokenData.creator = solscanData.value?.owner || '';
      }

      // Process Birdeye data
      if (birdeyeData.status === 'fulfilled') {
        const data = birdeyeData.value?.data;
        if (data) {
          tokenData.price = data.price || tokenData.price;
          tokenData.marketCap = data.mc || tokenData.marketCap;
          tokenData.volume24h = data.v24hUSD || tokenData.volume24h;
          tokenData.change24h = data.priceChange24h || tokenData.change24h;
        }
      }

      return tokenData;
    } catch (error) {
      console.error('Error analyzing token:', error);
      return null;
    }
  }

  // ============= TRADING SIGNALS =============
  async generateTradingSignals(tokenData: TokenData): Promise<TradingSignal> {
    const indicators = {
      volume: tokenData.volume24h > 10000,
      price: tokenData.change1h > 0 && tokenData.change24h > 0,
      social: (tokenData.socialScore || 0) > 0.7,
      technical: tokenData.change1h > 0 && tokenData.change24h > 0,
      onchain: tokenData.holders > 100 && tokenData.volume24h > 10000
    };

    const trueIndicators = Object.values(indicators).filter(Boolean).length;
    const strength = (trueIndicators / 5) * 100;

    let type: 'buy' | 'sell' | 'hold' = 'hold';
    let reason = '';
    let confidence = strength;

    if (strength >= 80) {
      type = 'buy';
      reason = 'Strong bullish signals across all indicators';
      confidence = Math.min(confidence + 10, 100);
    } else if (strength >= 60) {
      type = 'buy';
      reason = 'Moderate bullish signals detected';
    } else if (strength <= 20) {
      type = 'sell';
      reason = 'Strong bearish signals detected';
      confidence = Math.min(confidence + 10, 100);
    } else {
      type = 'hold';
      reason = 'Mixed signals - wait for clearer direction';
    }

    return {
      type,
      strength,
      reason,
      confidence,
      timestamp: new Date(),
      indicators
    };
  }

  // ============= EXECUTE TRADE =============
  async executeTrade(tokenAddress: string, amount: number, type: 'buy' | 'sell'): Promise<string> {
    try {
      const transaction = new Transaction();
      
      if (type === 'buy') {
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: this.wallet.publicKey,
            toPubkey: new PublicKey(tokenAddress),
            lamports: LAMPORTS_PER_SOL * amount,
          })
        );
      }

      const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.wallet.publicKey;

      const signature = await this.connection.sendRawTransaction(
        transaction.serialize(),
        { skipPreflight: true }
      );

      return signature;
    } catch (error) {
      console.error('Error executing trade:', error);
      throw error;
    }
  }
}
