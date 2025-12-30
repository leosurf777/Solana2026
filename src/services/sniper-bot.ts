import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL, AccountInfo } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { API_ENDPOINTS } from '../config/api-endpoints.js';

export interface SniperTarget {
  tokenAddress: string;
  symbol: string;
  creator: string;
  price: number;
  liquidity: number;
  marketCap: number;
  priority: number;
  reason: string;
  estimatedGas: number;
  minBuyAmount: number;
  maxBuyAmount: number;
  slippage: number;
  createdAt: Date;
}

export interface SniperConfig {
  enabled: boolean;
  maxGasPrice: number; // in lamports
  minLiquidity: number;
  maxSlippage: number;
  buyAmount: number;
  sellTarget: number; // percentage gain
  stopLoss: number; // percentage loss
  maxPositions: number;
  cooldownMs: number;
  priorityFeeMultiplier: number;
}

export interface SniperPosition {
  id: string;
  tokenAddress: string;
  symbol: string;
  buyAmount: number;
  buyPrice: number;
  currentPrice: number;
  buySignature: string;
  sellSignature?: string;
  status: 'buying' | 'bought' | 'selling' | 'sold' | 'failed';
  pnl?: number;
  pnlPercentage?: number;
  createdAt: Date;
  soldAt?: Date;
}

export interface TradeSignal {
  type: 'new_token' | 'liquidity_add' | 'volume_spike' | 'price_breakout';
  tokenAddress: string;
  symbol: string;
  strength: number;
  confidence: number;
  data: any;
  timestamp: Date;
}

export class SniperBot {
  private connection: Connection;
  private wallet: Keypair;
  private config: SniperConfig;
  private targets: SniperTarget[] = [];
  private positions: Map<string, SniperPosition> = new Map();
  private signals: TradeSignal[] = [];
  private isRunning = false;
  private monitorInterval: NodeJS.Timeout | null = null;
  private positionCheckInterval: NodeJS.Timeout | null = null;

  constructor(connection: Connection, wallet: Keypair, config?: Partial<SniperConfig>) {
    this.connection = connection;
    this.wallet = wallet;
    this.config = {
      enabled: true,
      maxGasPrice: 10000000, // 0.01 SOL
      minLiquidity: 10000,
      maxSlippage: 3.0,
      buyAmount: 0.1,
      sellTarget: 50, // 50% profit
      stopLoss: 20, // 20% loss
      maxPositions: 5,
      cooldownMs: 5000,
      priorityFeeMultiplier: 2.0,
      ...config
    };
  }

  // Start the sniper bot
  async startSniping() {
    if (this.isRunning) {
      console.log('⚠️ Sniper bot is already running');
      return;
    }

    this.isRunning = true;
    console.log('🎯 Starting sniper bot...');

    // Start monitoring for new targets
    this.monitorInterval = setInterval(async () => {
      await this.scanForTargets();
    }, 2000); // Scan every 2 seconds

    // Start monitoring positions
    this.positionCheckInterval = setInterval(async () => {
      await this.monitorPositions();
    }, 3000); // Check every 3 seconds

    // Initial scan
    await this.scanForTargets();
  }

  // Stop the sniper bot
  stopSniping() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    if (this.positionCheckInterval) {
      clearInterval(this.positionCheckInterval);
      this.positionCheckInterval = null;
    }
    this.isRunning = false;
    console.log('⏹️ Sniper bot stopped');
  }

  // Scan for new sniping targets
  private async scanForTargets() {
    try {
      // Method 1: Monitor new token launches
      const newTokens = await this.scanNewTokens();
      
      // Method 2: Monitor liquidity additions
      const liquidityEvents = await this.scanLiquidityEvents();
      
      // Method 3: Monitor volume spikes
      const volumeSpikes = await this.scanVolumeSpikes();

      // Process all signals
      const allSignals = [...newTokens, ...liquidityEvents, ...volumeSpikes];
      
      for (const signal of allSignals) {
        await this.processSignal(signal);
      }

    } catch (error) {
      console.error('❌ Error scanning for targets:', error);
    }
  }

  // Scan for new tokens
  private async scanNewTokens(): Promise<TradeSignal[]> {
    try {
      const response = await fetch(`${API_ENDPOINTS.PUMPFUN.API}/tokens/new`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SolanaBot/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const signals: TradeSignal[] = [];

      for (const token of data.slice(0, 5)) { // Top 5 newest
        const signal: TradeSignal = {
          type: 'new_token',
          tokenAddress: token.address || token.mint,
          symbol: token.symbol || 'UNK',
          strength: this.calculateNewTokenStrength(token),
          confidence: this.calculateConfidence(token),
          data: token,
          timestamp: new Date()
        };

        signals.push(signal);
      }

      return signals;
    } catch (error) {
      console.error('❌ Error scanning new tokens:', error);
      return [];
    }
  }

  // Scan for liquidity events
  private async scanLiquidityEvents(): Promise<TradeSignal[]> {
    try {
      // This would monitor on-chain liquidity events
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('❌ Error scanning liquidity events:', error);
      return [];
    }
  }

  // Scan for volume spikes
  private async scanVolumeSpikes(): Promise<TradeSignal[]> {
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
      const signals: TradeSignal[] = [];

      for (const pair of data.pairs) {
        const volume1h = parseFloat(pair.volume?.h1 || 0);
        const volume24h = parseFloat(pair.volume?.h24 || 0);
        const avgHourlyVolume = volume24h / 24;
        
        // Check for volume spike (3x average)
        if (volume1h > avgHourlyVolume * 3) {
          const signal: TradeSignal = {
            type: 'volume_spike',
            tokenAddress: pair.baseToken?.address || '',
            symbol: pair.baseToken?.symbol || '',
            strength: volume1h / avgHourlyVolume,
            confidence: 0.8,
            data: pair,
            timestamp: new Date()
          };

          signals.push(signal);
        }
      }

      return signals;
    } catch (error) {
      console.error('❌ Error scanning volume spikes:', error);
      return [];
    }
  }

  // Process trading signal
  private async processSignal(signal: TradeSignal) {
    try {
      // Check if we already have this token
      const existingTarget = this.targets.find(t => t.tokenAddress === signal.tokenAddress);
      if (existingTarget) {
        return;
      }

      // Check if we already have a position
      const existingPosition = this.positions.get(signal.tokenAddress);
      if (existingPosition) {
        return;
      }

      // Evaluate if signal meets criteria
      const target = await this.evaluateSignal(signal);
      if (target && target.priority >= 70) {
        this.targets.push(target);
        this.targets.sort((a, b) => b.priority - a.priority);
        
        // Keep only top 20 targets
        if (this.targets.length > 20) {
          this.targets = this.targets.slice(0, 20);
        }

        console.log(`🎯 New sniper target: ${target.symbol} (Priority: ${target.priority})`);
        
        // Execute snipe if conditions are met
        if (this.shouldExecuteSnipe(target)) {
          await this.executeSnipe(target);
        }
      }

    } catch (error) {
      console.error(`❌ Error processing signal for ${signal.symbol}:`, error);
    }
  }

  // Evaluate signal and create target
  private async evaluateSignal(signal: TradeSignal): Promise<SniperTarget | null> {
    try {
      // Get token data
      const tokenData = await this.getTokenData(signal.tokenAddress);
      
      let priority = 0;
      let reason = '';

      // Signal strength
      priority += signal.strength * 10;
      reason += `Signal strength: ${signal.strength.toFixed(2)}; `;

      // Liquidity check
      if (tokenData.liquidity >= this.config.minLiquidity) {
        priority += 20;
        reason += 'Sufficient liquidity; ';
      }

      // Market cap check
      if (tokenData.marketCap < 1000000) { // Less than $1M
        priority += 15;
        reason += 'Low market cap potential; ';
      }

      // Social signals
      if (tokenData.twitter && tokenData.telegram) {
        priority += 10;
        reason += 'Social presence; ';
      }

      // Volume check
      if (tokenData.volume24h > tokenData.liquidity * 0.5) {
        priority += 15;
        reason += 'Good volume; ';
      }

      // Creator reputation (simplified)
      if (this.isReputableCreator(tokenData.creator)) {
        priority += 10;
        reason += 'Reputable creator; ';
      }

      const target: SniperTarget = {
        tokenAddress: signal.tokenAddress,
        symbol: signal.symbol,
        creator: tokenData.creator,
        price: tokenData.price,
        liquidity: tokenData.liquidity,
        marketCap: tokenData.marketCap,
        priority: Math.min(priority, 100),
        reason: reason.trim(),
        estimatedGas: this.estimateGasCost(),
        minBuyAmount: this.config.buyAmount * 0.5,
        maxBuyAmount: this.config.buyAmount * 2,
        slippage: this.config.maxSlippage,
        createdAt: new Date()
      };

      return target;

    } catch (error) {
      console.error(`❌ Error evaluating signal:`, error);
      return null;
    }
  }

  // Get token data from multiple sources
  private async getTokenData(tokenAddress: string) {
    try {
      // Try DexScreener first
      const response = await fetch(`${API_ENDPOINTS.MARKET_DATA.DEXSCREENER}/search?q=${tokenAddress}`);
      const data = await response.json();
      
      if (data.pairs && data.pairs.length > 0) {
        const pair = data.pairs[0];
        return {
          creator: pair.baseToken?.address || '',
          price: parseFloat(pair.priceUsd || '0'),
          liquidity: parseFloat(pair.liquidity?.usd || '0'),
          marketCap: parseFloat(pair.fdv || '0'),
          volume24h: parseFloat(pair.volume?.h24 || '0'),
          twitter: pair.info?.socials?.twitter,
          telegram: pair.info?.socials?.telegram
        };
      }
    } catch (error) {
      console.error('❌ Error fetching token data:', error);
    }

    // Fallback data
    return {
      creator: '',
      price: 0,
      liquidity: 0,
      marketCap: 0,
      volume24h: 0,
      twitter: null,
      telegram: null
    };
  }

  // Calculate new token strength
  private calculateNewTokenStrength(token: any): number {
    let strength = 50; // Base strength for new tokens

    // Liquidity bonus
    if (token.liquidity > 10000) strength += 20;
    if (token.liquidity > 50000) strength += 10;

    // Volume bonus
    if (token.volume24h > token.liquidity) strength += 15;

    // Social bonus
    if (token.twitter && token.telegram) strength += 10;

    return Math.min(strength, 100);
  }

  // Calculate signal confidence
  private calculateConfidence(token: any): number {
    let confidence = 0.5; // Base confidence

    // Multiple data sources increase confidence
    if (token.liquidity && token.volume24h && token.marketCap) {
      confidence += 0.2;
    }

    // Social verification
    if (token.twitter || token.telegram) {
      confidence += 0.1;
    }

    // Reasonable metrics
    if (token.marketCap > 1000 && token.marketCap < 10000000) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  // Check if creator is reputable
  private isReputableCreator(creator: string): boolean {
    // This would check against a database of known creators
    // For now, return true (no filtering)
    return true;
  }

  // Estimate gas cost
  private estimateGasCost(): number {
    return 0.000005; // 5000 lamports base
  }

  // Determine if should execute snipe
  private shouldExecuteSnipe(target: SniperTarget): boolean {
    // Check if we have max positions
    if (this.positions.size >= this.config.maxPositions) {
      return false;
    }

    // Check priority threshold
    if (target.priority < 80) {
      return false;
    }

    // Check cooldown
    const lastTrade = Array.from(this.positions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    
    if (lastTrade) {
      const timeSinceLastTrade = Date.now() - lastTrade.createdAt.getTime();
      if (timeSinceLastTrade < this.config.cooldownMs) {
        return false;
      }
    }

    return true;
  }

  // Execute snipe transaction
  private async executeSnipe(target: SniperTarget): Promise<void> {
    try {
      console.log(`🚀 Executing snipe for ${target.symbol}...`);

      const buyAmount = Math.min(target.maxBuyAmount, this.config.buyAmount);
      
      const position: SniperPosition = {
        id: Date.now().toString(),
        tokenAddress: target.tokenAddress,
        symbol: target.symbol,
        buyAmount,
        buyPrice: target.price,
        currentPrice: target.price,
        buySignature: '',
        status: 'buying',
        createdAt: new Date()
      };

      this.positions.set(target.tokenAddress, position);

      // Execute buy transaction
      const signature = await this.executeBuy(target, buyAmount);
      position.buySignature = signature;
      position.status = 'bought';

      console.log(`✅ Snipe executed: ${target.symbol} (${signature})`);

    } catch (error) {
      console.error(`❌ Snipe failed for ${target.symbol}:`, error);
      
      // Update position status
      const position = this.positions.get(target.tokenAddress);
      if (position) {
        position.status = 'failed';
      }
    }
  }

  // Execute buy transaction
  private async executeBuy(target: SniperTarget, amount: number): Promise<string> {
    const transaction = new Transaction();

    // Calculate optimal priority fee
    const priorityFee = await this.getOptimalPriorityFee();
    
    // Add swap instruction (mock)
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: this.wallet.publicKey,
        toPubkey: new PublicKey(target.tokenAddress),
        lamports: LAMPORTS_PER_SOL * amount,
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

  // Get optimal priority fee
  private async getOptimalPriorityFee(): Promise<number> {
    try {
      const fees = await this.connection.getRecentPrioritizationFees();
      const medianFee = fees.sort((a, b) => a.prioritizationFee - b.prioritizationFee)[Math.floor(fees.length / 2)];
      return medianFee.prioritizationFee || 1000;
    } catch (error) {
      return 1000;
    }
  }

  // Monitor existing positions
  private async monitorPositions() {
    try {
      for (const [tokenAddress, position] of this.positions) {
        if (position.status === 'bought') {
          await this.checkPosition(position);
        }
      }
    } catch (error) {
      console.error('❌ Error monitoring positions:', error);
    }
  }

  // Check individual position
  private async checkPosition(position: SniperPosition) {
    try {
      // Get current price
      const currentPrice = await this.getCurrentPrice(position.tokenAddress);
      position.currentPrice = currentPrice;

      // Calculate PnL
      const pnl = (currentPrice - position.buyPrice) * position.buyAmount;
      const pnlPercentage = ((currentPrice - position.buyPrice) / position.buyPrice) * 100;
      
      position.pnl = pnl;
      position.pnlPercentage = pnlPercentage;

      // Check sell conditions
      if (pnlPercentage >= this.config.sellTarget) {
        await this.executeSell(position, 'profit');
      } else if (pnlPercentage <= -this.config.stopLoss) {
        await this.executeSell(position, 'stop_loss');
      }

    } catch (error) {
      console.error(`❌ Error checking position ${position.symbol}:`, error);
    }
  }

  // Get current price
  private async getCurrentPrice(tokenAddress: string): Promise<number> {
    try {
      const response = await fetch(`${API_ENDPOINTS.MARKET_DATA.DEXSCREENER}/search?q=${tokenAddress}`);
      const data = await response.json();
      
      if (data.pairs && data.pairs.length > 0) {
        return parseFloat(data.pairs[0].priceUsd || '0');
      }
    } catch (error) {
      console.error('❌ Error getting current price:', error);
    }

    return 0;
  }

  // Execute sell
  private async executeSell(position: SniperPosition, reason: string): Promise<void> {
    try {
      console.log(`💰 Selling ${position.symbol} (${reason}): ${position.pnlPercentage?.toFixed(2)}%`);

      position.status = 'selling';

      // Execute sell transaction (mock)
      const signature = await this.executeSellTransaction(position);
      position.sellSignature = signature;
      position.status = 'sold';
      position.soldAt = new Date();

      console.log(`✅ Sold ${position.symbol} (${signature})`);

    } catch (error) {
      console.error(`❌ Sell failed for ${position.symbol}:`, error);
      position.status = 'bought'; // Reset to bought status
    }
  }

  // Execute sell transaction
  private async executeSellTransaction(position: SniperPosition): Promise<string> {
    const transaction = new Transaction();
    
    // Add sell instruction (mock)
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: this.wallet.publicKey,
        toPubkey: new PublicKey(position.tokenAddress),
        lamports: LAMPORTS_PER_SOL * position.buyAmount,
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

  // Getters
  getTargets(): SniperTarget[] {
    return this.targets;
  }

  getPositions(): SniperPosition[] {
    return Array.from(this.positions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getConfig(): SniperConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<SniperConfig>) {
    Object.assign(this.config, updates);
    console.log('✅ Sniper config updated');
  }

  getPerformanceMetrics() {
    const positions = this.getPositions();
    const sold = positions.filter(p => p.status === 'sold');
    const profits = sold.filter(p => (p.pnlPercentage || 0) > 0);
    const losses = sold.filter(p => (p.pnlPercentage || 0) < 0);

    return {
      totalTrades: sold.length,
      profitableTrades: profits.length,
      losingTrades: losses.length,
      winRate: sold.length > 0 ? (profits.length / sold.length) * 100 : 0,
      totalPnL: sold.reduce((sum, p) => sum + (p.pnl || 0), 0),
      averageWin: profits.length > 0 ? profits.reduce((sum, p) => sum + (p.pnlPercentage || 0), 0) / profits.length : 0,
      averageLoss: losses.length > 0 ? losses.reduce((sum, p) => sum + (p.pnlPercentage || 0), 0) / losses.length : 0,
      bestTrade: profits.length > 0 ? Math.max(...profits.map(p => p.pnlPercentage || 0)) : 0,
      worstTrade: losses.length > 0 ? Math.min(...losses.map(p => p.pnlPercentage || 0)) : 0
    };
  }
}

export default SniperBot;
