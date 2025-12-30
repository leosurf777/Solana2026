import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { API_ENDPOINTS } from '../config/api-endpoints.js';

export interface VolumeTrade {
  id: string;
  tokenAddress: string;
  symbol: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: Date;
  signature: string;
  status: 'pending' | 'confirmed' | 'failed';
  volume: number;
  impact: number;
}

export interface VolumeStrategy {
  name: string;
  description: string;
  minVolume: number;
  maxSlippage: number;
  targetImpact: number;
  cooldownMs: number;
  enabled: boolean;
}

export interface MarketVolume {
  tokenAddress: string;
  symbol: string;
  volume1h: number;
  volume24h: number;
  priceChange1h: number;
  priceChange24h: number;
  liquidity: number;
  marketCap: number;
  trades: number;
  buyVolume: number;
  sellVolume: number;
}

export class VolumeTrader {
  private connection: Connection;
  private wallet: Keypair;
  private trades: Map<string, VolumeTrade> = new Map();
  private strategies: Map<string, VolumeStrategy> = new Map();
  private volumeData: Map<string, MarketVolume> = new Map();
  private isRunning = false;
  private tradeInterval: NodeJS.Timeout | null = null;

  constructor(connection: Connection, wallet: Keypair) {
    this.connection = connection;
    this.wallet = wallet;
    this.initializeStrategies();
  }

  // Initialize volume trading strategies
  private initializeStrategies() {
    const strategies: VolumeStrategy[] = [
      {
        name: 'volume_spike',
        description: 'Trade tokens with sudden volume increases',
        minVolume: 50000,
        maxSlippage: 2.0,
        targetImpact: 5.0,
        cooldownMs: 30000,
        enabled: true
      },
      {
        name: 'accumulation',
        description: 'Gradually accumulate tokens with consistent volume',
        minVolume: 25000,
        maxSlippage: 1.5,
        targetImpact: 2.0,
        cooldownMs: 60000,
        enabled: true
      },
      {
        name: 'momentum',
        description: 'Follow strong volume momentum',
        minVolume: 100000,
        maxSlippage: 3.0,
        targetImpact: 8.0,
        cooldownMs: 15000,
        enabled: false
      },
      {
        name: 'whale_watching',
        description: 'Track large volume movements',
        minVolume: 500000,
        maxSlippage: 5.0,
        targetImpact: 15.0,
        cooldownMs: 10000,
        enabled: true
      }
    ];

    strategies.forEach(strategy => {
      this.strategies.set(strategy.name, strategy);
    });
  }

  // Start volume trading
  async startVolumeTrading() {
    if (this.isRunning) {
      console.log('⚠️ Volume trading is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting volume trading bot...');

    // Start monitoring volume
    this.tradeInterval = setInterval(async () => {
      await this.monitorAndTrade();
    }, 5000); // Check every 5 seconds

    // Initial volume scan
    await this.updateVolumeData();
  }

  // Stop volume trading
  stopVolumeTrading() {
    if (this.tradeInterval) {
      clearInterval(this.tradeInterval);
      this.tradeInterval = null;
    }
    this.isRunning = false;
    console.log('⏹️ Volume trading stopped');
  }

  // Monitor volume and execute trades
  private async monitorAndTrade() {
    try {
      // Update volume data
      await this.updateVolumeData();

      // Check each enabled strategy
      for (const [name, strategy] of this.strategies) {
        if (strategy.enabled) {
          await this.executeStrategy(strategy);
        }
      }

    } catch (error) {
      console.error('❌ Error in volume monitoring:', error);
    }
  }

  // Update volume data from multiple sources
  private async updateVolumeData() {
    try {
      // Method 1: DexScreener API
      const dexScreenerData = await this.fetchDexScreenerVolume();
      
      // Method 2: Birdeye API
      const birdeyeData = await this.fetchBirdeyeVolume();
      
      // Method 3: Solana on-chain data
      const onChainData = await this.fetchOnChainVolume();

      // Merge and analyze data
      this.mergeVolumeData(dexScreenerData, birdeyeData, onChainData);

    } catch (error) {
      console.error('❌ Error updating volume data:', error);
    }
  }

  // Fetch volume from DexScreener
  private async fetchDexScreenerVolume(): Promise<MarketVolume[]> {
    try {
      const response = await fetch(`${API_ENDPOINTS.MARKET_DATA.DEXSCREENER}/search?q=SOL`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SolanaBot/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.pairs.map(this.formatDexScreenerData);
    } catch (error) {
      console.error('❌ DexScreener API error:', error);
      return [];
    }
  }

  // Fetch volume from Birdeye
  private async fetchBirdeyeVolume(): Promise<MarketVolume[]> {
    try {
      const response = await fetch(`${API_ENDPOINTS.MARKET_DATA.BIRDEYE}/defi/v2/tokens`, {
        headers: {
          'X-API-KEY': process.env.BIRDEYE_API_KEY || '',
          'User-Agent': 'Mozilla/5.0 (compatible; SolanaBot/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.tokens.map(this.formatBirdeyeData);
    } catch (error) {
      console.error('❌ Birdeye API error:', error);
      return [];
    }
  }

  // Fetch on-chain volume data
  private async fetchOnChainVolume(): Promise<MarketVolume[]> {
    try {
      // This would analyze recent transactions for volume patterns
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('❌ On-chain volume error:', error);
      return [];
    }
  }

  // Format DexScreener data
  private formatDexScreenerData = (rawData: any): MarketVolume => ({
    tokenAddress: rawData.baseToken?.address || '',
    symbol: rawData.baseToken?.symbol || '',
    volume1h: parseFloat(rawData.volume?.h1 || 0),
    volume24h: parseFloat(rawData.volume?.h24 || 0),
    priceChange1h: parseFloat(rawData.priceChange?.h1 || 0),
    priceChange24h: parseFloat(rawData.priceChange?.h24 || 0),
    liquidity: parseFloat(rawData.liquidity?.usd || 0),
    marketCap: parseFloat(rawData.fdv || 0),
    trades: parseInt(rawData.txns?.h24 || 0),
    buyVolume: parseFloat(rawData.volume?.h24 || 0) * 0.6, // Estimate
    sellVolume: parseFloat(rawData.volume?.h24 || 0) * 0.4, // Estimate
  });

  // Format Birdeye data
  private formatBirdeyeData = (rawData: any): MarketVolume => ({
    tokenAddress: rawData.address || '',
    symbol: rawData.symbol || '',
    volume1h: parseFloat(rawData.volume24h) / 24, // Estimate
    volume24h: parseFloat(rawData.volume24h || 0),
    priceChange1h: parseFloat(rawData.priceChange24h) / 24, // Estimate
    priceChange24h: parseFloat(rawData.priceChange24h || 0),
    liquidity: parseFloat(rawData.liquidity || 0),
    marketCap: parseFloat(rawData.mcap || 0),
    trades: 0, // Not provided by Birdeye
    buyVolume: parseFloat(rawData.volume24h || 0) * 0.6,
    sellVolume: parseFloat(rawData.volume24h || 0) * 0.4,
  });

  // Merge volume data from multiple sources
  private mergeVolumeData(
    dexScreener: MarketVolume[],
    birdeye: MarketVolume[],
    onChain: MarketVolume[]
  ) {
    const allData = [...dexScreener, ...birdeye, ...onChain];
    
    for (const data of allData) {
      const existing = this.volumeData.get(data.tokenAddress);
      
      if (existing) {
        // Average the data from multiple sources
        existing.volume1h = (existing.volume1h + data.volume1h) / 2;
        existing.volume24h = (existing.volume24h + data.volume24h) / 2;
        existing.liquidity = Math.max(existing.liquidity, data.liquidity);
        existing.trades += data.trades;
      } else {
        this.volumeData.set(data.tokenAddress, data);
      }
    }
  }

  // Execute trading strategy
  private async executeStrategy(strategy: VolumeStrategy) {
    try {
      // Find tokens that meet strategy criteria
      const candidates = Array.from(this.volumeData.values()).filter(token => 
        token.volume24h >= strategy.minVolume
      );

      for (const token of candidates) {
        const shouldTrade = this.evaluateTradeOpportunity(token, strategy);
        
        if (shouldTrade) {
          await this.executeVolumeTrade(token, strategy);
        }
      }

    } catch (error) {
      console.error(`❌ Error executing strategy ${strategy.name}:`, error);
    }
  }

  // Evaluate if a trade opportunity exists
  private evaluateTradeOpportunity(token: MarketVolume, strategy: VolumeStrategy): boolean {
    // Check if we recently traded this token
    const lastTrade = Array.from(this.trades.values())
      .filter(trade => trade.tokenAddress === token.tokenAddress)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    if (lastTrade) {
      const timeSinceLastTrade = Date.now() - lastTrade.timestamp.getTime();
      if (timeSinceLastTrade < strategy.cooldownMs) {
        return false;
      }
    }

    // Volume spike detection
    const volumeRatio = token.volume1h / (token.volume24h / 24);
    if (volumeRatio > 3) { // 3x average hourly volume
      return true;
    }

    // Price momentum with volume
    if (Math.abs(token.priceChange1h) > 5 && token.volume1h > strategy.minVolume) {
      return true;
    }

    // High volume consistency
    if (token.volume24h > strategy.minVolume * 2 && token.trades > 100) {
      return true;
    }

    return false;
  }

  // Execute volume-based trade
  private async executeVolumeTrade(token: MarketVolume, strategy: VolumeStrategy) {
    try {
      const tradeType = this.determineTradeType(token);
      const tradeAmount = this.calculateTradeAmount(token, strategy);
      
      const trade: VolumeTrade = {
        id: Date.now().toString(),
        tokenAddress: token.tokenAddress,
        symbol: token.symbol,
        type: tradeType,
        amount: tradeAmount,
        price: 0, // Will get from DEX
        timestamp: new Date(),
        signature: '',
        status: 'pending',
        volume: token.volume24h,
        impact: (tradeAmount / token.liquidity) * 100
      };

      // Execute the trade
      const signature = await this.executeTrade(trade, strategy);
      trade.signature = signature;
      trade.status = 'confirmed';

      this.trades.set(trade.id, trade);

      console.log(`📈 Volume trade executed: ${trade.type} ${trade.amount} of ${token.symbol} (${signature})`);

    } catch (error) {
      console.error(`❌ Volume trade failed for ${token.symbol}:`, error);
    }
  }

  // Determine trade type based on market conditions
  private determineTradeType(token: MarketVolume): 'buy' | 'sell' {
    // Buy on positive momentum with volume
    if (token.priceChange1h > 2 && token.buyVolume > token.sellVolume * 1.5) {
      return 'buy';
    }
    
    // Sell on negative momentum or distribution
    if (token.priceChange1h < -2 || token.sellVolume > token.buyVolume * 1.5) {
      return 'sell';
    }
    
    // Default to buy for neutral conditions with good volume
    return 'buy';
  }

  // Calculate optimal trade amount
  private calculateTradeAmount(token: MarketVolume, strategy: VolumeStrategy): number {
    const baseAmount = 0.1; // 0.1 SOL base
    
    // Adjust based on volume
    const volumeMultiplier = Math.min(token.volume24h / 100000, 5);
    
    // Adjust based on strategy impact target
    const impactAmount = (strategy.targetImpact / 100) * token.liquidity;
    
    // Use the smaller of the amounts to avoid over-trading
    return Math.min(baseAmount * volumeMultiplier, impactAmount);
  }

  // Execute the actual trade
  private async executeTrade(trade: VolumeTrade, strategy: VolumeStrategy): Promise<string> {
    // This would integrate with Jupiter/Raydium for actual DEX trades
    // For now, create a mock transaction
    
    const transaction = new Transaction();
    
    // Add swap instruction (mock)
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: this.wallet.publicKey,
        toPubkey: new PublicKey(trade.tokenAddress),
        lamports: LAMPORTS_PER_SOL * trade.amount,
      })
    );

    const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = this.wallet.publicKey;

    const signature = await this.connection.sendRawTransaction(
      transaction.serialize(),
      {
        skipPreflight: true,
        maxRetries: 3,
      }
    );

    return signature;
  }

  // Get current volume data
  getVolumeData(): MarketVolume[] {
    return Array.from(this.volumeData.values());
  }

  // Get trade history
  getTrades(): VolumeTrade[] {
    return Array.from(this.trades.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Get strategies
  getStrategies(): VolumeStrategy[] {
    return Array.from(this.strategies.values());
  }

  // Update strategy
  updateStrategy(name: string, updates: Partial<VolumeStrategy>) {
    const strategy = this.strategies.get(name);
    if (strategy) {
      Object.assign(strategy, updates);
      this.strategies.set(name, strategy);
      console.log(`✅ Updated strategy: ${name}`);
    }
  }

  // Get performance metrics
  getPerformanceMetrics() {
    const trades = this.getTrades();
    const successful = trades.filter(t => t.status === 'confirmed');
    const buys = successful.filter(t => t.type === 'buy');
    const sells = successful.filter(t => t.type === 'sell');

    return {
      totalTrades: trades.length,
      successfulTrades: successful.length,
      successRate: (successful.length / trades.length) * 100,
      totalVolume: successful.reduce((sum, t) => sum + t.volume, 0),
      averageImpact: successful.reduce((sum, t) => sum + t.impact, 0) / successful.length,
      buyCount: buys.length,
      sellCount: sells.length,
      lastTrade: trades[0]?.timestamp || null
    };
  }
}

export default VolumeTrader;
