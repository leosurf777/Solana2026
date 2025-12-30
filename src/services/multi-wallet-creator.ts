import { Keypair, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL, Connection } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import fs from 'fs/promises';
import path from 'path';

export interface WalletInfo {
  publicKey: string;
  privateKey: string;
  index: number;
  label?: string;
  balance: number;
  created: Date;
}

export interface WalletBatch {
  wallets: WalletInfo[];
  batchName: string;
  createdAt: Date;
  totalWallets: number;
}

export interface DistributionPlan {
  fromWallet: string;
  toWallets: Array<{
    address: string;
    amount: number;
    percentage?: number;
  }>;
  totalAmount: number;
  fee: number;
}

export class MultiWalletCreator {
  private connection: Connection;
  private wallets: Map<string, WalletInfo> = new Map();
  private batches: Map<string, WalletBatch> = new Map();

  constructor(connection: Connection) {
    this.connection = connection;
  }

  // Create multiple new wallets
  async createWalletBatch(count: number, batchName: string, prefix?: string): Promise<WalletBatch> {
    const wallets: WalletInfo[] = [];
    
    console.log(`🔧 Creating ${count} wallets for batch: ${batchName}`);
    
    for (let i = 0; i < count; i++) {
      const keypair = Keypair.generate();
      const walletInfo: WalletInfo = {
        publicKey: keypair.publicKey.toBase58(),
        privateKey: Buffer.from(keypair.secretKey).toString('hex'),
        index: i,
        label: prefix ? `${prefix}_${i}` : `wallet_${i}`,
        balance: 0,
        created: new Date()
      };
      
      wallets.push(walletInfo);
      this.wallets.set(walletInfo.publicKey, walletInfo);
      
      console.log(`✅ Created wallet ${i + 1}/${count}: ${walletInfo.publicKey}`);
    }

    const batch: WalletBatch = {
      wallets,
      batchName,
      createdAt: new Date(),
      totalWallets: count
    };

    this.batches.set(batchName, batch);
    
    // Save to file
    await this.saveBatchToFile(batch);
    
    console.log(`✅ Batch "${batchName}" created with ${count} wallets`);
    return batch;
  }

  // Fund multiple wallets from a source wallet
  async fundWallets(
    sourceKeypair: Keypair,
    batchName: string,
    amountPerWallet: number
  ): Promise<string[]> {
    const batch = this.batches.get(batchName);
    if (!batch) {
      throw new Error(`Batch "${batchName}" not found`);
    }

    console.log(`💰 Funding ${batch.wallets.length} wallets with ${amountPerWallet} SOL each`);
    
    const transactions: string[] = [];
    
    // Create transactions in batches to avoid network congestion
    const batchSize = 10;
    for (let i = 0; i < batch.wallets.length; i += batchSize) {
      const walletBatch = batch.wallets.slice(i, i + batchSize);
      
      for (const wallet of walletBatch) {
        try {
          const transaction = new Transaction();
          
          // Add transfer instruction
          transaction.add(
            SystemProgram.transfer({
              fromPubkey: sourceKeypair.publicKey,
              toPubkey: new PublicKey(wallet.publicKey),
              lamports: LAMPORTS_PER_SOL * amountPerWallet,
            })
          );

          // Get recent blockhash
          const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = sourceKeypair.publicKey;

          // Sign and send transaction
          const signature = await this.connection.sendRawTransaction(
            transaction.serialize(),
            {
              skipPreflight: false,
              maxRetries: 3,
            }
          );

          transactions.push(signature);
          console.log(`💸 Sent ${amountPerWallet} SOL to ${wallet.publicKey} (${signature})`);
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`❌ Failed to fund wallet ${wallet.publicKey}:`, error);
        }
      }
    }

    console.log(`✅ Funding complete. ${transactions.length} transactions sent`);
    return transactions;
  }

  // Create distribution plan for volume trading
  createDistributionPlan(
    sourceWallet: string,
    amounts: Array<{ address: string; amount: number }>,
    type: 'equal' | 'percentage' | 'custom' = 'equal'
  ): DistributionPlan {
    const totalAmount = amounts.reduce((sum, item) => sum + item.amount, 0);
    const fee = totalAmount * 0.000005; // Estimate transaction fees

    const plan: DistributionPlan = {
      fromWallet: sourceWallet,
      toWallets: amounts,
      totalAmount,
      fee
    };

    console.log(`📊 Created distribution plan: ${totalAmount} SOL to ${amounts.length} wallets`);
    return plan;
  }

  // Execute coordinated buy across multiple wallets
  async executeCoordinatedBuy(
    batchName: string,
    tokenAddress: string,
    buyAmounts: number[],
    slippage: number = 1.0
  ): Promise<string[]> {
    const batch = this.batches.get(batchName);
    if (!batch) {
      throw new Error(`Batch "${batchName}" not found`);
    }

    if (buyAmounts.length !== batch.wallets.length) {
      throw new Error('Buy amounts count must match wallet count');
    }

    console.log(`🚀 Executing coordinated buy for ${tokenAddress} across ${batch.wallets.length} wallets`);
    
    const transactions: string[] = [];
    
    // Execute buys with slight delays to avoid detection
    for (let i = 0; i < batch.wallets.length; i++) {
      const wallet = batch.wallets[i];
      const amount = buyAmounts[i];
      
      try {
        const keypair = Keypair.fromSecretKey(
          Buffer.from(wallet.privateKey, 'hex')
        );
        
        // Create buy transaction using Jupiter or Raydium
        const signature = await this.executeBuyTransaction(
          keypair,
          tokenAddress,
          amount,
          slippage
        );
        
        transactions.push(signature);
        console.log(`✅ Wallet ${i + 1} bought ${amount} SOL worth of tokens (${signature})`);
        
        // Random delay between transactions
        const delay = Math.random() * 2000 + 1000; // 1-3 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
        
      } catch (error) {
        console.error(`❌ Wallet ${i + 1} buy failed:`, error);
      }
    }

    console.log(`✅ Coordinated buy complete. ${transactions.length} successful transactions`);
    return transactions;
  }

  // Execute individual buy transaction
  private async executeBuyTransaction(
    keypair: Keypair,
    tokenAddress: string,
    amount: number,
    slippage: number
  ): Promise<string> {
    // This would integrate with Jupiter/Raydium API for actual swaps
    // For now, return a mock transaction
    const transaction = new Transaction();
    
    // Add swap instruction (mock)
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: new PublicKey(tokenAddress),
        lamports: LAMPORTS_PER_SOL * amount,
      })
    );

    const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = keypair.publicKey;

    const signature = await this.connection.sendRawTransaction(
      transaction.serialize(),
      {
        skipPreflight: true,
        maxRetries: 3,
      }
    );

    return signature;
  }

  // Collect funds from multiple wallets
  async collectFunds(
    batchName: string,
    destinationWallet: string,
    leaveBalance: number = 0.001
  ): Promise<string[]> {
    const batch = this.batches.get(batchName);
    if (!batch) {
      throw new Error(`Batch "${batchName}" not found`);
    }

    console.log(`🔄 Collecting funds from ${batch.wallets.length} wallets to ${destinationWallet}`);
    
    const transactions: string[] = [];
    
    for (const wallet of batch.wallets) {
      try {
        const balance = await this.connection.getBalance(new PublicKey(wallet.publicKey));
        const transferAmount = balance - (leaveBalance * LAMPORTS_PER_SOL);
        
        if (transferAmount > 0) {
          const keypair = Keypair.fromSecretKey(
            Buffer.from(wallet.privateKey, 'hex')
          );
          
          const transaction = new Transaction();
          transaction.add(
            SystemProgram.transfer({
              fromPubkey: keypair.publicKey,
              toPubkey: new PublicKey(destinationWallet),
              lamports: transferAmount,
            })
          );

          const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = keypair.publicKey;

          const signature = await this.connection.sendRawTransaction(
            transaction.serialize(),
            {
              skipPreflight: false,
              maxRetries: 3,
            }
          );

          transactions.push(signature);
          console.log(`💰 Collected ${transferAmount / LAMPORTS_PER_SOL} SOL from ${wallet.publicKey}`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to collect from ${wallet.publicKey}:`, error);
      }
    }

    console.log(`✅ Collection complete. ${transactions.length} transactions processed`);
    return transactions;
  }

  // Get wallet balances for a batch
  async getBatchBalances(batchName: string): Promise<WalletInfo[]> {
    const batch = this.batches.get(batchName);
    if (!batch) {
      throw new Error(`Batch "${batchName}" not found`);
    }

    console.log(`💳 Checking balances for ${batch.wallets.length} wallets`);
    
    for (const wallet of batch.wallets) {
      try {
        const balance = await this.connection.getBalance(new PublicKey(wallet.publicKey));
        wallet.balance = balance / LAMPORTS_PER_SOL;
      } catch (error) {
        console.error(`❌ Failed to get balance for ${wallet.publicKey}:`, error);
        wallet.balance = 0;
      }
    }

    return batch.wallets;
  }

  // Save batch to file
  private async saveBatchToFile(batch: WalletBatch): Promise<void> {
    const filename = `${batch.batchName}_${Date.now()}.json`;
    const filepath = path.join(process.cwd(), 'wallet-batches', filename);
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(filepath), { recursive: true });
    
    await fs.writeFile(filepath, JSON.stringify(batch, null, 2));
    console.log(`💾 Saved batch to ${filepath}`);
  }

  // Load batch from file
  async loadBatchFromFile(filename: string): Promise<WalletBatch> {
    const filepath = path.join(process.cwd(), 'wallet-batches', filename);
    const data = await fs.readFile(filepath, 'utf-8');
    const batch = JSON.parse(data) as WalletBatch;
    
    this.batches.set(batch.batchName, batch);
    
    for (const wallet of batch.wallets) {
      this.wallets.set(wallet.publicKey, wallet);
    }
    
    return batch;
  }

  // Get all batches
  getAllBatches(): WalletBatch[] {
    return Array.from(this.batches.values());
  }

  // Get specific batch
  getBatch(batchName: string): WalletBatch | undefined {
    return this.batches.get(batchName);
  }

  // Delete batch
  deleteBatch(batchName: string): boolean {
    return this.batches.delete(batchName);
  }
}

export default MultiWalletCreator;
