// ============================================================
// lib/redis.ts — Redis client singleton
// ============================================================
import Redis from "ioredis"

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
  })

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis

redis.on("error", (err) => {
  console.error("Redis connection error:", err)
})

redis.on("connect", () => {
  console.log("Redis connected")
})
