import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { BN } from '@coral-xyz/anchor';
import { API_ENDPOINTS } from '../config/api-endpoints';

export interface PumpFunToken {
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
  description?: string;
  twitter?: string;
  telegram?: string;
  website?: string;
}

export interface SnipeTarget {
  token: PumpFunToken;
  priority: number;
  reason: string;
  estimatedGas: number;
  minBuyAmount: number;
}

export class PumpFunScanner {
  private connection: Connection;
  private wallet: Keypair;
  private scanInterval: NodeJS.Timeout | null = null;
  private tokens: Map<string, PumpFunToken> = new Map();
  private callbacks: ((tokens: PumpFunToken[]) => void)[] = [];

  constructor(rpcUrl: string, wallet: Keypair) {
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.wallet = wallet;
  }

  // Start scanning pump.fun market
  async startScanning(callback?: (tokens: PumpFunToken[]) => void) {
    if (callback) {
      this.callbacks.push(callback);
    }

    // Initial scan
    await this.scanMarket();
    
    // Set up continuous scanning
    this.scanInterval = setInterval(async () => {
      await this.scanMarket();
    }, 5000); // Scan every 5 seconds
  }

  // Stop scanning
  stopScanning() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
  }

  // Scan pump.fun market for new tokens
  private async scanMarket() {
    try {
      // This would integrate with pump.fun API or monitor on-chain events
      // For now, we'll simulate with mock data that updates
      const newTokens = await this.fetchPumpFunTokens();
      
      // Process and store tokens
      this.tokens.clear();
      newTokens.forEach((token: PumpFunToken) => {
        this.tokens.set(token.address, token);
      });

      // Notify callbacks
      this.callbacks.forEach(callback => {
        callback(Array.from(this.tokens.values()));
      });

    } catch (error) {
      console.error('Error scanning pump.fun market:', error);
    }
  }

  // Fetch pump.fun tokens from API
  private async fetchPumpFunTokens(): Promise<PumpFunToken[]> {
    try {
      const response = await fetch(API_ENDPOINTS.PUMPFUN.API + '/tokens', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SolanaBot/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return this.formatPumpFunData(data);
    } catch (error) {
      console.error('Error fetching pump.fun tokens:', error);
      return [];
    }
  }

  // Format pump.fun API data
  private formatPumpFunData = (rawData: any): PumpFunToken[] => {
    if (!rawData || !Array.isArray(rawData)) {
      return [];
    }

    return rawData.map((token: any) => ({
      address: token.address || token.mint || '',
      name: token.name || 'Unknown',
      symbol: token.symbol || 'UNK',
      creator: token.creator || '',
      price: parseFloat(token.price || '0'),
      marketCap: parseFloat(token.marketCap || '0'),
      volume24h: parseFloat(token.volume24h || '0'),
      liquidity: parseFloat(token.liquidity || '0'),
      holders: parseInt(token.holders || '0'),
      createdAt: new Date(token.createdAt || Date.now()),
      bondingCurve: parseFloat(token.bondingCurve || '0'),
      description: token.description,
      twitter: token.twitter,
      telegram: token.telegram,
      website: token.website
    }));
  };

  // Fetch backup data
  private async fetchBackupData(): Promise<PumpFunToken[]> {
    try {
      const response = await fetch(API_ENDPOINTS.PUMPFUN.BACKUP + '/tokens', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SolanaBot/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return this.formatPumpFunData(data);
    } catch (error) {
      console.error('Error fetching backup data:', error);
      return [];
    }
  }

  // Enrich tokens with additional data from DexScreener
  private async enrichWithDexScreenerData(tokens: PumpFunToken[]): Promise<void> {
    for (const token of tokens) {
      const response = await fetch(`${API_ENDPOINTS.MARKET_DATA.DEXSCREENER}/${token.address}`);
      const data = await response.json();
      token.liquidity = data.liquidity;
      token.volume24h = data.volume24h;
    }
  }

  // Analyze tokens for sniping opportunities
  private analyzeToken(token: PumpFunToken): SnipeTarget | null {
    let priority = 0;
    let reason = '';
    let estimatedGas = 0.000005; // Base gas estimate
    let minBuyAmount = 0.01;

    // Check for new tokens (high priority)
    const tokenAge = Date.now() - token.createdAt.getTime();
    if (tokenAge < 300000) { // Less than 5 minutes old
      priority += 50;
      reason += 'New token launch; ';
      minBuyAmount = 0.005;
    }

    // Check liquidity (medium priority)
    if (token.liquidity < 100000) {
      priority += 20;
      reason += 'Low liquidity potential; ';
    }

    // Check volume spike (high priority)
    if (token.volume24h > token.marketCap * 0.5) {
      priority += 30;
      reason += 'High volume spike; ';
    }

    // Check bonding curve progress
    if (token.bondingCurve > 80 && token.bondingCurve < 95) {
      priority += 25;
      reason += 'Near Raydium launch; ';
      estimatedGas = 0.000008;
    }

    // Check social signals
    if (token.twitter && token.telegram) {
      priority += 15;
      reason += 'Strong social presence; ';
    }

    // Only include tokens with decent priority
    if (priority >= 30) {
      return {
        token,
        priority,
        reason: reason.trim(),
        estimatedGas,
        minBuyAmount
      };
    }

    return null;
  }

  // Get snipe targets
  getSnipeTargets(): SnipeTarget[] {
    const targets: SnipeTarget[] = [];
    
    for (const token of this.tokens.values()) {
      const target = this.analyzeToken(token);
      if (target && target.priority >= 70) {
        targets.push(target);
      }
    }
    
    return targets.sort((a, b) => b.priority - a.priority).slice(0, 10);
  }

  // Execute snipe transaction with gas optimization
  async executeSnipe(token: PumpFunToken, amount: number): Promise<string> {
    try {
      // Create optimized transaction for minimal gas
      const transaction = new Transaction();

      // Calculate optimal compute units and priority fee
      const computeUnits = 200000; // Minimum required
      const priorityFee = await this.getOptimalPriorityFee();

      // Add priority fee instruction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: this.wallet.publicKey,
          toPubkey: new PublicKey(token.address),
          lamports: LAMPORTS_PER_SOL * amount,
        })
      );

      // Set recent blockhash for optimal timing
      const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.wallet.publicKey;

      // Sign and send transaction
      const signature = await this.connection.sendRawTransaction(
        transaction.serialize({ requireAllSignatures: false }),
        {
          skipPreflight: true, // Skip preflight for speed
          maxRetries: 3,
        }
      );

      return signature;
    } catch (error) {
      console.error('Error executing snipe:', error);
      throw error;
    }
  }

  // Get optimal priority fee for current network conditions
  private async getOptimalPriorityFee(): Promise<number> {
    try {
      const fees = await this.connection.getRecentPrioritizationFees();
      const medianFee = fees.sort((a, b) => a.prioritizationFee - b.prioritizationFee)[Math.floor(fees.length / 2)];
      return medianFee.prioritizationFee || 1000; // Default to 1000 lamports
    } catch (error) {
      return 1000; // Fallback
    }
  }

  // Get detailed token information
  async getTokenInfo(address: string): Promise<PumpFunToken | null> {
    return this.tokens.get(address) || null;
  }

  // Get current tokens
  getCurrentTokens(): PumpFunToken[] {
    return Array.from(this.tokens.values());
  }
}
