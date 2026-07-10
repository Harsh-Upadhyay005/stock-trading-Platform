// ============================================================
// workers/order.worker.ts — BullMQ order processor
// Run with: npx tsx workers/order.worker.ts
// ============================================================
import { Worker, type Job } from "bullmq"
import { redis } from "@/lib/redis"
import { db } from "@/lib/db"
import { getBroker } from "@/lib/brokers"
import { notificationQueue, QUEUE_NAMES, type OrderJobData } from "@/lib/queue"
import { emitOrderUpdate } from "@/lib/socket"
import { logger } from "@/utils/logger"

// Initialize broker
const broker = getBroker()

const worker = new Worker<OrderJobData>(
  QUEUE_NAMES.ORDERS,
  async (job: Job<OrderJobData>) => {
    const { orderId, accountId, userId } = job.data
    logger.info({ orderId, jobId: job.id }, "Processing order")

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        symbol: { include: { quote: true, exchange: true } },
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

    // Connect to broker if not connected
    if (!broker.isConnected()) {
      await broker.connect()
    }

    try {
      // ── Mark as OPEN ────────────────────────────────────────
      await db.order.update({
        where: { id: orderId },
        data: { status: "OPEN" },
      })

      // ── Place order with broker ────────────────────────────
      const brokerResponse = await broker.placeOrder({
        symbol: order.symbol.ticker,
        side: order.side as any,
        type: order.type as any,
        quantity: Number(order.quantity),
        limitPrice: order.limitPrice ? Number(order.limitPrice) : undefined,
        stopPrice: order.stopPrice ? Number(order.stopPrice) : undefined,
        duration: order.duration as any,
      })

      logger.info(
        { orderId, brokerOrderId: brokerResponse.brokerOrderId },
        "Order placed with broker"
      )

      // ── Handle order response ──────────────────────────────
      if (brokerResponse.status === "FILLED") {
        // Order filled immediately (market orders)
        await handleOrderFill(order, brokerResponse, accountId, userId)
      } else if (brokerResponse.status === "REJECTED") {
        // Order rejected by broker
        await db.order.update({
          where: { id: orderId },
          data: {
            status: "REJECTED",
            rejectionReason: brokerResponse.message || "Rejected by broker",
          },
        })

        emitOrderUpdate(accountId, {
          type: "ORDER_REJECTED",
          orderId,
          reason: brokerResponse.message,
        })
      } else {
        // Order pending/open - will be filled later
        // In production, you'd poll broker API or use webhooks
        logger.info({ orderId, status: brokerResponse.status }, "Order pending execution")
      }
    } catch (err: any) {
      logger.error({ err, orderId }, "Order processing failed")

      // Mark order as rejected
      await db.order.update({
        where: { id: orderId },
        data: {
          status: "REJECTED",
          rejectionReason: err.message || "Processing failed",
        },
      })

      throw err
    }
  },
  {
    connection: redis as any,
    concurrency: 10,
  }
)

async function handleOrderFill(order: any, brokerResponse: any, accountId: string, userId: string) {
  const fillPrice = brokerResponse.avgFillPrice!
  const filledQuantity = brokerResponse.filledQuantity
  const filledAmount = fillPrice * filledQuantity

  const commission = filledAmount * 0.0003 // 0.03% brokerage
  const tax = filledAmount * 0.00015 // STT approximation
  const netAmount =
    order.side === "BUY" || order.side === "BUY_TO_COVER"
      ? -(filledAmount + commission + tax)
      : filledAmount - commission - tax

  // Record fill + update order atomically
  await db.$transaction(async (tx) => {
    await tx.orderFill.create({
      data: {
        orderId: order.id,
        quantity: filledQuantity,
        price: fillPrice,
        commission,
        tax,
      },
    })

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "FILLED",
        filledQuantity,
        remainingQuantity: 0,
        avgFillPrice: fillPrice,
        filledAmount,
        commission,
        tax,
        netAmount,
        filledAt: new Date(),
      },
    })

    // Update account cash balance
    await tx.tradingAccount.update({
      where: { id: accountId },
      data: {
        cashBalance: { increment: netAmount },
        buyingPower: { increment: netAmount },
      },
    })

    // Update or create position
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
          quantity: filledQuantity,
          avgCostBasis: fillPrice,
          currentPrice: fillPrice,
          marketValue: filledAmount,
          unrealizedPnl: 0,
          unrealizedPnlPct: 0,
        },
        update: {
          quantity: { increment: filledQuantity },
          currentPrice: fillPrice,
          marketValue: { increment: filledAmount },
        },
      })
    } else if (order.side === "SELL") {
      // Reduce position
      const position = await tx.position.findFirst({
        where: { accountId, symbolId: order.symbolId, side: "LONG" },
      })

      if (position) {
        const newQuantity = Number(position.quantity) - filledQuantity
        if (newQuantity <= 0) {
          await tx.position.delete({ where: { id: position.id } })
        } else {
          await tx.position.update({
            where: { id: position.id },
            data: {
              quantity: newQuantity,
              marketValue: newQuantity * fillPrice,
            },
          })
        }
      }
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
        netAmount: Math.abs(netAmount),
        balanceBefore: cashBefore,
        balanceAfter: cashBefore + netAmount,
        referenceId: order.id,
        processedAt: new Date(),
      },
    })
  })

  // Notify user
  await notificationQueue.add("send" as never, {
    userId,
    type: "ORDER_FILLED",
    channel: "IN_APP",
    title: "Order Filled",
    body: `Your ${order.side} order for ${filledQuantity} shares of ${order.symbol.ticker} was filled at ${order.symbol.currency} ${fillPrice.toFixed(2)}`,
    data: { orderId: order.id, fillPrice, filledQuantity },
  })

  emitOrderUpdate(accountId, {
    type: "ORDER_FILLED",
    orderId: order.id,
    fillPrice,
    quantity: filledQuantity,
  })

  logger.info({ orderId: order.id, fillPrice }, "Order filled successfully")
}

worker.on("completed", (job) => {
  logger.info({ jobId: job.id }, "Order job completed")
})

worker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, err }, "Order job failed")
})

export { worker as orderWorker }