// ============================================================
// lib/queue.ts — BullMQ queue definitions
// ============================================================
import { Queue } from "bullmq"
import { redis } from "./redis"

export const QUEUE_NAMES = {
  ORDERS: "orders",
  ALERTS: "alerts",
  NOTIFICATIONS: "notifications",
} as const

// ── Queue Type Definitions ────────────────────────────────

export type OrderJobData = {
  orderId: string
  accountId: string
  userId: string
}

export type AlertJobData = {
  symbolId: string
  ticker: string
  lastPrice: number
  volume?: number
}

export type NotificationJobData = {
  userId: string
  type: string
  channel: string
  title: string
  body: string
  data?: Record<string, any>
}

// ── Queue Instances ───────────────────────────────────────

const redisConnection = {
  host: redis.options.host,
  port: redis.options.port,
  password: redis.options.password,
}

export const orderQueue = new Queue<OrderJobData>(QUEUE_NAMES.ORDERS, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
})

export const alertQueue = new Queue<AlertJobData>(QUEUE_NAMES.ALERTS, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: 50,
    removeOnFail: 100,
  },
})

export const notificationQueue = new Queue<NotificationJobData>(
  QUEUE_NAMES.NOTIFICATIONS,
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: 50,
      removeOnFail: 100,
    },
  }
)
