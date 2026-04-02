import { Redis } from "@upstash/redis";

/**
 * Global Redis client instance for Nodebase.
 * Uses Upstash Redis for edge-compatible, high-performance caching.
 */
const isRedisConfigured = !!(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

let redisInstance: Redis | null = null;
let hasLoggedWarning = false;

if (isRedisConfigured) {
  redisInstance = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

/**
 * Proxy for the Redis client to handle missing configuration gracefully.
 */
export const redis = new Proxy({} as Redis, {
  get: (target, prop) => {
    if (!isRedisConfigured) {
      if (!hasLoggedWarning) {
        console.warn(
          "[Redis] Warning: Redis is not configured. UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required for caching features."
        );
        hasLoggedWarning = true;
      }
      // Return a no-op function for any method calls to prevent crashes
      return async () => null;
    }
    return (redisInstance as any)[prop];
  },
});

/**
 * Cache helper utilities for common patterns.
 */
export const cache = {
  /**
   * Set a value in cache with an optional TTL (seconds).
   */
  set: async (key: string, value: unknown, ttl?: number) => {
    try {
      if (ttl) {
        await redis.set(key, JSON.stringify(value), { ex: ttl });
      } else {
        await redis.set(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`[Redis] Error setting key ${key}:`, error);
    }
  },

  /**
   * Get a value from cache and parse it.
   */
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return typeof data === "string" ? JSON.parse(data) : (data as T);
    } catch (error) {
      console.error(`[Redis] Error getting key ${key}:`, error);
      return null;
    }
  },

  /**
   * Delete a key from cache.
   */
  del: async (key: string) => {
    try {
      await redis.del(key);
    } catch (error) {
      console.error(`[Redis] Error deleting key ${key}:`, error);
    }
  },

  /**
   * Generate a standard cache key.
   */
  key: (...parts: string[]) => `nodebase:${parts.join(":")}`,
};
