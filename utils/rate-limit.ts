// ============================================================
// utils/rate-limit.ts — Sliding window rate limiter via Redis
// ============================================================
import { redis } from "@/lib/redis"
import { tooManyRequests } from "@/utils/response"
import type { NextRequest } from "next/server"

export type RateLimitOptions = {
  /** Max requests in window */
  limit: number
  /** Window size in seconds */
  windowSec: number
  /** Key prefix to namespace limits */
  prefix?: string
}

export type RateLimitResult =
  | { limited: false; remaining: number; reset: number }
  | { limited: true; response: ReturnType<typeof tooManyRequests> }

/**
 * Sliding window rate limiter.
 * Returns { limited: false } if under limit, or { limited: true, response } to return immediately.
 */
export async function rateLimit(
  identifier: string,
  opts: RateLimitOptions
): Promise<RateLimitResult> {
  const { limit, windowSec, prefix = "rl" } = opts
  const key = `${prefix}:${identifier}`
  const now = Date.now()
  const windowMs = windowSec * 1000

  const pipeline = redis.pipeline()
  pipeline.zremrangebyscore(key, 0, now - windowMs)
  pipeline.zadd(key, now, `${now}-${Math.random()}`)
  pipeline.zcard(key)
  pipeline.pexpire(key, windowMs)

  const results = await pipeline.exec()
  const count = (results?.[2]?.[1] as number) ?? 0
  const reset = Math.ceil((now + windowMs) / 1000)

  if (count > limit) {
    return {
      limited: true,
      response: tooManyRequests(`Rate limit exceeded. Try again after ${reset}`),
    }
  }

  return { limited: false, remaining: limit - count, reset }
}

/** Convenience: extract identifier from request (userId header or IP) */
export function getIdentifier(req: NextRequest, userId?: string): string {
  if (userId) return `user:${userId}`
  const forwarded = req.headers.get("x-forwarded-for")
  return `ip:${forwarded?.split(",")[0]?.trim() ?? "unknown"}`
}