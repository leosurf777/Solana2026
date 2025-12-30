import express, { Request, Response } from 'express';
import cors from 'cors';
import { config, connection, wallet } from './config.js';
import { EnhancedPumpFunScanner } from './services/enhanced-pumpfun-scanner.js';
import { MultiWalletCreator } from './services/multi-wallet-creator.js';
import { VolumeTrader } from './services/volume-trader.js';
import { SniperBot } from './services/sniper-bot.js';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
let pumpFunScanner: EnhancedPumpFunScanner;
let multiWalletCreator: MultiWalletCreator;
let volumeTrader: VolumeTrader;
let sniperBot: SniperBot;

// Initialize all services
async function initializeServices() {
  try {
    console.log('🚀 Initializing all trading services...');
    
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
    services: {
      api: 'running',
      config: 'loaded',
      connection: 'connected',
      wallet: wallet.publicKey.toBase58()
    }
  });
});

// Bot status
app.get('/api/bot/status', (req: Request, res: Response) => {
  res.json({
    status: 'operational',
    wallet: wallet.publicKey.toBase58(),
    network: config.rpcUrl,
    timestamp: new Date().toISOString()
  });
});

// Trades endpoint
app.get('/api/trades', (req: Request, res: Response) => {
  try {
    const trades = volumeTrader?.getTrades() || [];
    res.json({
      trades,
      total: trades.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get trades' });
  }
});

// Market data
app.get('/api/market', (req: Request, res: Response) => {
  try {
    const tokens = pumpFunScanner?.getCurrentTokens() || [];
    res.json({
      tokens,
      stats: {
        totalTokens: tokens.length,
        newTokens: tokens.filter(t => Date.now() - t.createdAt.getTime() < 3600000).length,
        avgLiquidity: tokens.reduce((sum, t) => sum + t.liquidity, 0) / tokens.length || 0,
        totalVolume: tokens.reduce((sum, t) => sum + t.volume24h, 0)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get market data' });
  }
});

// API endpoints info
app.get('/api/endpoints', (req: Request, res: Response) => {
  res.json({
    available: [
      '/api/health',
      '/api/bot/status', 
      '/api/trades',
      '/api/market',
      '/api/pumpfun/start',
      '/api/pumpfun/stop',
      '/api/pumpfun/targets',
      '/api/pumpfun/tokens',
      '/api/volume/start',
      '/api/volume/stop',
      '/api/volume/data',
      '/api/volume/trades',
      '/api/volume/performance',
      '/api/sniper/start',
      '/api/sniper/stop',
      '/api/sniper/targets',
      '/api/sniper/positions',
      '/api/sniper/config',
      '/api/wallets/create',
      '/api/wallets/batches'
    ],
    status: 'real_services_operational',
    timestamp: new Date().toISOString()
  });
});

// Pump.fun endpoints
app.get('/api/pumpfun/start', (req: Request, res: Response) => {
  try {
    pumpFunScanner?.startScanning();
    res.json({ success: true, message: 'Pump.fun scanner started' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start scanner' });
  }
});

app.get('/api/pumpfun/stop', (req: Request, res: Response) => {
  try {
    pumpFunScanner?.stopScanning();
    res.json({ success: true, message: 'Pump.fun scanner stopped' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to stop scanner' });
  }
});

app.get('/api/pumpfun/targets', (req: Request, res: Response) => {
  try {
    const targets = pumpFunScanner?.getSnipeTargets() || [];
    res.json(targets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get targets' });
  }
});

app.get('/api/pumpfun/tokens', (req: Request, res: Response) => {
  try {
    const tokens = pumpFunScanner?.getCurrentTokens() || [];
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get tokens' });
  }
});

// Volume trader endpoints
app.get('/api/volume/start', (req: Request, res: Response) => {
  try {
    volumeTrader?.startVolumeTrading();
    res.json({ success: true, message: 'Volume trading started' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start volume trading' });
  }
});

app.get('/api/volume/stop', (req: Request, res: Response) => {
  try {
    volumeTrader?.stopVolumeTrading();
    res.json({ success: true, message: 'Volume trading stopped' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to stop volume trading' });
  }
});

app.get('/api/volume/data', (req: Request, res: Response) => {
  try {
    const data = volumeTrader?.getVolumeData() || [];
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get volume data' });
  }
});

app.get('/api/volume/trades', (req: Request, res: Response) => {
  try {
    const trades = volumeTrader?.getTrades() || [];
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get trades' });
  }
});

app.get('/api/volume/performance', (req: Request, res: Response) => {
  try {
    const metrics = volumeTrader?.getPerformanceMetrics();
    res.json(metrics || {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to get performance metrics' });
  }
});

// Sniper bot endpoints
app.get('/api/sniper/start', (req: Request, res: Response) => {
  try {
    sniperBot?.startSniping();
    res.json({ success: true, message: 'Sniper bot started' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start sniper bot' });
  }
});

app.get('/api/sniper/stop', (req: Request, res: Response) => {
  try {
    sniperBot?.stopSniping();
    res.json({ success: true, message: 'Sniper bot stopped' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to stop sniper bot' });
  }
});

app.get('/api/sniper/targets', (req: Request, res: Response) => {
  try {
    const targets = sniperBot?.getTargets() || [];
    res.json(targets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get targets' });
  }
});

app.get('/api/sniper/positions', (req: Request, res: Response) => {
  try {
    const positions = sniperBot?.getPositions() || [];
    res.json(positions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get positions' });
  }
});

app.get('/api/sniper/config', (req: Request, res: Response) => {
  try {
    const config = sniperBot?.getConfig();
    res.json(config || {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to get config' });
  }
});

app.post('/api/sniper/config', (req: Request, res: Response) => {
  try {
    const updates = req.body;
    sniperBot?.updateConfig(updates);
    res.json({ success: true, message: 'Sniper config updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update config' });
  }
});

app.get('/api/sniper/performance', (req: Request, res: Response) => {
  try {
    const metrics = sniperBot?.getPerformanceMetrics();
    res.json(metrics || {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to get performance metrics' });
  }
});

// Multi-wallet endpoints
app.post('/api/wallets/create', (req: Request, res: Response) => {
  try {
    const { count, batchName, prefix } = req.body;
    const batch = multiWalletCreator?.createWalletBatch(count, batchName, prefix);
    res.json(batch);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create wallets' });
  }
});

app.get('/api/wallets/batches', (req: Request, res: Response) => {
  try {
    const batches = multiWalletCreator?.getAllBatches() || [];
    res.json(batches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get batches' });
  }
});

// Start server
app.listen(port, async () => {
  console.log(`🚀 Solana Pump Bot API Server running on port ${port}`);
  await initializeServices();
});

export default app;
