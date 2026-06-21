// ============================================================
// services/order.service.ts — Order lifecycle management
// ============================================================
import { db } from "@/lib/db"
import { orderQueue } from "@/lib/queue"
import { emitOrderUpdate } from "@/lib/socket"
import { logger } from "@/utils/logger"
import type { CreateOrderInput, UpdateOrderInput, OrderQueryInput } from "@/validators/order.schema"
import type { OrderWithDetails } from "@/types/order"
import type { Prisma } from "../../generated/prisma"

export class OrderService {
  // ── Create Order ──────────────────────────────────────────

  async createOrder(userId: string, input: CreateOrderInput): Promise<OrderWithDetails> {
    // 1. Verify account ownership
    const account = await db.tradingAccount.findFirst({
      where: { id: input.accountId, userId, status: "ACTIVE" },
    })
    if (!account) {
      throw new ServiceError("Trading account not found or inactive", "ACCOUNT_NOT_FOUND", 404)
    }

    // 2. Verify symbol is tradable
    const symbol = await db.symbol.findFirst({
      where: { id: input.symbolId, isActive: true, isTradable: true },
    })
    if (!symbol) {
      throw new ServiceError("Symbol not found or not tradable", "SYMBOL_NOT_TRADABLE", 422)
    }

    // 3. Check buying power for BUY orders
    if (input.side === "BUY" || input.side === "BUY_TO_COVER") {
      const quote = await db.quote.findUnique({ where: { symbolId: symbol.id } })
      const estimatedPrice = input.limitPrice ?? (quote ? Number(quote.lastPrice) : null)

      if (!estimatedPrice) {
        throw new ServiceError("Cannot estimate order value — no price available", "NO_PRICE", 422)
      }

      const estimatedCost = estimatedPrice * input.quantity * Number(symbol.lotSize)
      if (Number(account.buyingPower) < estimatedCost) {
        throw new ServiceError(
          `Insufficient buying power. Required: ${estimatedCost.toFixed(2)}, Available: ${Number(account.buyingPower).toFixed(2)}`,
          "INSUFFICIENT_FUNDS",
          422
        )
      }
    }

    // 4. Check short-selling permissions
    if (input.side === "SELL_SHORT") {
      const riskProfile = await db.riskProfile.findUnique({ where: { userId } })
      if (!riskProfile?.shortSellingAllowed) {
        throw new ServiceError("Short selling not permitted on this account", "SHORT_NOT_ALLOWED", 403)
      }
    }

    // 5. Create order
    const order = await db.order.create({
      data: {
        accountId: input.accountId,
        symbolId: input.symbolId,
        clientOrderId: input.clientOrderId,
        side: input.side,
        type: input.type,
        duration: input.duration,
        status: "PENDING",
        quantity: input.quantity,
        filledQuantity: 0,
        remainingQuantity: input.quantity,
        limitPrice: input.limitPrice,
        stopPrice: input.stopPrice,
        trailAmount: input.trailAmount,
        trailPercent: input.trailPercent,
        extendedHours: input.extendedHours,
        notes: input.notes,
      },
      include: {
        symbol: { select: { id: true, ticker: true, name: true, currency: true, assetClass: true } },
        fills: true,
      },
    })

    // 6. Enqueue for async processing
    await orderQueue.add("process", {
      orderId: order.id,
      accountId: input.accountId,
      userId,
    })

    // 7. Emit real-time update
    emitOrderUpdate(input.accountId, { type: "ORDER_CREATED", order })

    logger.info({ orderId: order.id, userId, side: input.side, symbol: symbol.ticker }, "Order created")
    return order as OrderWithDetails
  }

  // ── List Orders ───────────────────────────────────────────

  async listOrders(
    userId: string,
    input: OrderQueryInput
  ): Promise<{ orders: OrderWithDetails[]; total: number }> {
    const where: Prisma.OrderWhereInput = {
      account: { userId },
      ...(input.accountId && { accountId: input.accountId }),
      ...(input.status && { status: input.status }),
      ...(input.side && { side: input.side }),
      ...(input.symbolId && { symbolId: input.symbolId }),
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          symbol: { select: { id: true, ticker: true, name: true, currency: true, assetClass: true } },
          fills: true,
        },
        orderBy: { [input.sortBy]: input.sortOrder },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      db.order.count({ where }),
    ])

    return { orders: orders as OrderWithDetails[], total }
  }

  // ── Get Single Order ──────────────────────────────────────

  async getOrder(userId: string, orderId: string): Promise<OrderWithDetails> {
    const order = await db.order.findFirst({
      where: { id: orderId, account: { userId } },
      include: {
        symbol: { select: { id: true, ticker: true, name: true, currency: true, assetClass: true } },
        fills: true,
      },
    })

    if (!order) throw new ServiceError("Order not found", "ORDER_NOT_FOUND", 404)
    return order as OrderWithDetails
  }

  // ── Update Order ──────────────────────────────────────────

  async updateOrder(
    userId: string,
    orderId: string,
    input: UpdateOrderInput
  ): Promise<OrderWithDetails> {
    const order = await db.order.findFirst({
      where: { id: orderId, account: { userId } },
    })

    if (!order) throw new ServiceError("Order not found", "ORDER_NOT_FOUND", 404)

    if (!["PENDING", "OPEN"].includes(order.status)) {
      throw new ServiceError(
        `Cannot modify order with status: ${order.status}`,
        "ORDER_NOT_MODIFIABLE",
        422
      )
    }

    const updated = await db.order.update({
      where: { id: orderId },
      data: {
        ...(input.limitPrice !== undefined && { limitPrice: input.limitPrice }),
        ...(input.stopPrice !== undefined && { stopPrice: input.stopPrice }),
        ...(input.quantity !== undefined && {
          quantity: input.quantity,
          remainingQuantity: input.quantity - Number(order.filledQuantity),
        }),
      },
      include: {
        symbol: { select: { id: true, ticker: true, name: true, currency: true, assetClass: true } },
        fills: true,
      },
    })

    emitOrderUpdate(order.accountId, { type: "ORDER_UPDATED", order: updated })
    return updated as OrderWithDetails
  }

  // ── Cancel Order ──────────────────────────────────────────

  async cancelOrder(userId: string, orderId: string): Promise<OrderWithDetails> {
    const order = await db.order.findFirst({
      where: { id: orderId, account: { userId } },
    })

    if (!order) throw new ServiceError("Order not found", "ORDER_NOT_FOUND", 404)

    if (!["PENDING", "OPEN", "PARTIALLY_FILLED"].includes(order.status)) {
      throw new ServiceError(
        `Cannot cancel order with status: ${order.status}`,
        "ORDER_NOT_CANCELLABLE",
        422
      )
    }

    const cancelled = await db.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED", cancelledAt: new Date() },
      include: {
        symbol: { select: { id: true, ticker: true, name: true, currency: true, assetClass: true } },
        fills: true,
      },
    })

    emitOrderUpdate(order.accountId, { type: "ORDER_CANCELLED", order: cancelled })
    logger.info({ orderId, userId }, "Order cancelled")
    return cancelled as OrderWithDetails
  }

  // ── Delete Order (soft — only PENDING before enqueue) ─────

  async deleteOrder(userId: string, orderId: string): Promise<void> {
    const order = await db.order.findFirst({
      where: { id: orderId, account: { userId }, status: "PENDING" },
    })

    if (!order) {
      throw new ServiceError("Order not found or cannot be deleted", "ORDER_NOT_DELETABLE", 404)
    }

    await db.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    })
  }
}

export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message)
    this.name = "ServiceError"
  }
}

export const orderService = new OrderService()