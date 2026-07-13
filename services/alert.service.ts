// ============================================================
// services/alert.service.ts — Alert evaluation engine
// ============================================================
import { db } from "@/lib/db"
import { notificationQueue } from "@/lib/queue"
import { logger } from "@/utils/logger"
import { ServiceError } from "./order.service"
import type { CreateAlertInput, UpdateAlertInput, AlertQueryInput } from "@/validators/alert.schema"
import type { Prisma } from "../generated/prisma"

export class AlertService {
  // ── CRUD ──────────────────────────────────────────────────

  async createAlert(userId: string, input: CreateAlertInput) {
    const symbol = await db.symbol.findUnique({ where: { id: input.symbolId } })
    if (!symbol) throw new ServiceError("Symbol not found", "SYMBOL_NOT_FOUND", 404)

    // Check for duplicate active alert
    const existingAlert = await db.priceAlert.findFirst({
      where: {
        userId,
        symbolId: input.symbolId,
        type: input.type,
        status: "ACTIVE",
        targetValue: input.targetValue,
      },
    })

    if (existingAlert) {
      throw new ServiceError(
        "Similar active alert already exists for this symbol",
        "DUPLICATE_ALERT",
        409
      )
    }

    return db.priceAlert.create({
      data: {
        userId,
        symbolId: input.symbolId,
        type: input.type,
        targetValue: input.targetValue,
        message: input.message,
        expiresAt: input.expiresAt,
        status: "ACTIVE",
      },
      include: { symbol: { select: { ticker: true, name: true, exchange: true } } },
    })
  }

  async listAlerts(userId: string, input: AlertQueryInput) {
    const where: Prisma.PriceAlertWhereInput = {
      userId,
      ...(input.symbolId && { symbolId: input.symbolId }),
      ...(input.type && { type: input.type }),
      ...(input.status && { status: input.status }),
    }

    const [alerts, total] = await Promise.all([
      db.priceAlert.findMany({
        where,
        include: {
          symbol: {
            select: { ticker: true, name: true, logoUrl: true, exchange: { select: { code: true } } },
          },
        },
        orderBy: { [input.sortBy]: input.sortOrder },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      db.priceAlert.count({ where }),
    ])

    return { alerts, total }
  }

  async getAlert(userId: string, alertId: string) {
    const alert = await db.priceAlert.findFirst({
      where: { id: alertId, userId },
      include: {
        symbol: {
          select: {
            ticker: true,
            name: true,
            logoUrl: true,
            exchange: { select: { code: true } },
            quote: true,
          },
        },
      },
    })

    if (!alert) throw new ServiceError("Alert not found", "ALERT_NOT_FOUND", 404)
    return alert
  }

  async updateAlert(userId: string, alertId: string, input: UpdateAlertInput) {
    const alert = await db.priceAlert.findFirst({ where: { id: alertId, userId } })
    if (!alert) throw new ServiceError("Alert not found", "ALERT_NOT_FOUND", 404)

    return db.priceAlert.update({
      where: { id: alertId },
      data: {
        ...(input.targetValue !== undefined && { targetValue: input.targetValue }),
        ...(input.message !== undefined && { message: input.message }),
        ...(input.expiresAt !== undefined && { expiresAt: input.expiresAt }),
        ...(input.status && { status: input.status }),
        // Reactivate on update if not explicitly setting status
        ...(!input.status && { status: "ACTIVE", triggeredAt: null }),
      },
      include: {
        symbol: { select: { ticker: true, name: true, exchange: { select: { code: true } } } },
      },
    })
  }

  async deleteAlert(userId: string, alertId: string): Promise<void> {
    const alert = await db.priceAlert.findFirst({ where: { id: alertId, userId } })
    if (!alert) throw new ServiceError("Alert not found", "ALERT_NOT_FOUND", 404)
    await db.priceAlert.delete({ where: { id: alertId } })
  }

  async cancelAlert(userId: string, alertId: string) {
    const alert = await db.priceAlert.findFirst({ where: { id: alertId, userId } })
    if (!alert) throw new ServiceError("Alert not found", "ALERT_NOT_FOUND", 404)

    return db.priceAlert.update({
      where: { id: alertId },
      data: { status: "CANCELLED" },
      include: {
        symbol: { select: { ticker: true, name: true, exchange: { select: { code: true } } } },
      },
    })
  }

  // ── Bulk Operations ───────────────────────────────────────

  async deleteExpiredAlerts(): Promise<number> {
    const result = await db.priceAlert.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
        status: { in: ["ACTIVE", "EXPIRED"] },
      },
    })

    logger.info({ deleted: result.count }, "Cleaned up expired alerts")
    return result.count
  }

  async markExpiredAlerts(): Promise<number> {
    const result = await db.priceAlert.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        status: "ACTIVE",
      },
      data: { status: "EXPIRED" },
    })

    return result.count
  }

  // ── Evaluation (called by alert worker) ───────────────────

  async evaluateAlerts(symbolId: string, lastPrice: number, volume?: number): Promise<void> {
    // Get symbol data for context
    const symbol = await db.symbol.findUnique({
      where: { id: symbolId },
      include: { quote: true },
    })

    if (!symbol) {
      logger.warn({ symbolId }, "Symbol not found for alert evaluation")
      return
    }

    const activeAlerts = await db.priceAlert.findMany({
      where: {
        symbolId,
        status: "ACTIVE",
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: {
        user: { select: { id: true, email: true } },
        symbol: { select: { ticker: true, name: true } },
      },
    })

    if (activeAlerts.length === 0) return

    const triggeredIds: string[] = []
    const previousClose = symbol.quote ? Number(symbol.quote.previousClose) : lastPrice
    const percentChange = previousClose > 0 ? ((lastPrice - previousClose) / previousClose) * 100 : 0

    for (const alert of activeAlerts) {
      let triggered = false
      let message = alert.message

      switch (alert.type) {
        case "PRICE_ABOVE":
          triggered = lastPrice >= Number(alert.targetValue)
          if (triggered && !message) {
            message = `${alert.symbol.ticker} is now above ${Number(alert.targetValue).toFixed(2)} at ${lastPrice.toFixed(2)}`
          }
          break

        case "PRICE_BELOW":
          triggered = lastPrice <= Number(alert.targetValue)
          if (triggered && !message) {
            message = `${alert.symbol.ticker} is now below ${Number(alert.targetValue).toFixed(2)} at ${lastPrice.toFixed(2)}`
          }
          break

        case "PERCENT_CHANGE":
          // targetValue = threshold percent (positive or negative)
          const targetPct = Number(alert.targetValue)
          if (targetPct > 0) {
            triggered = percentChange >= targetPct
          } else {
            triggered = percentChange <= targetPct
          }
          if (triggered && !message) {
            message = `${alert.symbol.ticker} changed by ${percentChange.toFixed(2)}% (target: ${targetPct.toFixed(2)}%)`
          }
          break

        case "VOLUME_SPIKE":
          if (volume !== undefined) {
            triggered = volume >= Number(alert.targetValue)
            if (triggered && !message) {
              message = `${alert.symbol.ticker} volume spike: ${volume.toLocaleString()} (target: ${Number(alert.targetValue).toLocaleString()})`
            }
          }
          break

        case "NEWS":
        case "EARNINGS":
        case "DIVIDEND":
          // These would be triggered by external events, not price
          // Handled separately
          break

        default:
          logger.warn({ alertId: alert.id, type: alert.type }, "Unknown alert type")
      }

      if (triggered) {
        triggeredIds.push(alert.id)

        // Queue notification
        await notificationQueue.add("send" as never, {
          userId: alert.userId,
          type: "PRICE_ALERT",
          channel: "IN_APP",
          title: `🔔 ${alert.symbol.ticker} Alert Triggered`,
          body: message ?? `Your alert for ${alert.symbol.ticker} has been triggered`,
          data: {
            alertId: alert.id,
            symbolId,
            ticker: alert.symbol.ticker,
            lastPrice,
            percentChange,
            volume,
          },
        })

        logger.info(
          {
            alertId: alert.id,
            userId: alert.userId,
            ticker: alert.symbol.ticker,
            type: alert.type,
            lastPrice,
          },
          "Alert triggered"
        )
      }
    }

    if (triggeredIds.length > 0) {
      await db.priceAlert.updateMany({
        where: { id: { in: triggeredIds } },
        data: { status: "TRIGGERED", triggeredAt: new Date() },
      })

      logger.info(
        { symbolId, ticker: symbol.ticker, triggeredCount: triggeredIds.length },
        "Alerts processed"
      )
    }
  }
}

export const alertService = new AlertService()