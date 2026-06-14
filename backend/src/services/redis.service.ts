import Redis from 'ioredis';

let redis: Redis | null = null;
let isRedisConnected = false;

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

try {
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    retryStrategy(times) {
      if (times > 3) {
        return null; // Stop reconnecting to prevent terminal spam
      }
      return Math.min(times * 100, 2000);
    },
    connectTimeout: 2000,
  });

  redis.on('connect', () => {
    console.log('Redis connected successfully');
    isRedisConnected = true;
  });

  redis.on('error', (err) => {
    console.warn('Redis connection failed, falling back to in-memory store:', err.message);
    isRedisConnected = false;
  });
} catch (error) {
  console.warn('Failed to initialize Redis, falling back to in-memory store');
  isRedisConnected = false;
}

// In-memory fallback
const inMemoryBlacklist = new Set<string>();

export const redisService = {
  blacklistToken: async (jti: string, exp: number): Promise<void> => {
    const now = Math.floor(Date.now() / 1000);
    const ttl = exp - now;
    if (ttl <= 0) return;

    if (isRedisConnected && redis) {
      try {
        await redis.set(`blacklist:${jti}`, '1', 'EX', ttl);
        return;
      } catch (err) {
        console.error('Failed to save to Redis blacklist, saving to in-memory:', err);
      }
    }

    // Fallback to in-memory
    inMemoryBlacklist.add(jti);
    // Cleanup after TTL
    setTimeout(() => {
      inMemoryBlacklist.delete(jti);
    }, ttl * 1000);
  },

  isTokenBlacklisted: async (jti: string): Promise<boolean> => {
    if (isRedisConnected && redis) {
      try {
        const result = await redis.get(`blacklist:${jti}`);
        return result === '1';
      } catch (err) {
        console.error('Failed to check Redis blacklist, checking in-memory:', err);
      }
    }

    return inMemoryBlacklist.has(jti);
  }
};
