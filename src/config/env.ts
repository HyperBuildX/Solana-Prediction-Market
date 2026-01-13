import { DEFAULT_CONFIG, DEFAULT_USDC_CONTRACT } from '../core/constants';
import { ValidationError } from '../core/errors';

export type RuntimeEnv = {
  targetAddresses: string[];
  proxyWallet: string;
  privateKey: string;
  mongoUri?: string;
  rpcUrl: string;
  fetchIntervalSeconds: number;
  tradeMultiplier: number;
  retryLimit: number;
  aggregationEnabled: boolean;
  aggregationWindowSeconds: number;
  usdcContractAddress: string;
  polymarketApiKey?: string;
  polymarketApiSecret?: string;
  polymarketApiPassphrase?: string;
  minTradeSizeUsd: number;
  frontrunSizeMultiplier: number;
  gasPriceMultiplier: number;
  maxSlippagePercent: number;
  maxPositionSizeUsd: number;
  maxTotalExposureUsd: number;
  healthCheckPort: number;
};

export function loadEnv(): RuntimeEnv {
  const parseList = (val: string | undefined): string[] => {
    if (!val) return [];
    try {
      const maybeJson = JSON.parse(val);
      if (Array.isArray(maybeJson)) return maybeJson.map(String);
    } catch {
      // Not JSON, parse as comma-separated
    }
    return val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const required = (name: string, v: string | undefined): string => {
    if (!v) {
      throw new ValidationError(`Missing required environment variable: ${name}`);
    }
    return v;
  };

  const targetAddresses = parseList(process.env.TARGET_ADDRESSES);
  if (targetAddresses.length === 0) {
    throw new ValidationError('TARGET_ADDRESSES must contain at least one trader address');
  }

  return {
    targetAddresses,
    proxyWallet: required('PUBLIC_KEY', process.env.PUBLIC_KEY),
    privateKey: required('PRIVATE_KEY', process.env.PRIVATE_KEY),
    mongoUri: process.env.MONGO_URI,
    rpcUrl: required('RPC_URL', process.env.RPC_URL),
    fetchIntervalSeconds: Number(process.env.FETCH_INTERVAL ?? DEFAULT_CONFIG.FETCH_INTERVAL),
    tradeMultiplier: Number(process.env.TRADE_MULTIPLIER ?? 1.0),
    retryLimit: Number(process.env.RETRY_LIMIT ?? DEFAULT_CONFIG.RETRY_LIMIT),
    aggregationEnabled: String(process.env.TRADE_AGGREGATION_ENABLED ?? 'false') === 'true',
    aggregationWindowSeconds: Number(process.env.TRADE_AGGREGATION_WINDOW_SECONDS ?? 300),
    usdcContractAddress: process.env.USDC_CONTRACT_ADDRESS || DEFAULT_USDC_CONTRACT,
    polymarketApiKey: process.env.POLYMARKET_API_KEY,
    polymarketApiSecret: process.env.POLYMARKET_API_SECRET,
    polymarketApiPassphrase: process.env.POLYMARKET_API_PASSPHRASE,
    minTradeSizeUsd: Number(process.env.MIN_TRADE_SIZE_USD ?? DEFAULT_CONFIG.MIN_TRADE_SIZE_USD),
    frontrunSizeMultiplier: Number(process.env.FRONTRUN_SIZE_MULTIPLIER ?? DEFAULT_CONFIG.FRONTRUN_SIZE_MULTIPLIER),
    gasPriceMultiplier: Number(process.env.GAS_PRICE_MULTIPLIER ?? DEFAULT_CONFIG.GAS_PRICE_MULTIPLIER),
    maxSlippagePercent: Number(process.env.MAX_SLIPPAGE_PERCENT ?? DEFAULT_CONFIG.MAX_SLIPPAGE_PERCENT),
    maxPositionSizeUsd: Number(process.env.MAX_POSITION_SIZE_USD ?? DEFAULT_CONFIG.MAX_POSITION_SIZE_USD),
    maxTotalExposureUsd: Number(process.env.MAX_TOTAL_EXPOSURE_USD ?? DEFAULT_CONFIG.MAX_TOTAL_EXPOSURE_USD),
    healthCheckPort: Number(process.env.HEALTH_CHECK_PORT ?? DEFAULT_CONFIG.HEALTH_CHECK_PORT),
  };
}

