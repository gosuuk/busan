interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function checkRateLimit(
  key: string,
  options: RateLimitOptions,
): RateLimitResult {
  // This is a local fallback. Use Vercel WAF or a shared store for production.
  const now = Date.now();
  const currentBucket = buckets.get(key);

  if (!currentBucket || currentBucket.resetAt <= now) {
    const resetAt = now + options.windowMs;
    buckets.set(key, {
      count: 1,
      resetAt,
    });

    return {
      allowed: true,
      limit: options.limit,
      remaining: options.limit - 1,
      resetAt: new Date(resetAt),
    };
  }

  currentBucket.count += 1;

  return {
    allowed: currentBucket.count <= options.limit,
    limit: options.limit,
    remaining: Math.max(options.limit - currentBucket.count, 0),
    resetAt: new Date(currentBucket.resetAt),
  };
}
