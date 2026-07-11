// ============================================================
// utils/rate-limit.ts — Advanced Redis-based rate limiter
// Supports configurable limits, exponential backoff, and multiple strategies
// ============================================================
import { redis } from "@/lib/redis"
import { logger } from "./logger"

// ── Configuration Types ──────────────────────────────────────

export type RateLimitConfig = {
  interval: number // time window in seconds
  maxRequests: number // max requests per interval
  enableBackoff?: boolean // exponential backoff on repeated violations
  backoffMultiplier?: number // multiplier for backoff (default: 2)
  maxBackoffSeconds?: number // max backoff duration in seconds
}

export type RateLimitStrategy = {
  primary: RateLimitConfig // Main limit (e.g., per-IP)
  secondary?: RateLimitConfig // Optional secondary limit (e.g., per-account)
  message?: string // Custom error message
}

export type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter?: number // seconds to wait before retrying (for backoff)
  violationType?: "primary" | "secondary"
}

// ── Configurable Presets ─────────────────────────────────────
// Load from environment or use defaults

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key]
  return value ? parseInt(value, 10) : defaultValue
}

export const RATE_LIMIT_PRESETS = {
  // Authentication endpoints (strictest)
  auth: {
    primary: {
      interval: getEnvNumber("RATE_LIMIT_AUTH_INTERVAL", 60), // 1 minute
      maxRequests: getEnvNumber("RATE_LIMIT_AUTH_MAX_REQUESTS", 5),
      enableBackoff: true,
      backoffMultiplier: 2,
      maxBackoffSeconds: 3600, // 1 hour max
    },
    secondary: {
      interval: getEnvNumber("RATE_LIMIT_AUTH_ACCOUNT_INTERVAL", 300), // 5 minutes
      maxRequests: getEnvNumber("RATE_LIMIT_AUTH_ACCOUNT_MAX_REQUESTS", 10),
    },
    message: "Too many authentication attempts. Please try again later.",
  },

  // Public endpoints (moderate)
  public: {
    primary: {
      interval: getEnvNumber("RATE_LIMIT_PUBLIC_INTERVAL", 60),
      maxRequests: getEnvNumber("RATE_LIMIT_PUBLIC_MAX_REQUESTS", 30),
    },
    message: "Too many requests. Please slow down.",
  },

  // Authenticated endpoints (lenient)
  authenticated: {
    primary: {
      interval: getEnvNumber("RATE_LIMIT_AUTH_USER_INTERVAL", 60),
      maxRequests: getEnvNumber("RATE_LIMIT_AUTH_USER_MAX_REQUESTS", 100),
    },
    message: "Rate limit exceeded. Please try again shortly.",
  },

  // API keys (very lenient)
  apiKey: {
    primary: {
      interval: getEnvNumber("RATE_LIMIT_API_KEY_INTERVAL", 60),
      maxRequests: getEnvNumber("RATE_LIMIT_API_KEY_MAX_REQUESTS", 1000),
    },
    message: "API rate limit exceeded.",
  },

  // Admin operations (moderate)
  admin: {
    primary: {
      interval: getEnvNumber("RATE_LIMIT_ADMIN_INTERVAL", 60),
      maxRequests: getEnvNumber("RATE_LIMIT_ADMIN_MAX_REQUESTS", 50),
    },
    message: "Admin rate limit exceeded.",
  },

  // Sensitive operations (strict)
  sensitive: {
    primary: {
      interval: getEnvNumber("RATE_LIMIT_SENSITIVE_INTERVAL", 300), // 5 minutes
      maxRequests: getEnvNumber("RATE_LIMIT_SENSITIVE_MAX_REQUESTS", 5),
      enableBackoff: true,
      backoffMultiplier: 3,
      maxBackoffSeconds: 7200, // 2 hours max
    },
    message: "Too many attempts for sensitive operation.",
  },

  // Order placement (moderate)
  orders: {
    primary: {
      interval: getEnvNumber("RATE_LIMIT_ORDERS_INTERVAL", 60),
      maxRequests: getEnvNumber("RATE_LIMIT_ORDERS_MAX_REQUESTS", 20),
    },
    message: "Too many orders. Please wait before placing more orders.",
  },

  // Market data (lenient)
  marketData: {
    primary: {
      interval: getEnvNumber("RATE_LIMIT_MARKET_DATA_INTERVAL", 60),
      maxRequests: getEnvNumber("RATE_LIMIT_MARKET_DATA_MAX_REQUESTS", 200),
    },
    message: "Market data rate limit exceeded.",
  },
} as const

export type RateLimitPreset = keyof typeof RATE_LIMIT_PRESETS

// ── Core Rate Limiting Function ──────────────────────────────

export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { interval, maxRequests, enableBackoff, backoffMultiplier = 2, maxBackoffSeconds = 3600 } = config

  const key = `rate-limit:${identifier}`
  const backoffKey = `rate-limit:backoff:${identifier}`
  const now = Date.now()
  const windowStart = now - interval * 1000

  // Check if currently in backoff period
  if (enableBackoff) {
    const backoffUntil = await redis.get(backoffKey)
    if (backoffUntil) {
      const backoffEnd = parseInt(backoffUntil, 10)
      if (now < backoffEnd) {
        const retryAfter = Math.ceil((backoffEnd - now) / 1000)
        logger.warn({ identifier, retryAfter }, "Request blocked by exponential backoff")
        return {
          success: false,
          limit: maxRequests,
          remaining: 0,
          reset: Math.ceil(backoffEnd / 1000),
          retryAfter,
        }
      } else {
        // Backoff period expired, clear it
        await redis.del(backoffKey)
      }
    }
  }

  // Use Redis sorted set to track requests
  const multi = redis.multi()

  // Remove old entries
  multi.zremrangebyscore(key, 0, windowStart)

  // Add current request
  multi.zadd(key, now, `${now}-${Math.random()}`)

  // Count requests in window
  multi.zcard(key)

  // Set expiry
  multi.expire(key, interval)

  const results = await multi.exec()

  if (!results) {
    logger.error({ identifier }, "Redis rate limit check failed")
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: Math.ceil((now + interval * 1000) / 1000),
    }
  }

  const count = (results[2][1] as number) || 0
  const remaining = Math.max(0, maxRequests - count)
  const success = count <= maxRequests

  // Handle rate limit violation with exponential backoff
  if (!success && enableBackoff) {
    // Get current violation count
    const violationKey = `rate-limit:violations:${identifier}`
    const violations = await redis.incr(violationKey)
    await redis.expire(violationKey, maxBackoffSeconds)

    // Calculate backoff duration with exponential increase
    const backoffSeconds = Math.min(
      Math.pow(backoffMultiplier, violations - 1) * interval,
      maxBackoffSeconds
    )
    const backoffUntil = now + backoffSeconds * 1000

    // Set backoff period
    await redis.setex(backoffKey, Math.ceil(backoffSeconds), backoffUntil.toString())

    logger.warn(
      { identifier, violations, backoffSeconds },
      "Rate limit violation - exponential backoff applied"
    )

    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: Math.ceil(backoffUntil / 1000),
      retryAfter: backoffSeconds,
    }
  }

  // Reset violation count on successful request
  if (success && enableBackoff) {
    await redis.del(`rate-limit:violations:${identifier}`)
  }

  return {
    success,
    limit: maxRequests,
    remaining,
    reset: Math.ceil((now + interval * 1000) / 1000),
  }
}

// ── Multi-Layer Rate Limiting ────────────────────────────────

export async function rateLimitWithStrategy(
  primaryId: string,
  strategy: RateLimitStrategy,
  secondaryId?: string
): Promise<RateLimitResult> {
  // Check primary limit (e.g., IP-based)
  const primaryResult = await rateLimit(primaryId, strategy.primary)

  if (!primaryResult.success) {
    return { ...primaryResult, violationType: "primary" }
  }

  // Check secondary limit if configured (e.g., account-based)
  if (strategy.secondary && secondaryId) {
    const secondaryResult = await rateLimit(secondaryId, strategy.secondary)

    if (!secondaryResult.success) {
      return { ...secondaryResult, violationType: "secondary" }
    }
  }

  return primaryResult
}

// ── Preset-Based Rate Limiting ───────────────────────────────

export async function rateLimitByPreset(
  preset: RateLimitPreset,
  primaryId: string,
  secondaryId?: string
): Promise<RateLimitResult> {
  const strategy = RATE_LIMIT_PRESETS[preset]
  return rateLimitWithStrategy(primaryId, strategy, secondaryId)
}

// ── Middleware Helper ────────────────────────────────────────

export class RateLimitError extends Error {
  constructor(
    message: string,
    public result: RateLimitResult
  ) {
    super(message)
    this.name = "RateLimitError"
  }
}

export async function checkRateLimit(
  preset: RateLimitPreset,
  primaryId: string,
  secondaryId?: string
): Promise<RateLimitResult> {
  const result = await rateLimitByPreset(preset, primaryId, secondaryId)

  if (!result.success) {
    const strategy = RATE_LIMIT_PRESETS[preset]
    throw new RateLimitError(strategy.message || "Rate limit exceeded", result)
  }

  return result
}

// ── Manual Reset (for testing/admin) ─────────────────────────

export async function resetRateLimit(identifier: string): Promise<void> {
  const keys = await redis.keys(`rate-limit*:${identifier}`)
  if (keys.length > 0) {
    await redis.del(...keys)
  }
  logger.info({ identifier }, "Rate limit reset")
}

// ── Statistics ───────────────────────────────────────────────

export async function getRateLimitStats(identifier: string): Promise<{
  currentCount: number
  inBackoff: boolean
  backoffExpiresAt?: Date
  violations: number
}> {
  const key = `rate-limit:${identifier}`
  const backoffKey = `rate-limit:backoff:${identifier}`
  const violationKey = `rate-limit:violations:${identifier}`

  const [count, backoffUntil, violations] = await Promise.all([
    redis.zcard(key),
    redis.get(backoffKey),
    redis.get(violationKey),
  ])

  return {
    currentCount: count || 0,
    inBackoff: !!backoffUntil && parseInt(backoffUntil, 10) > Date.now(),
    backoffExpiresAt: backoffUntil ? new Date(parseInt(backoffUntil, 10)) : undefined,
    violations: violations ? parseInt(violations, 10) : 0,
  }
}
