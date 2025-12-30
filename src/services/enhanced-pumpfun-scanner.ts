import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { BN } from '@coral-xyz/anchor';
import { API_ENDPOINTS } from '../config/api-endpoints.js';

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

export class EnhancedPumpFunScanner {
  private connection: Connection;
  private wallet: Keypair;
  private scanInterval: NodeJS.Timeout | null = null;
  private tokens: Map<string, PumpFunToken> = new Map();
  private callbacks: ((tokens: PumpFunToken[]) => void)[] = [];
  private snipeTargets: SnipeTarget[] = [];

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
      console.log('⏹️ Pump.fun scanner stopped');
    }
  }

  // Scan pump.fun market using multiple APIs
  private async scanMarket() {
    try {
      // Method 1: Official Pump.fun API
      let tokens = await this.fetchFromPumpFunAPI();
      
      // Method 2: Backup API if primary fails
      if (tokens.length === 0) {
        tokens = await this.fetchFromBackupAPI();
      }
      
      // Method 3: DexScreener for additional data
      if (tokens.length > 0) {
        await this.enrichWithDexScreenerData(tokens);
      }
      
      // Process new tokens
      for (const token of tokens) {
        if (!this.tokens.has(token.address)) {
          this.tokens.set(token.address, token);
          
          // Analyze for sniping potential
          const target = this.analyzeToken(token);
          if (target) {
            this.snipeTargets.push(target);
            this.snipeTargets.sort((a, b) => b.priority - a.priority);
            
            // Keep only top 20 targets
            if (this.snipeTargets.length > 20) {
              this.snipeTargets = this.snipeTargets.slice(0, 20);
            }
          }
        }
      }
      
      // Notify callbacks
      this.notifyCallbacks(Array.from(this.tokens.values()));

    } catch (error) {
      console.error('❌ Error scanning pump.fun market:', error);
    }
  }

  // Fetch from official Pump.fun API
  private async fetchFromPumpFunAPI(): Promise<PumpFunToken[]> {
    try {
      const response = await fetch(`${API_ENDPOINTS.PUMPFUN.API}/tokens/new`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SolanaBot/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.map(this.formatTokenData);
    } catch (error) {
      console.error('❌ Pump.fun API error:', error);
      return [];
    }
  }

  // Fetch from backup API
  private async fetchFromBackupAPI(): Promise<PumpFunToken[]> {
    try {
      const response = await fetch(`${API_ENDPOINTS.PUMPFUN.BACKUP}/tokens`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SolanaBot/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.slice(0, 10).map(this.formatTokenData);
    } catch (error) {
      console.error('❌ Backup API error:', error);
      return [];
    }
  }

  // Enrich tokens with additional data from DexScreener
  private async enrichWithDexScreenerData(tokens: PumpFunToken[]): Promise<void> {
    for (const token of tokens) {
      try {
        const response = await fetch(`${API_ENDPOINTS.MARKET_DATA.DEXSCREENER}/search?q=${token.address}`);
        const data = await response.json();
        
        if (data.pairs && data.pairs.length > 0) {
          const pair = data.pairs[0];
          token.liquidity = pair.liquidity?.usd || token.liquidity;
          token.volume24h = pair.volume?.h24 || token.volume24h;
        }
      } catch (error) {
        console.error(`❌ Error enriching ${token.symbol}:`, error);
      }
    }
  }

  // Format token data from API response
  private formatTokenData = (rawData: any): PumpFunToken => ({
    address: rawData.address || rawData.mint,
    name: rawData.name || 'Unknown',
    symbol: rawData.symbol || 'UNK',
    creator: rawData.creator || '',
    price: rawData.price || 0,
    marketCap: rawData.marketCap || 0,
    liquidity: rawData.liquidity || 0,
    volume24h: rawData.volume24h || 0,
    holders: rawData.holders || 0,
    createdAt: new Date(rawData.created || rawData.createdAt),
    bondingCurve: rawData.bondingCurve || 0,
    description: rawData.description || '',
    twitter: rawData.twitter,
    telegram: rawData.telegram,
    website: rawData.website,
  });

  // Analyze token for sniping potential
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

  // Notify callbacks
  private notifyCallbacks(tokens: PumpFunToken[]) {
    this.callbacks.forEach(callback => {
      try {
        callback(tokens);
      } catch (error) {
        console.error('❌ Callback error:', error);
      }
    });
  }

  // Get detailed token information
  async getTokenInfo(address: string): Promise<PumpFunToken | null> {
    return this.tokens.get(address) || null;
  }

  // Get current tokens
  getCurrentTokens(): PumpFunToken[] {
    return Array.from(this.tokens.values());
  }

  // Get snipe targets
  getSnipeTargets(): SnipeTarget[] {
    return this.snipeTargets;
  }

  // Clear old targets
  clearOldTargets(maxAgeMinutes: number = 30) {
    const cutoff = Date.now() - (maxAgeMinutes * 60 * 1000);
    this.snipeTargets = this.snipeTargets.filter(
      target => new Date(target.token.createdAt).getTime() > cutoff
    );
  }
}

export default EnhancedPumpFunScanner;
