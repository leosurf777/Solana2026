import { Request, Response } from 'express';
import { Keypair } from '@solana/web3.js';

// Pump.fun Scanner Endpoints
export const pumpFunEndpoints = {
  // Start scanning
  '/api/pumpfun/start': (scanner: any, req: Request, res: Response) => {
    try {
      scanner.startScanning((tokens: any[]) => {
        console.log(`📊 Pump.fun scan found ${tokens.length} tokens`);
      });
      res.json({ success: true, message: 'Pump.fun scanner started' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to start scanner' });
    }
  },

  // Stop scanning
  '/api/pumpfun/stop': (scanner: any, req: Request, res: Response) => {
    try {
      scanner.stopScanning();
      res.json({ success: true, message: 'Pump.fun scanner stopped' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to stop scanner' });
    }
  },

  // Get current targets
  '/api/pumpfun/targets': (scanner: any, req: Request, res: Response) => {
    try {
      const targets = scanner.getSnipeTargets();
      res.json(targets);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get targets' });
    }
  },

  // Get scanned tokens
  '/api/pumpfun/tokens': (scanner: any, req: Request, res: Response) => {
    try {
      const tokens = scanner.getCurrentTokens();
      res.json(tokens);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get tokens' });
    }
  }
};

// Multi-Wallet Creator Endpoints
export const multiWalletEndpoints = {
  // Create wallet batch
  '/api/wallets/create': (walletCreator: any, req: Request, res: Response) => {
    try {
      const { count, batchName, prefix } = req.body;
      const batch = walletCreator.createWalletBatch(count, batchName, prefix);
      res.json(batch);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create wallets' });
    }
  },

  // Fund wallets
  '/api/wallets/fund': async (walletCreator: any, req: Request, res: Response) => {
    try {
      const { batchName, amountPerWallet, sourcePrivateKey } = req.body;
      const sourceKeypair = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(`[${sourcePrivateKey}]`))
      );
      const transactions = await walletCreator.fundWallets(
        sourceKeypair, 
        batchName, 
        amountPerWallet
      );
      res.json({ transactions });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fund wallets' });
    }
  },

  // Execute coordinated buy
  '/api/wallets/coordinated-buy': async (walletCreator: any, req: Request, res: Response) => {
    try {
      const { batchName, tokenAddress, buyAmounts, slippage } = req.body;
      const transactions = await walletCreator.executeCoordinatedBuy(
        batchName,
        tokenAddress,
        buyAmounts,
        slippage
      );
      res.json({ transactions });
    } catch (error) {
      res.status(500).json({ error: 'Failed to execute coordinated buy' });
    }
  },

  // Collect funds
  '/api/wallets/collect': async (walletCreator: any, req: Request, res: Response) => {
    try {
      const { batchName, destinationWallet, leaveBalance } = req.body;
      const transactions = await walletCreator.collectFunds(
        batchName,
        destinationWallet,
        leaveBalance
      );
      res.json({ transactions });
    } catch (error) {
      res.status(500).json({ error: 'Failed to collect funds' });
    }
  },

  // Get batch balances
  '/api/wallets/balances/:batchName': async (walletCreator: any, req: Request, res: Response) => {
    try {
      const { batchName } = req.params;
      const balances = await walletCreator.getBatchBalances(batchName);
      res.json(balances);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get balances' });
    }
  },

  // Get all batches
  '/api/wallets/batches': (walletCreator: any, req: Request, res: Response) => {
    try {
      const batches = walletCreator.getAllBatches();
      res.json(batches);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get batches' });
    }
  }
};

// Volume Trader Endpoints
export const volumeTraderEndpoints = {
  // Start volume trading
  '/api/volume/start': (volumeTrader: any, req: Request, res: Response) => {
    try {
      volumeTrader.startVolumeTrading();
      res.json({ success: true, message: 'Volume trading started' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to start volume trading' });
    }
  },

  // Stop volume trading
  '/api/volume/stop': (volumeTrader: any, req: Request, res: Response) => {
    try {
      volumeTrader.stopVolumeTrading();
      res.json({ success: true, message: 'Volume trading stopped' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to stop volume trading' });
    }
  },

  // Get volume data
  '/api/volume/data': (volumeTrader: any, req: Request, res: Response) => {
    try {
      const data = volumeTrader.getVolumeData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get volume data' });
    }
  },

  // Get trades
  '/api/volume/trades': (volumeTrader: any, req: Request, res: Response) => {
    try {
      const trades = volumeTrader.getTrades();
      res.json(trades);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get trades' });
    }
  },

  // Get strategies
  '/api/volume/strategies': (volumeTrader: any, req: Request, res: Response) => {
    try {
      const strategies = volumeTrader.getStrategies();
      res.json(strategies);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get strategies' });
    }
  },

  // Update strategy
  '/api/volume/strategy/:name': (volumeTrader: any, req: Request, res: Response) => {
    try {
      const { name } = req.params;
      const updates = req.body;
      volumeTrader.updateStrategy(name, updates);
      res.json({ success: true, message: `Strategy ${name} updated` });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update strategy' });
    }
  },

  // Get performance metrics
  '/api/volume/performance': (volumeTrader: any, req: Request, res: Response) => {
    try {
      const metrics = volumeTrader.getPerformanceMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get performance metrics' });
    }
  }
};

// Sniper Bot Endpoints
export const sniperBotEndpoints = {
  // Start sniping
  '/api/sniper/start': (sniperBot: any, req: Request, res: Response) => {
    try {
      sniperBot.startSniping();
      res.json({ success: true, message: 'Sniper bot started' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to start sniper bot' });
    }
  },

  // Stop sniping
  '/api/sniper/stop': (sniperBot: any, req: Request, res: Response) => {
    try {
      sniperBot.stopSniping();
      res.json({ success: true, message: 'Sniper bot stopped' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to stop sniper bot' });
    }
  },

  // Get targets
  '/api/sniper/targets': (sniperBot: any, req: Request, res: Response) => {
    try {
      const targets = sniperBot.getTargets();
      res.json(targets);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get targets' });
    }
  },

  // Get positions
  '/api/sniper/positions': (sniperBot: any, req: Request, res: Response) => {
    try {
      const positions = sniperBot.getPositions();
      res.json(positions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get positions' });
    }
  },

  // Get config
  '/api/sniper/config': (sniperBot: any, req: Request, res: Response) => {
    try {
      const config = sniperBot.getConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get config' });
    }
  },

  // Update config (POST)
  '/api/sniper/config/update': (sniperBot: any, req: Request, res: Response) => {
    try {
      const updates = req.body;
      sniperBot.updateConfig(updates);
      res.json({ success: true, message: 'Sniper config updated' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update config' });
    }
  },

  // Get performance metrics
  '/api/sniper/performance': (sniperBot: any, req: Request, res: Response) => {
    try {
      const metrics = sniperBot.getPerformanceMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get performance metrics' });
    }
  }
};

// API Endpoints Configuration
export const apiEndpoints = {
  // Pump.fun Scanner endpoints
  pumpFun: {
    start: '/api/pumpfun/start',
    stop: '/api/pumpfun/stop',
    targets: '/api/pumpfun/targets',
    tokens: '/api/pumpfun/tokens'
  },
  
  // Multi-Wallet endpoints
  multiWallet: {
    create: '/api/wallets/create',
    fund: '/api/wallets/fund',
    coordinatedBuy: '/api/wallets/coordinated-buy',
    collect: '/api/wallets/collect',
    balances: '/api/wallets/balances/:batchName',
    batches: '/api/wallets/batches'
  },
  
  // Volume Trader endpoints
  volumeTrader: {
    start: '/api/volume/start',
    stop: '/api/volume/stop',
    data: '/api/volume/data',
    trades: '/api/volume/trades',
    strategies: '/api/volume/strategies',
    strategy: '/api/volume/strategy/:name',
    performance: '/api/volume/performance'
  },
  
  // Sniper Bot endpoints
  sniperBot: {
    start: '/api/sniper/start',
    stop: '/api/sniper/stop',
    targets: '/api/sniper/targets',
    positions: '/api/sniper/positions',
    config: '/api/sniper/config',
    performance: '/api/sniper/performance'
  }
};

export default {
  pumpFunEndpoints,
  multiWalletEndpoints,
  volumeTraderEndpoints,
  sniperBotEndpoints,
  apiEndpoints
};
