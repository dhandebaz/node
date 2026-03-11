import Redis from 'ioredis';

const getRedisClient = () => {
  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL);
  }
  // Fallback or Mock if needed for dev without Redis
  // Ideally, throw error or use in-memory mock if critical
  return null;
};

const redis = getRedisClient();

export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    if (!redis) return null;
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Cache Get Error:', e);
      return null;
    }
  },

  async set(key: string, value: any, ttlSeconds = 3600): Promise<void> {
    if (!redis) return;
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (e) {
      console.error('Cache Set Error:', e);
    }
  },

  async del(key: string): Promise<void> {
    if (!redis) return;
    try {
      await redis.del(key);
    } catch (e) {
      console.error('Cache Del Error:', e);
    }
  },
  
  async delPattern(pattern: string): Promise<void> {
      if (!redis) return;
      try {
          const keys = await redis.keys(pattern);
          if (keys.length > 0) {
              await redis.del(...keys);
          }
      } catch (e) {
          console.error('Cache DelPattern Error:', e);
      }
  }
};
