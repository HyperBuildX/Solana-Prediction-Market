interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class Cache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private defaultTtl: number;
  private cleanupInterval?: NodeJS.Timeout;
  private readonly maxSize: number;

  constructor(defaultTtlMs: number = 2000, maxSize: number = 1000) {
    this.defaultTtl = defaultTtlMs;
    this.maxSize = maxSize;
    // Start periodic cleanup to prevent memory leaks
    this.startCleanup();
  }

  private startCleanup(): void {
    // Cleanup expired entries every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 30000);
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: T, ttlMs?: number): void {
    // Evict oldest entries if cache is too large
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const ttl = ttlMs || this.defaultTtl;
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }
    
    // Batch delete for better performance
    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

