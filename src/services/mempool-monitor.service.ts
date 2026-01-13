import type { ClobClient } from '@polymarket/clob-client';
import type { RuntimeEnv } from '../config/env';
import type { Logger } from '../utils/logger.util';
import type { TradeSignal } from '../domain/trade.types';
import { ethers } from 'ethers';
import { httpGet } from '../utils/fetch-data.util';
import axios from 'axios';
import type { DatabaseService } from '../infrastructure/database.service';

export type MempoolMonitorDeps = {
  client: ClobClient;
  env: RuntimeEnv;
  logger: Logger;
  database?: DatabaseService;
  onDetectedTrade: (signal: TradeSignal) => Promise<void>;
};


// Polymarket contract addresses on Polygon
const POLYMARKET_CONTRACTS = [
  '0x4bfb41d5b3570dfe5a4bde6f4f13907e456f2b13', // ConditionalTokens
  '0x89c5cc945dd550bcffb72fe42bff002429f46fec', // Polymarket CLOB
];

interface ActivityResponse {
  type: string;
  timestamp: number;
  conditionId: string;
  asset: string;
  size: number;
  usdcSize: number;
  price: number;
  side: string;
  outcomeIndex: number;
  transactionHash: string;
  status?: string; // 'pending' | 'confirmed'
}

export class MempoolMonitorService {
  private readonly deps: MempoolMonitorDeps;
  private provider?: ethers.providers.JsonRpcProvider;
  private isRunning = false;
  private readonly processedHashes: Set<string> = new Set(); // In-memory fallback
  private readonly targetAddresses: Set<string> = new Set();
  private timer?: NodeJS.Timeout;
  private readonly lastFetchTime: Map<string, number> = new Map();

  constructor(deps: MempoolMonitorDeps) {
    this.deps = deps;
    POLYMARKET_CONTRACTS.forEach((addr) => this.targetAddresses.add(addr.toLowerCase()));
  }

  private async isProcessed(txHash: string): Promise<boolean> {
    // Check in-memory first (fast, synchronous)
    if (this.processedHashes.has(txHash)) {
      return true;
    }

    // Check database if available (async)
    if (this.deps.database) {
      const dbResult = await this.deps.database.isProcessed(txHash);
      // Cache the result in memory to avoid future DB queries
      if (dbResult) {
        this.processedHashes.add(txHash);
      }
      return dbResult;
    }

    return false;
  }

  private async markProcessed(txHash: string): Promise<void> {
    // Mark in memory
    this.processedHashes.add(txHash);

    // Mark in database if available (TTL: 24 hours)
    if (this.deps.database) {
      await this.deps.database.markProcessed(txHash, 86400);
    }
  }

  async start(): Promise<void> {
    const { logger, env } = this.deps;
    logger.info('Starting Polymarket Frontrun Bot - Mempool Monitor');
    
    // Configure for Polygon network (chainId: 137) and disable ENS
    const network = {
      chainId: 137,
      name: 'matic',
      ensAddress: undefined, // Disable ENS - Polygon doesn't support it
    };
    this.provider = new ethers.providers.JsonRpcProvider(env.rpcUrl, network);
    this.isRunning = true;

    // Subscribe to pending transactions with error handling
    this.provider.on('pending', (txHash: string) => {
      if (this.isRunning) {
        void this.handlePendingTransaction(txHash).catch((err) => {
          // Log errors but don't block the event loop
          this.deps.logger.debug(`Error handling pending transaction ${txHash}: ${err instanceof Error ? err.message : String(err)}`);
        });
      }
    });

    // Also monitor Polymarket API for recent orders (hybrid approach)
    // This helps catch orders that might not be in mempool yet
    this.timer = setInterval(() => void this.monitorRecentOrders().catch(() => undefined), env.fetchIntervalSeconds * 1000);
    await this.monitorRecentOrders();

    logger.info('Market monitoring active. Waiting for pending transactions...');
  }

  stop(): void {
    this.isRunning = false;
    if (this.provider) {
      this.provider.removeAllListeners('pending');
    }
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.deps.logger.info('Market monitoring stopped');
  }

  private async handlePendingTransaction(txHash: string): Promise<void> {
    // Skip if already processed
    if (await this.isProcessed(txHash)) {
      return;
    }

    try {
      const tx = await this.provider!.getTransaction(txHash);
      if (!tx) {
        return;
      }

      const toAddress = tx.to?.toLowerCase();
      if (!toAddress || !this.targetAddresses.has(toAddress)) {
        return;
      }

      // For now, we'll rely on API monitoring for trade details
      // Mempool monitoring helps us detect transactions early
      // The actual trade parsing happens in monitorRecentOrders
    } catch {
      // Expected - transaction might not be available yet
    }
  }

  private async monitorRecentOrders(): Promise<void> {
    const { logger, env } = this.deps;
    
    // Monitor all addresses in parallel for better performance
    const promises = env.targetAddresses.map(async (targetAddress) => {
      try {
        await this.checkRecentActivity(targetAddress);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          return;
        }
        logger.debug(`Error checking activity for ${targetAddress}: ${err instanceof Error ? err.message : String(err)}`);
      }
    });
    
    await Promise.allSettled(promises);
  }

  private async checkRecentActivity(targetAddress: string): Promise<void> {
    const { logger, env } = this.deps;
    
    try {
      const url = `https://data-api.polymarket.com/activity?user=${targetAddress}`;
      const activities: ActivityResponse[] = await httpGet<ActivityResponse[]>(url);

      const now = Math.floor(Date.now() / 1000);
      const cutoffTime = now - 60; // Only check very recent activities (last 60 seconds)

      // Filter and process trades in parallel where possible
      const tradePromises: Promise<void>[] = [];
      
      for (const activity of activities) {
        if (activity.type !== 'TRADE') continue;

        const activityTime = typeof activity.timestamp === 'number' 
          ? activity.timestamp 
          : Math.floor(new Date(activity.timestamp).getTime() / 1000);
        
        // Only process very recent trades (potential frontrun targets)
        if (activityTime < cutoffTime) continue;
        
        const lastTime = this.lastFetchTime.get(targetAddress) || 0;
        if (activityTime <= lastTime) continue;

        // Check minimum trade size early (before async operations)
        const sizeUsd = activity.usdcSize || activity.size * activity.price;
        const minTradeSize = env.minTradeSizeUsd || 100;
        if (sizeUsd < minTradeSize) continue;

        // Process this trade asynchronously
        tradePromises.push(this.processTradeActivity(activity, targetAddress, activityTime, sizeUsd));
      }
      
      // Wait for all trade processing to complete
      await Promise.allSettled(tradePromises);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return;
      }
      throw err;
    }
  }

  private async processTradeActivity(
    activity: ActivityResponse,
    targetAddress: string,
    activityTime: number,
    sizeUsd: number,
  ): Promise<void> {
    const { logger, env } = this.deps;
    
    // Skip if already processed (check in-memory first for speed)
    if (this.processedHashes.has(activity.transactionHash)) {
      return;
    }
    
    // Check database if available (async)
    if (await this.isProcessed(activity.transactionHash)) {
      return;
    }

    // Check if transaction is still pending (frontrun opportunity) - do this in parallel with gas price extraction
    const [txStatus, tx] = await Promise.allSettled([
      this.checkTransactionStatus(activity.transactionHash),
      this.provider!.getTransaction(activity.transactionHash).catch(() => null),
    ]);

    if (txStatus.status === 'fulfilled' && txStatus.value === 'confirmed') {
      // Too late to frontrun
      await this.markProcessed(activity.transactionHash);
      return;
    }

    // Extract gas price from transaction
    let targetGasPrice: string | undefined;
    if (tx.status === 'fulfilled' && tx.value) {
      targetGasPrice = tx.value.gasPrice?.toString() || tx.value.maxFeePerGas?.toString();
    }

    logger.info(
      `[Frontrun] Detected pending trade: ${activity.side.toUpperCase()} ${sizeUsd.toFixed(2)} USD on market ${activity.conditionId}`,
    );

    const signal: TradeSignal = {
      trader: targetAddress,
      marketId: activity.conditionId,
      tokenId: activity.asset,
      outcome: activity.outcomeIndex === 0 ? 'YES' : 'NO',
      side: activity.side.toUpperCase() as 'BUY' | 'SELL',
      sizeUsd,
      price: activity.price,
      timestamp: activityTime * 1000,
      pendingTxHash: activity.transactionHash,
      targetGasPrice,
    };

    await this.markProcessed(activity.transactionHash);
    this.lastFetchTime.set(targetAddress, Math.max(this.lastFetchTime.get(targetAddress) || 0, activityTime));

    // Execute frontrun
    await this.deps.onDetectedTrade(signal);
  }

  private async checkTransactionStatus(txHash: string): Promise<'pending' | 'confirmed'> {
    try {
      const receipt = await this.provider!.getTransactionReceipt(txHash);
      return receipt ? 'confirmed' : 'pending';
    } catch {
      return 'pending';
    }
  }
}

