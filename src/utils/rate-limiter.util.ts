import Bottleneck from 'bottleneck';

// Rate limiters for different API endpoints
// Optimized for better throughput while respecting rate limits
export const polymarketLimiter = new Bottleneck({
  minTime: 100, // Minimum 100ms between requests (10 req/sec)
  maxConcurrent: 10, // Increased from 5 for better parallelism
  reservoir: 100, // Allow bursts up to 100 requests
  reservoirRefreshAmount: 100,
  reservoirRefreshInterval: 10 * 1000, // Refresh every 10 seconds
});

export const rpcLimiter = new Bottleneck({
  minTime: 50, // Minimum 50ms between requests (20 req/sec)
  maxConcurrent: 20, // Increased from 10 for better parallelism
  reservoir: 200, // Allow bursts up to 200 requests
  reservoirRefreshAmount: 200,
  reservoirRefreshInterval: 10 * 1000, // Refresh every 10 seconds
});

export async function withRateLimit<T>(
  limiter: Bottleneck,
  fn: () => Promise<T>,
): Promise<T> {
  return limiter.schedule(fn);
}
