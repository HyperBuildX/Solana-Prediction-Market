// Network & Contract Constants
export const POLYGON_CHAIN_ID = 137;
export const POLYGON_NETWORK = {
  chainId: POLYGON_CHAIN_ID,
  name: 'matic',
  ensAddress: undefined,
};

export const POLYMARKET_CONTRACTS = [
  '0x4bfb41d5b3570dfe5a4bde6f4f13907e456f2b13', // ConditionalTokens
  '0x89c5cc945dd550bcffb72fe42bff002429f46fec', // Polymarket CLOB
];

export const DEFAULT_USDC_CONTRACT = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
export const POLYMARKET_API_BASE = 'https://clob.polymarket.com';
export const POLYMARKET_DATA_API = 'https://data-api.polymarket.com';

// Default Configuration Values
export const DEFAULT_CONFIG = {
  FETCH_INTERVAL: 1,
  MIN_TRADE_SIZE_USD: 100,
  FRONTRUN_SIZE_MULTIPLIER: 0.5,
  GAS_PRICE_MULTIPLIER: 1.2,
  MAX_SLIPPAGE_PERCENT: 2.0,
  MAX_POSITION_SIZE_USD: 10000,
  MAX_TOTAL_EXPOSURE_USD: 50000,
  HEALTH_CHECK_PORT: 3000,
  RETRY_LIMIT: 3,
  MIN_POL_FOR_GAS: 0.05,
  CACHE_CLEANUP_INTERVAL: 30000,
  CACHE_MAX_SIZE: 1000,
  ORDERBOOK_CACHE_TTL: 1000,
  ORDERBOOK_CACHE_MAX_SIZE: 500,
  TRANSACTION_TTL_SECONDS: 86400, // 24 hours
  ACTIVITY_CUTOFF_SECONDS: 60,
} as const;

// HTTP Configuration
export const HTTP_CONFIG = {
  TIMEOUT: 10000,
  MAX_SOCKETS: 50,
  MAX_FREE_SOCKETS: 10,
  KEEP_ALIVE_MSECS: 30000,
} as const;
