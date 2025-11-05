// IP-Based Rate Limiter
// Prevents DDoS and brute-force attacks on public endpoints

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (upgrade to Redis for production multi-instance deployments)
const ipLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipLimitStore.entries()) {
    if (now > entry.resetTime) {
      ipLimitStore.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export interface IPRateLimitConfig {
  maxRequests: number;
  windowMs: number; // Time window in milliseconds
}

export interface IPRateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number; // Seconds until rate limit resets
}

/**
 * Check if IP is within rate limits
 */
export function checkIPRateLimit(
  ip: string,
  config: IPRateLimitConfig
): IPRateLimitResult {
  const now = Date.now();
  const entry = ipLimitStore.get(ip);

  // No previous record or window expired
  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.windowMs;
    ipLimitStore.set(ip, { count: 1, resetTime });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  // Within window - check if limit exceeded
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }

  // Increment counter
  entry.count++;
  ipLimitStore.set(ip, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client IP from request headers (works with Vercel)
 */
export function getClientIP(request: Request): string {
  // Vercel provides x-forwarded-for and x-real-ip
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can be: "client, proxy1, proxy2"
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback (shouldn't happen on Vercel)
  return 'unknown';
}

/**
 * Rate limit configurations for different endpoint types
 */
export const IP_RATE_LIMITS = {
  // Very strict for auth endpoints (prevent brute force)
  auth: {
    maxRequests: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // Moderate for API endpoints
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  // Strict for expensive operations
  chat: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
  },
};
