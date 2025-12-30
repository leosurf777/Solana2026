import { Connection, PublicKey, Transaction, ComputeBudgetProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

export interface GasOptimization {
  computeUnits: number;
  computeUnitPrice: number;
  priorityFee: number;
  estimatedTotalCost: number;
  recommendations: string[];
}

export class GasOptimizer {
  private connection: Connection;

  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  // Get optimal gas settings for current network conditions
  async getOptimalGasSettings(): Promise<GasOptimization> {
    try {
      // Get recent prioritization fees
      const priorityFees = await this.connection.getRecentPrioritizationFees();
      
      // Calculate optimal compute unit price
      const medianFee = this.calculateMedianFee(priorityFees);
      const computeUnitPrice = Math.max(medianFee, 1000); // Minimum 1000 lamports
      
      // Set compute units (minimum for most transactions)
      const computeUnits = 200000;
      
      // Calculate total cost
      const priorityFee = computeUnits * computeUnitPrice;
      const estimatedTotalCost = priorityFee / LAMPORTS_PER_SOL;

      // Generate recommendations
      const recommendations = this.generateRecommendations(priorityFees, computeUnitPrice);

      return {
        computeUnits,
        computeUnitPrice,
        priorityFee,
        estimatedTotalCost,
        recommendations
      };
    } catch (error) {
      console.error('Error getting gas settings:', error);
      return this.getDefaultGasSettings();
    }
  }

  // Add compute budget instructions to transaction for gas optimization
  optimizeTransaction(transaction: Transaction, gasSettings: GasOptimization): void {
    // Add compute budget instruction
    transaction.add(
      ComputeBudgetProgram.setComputeUnitLimit({
        units: gasSettings.computeUnits
      })
    );

    // Add compute unit price instruction
    transaction.add(
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: gasSettings.computeUnitPrice
      })
    );
  }

  // Calculate median fee from recent prioritization fees
  private calculateMedianFee(fees: any[]): number {
    if (fees.length === 0) return 1000;
    
    const sortedFees = fees
      .map(fee => fee.prioritizationFee || 0)
      .sort((a, b) => a - b);
    
    const middle = Math.floor(sortedFees.length / 2);
    return sortedFees[middle] || 1000;
  }

  // Generate gas optimization recommendations
  private generateRecommendations(fees: any[], computeUnitPrice: number): string[] {
    const recommendations: string[] = [];
    
    // Check network congestion
    const avgFee = fees.reduce((sum, fee) => sum + (fee.prioritizationFee || 0), 0) / fees.length;
    
    if (avgFee > 10000) {
      recommendations.push('High network congestion detected - consider increasing priority fee');
    } else if (avgFee < 1000) {
      recommendations.push('Low network congestion - minimum priority fee should be sufficient');
    } else {
      recommendations.push('Moderate network activity - current priority fee is optimal');
    }

    // Check for fee spikes
    const maxFee = Math.max(...fees.map(f => f.prioritizationFee || 0));
    if (maxFee > avgFee * 5) {
      recommendations.push('Fee spike detected - consider waiting for lower fees');
    }

    // Add timing recommendations
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 9 && hour <= 17) {
      recommendations.push('Business hours - consider trading during off-peak hours for lower fees');
    } else if (hour >= 22 || hour <= 6) {
      recommendations.push('Off-peak hours - optimal timing for low fees');
    }

    return recommendations;
  }

  // Get default gas settings as fallback
  private getDefaultGasSettings(): GasOptimization {
    const computeUnits = 200000;
    const computeUnitPrice = 1000;
    const priorityFee = computeUnits * computeUnitPrice;
    const estimatedTotalCost = priorityFee / LAMPORTS_PER_SOL;

    return {
      computeUnits,
      computeUnitPrice,
      priorityFee,
      estimatedTotalCost,
      recommendations: ['Using default gas settings - network data unavailable']
    };
  }

  // Estimate transaction cost with different priority levels
  async estimateCostAtPriorityLevels(): Promise<{ level: string; cost: number; speed: string }[]> {
    const baseComputeUnits = 200000;
    const priorityLevels = [
      { level: 'Slow', multiplier: 1, speed: '~30 seconds' },
      { level: 'Average', multiplier: 2, speed: '~15 seconds' },
      { level: 'Fast', multiplier: 5, speed: '~5 seconds' },
      { level: 'Instant', multiplier: 10, speed: '~2 seconds' }
    ];

    try {
      const fees = await this.connection.getRecentPrioritizationFees();
      const baseFee = this.calculateMedianFee(fees);

      return priorityLevels.map(({ level, multiplier, speed }) => ({
        level,
        cost: (baseComputeUnits * baseFee * multiplier) / LAMPORTS_PER_SOL,
        speed
      }));
    } catch (error) {
      // Fallback estimates
      return priorityLevels.map(({ level, multiplier, speed }) => ({
        level,
        cost: (baseComputeUnits * 1000 * multiplier) / LAMPORTS_PER_SOL,
        speed
      }));
    }
  }

  // Get optimal blockhash for transaction timing
  async getOptimalBlockhash(): Promise<{ blockhash: string; lastValidBlockHeight: number }> {
    try {
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('confirmed');
      return { blockhash, lastValidBlockHeight };
    } catch (error) {
      console.error('Error getting blockhash:', error);
      throw new Error('Failed to get optimal blockhash');
    }
  }

  // Simulate transaction to get exact compute units needed
  async simulateTransaction(transaction: Transaction): Promise<number> {
    try {
      const simulation = await this.connection.simulateTransaction(transaction);
      return simulation.value.unitsConsumed || 200000;
    } catch (error) {
      console.error('Error simulating transaction:', error);
      return 200000; // Default fallback
    }
  }
}
