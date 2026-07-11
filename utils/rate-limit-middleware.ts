// ============================================================
// utils/rate-limit-middleware.ts — Rate limit middleware for Next.js
// ============================================================
import { type NextRequest, NextResponse } from "next/server"
import { rateLimitByPreset, RateLimitError, type RateLimitPreset } from "./rate-limit"
import { logger } from "./logger"

/**
 * Get identifier from request
 * Uses IP address as primary identifier
 */
export function getClientIdentifier(req: NextRequest): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwardedFor = req.headers.get("x-forwarded-for")
  const realIp = req.headers.get("x-real-ip")
  
  const ip = forwardedFor?.split(",")[0].trim() || realIp || req.ip || "unknown"
  
  return `ip:${ip}`
}

/**
 * Get user identifier for secondary rate limiting
 */
export function getUserIdentifier(userId?: string): string | undefined {
  return userId ? `user:${userId}` : undefined
}

/**
 * Rate limit middleware for API routes
 * 
 * @example
 * // In your API route:
 * export async function POST(req: NextRequest) {
 *   // Apply rate limit
 *   const rateLimitResult = await applyRateLimit(req, "auth")
 *   if (!rateLimitResult.success) {
 *     return rateLimitResult.response
 *   }
 *   
 *   // Your route logic...
 * }
 */
export async function applyRateLimit(
  req: NextRequest,
  preset: RateLimitPreset,
  userId?: string
): Promise<{ success: true; remaining: number } | { success: false; response: NextResponse }> {
  const primaryId = getClientIdentifier(req)
  const secondaryId = getUserIdentifier(userId)

  try {
    const result = await rateLimitByPreset(preset, primaryId, secondaryId)

    // Add rate limit headers to response
    const headers = {
      "X-RateLimit-Limit": result.limit.toString(),
      "X-RateLimit-Remaining": result.remaining.toString(),
      "X-RateLimit-Reset": result.reset.toString(),
    }

    // Log for monitoring
    if (result.remaining < 5) {
      logger.warn(
        { primaryId, secondaryId, remaining: result.remaining, preset },
        "Rate limit approaching"
      )
    }

    return { success: true, remaining: result.remaining }
  } catch (err) {
    if (err instanceof RateLimitError) {
      const { result } = err

      logger.warn(
        {
          primaryId,
          secondaryId,
          preset,
          violationType: result.violationType,
          retryAfter: result.retryAfter,
        },
        "Rate limit exceeded"
      )

      const headers: Record<string, string> = {
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": result.reset.toString(),
      }

      if (result.retryAfter) {
        headers["Retry-After"] = result.retryAfter.toString()
      }

      return {
        success: false,
        response: NextResponse.json(
          {
            success: false,
            error: {
              code: "RATE_LIMIT_EXCEEDED",
              message: err.message,
              retryAfter: result.retryAfter,
            },
          },
          {
            status: 429,
            headers,
          }
        ),
      }
    }

    // Unexpected error - log and fail open (allow request)
    logger.error({ err, primaryId, preset }, "Rate limit check failed")
    return { success: true, remaining: 999 }
  }
}

/**
 * Higher-order function to wrap API route handlers with rate limiting
 * 
 * @example
 * export const POST = withRateLimit("auth", async (req: NextRequest) => {
 *   // Your route logic - rate limit already checked
 *   return NextResponse.json({ success: true })
 * })
 */
export function withRateLimit(
  preset: RateLimitPreset,
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    // Apply rate limit
    const rateLimitResult = await applyRateLimit(req, preset)
    
    if (!rateLimitResult.success) {
      return rateLimitResult.response
    }

    // Continue to handler
    return handler(req, ...args)
  }
}

/**
 * Advanced: Rate limit with custom user ID extraction
 * 
 * @example
 * export const POST = withRateLimitAndUser(
 *   "authenticated",
 *   (req) => getUserIdFromToken(req),
 *   async (req: NextRequest) => {
 *     // Your route logic
 *   }
 * )
 */
export function withRateLimitAndUser(
  preset: RateLimitPreset,
  getUserId: (req: NextRequest) => string | undefined | Promise<string | undefined>,
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    // Extract user ID
    const userId = await getUserId(req)

    // Apply rate limit with user ID for secondary check
    const rateLimitResult = await applyRateLimit(req, preset, userId)
    
    if (!rateLimitResult.success) {
      return rateLimitResult.response
    }

    // Continue to handler
    return handler(req, ...args)
  }
}
