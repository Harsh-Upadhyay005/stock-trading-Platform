// ============================================================
// services/portfolio.service.ts — P&L and holdings
// ============================================================
import { db } from "@/lib/db"
import { redis } from "@/lib/redis"
import { ServiceError } from "./order.service"

export type PortfolioSummary = {
  accountId: string
  accountNumber: string
  accountType: string
  currency: string
  cashBalance: number
  investedValue: number
  totalPortfolioValue: number
  dayPnl: number
  dayPnlPct: number
  totalPnl: number
  totalPnlPct: number
  buyingPower: number
  marginUsed: number
  positionsCount: number
}

export type Holding = {
  symbolId: string
  ticker: string
  name: string
  exchange: string
  assetClass: string
  currency: string
  side: string
  quantity: number
  avgCostBasis: number
  currentPrice: number
  marketValue: number
  unrealizedPnl: number
  unrealizedPnlPct: number
  realizedPnl: number
  dayPnl: number
  weightPct: number
}

const PORTFOLIO_CACHE_TTL = 10 // seconds

export class PortfolioService {
  async getSummary(userId: string, accountId?: string): Promise<PortfolioSummary[]> {
    const cacheKey = `portfolio:${userId}:${accountId ?? "all"}`
    const cached = await redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const accounts = await db.tradingAccount.findMany({
      where: {
        userId,
        status: { not: "CLOSED" },
        ...(accountId && { id: accountId }),
      },
      include: {
        positions: {
          include: {
            symbol: {
              include: { quote: true },
            },
          },
        },
      },
    })

    const summaries: PortfolioSummary[] = accounts.map((account) => {
      const investedValue = account.positions.reduce(
        (sum, p) => sum + Number(p.marketValue),
        0
      )
      const dayPnl = account.positions.reduce((sum, p) => sum + Number(p.dayPnl), 0)
      const totalPnl = account.positions.reduce((sum, p) => sum + Number(p.unrealizedPnl), 0)
      const totalValue = Number(account.cashBalance) + investedValue
      const costBasis = totalValue - totalPnl

      return {
        accountId: account.id,
        accountNumber: account.accountNumber,
        accountType: account.type,
        currency: account.currency,
        cashBalance: Number(account.cashBalance),
        investedValue,
        totalPortfolioValue: totalValue,
        dayPnl,
        dayPnlPct: totalValue > 0 ? (dayPnl / (totalValue - dayPnl)) * 100 : 0,
        totalPnl,
        totalPnlPct: costBasis > 0 ? (totalPnl / costBasis) * 100 : 0,
        buyingPower: Number(account.buyingPower),
        marginUsed: Number(account.marginUsed),
        positionsCount: account.positions.length,
      }
    })

    await redis.setex(cacheKey, PORTFOLIO_CACHE_TTL, JSON.stringify(summaries))
    return summaries
  }

  async getHoldings(userId: string, accountId: string): Promise<Holding[]> {
    const cacheKey = `holdings:${accountId}`
    const cached = await redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const account = await db.tradingAccount.findFirst({
      where: { id: accountId, userId, status: { not: "CLOSED" } },
    })

    if (!account) throw new ServiceError("Account not found", "ACCOUNT_NOT_FOUND", 404)

    const positions = await db.position.findMany({
      where: { accountId },
      include: {
        symbol: {
          include: {
            exchange: true,
            quote: true,
          },
        },
      },
      orderBy: { marketValue: "desc" },
    })

    const totalValue = positions.reduce((sum, p) => sum + Number(p.marketValue), 0)

    const holdings: Holding[] = positions.map((p) => ({
      symbolId: p.symbolId,
      ticker: p.symbol.ticker,
      name: p.symbol.name,
      exchange: p.symbol.exchange.code,
      assetClass: p.symbol.assetClass,
      currency: p.symbol.currency,
      side: p.side,
      quantity: Number(p.quantity),
      avgCostBasis: Number(p.avgCostBasis),
      currentPrice: Number(p.currentPrice),
      marketValue: Number(p.marketValue),
      unrealizedPnl: Number(p.unrealizedPnl),
      unrealizedPnlPct: Number(p.unrealizedPnlPct),
      realizedPnl: Number(p.realizedPnl),
      dayPnl: Number(p.dayPnl),
      weightPct: totalValue > 0 ? (Number(p.marketValue) / totalValue) * 100 : 0,
    }))

    await redis.setex(cacheKey, PORTFOLIO_CACHE_TTL, JSON.stringify(holdings))
    return holdings
  }
}

  async getPerformance(
    userId: string,
    accountId: string,
    period: "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "YTD" | "ALL"
  ): Promise<PerformanceData> {
    const account = await db.tradingAccount.findFirst({
      where: { id: accountId, userId, status: { not: "CLOSED" } },
    })

    if (!account) throw new ServiceError("Account not found", "ACCOUNT_NOT_FOUND", 404)

    const endDate = new Date()
    let startDate = new Date()

    switch (period) {
      case "1D":
        startDate.setDate(endDate.getDate() - 1)
        break
      case "1W":
        startDate.setDate(endDate.getDate() - 7)
        break
      case "1M":
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case "3M":
        startDate.setMonth(endDate.getMonth() - 3)
        break
      case "6M":
        startDate.setMonth(endDate.getMonth() - 6)
        break
      case "1Y":
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      case "YTD":
        startDate = new Date(endDate.getFullYear(), 0, 1)
        break
      case "ALL":
        startDate = account.createdAt
        break
    }

    const snapshots = await db.portfolioSnapshot.findMany({
      where: {
        accountId,
        snapshotAt: { gte: startDate, lte: endDate },
      },
      orderBy: { snapshotAt: "asc" },
    })

    if (snapshots.length === 0) {
      return {
        period,
        startDate,
        endDate,
        startValue: Number(account.totalPortfolioValue),
        endValue: Number(account.totalPortfolioValue),
        totalReturn: 0,
        totalReturnPct: 0,
        dataPoints: [],
      }
    }

    const startValue = Number(snapshots[0].totalValue)
    const endValue = Number(snapshots[snapshots.length - 1].totalValue)
    const totalReturn = endValue - startValue
    const totalReturnPct = startValue > 0 ? (totalReturn / startValue) * 100 : 0

    const dataPoints = snapshots.map((s) => ({
      timestamp: s.snapshotAt,
      portfolioValue: Number(s.totalValue),
      cashBalance: Number(s.cashBalance),
      investedValue: Number(s.investedValue),
      dayReturn: Number(s.dayReturn),
      totalReturn: Number(s.totalReturn),
    }))

    return {
      period,
      startDate,
      endDate,
      startValue,
      endValue,
      totalReturn,
      totalReturnPct,
      dataPoints,
    }
  }

  async createSnapshot(accountId: string): Promise<void> {
    const account = await db.tradingAccount.findUnique({
      where: { id: accountId },
      include: { positions: true },
    })

    if (!account) return

    const investedValue = account.positions.reduce(
      (sum, p) => sum + Number(p.marketValue),
      0
    )
    const totalValue = Number(account.cashBalance) + investedValue

    await db.portfolioSnapshot.create({
      data: {
        accountId,
        totalValue,
        cashBalance: account.cashBalance,
        investedValue,
        dayReturn: account.dayPnl,
        totalReturn: account.totalPnl,
      },
    })
  }

  async updatePosition(
    accountId: string,
    symbolId: string,
    quantity: number,
    price: number,
    side: "LONG" | "SHORT" = "LONG"
  ): Promise<void> {
    const position = await db.position.findFirst({
      where: { accountId, symbolId, side },
    })

    if (!position) {
      // Create new position
      await db.position.create({
        data: {
          accountId,
          symbolId,
          side,
          quantity,
          avgCostBasis: price,
          currentPrice: price,
          marketValue: quantity * price,
          unrealizedPnl: 0,
          unrealizedPnlPct: 0,
        },
      })
    } else {
      // Update existing position
      const newQuantity = Number(position.quantity) + quantity
      const totalCost = Number(position.avgCostBasis) * Number(position.quantity) + price * quantity
      const newAvgCost = totalCost / newQuantity

      await db.position.update({
        where: { id: position.id },
        data: {
          quantity: newQuantity,
          avgCostBasis: newAvgCost,
          currentPrice: price,
          marketValue: newQuantity * price,
          unrealizedPnl: (price - newAvgCost) * newQuantity,
          unrealizedPnlPct: ((price - newAvgCost) / newAvgCost) * 100,
        },
      })
    }

    // Invalidate cache
    await redis.del(`holdings:${accountId}`)
    await redis.del(`portfolio:*`)
  }

  async closePosition(accountId: string, symbolId: string, side: "LONG" | "SHORT" = "LONG"): Promise<void> {
    await db.position.deleteMany({
      where: { accountId, symbolId, side },
    })

    // Invalidate cache
    await redis.del(`holdings:${accountId}`)
    await redis.del(`portfolio:*`)
  }

  async refreshPrices(accountId: string): Promise<void> {
    const positions = await db.position.findMany({
      where: { accountId },
      include: { symbol: { include: { quote: true } } },
    })

    for (const position of positions) {
      if (!position.symbol.quote) continue

      const currentPrice = Number(position.symbol.quote.lastPrice)
      const avgCost = Number(position.avgCostBasis)
      const quantity = Number(position.quantity)
      const marketValue = currentPrice * quantity
      const unrealizedPnl = (currentPrice - avgCost) * quantity
      const unrealizedPnlPct = ((currentPrice - avgCost) / avgCost) * 100

      // Calculate day P&L (difference from previous close)
      const previousClose = Number(position.symbol.quote.previousClose)
      const dayPnl = (currentPrice - previousClose) * quantity

      await db.position.update({
        where: { id: position.id },
        data: {
          currentPrice,
          marketValue,
          unrealizedPnl,
          unrealizedPnlPct,
          dayPnl,
        },
      })
    }

    // Update account totals
    const updatedPositions = await db.position.findMany({ where: { accountId } })
    const totalInvested = updatedPositions.reduce((sum, p) => sum + Number(p.marketValue), 0)
    const dayPnl = updatedPositions.reduce((sum, p) => sum + Number(p.dayPnl), 0)
    const totalPnl = updatedPositions.reduce((sum, p) => sum + Number(p.unrealizedPnl), 0)

    await db.tradingAccount.update({
      where: { id: accountId },
      data: {
        totalPortfolioValue: totalInvested,
        dayPnl,
        totalPnl,
      },
    })

    // Invalidate cache
    await redis.del(`holdings:${accountId}`)
    await redis.del(`portfolio:*`)
  }
}

export type PerformanceData = {
  period: string
  startDate: Date
  endDate: Date
  startValue: number
  endValue: number
  totalReturn: number
  totalReturnPct: number
  dataPoints: Array<{
    timestamp: Date
    portfolioValue: number
    cashBalance: number
    investedValue: number
    dayReturn: number
    totalReturn: number
  }>
}

export const portfolioService = new PortfolioService()