import { SolanaPumpBot } from './bot';
import { config } from './config';

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

// Main function
async function main() {
  console.log('🚀 Starting Solana Pump.fun Bundle Bot...');
  
  try {
    const bot = new SolanaPumpBot();
    await bot.start();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Start the bot
main().catch(console.error);
