import express, { Request, Response } from 'express';
import cors from 'cors';
import { SolanaPumpBot } from './bot.js';
import { config, connection, wallet } from './config.js';
import { EnhancedPumpFunScanner } from './services/enhanced-pumpfun-scanner.js';
import { MultiWalletCreator } from './services/multi-wallet-creator.js';
import { VolumeTrader } from './services/volume-trader.js';
import { SniperBot } from './services/sniper-bot.js';
import { apiEndpoints } from './api-server-endpoints.js';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
let bot: SolanaPumpBot;
let pumpFunScanner: EnhancedPumpFunScanner;
let multiWalletCreator: MultiWalletCreator;
let volumeTrader: VolumeTrader;
let sniperBot: SniperBot;

// Initialize all services
async function initializeServices() {
  try {
    console.log('🚀 Initializing all trading services...');
    
    // Initialize main bot
    bot = new SolanaPumpBot();
    await bot.start();
    
    // Initialize pump.fun scanner
    pumpFunScanner = new EnhancedPumpFunScanner(config.rpcUrl, wallet);
    
    // Initialize multi-wallet creator
    multiWalletCreator = new MultiWalletCreator(connection);
    
    // Initialize volume trader
    volumeTrader = new VolumeTrader(connection, wallet);
    
    // Initialize sniper bot
    sniperBot = new SniperBot(connection, wallet);
    
    console.log('✅ All services initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
  }
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    botRunning: bot ? true : false
  });
});

// Get bot status
app.get('/api/bot/status', (req: Request, res: Response) => {
  try {
    res.json({
      running: bot ? true : false,
      lastUpdate: new Date().toISOString(),
      config: {
        tokenMint: config.tokenMint.toBase58(),
        minSolAmount: config.minSolAmount,
        slippage: config.slippage
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get bot status' });
  }
});

// Get recent trades
app.get('/api/trades', (req: Request, res: Response) => {
  try {
    // Mock data for now - replace with actual bot data
    const mockTrades = [
      {
        id: '1',
        type: 'buy',
        token: 'So11111111111111111111111111111111111111112',
        amount: 0.5,
        price: 98.45,
        timestamp: new Date(Date.now() - 3600000),
        signature: '2ZE3R2Kx8QzJ7q6Y8M9X2W5V4N1P3Q6R9T2Y5U8I1O4L7A0S3D6F9G2H5J8K1M4',
        status: 'confirmed',
        profit: 2.34
      }
    ];
    res.json(mockTrades);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get trades' });
  }
});

// Execute trade
app.post('/api/trade', async (req: Request, res: Response) => {
  try {
    const { type, tokenAddress, amount } = req.body;
    
    if (!type || !tokenAddress || !amount) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Mock trade execution - replace with actual bot logic
    const trade = {
      id: Date.now().toString(),
      type,
      token: tokenAddress,
      amount,
      price: 98.45, // Mock price
      timestamp: new Date(),
      signature: 'mock_signature_' + Math.random().toString(36).substr(2, 9),
      status: 'pending'
    };

    res.json(trade);
  } catch (error) {
    res.status(500).json({ error: 'Trade execution failed' });
  }
});

// Register all new API endpoints
app.get(apiEndpoints.pumpFun.start, (req: Request, res: Response) => {
  try {
    pumpFunScanner?.startScanning();
    res.json({ success: true, message: 'Pump.fun scanner started' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start scanner' });
  }
});

app.get(apiEndpoints.pumpFun.stop, (req: Request, res: Response) => {
  try {
    pumpFunScanner?.stopScanning();
    res.json({ success: true, message: 'Pump.fun scanner stopped' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to stop scanner' });
  }
});

app.get(apiEndpoints.pumpFun.targets, (req: Request, res: Response) => {
  try {
    const targets = pumpFunScanner?.getSnipeTargets() || [];
    res.json(targets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get targets' });
  }
});

app.get(apiEndpoints.pumpFun.tokens, (req: Request, res: Response) => {
  try {
    const tokens = pumpFunScanner?.getCurrentTokens() || [];
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get tokens' });
  }
});

// Volume trader endpoints
app.get(apiEndpoints.volumeTrader.start, (req: Request, res: Response) => {
  try {
    volumeTrader?.startVolumeTrading();
    res.json({ success: true, message: 'Volume trading started' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start volume trading' });
  }
});

app.get(apiEndpoints.volumeTrader.performance, (req: Request, res: Response) => {
  try {
    const metrics = volumeTrader?.getPerformanceMetrics();
    res.json(metrics || {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to get performance metrics' });
  }
});

// Sniper bot endpoints
app.get(apiEndpoints.sniperBot.start, (req: Request, res: Response) => {
  try {
    sniperBot?.startSniping();
    res.json({ success: true, message: 'Sniper bot started' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start sniper bot' });
  }
});

app.get(apiEndpoints.sniperBot.targets, (req: Request, res: Response) => {
  try {
    const targets = sniperBot?.getTargets() || [];
    res.json(targets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get targets' });
  }
});

app.get(apiEndpoints.sniperBot.performance, (req: Request, res: Response) => {
  try {
    const metrics = sniperBot?.getPerformanceMetrics();
    res.json(metrics || {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to get performance metrics' });
  }
});

// Start server
app.listen(port, async () => {
  console.log(`🚀 API Server running on port ${port}`);
  await initializeServices();
});

export default app;
