// ============================================================
// utils/logger.ts — Pino structured logger
// ============================================================
import pino from "pino"

const isDev = process.env.NODE_ENV === "development"

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
  ...(isDev && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
      },
    },
  }),
  base: {
    service: "trading-platform",
    env: process.env.NODE_ENV,
  },
})

export type Logger = typeof logger