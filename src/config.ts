import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'RPC_URL',
  'PRIVATE_KEY',
  'TOKEN_MINT',
  'PUMP_PROGRAM_ID'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Configuration
export const config = {
  // Network configuration
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.PRIVATE_KEY!,
  
  // Token and program addresses
  tokenMint: new PublicKey(process.env.TOKEN_MINT!),
  pumpProgramId: new PublicKey(process.env.PUMP_PROGRAM_ID!),
  
  // Trading settings
  minSolAmount: parseFloat(process.env.MIN_SOL_AMOUNT || '0.1'),
  slippage: parseFloat(process.env.SLIPPAGE || '1.0'),
  
  // Notification settings
  telegram: {
    enabled: !!process.env.TELEGRAM_BOT_TOKEN && !!process.env.TELEGRAM_CHAT_ID,
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || ''
  }
};

// Create Solana connection
export const connection = new Connection(config.rpcUrl, 'confirmed');

// Create wallet from private key
export const wallet = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(`[${config.privateKey}]`))
);

console.log(`🔑 Loaded wallet: ${wallet.publicKey.toBase58()}`);
