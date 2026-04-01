import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Lazy initialization or build-time fallback to prevent crashes when environment variables are missing
const getRedisClient = () => {
  if (typeof process !== "undefined" && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return Redis.fromEnv();
  }
  // Fallback for build time - it won't be used during actual execution if variables are missing anyway
  return new Redis({
    url: "https://placeholder-url.upstash.io",
    token: "placeholder-token",
  });
};

// Create a new ratelimiter, that will return true if the request is allowed
// The ratelimit is 10 requests per 10 seconds
export const rateLimit = new Ratelimit({
  redis: getRedisClient(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

// Helper for more specific limits
export const getRateLimiter = (limit: number, window: `${number} ${"s" | "m" | "h" | "d"}`) => {
  return new Ratelimit({
    redis: getRedisClient(),
    limiter: Ratelimit.slidingWindow(limit, window),
    analytics: true,
    prefix: "@upstash/ratelimit",
  });
};
