// ============================================================
// lib/socket.ts — Socket.IO server singleton
// ============================================================
import { Server as SocketIOServer } from "socket.io"
import { createServer } from "http"
import { redis } from "./redis"
import { createAdapter } from "@socket.io/redis-adapter"
import { logger } from "@/utils/logger"

let io: SocketIOServer | null = null

/**
 * Initialize Socket.IO server
 * Call this in your Next.js custom server or API route
 */
export function initSocketServer(httpServer: ReturnType<typeof createServer>) {
  if (io) return io

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === "development" 
        ? "http://localhost:3000" 
        : process.env.NEXT_PUBLIC_APP_URL,
      credentials: true,
    },
    transports: ["websocket", "polling"],
  })

  // Use Redis adapter for horizontal scaling
  const pubClient = redis.duplicate()
  const subClient = redis.duplicate()

  io.adapter(createAdapter(pubClient, subClient))

  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id }, "Socket connected")

    socket.on("subscribe:account", (accountId: string) => {
      socket.join(`account:${accountId}`)
      logger.debug({ socketId: socket.id, accountId }, "Subscribed to account")
    })

    socket.on("subscribe:symbol", (ticker: string) => {
      socket.join(`symbol:${ticker}`)
      logger.debug({ socketId: socket.id, ticker }, "Subscribed to symbol")
    })

    socket.on("unsubscribe:account", (accountId: string) => {
      socket.leave(`account:${accountId}`)
    })

    socket.on("unsubscribe:symbol", (ticker: string) => {
      socket.leave(`symbol:${ticker}`)
    })

    socket.on("disconnect", () => {
      logger.info({ socketId: socket.id }, "Socket disconnected")
    })
  })

  logger.info("Socket.IO server initialized")
  return io
}

/**
 * Get the Socket.IO server instance
 */
export function getSocketServer(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.IO server not initialized. Call initSocketServer first.")
  }
  return io
}

// ── Event Emitters ────────────────────────────────────────

/**
 * Emit order update to a specific account
 */
export function emitOrderUpdate(accountId: string, data: any) {
  if (!io) return
  io.to(`account:${accountId}`).emit("order:update", data)
}

/**
 * Emit quote update for a symbol
 */
export function emitQuoteUpdate(ticker: string, data: any) {
  if (!io) return
  io.to(`symbol:${ticker}`).emit("quote:update", data)
}

/**
 * Emit portfolio update to a specific account
 */
export function emitPortfolioUpdate(accountId: string, data: any) {
  if (!io) return
  io.to(`account:${accountId}`).emit("portfolio:update", data)
}

/**
 * Emit notification to a user
 */
export function emitNotification(userId: string, data: any) {
  if (!io) return
  io.to(`user:${userId}`).emit("notification", data)
}
