import { redis } from '@/shared/cache/redis';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

/**
 * Sliding-window rate limiter backed by Redis.
 *
 * Key design: counts within a fixed window of `windowSeconds`. Falls back to an
 * in-memory limiter if Redis is unreachable (degraded but safe — limit still applies
 * within the same Node process).
 */
const memBuckets = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  try {
    if (redis.status !== 'ready' && redis.status !== 'connecting') {
      try {
        await redis.connect();
      } catch {
        // ignore — fall through to memory limiter
      }
    }
    if (redis.status === 'ready') {
      const now = Math.floor(Date.now() / 1000);
      const windowStart = now - (now % windowSeconds);
      const redisKey = `rl:${key}:${windowStart}`;
      const pipeline = redis.multi();
      pipeline.incr(redisKey);
      pipeline.expire(redisKey, windowSeconds);
      const result = await pipeline.exec();
      const count = Number(result?.[0]?.[1] ?? 1);
      const resetSeconds = windowSeconds - (now - windowStart);
      return {
        allowed: count <= limit,
        remaining: Math.max(0, limit - count),
        resetSeconds,
      };
    }
  } catch {
    // fall through
  }
  return memoryLimit(key, limit, windowSeconds);
}

function memoryLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const bucket = memBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    memBuckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, remaining: limit - 1, resetSeconds: windowSeconds };
  }
  bucket.count += 1;
  return {
    allowed: bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
    resetSeconds: Math.ceil((bucket.resetAt - now) / 1000),
  };
}
