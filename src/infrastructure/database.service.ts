import mongoose from 'mongoose';
import type { Logger } from '../utils/logger.util';
import { DEFAULT_CONFIG } from '../core/constants';

export interface ProcessedTransaction {
  txHash: string;
  processedAt: Date;
  expiresAt: Date;
}

const ProcessedTransactionSchema = new mongoose.Schema<ProcessedTransaction>({
  txHash: { type: String, required: true, unique: true, index: true },
  processedAt: { type: Date, required: true, default: Date.now },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
});

export const ProcessedTransactionModel = mongoose.model<ProcessedTransaction>(
  'ProcessedTransaction',
  ProcessedTransactionSchema,
);

export class DatabaseService {
  private logger: Logger;
  private isConnected = false;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async connect(mongoUri: string): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      await mongoose.connect(mongoUri);
      this.isConnected = true;
      this.logger.info('Connected to MongoDB');
      
      // Cleanup old entries on startup
      await this.cleanupExpired();
    } catch (error) {
      this.logger.error('Failed to connect to MongoDB', error as Error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      this.logger.info('Disconnected from MongoDB');
    } catch (error) {
      this.logger.error('Failed to disconnect from MongoDB', error as Error);
    }
  }

  async isProcessed(txHash: string): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      // Use lean() and select only _id for better performance
      const doc = await ProcessedTransactionModel.findOne({ txHash }).select('_id').lean().exec();
      return doc !== null;
    } catch (error) {
      this.logger.error(`Error checking if transaction is processed: ${txHash}`, error as Error);
      return false;
    }
  }

  async areProcessed(txHashes: string[]): Promise<Set<string>> {
    if (!this.isConnected || txHashes.length === 0) {
      return new Set();
    }

    try {
      const docs = await ProcessedTransactionModel.find({ txHash: { $in: txHashes } })
        .select('txHash')
        .lean()
        .exec();
      return new Set(docs.map(doc => doc.txHash));
    } catch (error) {
      this.logger.error(`Error checking if transactions are processed (batch): ${txHashes.length} transactions`, error as Error);
      return new Set();
    }
  }

  async markProcessed(txHash: string, ttlSeconds: number = DEFAULT_CONFIG.TRANSACTION_TTL_SECONDS): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
      // Use lean() for better performance when we don't need full document
      await ProcessedTransactionModel.findOneAndUpdate(
        { txHash },
        { txHash, processedAt: new Date(), expiresAt },
        { upsert: true, lean: true },
      ).exec();
    } catch (error) {
      this.logger.error(`Error marking transaction as processed: ${txHash}`, error as Error);
    }
  }

  async markProcessedBatch(txHashes: string[], ttlSeconds: number = DEFAULT_CONFIG.TRANSACTION_TTL_SECONDS): Promise<void> {
    if (!this.isConnected || txHashes.length === 0) {
      return;
    }

    try {
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
      const now = new Date();
      const operations = txHashes.map(txHash => ({
        updateOne: {
          filter: { txHash },
          update: { txHash, processedAt: now, expiresAt },
          upsert: true,
        },
      }));

      await ProcessedTransactionModel.bulkWrite(operations, { ordered: false });
    } catch (error) {
      this.logger.error(`Error marking transactions as processed (batch): ${txHashes.length} transactions`, error as Error);
    }
  }

  private async cleanupExpired(): Promise<void> {
    try {
      const result = await ProcessedTransactionModel.deleteMany({
        expiresAt: { $lt: new Date() },
      }).exec();
      if (result.deletedCount > 0) {
        this.logger.info(`Cleaned up ${result.deletedCount} expired transaction records`);
      }
    } catch (error) {
      this.logger.error('Error cleaning up expired transactions', error as Error);
    }
  }
}
