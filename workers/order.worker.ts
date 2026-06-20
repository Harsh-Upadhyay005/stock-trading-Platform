// ============================================================
// workers/order.worker.ts — BullMQ order processor
// Run with: npx ts-node -r tsconfig-paths/register src/workers/order.worker.ts
// ============================================================
import { Worker, type Job } from "bullmq"
import { redis } from "@/lib/redis"
import { db } from "@/lib/db"
import { notificationQueue, QUEUE_NAMES, type OrderJobData } from "@/lib/queue"
import { emitOrderUpdate } from "@/lib/socket"
import { logger } from "@/utils/logger"

const worker = new Worker<OrderJobData>(
  QUEUE_NAMES.ORDERS,
  async (job: Job<OrderJobData>) => {
    const { orderId, accountId, userId } = job.data
    logger.info({ orderId, jobId: job.id }, "Processing order")

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        symbol: { include: { quote: true } },
        account: true,
      },
    })

    if (!order) {
      logger.warn({ orderId }, "Order not found in worker — skipping")
      return
    }

    if (order.status !== "PENDING") {
      logger.warn({ orderId, status: order.status }, "Order already processed")
      return
    }

    // ── Mark as OPEN ────────────────────────────────────────
    await db.order.update({
      where: { id: orderId },
      data: { status: "OPEN" },
    })

    // ── Simulate execution (replace with real broker integration) ───
    // In production: call your broker API (Zerodha Kite / Alpaca / etc.)
    // For now: MARKET orders execute immediately at current price

    if (order.type === "MARKET") {
      const fillPrice = order.symbol.quote
        ? Number(order.symbol.quote.lastPrice)
        : Number(order.limitPrice ?? 0)

      if (fillPrice <= 0) {
        await db.order.update({
          where: { id: orderId },
          data: { status: "REJECTED", rejectionReason: "No price available for market order" },
        })
        return
      }

      const commission = fillPrice * Number(order.quantity) * 0.0003 // 0.03% brokerage
      const tax = fillPrice * Number(order.quantity) * 0.00015 // STT approximation
      const filledAmount = fillPrice * Number(order.quantity)

      // Record fill + update order atomically
      await db.$transaction(async (tx) => {
        await tx.orderFill.create({
          data: {
            orderId,
            quantity: order.quantity,
            price: fillPrice,
            commission,
            tax,
          },
        })

        await tx.order.update({
          where: { id: orderId },
          data: {
            status: "FILLED",
            filledQuantity: order.quantity,
            remainingQuantity: 0,
            avgFillPrice: fillPrice,
            filledAmount,
            commission,
            tax,
            netAmount:
              order.side === "BUY" || order.side === "BUY_TO_COVER"
                ? -(filledAmount + commission + tax)
                : filledAmount - commission - tax,
            filledAt: new Date(),
          },
        })

        // Update account cash balance
        const net =
          order.side === "BUY" || order.side === "BUY_TO_COVER"
            ? -(filledAmount + commission + tax)
            : filledAmount - commission - tax

        await tx.tradingAccount.update({
          where: { id: accountId },
          data: {
            cashBalance: { increment: net },
            buyingPower: { increment: net },
          },
        })

        // Upsert position
        if (order.side === "BUY" || order.side === "BUY_TO_COVER") {
          await tx.position.upsert({
            where: {
              accountId_symbolId_side: {
                accountId,
                symbolId: order.symbolId,
                side: "LONG",
              },
            },
            create: {
              accountId,
              symbolId: order.symbolId,
              side: "LONG",
              quantity: order.quantity,
              avgCostBasis: fillPrice,
              currentPrice: fillPrice,
              marketValue: filledAmount,
              unrealizedPnl: 0,
              unrealizedPnlPct: 0,
            },
            update: {
              quantity: { increment: Number(order.quantity) },
              currentPrice: fillPrice,
              marketValue: { increment: filledAmount },
            },
          })
        }

        // Record transaction
        const cashBefore = Number(order.account.cashBalance)
        await tx.transaction.create({
          data: {
            accountId,
            type: order.side === "BUY" ? "TRADE_BUY" : "TRADE_SELL",
            status: "COMPLETED",
            amount: filledAmount,
            fee: commission,
            tax,
            netAmount: Math.abs(net),
            balanceBefore: cashBefore,
            balanceAfter: cashBefore + net,
            referenceId: orderId,
            processedAt: new Date(),
          },
        })
      })

      // Notify user
      await notificationQueue.add("send", {
        userId,
        type: "ORDER_FILLED",
        channel: "IN_APP",
        title: "Order Filled",
        body: `Your ${order.side} order for ${Number(order.quantity)} shares of ${order.symbol.ticker} was filled at ₹${fillPrice.toFixed(2)}`,
        data: { orderId, fillPrice },
      })

      emitOrderUpdate(accountId, {
        type: "ORDER_FILLED",
        orderId,
        fillPrice,
        quantity: Number(order.quantity),
      })

      logger.info({ orderId, fillPrice }, "Order filled successfully")
    }
  },
  {
    connection: redis,
    concurrency: 10,
  }
)

worker.on("completed", (job) => {
  logger.info({ jobId: job.id }, "Order job completed")
})

worker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, err }, "Order job failed")
})

export { worker as orderWorker }