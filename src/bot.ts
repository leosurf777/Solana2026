import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { config, connection, wallet } from './config';
import * as anchor from '@coral-xyz/anchor';
import { telegram } from './services/telegram';

interface BuyEvent {
  buyer: string;
  amount: number; // in SOL
  signature: string;
  timestamp: number;
}

export class SolanaPumpBot {
  private isRunning = false;
  private lastProcessedSlot = 0;
  private token: Token;
  private tokenDecimals = 9; // Default token decimals, update if different
  private recentBuys: BuyEvent[] = [];
  private readonly MAX_RECENT_BUYS = 100;
  private readonly BUNDLE_COOLDOWN_MS = 10000; // 10 seconds cooldown between bundles
  private lastBundleTime = 0;

  constructor() {
    this.token = new Token(
      connection,
      config.tokenMint,
      TOKEN_PROGRAM_ID,
      wallet // payer
    );
  }

  async start() {
    if (this.isRunning) {
      console.log('Bot is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting Solana Pump.fun Bundle Bot...');
    
    try {
      // Get current slot
      const slot = await connection.getSlot();
      this.lastProcessedSlot = slot - 1; // Process from current block
      
      console.log(`👀 Monitoring for large buys on ${config.tokenMint.toBase58()}`);
      
      // Send startup notification
      await telegram.sendMessage(
        `🤖 *Bot Started*\n` +
        `• Token: ${config.tokenMint.toBase58()}\n` +
        `• Min SOL: ${config.minSolAmount} SOL\n` +
        `• Status: Monitoring for buys`
      );
      
      // Start the event loop
      this.eventLoop();
    } catch (error) {
      console.error('Error starting bot:', error);
      await telegram.notifyError(`Failed to start bot: ${error}`);
      this.isRunning = false;
    }
  }

  stop() {
    this.isRunning = false;
    console.log('🛑 Bot stopped');
  }

  private async eventLoop() {
    while (this.isRunning) {
      try {
        await this.processNewSlots();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between checks
      } catch (error) {
        console.error('Error in event loop:', error);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds on error
      }
    }
  }

  private async processNewSlots() {
    try {
      const currentSlot = await connection.getSlot();
      
      // Process in chunks to avoid timeouts
      const chunkSize = 100;
      let fromSlot = this.lastProcessedSlot + 1;
      
      while (fromSlot <= currentSlot) {
        const toSlot = Math.min(fromSlot + chunkSize - 1, currentSlot);
        
        console.log(`🔍 Processing slots ${fromSlot} to ${toSlot}`);
        
        // Get signatures for the slot range
        const signatures = await connection.getSignaturesForAddress(
          config.tokenMint,
          {
            until: toSlot.toString(),
            before: fromSlot === 0 ? undefined : (fromSlot - 1).toString(),
            limit: 1000
          }
        );

        // Process each transaction
        for (const signature of signatures) {
          await this.processTransaction(signature.signature);
        }
        
        this.lastProcessedSlot = toSlot;
        fromSlot = toSlot + 1;
      }
    } catch (error) {
      console.error('Error processing slots:', error);
      throw error;
    }
  }

  private async processTransaction(signature: string) {
    try {
      const tx = await connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });
      
      if (!tx) return;
      
      // Check if this is a buy transaction (simplified - you'll need to adjust based on pump.fun's program)
      const buyEvent = this.detectBuyEvent(tx);
      if (buyEvent) {
        console.log(`💰 Buy detected: ${buyEvent.amount} SOL from ${buyEvent.buyer}`);
        this.handleBuyEvent(buyEvent);
      }
    } catch (error) {
      console.error('Error processing transaction:', error);
    }
  }

  private detectBuyEvent(tx: any): BuyEvent | null {
    // This is a simplified version. You'll need to adjust this based on pump.fun's program structure
    // Look for transfer instructions to the pump.fun program
    
    // Example: Check if the transaction has a transfer to the pump.fun program
    const relevantInstructions = tx.transaction.message.instructions.filter((ix: any) => {
      return ix.programId.equals(config.pumpProgramId);
    });

    if (relevantInstructions.length > 0) {
      // This is where you'd parse the instruction data to extract the buyer and amount
      // For now, we'll just return a mock event
      return {
        buyer: tx.transaction.message.accountKeys[0].toString(), // Likely the buyer
        amount: 0.5, // This should be parsed from the instruction data
        signature: tx.transaction.signatures[0],
        timestamp: new Date().getTime()
      };
    }
    
    return null;
  }

  private async handleBuyEvent(event: BuyEvent) {
    // Add to recent buys
    this.recentBuys.push(event);
    
    // Keep only the most recent buys
    if (this.recentBuys.length > this.MAX_RECENT_BUYS) {
      this.recentBuys.shift();
    }

    // Check if this buy is large enough to trigger a bundle
    if (event.amount >= config.minSolAmount) {
      const message = `🚨 *Large Buy Detected*\n` +
        `• Amount: *${event.amount} SOL*\n` +
        `• Buyer: \`${event.buyer}\`\n` +
        `• [View on Solscan](https://solscan.io/tx/${event.signature})`;
      
      console.log(message);
      await telegram.sendMessage(message);
      
      // Check cooldown
      const now = Date.now();
      if (now - this.lastBundleTime < this.BUNDLE_COOLDOWN_MS) {
        const cooldownLeft = Math.ceil((this.BUNDLE_COOLDOWN_MS - (now - this.lastBundleTime)) / 1000);
        console.log(`⏳ Bundle on cooldown, ${cooldownLeft}s remaining...`);
        await telegram.sendMessage(`⏳ Bundle on cooldown, ${cooldownLeft}s remaining...`);
        return;
      }
      
      this.lastBundleTime = now;
      await this.executeBundle(event);
    }
  }

  private async executeBundle(event: BuyEvent) {
    try {
      console.log(`💸 Executing bundle for ${event.amount} SOL buy...`);
      await telegram.sendMessage(`💸 *Executing Bundle*\n` +
        `• Buy Amount: *${event.amount} SOL*\n` +
        `• Processing...`);

      // TODO: Implement bundle execution logic
      console.log(`Executing bundle for buy: ${event.amount} SOL from ${event.buyer}`);
      
      // Simulate bundle execution delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Bundle executed successfully');
      await telegram.sendMessage(`✅ *Bundle Executed Successfully*\n` +
        `• Amount: *${event.amount} SOL*\n` +
        `• [View on Solscan](https://solscan.io/tx/${event.signature})`);

      // based on pump.fun's program
      
      // Example: Add a transfer instruction (replace with actual swap logic)
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: new PublicKey(buyEvent.buyer), // Just an example - don't actually send to the buyer!
          lamports: 1000000 // 0.001 SOL
        })
      );
      
      // Sign and send the transaction
      console.log('🔄 Sending bundle transaction...');
      const signature = await connection.sendTransaction(transaction, [wallet]);
      
      console.log(`✅ Bundle transaction sent: ${signature}`);
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      console.log(`✅ Bundle confirmed in slot ${confirmation.context.slot}`);
      
      // Send notification
      await this.sendNotification(
        `✅ Bundle executed!\n` +
        `💰 Buy: ${buyEvent.amount} SOL\n` +
        `🔗 Tx: https://solscan.io/tx/${signature}`
      );
      
    } catch (error) {
      console.error('Error executing bundle:', error);
      
      await this.sendNotification(
        `❌ Bundle execution failed!\n` +
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
  
  private async sendNotification(message: string) {
    if (!config.telegram.enabled) return;
    
    try {
      const url = `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`;
      const params = new URLSearchParams({
        chat_id: config.telegram.chatId,
        text: message,
        parse_mode: 'Markdown'
      });
      
      await fetch(`${url}?${params.toString()}`);
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
    }
  }
  
  // Helper method to get SOL price (optional)
  private async getSolPrice(): Promise<number> {
    try {
      // This is a placeholder - implement your own price fetching logic
      // You might use an oracle or a price API
      return 100; // Example price in USD
    } catch (error) {
      console.error('Error getting SOL price:', error);
      return 0;
    }
  }
}
