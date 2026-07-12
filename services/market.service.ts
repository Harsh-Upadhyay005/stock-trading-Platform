// ============================================================
// services/market.service.ts — Market data aggregation
// ============================================================
import { db } from "@/lib/db"
import { redis } from "@/lib/redis"
import { alertQueue } from "@/lib/queue"
import { emitQuoteUpdate } from "@/lib/socket"
import { logger } from "@/utils/logger"
import type { QuoteQueryInput, OHLCVQueryInput, SearchQueryInput, MarketFeedBatchInput } from "@/validators/market.schema"
import type { QuoteData, OHLCVBar, SymbolSearchResult, MarketStatus } from "@/types/market"
import type { Prisma } from "../generated/prisma"

const QUOTE_CACHE_TTL = 5 // seconds — live quotes
const OHLCV_CACHE_TTL = 60 // seconds — candles
const SEARCH_CACHE_TTL = 300 // seconds — search results

export class MarketService {
  // ── Quotes ────────────────────────────────────────────────

  async getQuotes(input: QuoteQueryInput): Promise<QuoteData[]> {
    const cacheKey = `quotes:${input.tickers.sort().join(",")}`
    const cached = await redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const quotes = await db.quote.findMany({
      where: {
        symbol: {
          ticker: { in: input.tickers },
          ...(input.exchange && { exchange: { code: input.exchange } }),
          isActive: true,
        },
      },
      include: {
        symbol: { include: { exchange: true } },
      },
    })

    const result: QuoteData[] = quotes.map((q) => ({
      symbolId: q.symbolId,
      ticker: q.symbol.ticker,
      name: q.symbol.name,
      exchange: q.symbol.exchange.code,
      lastPrice: Number(q.lastPrice),
      open: Number(q.open),
      high: Number(q.high),
      low: Number(q.low),
      close: Number(q.close),
      previousClose: Number(q.previousClose),
      change: Number(q.change),
      changePct: Number(q.changePct),
      volume: Number(q.volume),
      avgVolume: q.avgVolume ? Number(q.avgVolume) : null,
      bidPrice: q.bidPrice ? Number(q.bidPrice) : null,
      askPrice: q.askPrice ? Number(q.askPrice) : null,
      weekHigh52: q.weekHigh52 ? Number(q.weekHigh52) : null,
      weekLow52: q.weekLow52 ? Number(q.weekLow52) : null,
      marketStatus: q.marketStatus,
      tradedAt: q.tradedAt,
    }))

    await redis.setex(cacheKey, QUOTE_CACHE_TTL, JSON.stringify(result))
    return result
  }

  // ── OHLCV ─────────────────────────────────────────────────

  async getOHLCV(input: OHLCVQueryInput): Promise<OHLCVBar[]> {
    const cacheKey = `ohlcv:${input.ticker}:${input.interval}:${input.from?.toISOString() ?? ""}:${input.limit}`
    const cached = await redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const where: Prisma.OHLCVWhereInput = {
      symbol: {
        ticker: input.ticker,
        ...(input.exchange && { exchange: { code: input.exchange } }),
      },
      interval: input.interval,
      ...(input.from && { timestamp: { gte: input.from } }),
      ...(input.to && { timestamp: { lte: input.to } }),
    }

    const bars = await db.oHLCV.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: input.limit,
    })

    const result: OHLCVBar[] = bars
      .reverse()
      .map((b) => ({
        timestamp: b.timestamp,
        open: Number(b.open),
        high: Number(b.high),
        low: Number(b.low),
        close: Number(b.close),
        volume: Number(b.volume),
      }))

    await redis.setex(cacheKey, OHLCV_CACHE_TTL, JSON.stringify(result))
    return result
  }

  // ── Search ────────────────────────────────────────────────

  async searchSymbols(input: SearchQueryInput): Promise<SymbolSearchResult[]> {
    const cacheKey = `search:${input.q}:${input.assetClass ?? "all"}:${input.exchange ?? "all"}`
    const cached = await redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const symbols = await db.symbol.findMany({
      where: {
        isActive: true,
        ...(input.assetClass && { assetClass: input.assetClass }),
        ...(input.exchange && { exchange: { code: input.exchange } }),
        OR: [
          { ticker: { contains: input.q, mode: "insensitive" } },
          { name: { contains: input.q, mode: "insensitive" } },
          { fullName: { contains: input.q, mode: "insensitive" } },
          { isin: { equals: input.q.toUpperCase() } },
        ],
      },
      include: { exchange: true },
      take: input.limit,
      orderBy: [
        { ticker: "asc" }, // exact ticker matches first
      ],
    })

    const result: SymbolSearchResult[] = symbols.map((s) => ({
      id: s.id,
      ticker: s.ticker,
      name: s.name,
      exchange: s.exchange.code,
      assetClass: s.assetClass,
      currency: s.currency,
      sector: s.sector,
      logoUrl: s.logoUrl,
      isActive: s.isActive,
      isTradable: s.isTradable,
    }))

    await redis.setex(cacheKey, SEARCH_CACHE_TTL, JSON.stringify(result))
    return result
  }

  // ── Store OHLCV Data ──────────────────────────────────────

  async storeOHLCV(
    symbolId: string,
    interval: string,
    bars: Array<{ timestamp: Date; open: number; high: number; low: number; close: number; volume: number }>
  ): Promise<void> {
    // Use upsert to avoid duplicates
    for (const bar of bars) {
      await db.oHLCV.upsert({
        where: {
          symbolId_interval_timestamp: {
            symbolId,
            interval,
            timestamp: bar.timestamp,
          },
        },
        create: {
          symbolId,
          interval,
          timestamp: bar.timestamp,
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
          volume: bar.volume,
        },
        update: {
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
          volume: bar.volume,
        },
      })
    }

    // Invalidate OHLCV cache
    await redis.del(`ohlcv:*:${interval}:*`)
  }

  // ── Get Symbol by Ticker ──────────────────────────────────

  async getSymbolByTicker(ticker: string, exchange?: string) {
    return await db.symbol.findFirst({
      where: {
        ticker: ticker.toUpperCase(),
        ...(exchange && { exchange: { code: exchange } }),
        isActive: true,
      },
      include: {
        exchange: true,
        quote: true,
      },
    })
  }

  // ── Update Quote ──────────────────────────────────────────

  async updateQuote(
    symbolId: string,
    data: {
      lastPrice: number
      volume?: number
      bid?: number
      ask?: number
      open?: number
      high?: number
      low?: number
    }
  ): Promise<void> {
    const symbol = await db.symbol.findUnique({
      where: { id: symbolId },
      include: { quote: true },
    })

    if (!symbol) {
      throw new Error(`Symbol not found: ${symbolId}`)
    }

    const previousQuote = symbol.quote
    const previousClose = previousQuote ? Number(previousQuote.close) : data.lastPrice
    const change = data.lastPrice - previousClose
    const changePct = previousClose > 0 ? (change / previousClose) * 100 : 0

    await db.quote.upsert({
      where: { symbolId },
      create: {
        symbolId,
        open: data.open ?? data.lastPrice,
        high: data.high ?? data.lastPrice,
        low: data.low ?? data.lastPrice,
        close: data.lastPrice,
        previousClose,
        lastPrice: data.lastPrice,
        bidPrice: data.bid,
        askPrice: data.ask,
        volume: data.volume ?? 0,
        change,
        changePct,
        marketStatus: "OPEN",
        tradedAt: new Date(),
      },
      update: {
        lastPrice: data.lastPrice,
        ...(data.open && { open: data.open }),
        ...(data.high && {
          high: Math.max(data.high, previousQuote ? Number(previousQuote.high) : 0),
        }),
        ...(data.low && {
          low: Math.min(data.low, previousQuote ? Number(previousQuote.low) : Infinity),
        }),
        bidPrice: data.bid,
        askPrice: data.ask,
        ...(data.volume !== undefined && { volume: data.volume }),
        change,
        changePct,
        tradedAt: new Date(),
      },
    })

    // Invalidate cache
    await redis.del(`quotes:${symbol.ticker}`)

    // Emit WebSocket update
    emitQuoteUpdate(symbol.ticker, {
      ticker: symbol.ticker,
      lastPrice: data.lastPrice,
      change,
      changePct,
      volume: data.volume,
    })
  }

  // ── Check Market Hours ────────────────────────────────────

  async isMarketOpen(exchangeCode: string): Promise<boolean> {
    const now = new Date()
    const dayOfWeek = now.getDay() // 0=Sunday, 6=Saturday

    // Get market hours for this exchange
    const marketHours = await db.marketHour.findFirst({
      where: {
        exchange: { code: exchangeCode },
        dayOfWeek,
        isHoliday: false,
      },
    })

    if (!marketHours) return false

    // Parse time strings (format: "HH:MM")
    const [openHour, openMin] = marketHours.openTime.split(":").map(Number)
    const [closeHour, closeMin] = marketHours.closeTime.split(":").map(Number)

    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const openMinutes = openHour * 60 + openMin
    const closeMinutes = closeHour * 60 + closeMin

    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes
  }

  // ── Get Market Status ─────────────────────────────────────

  async getMarketStatus(exchangeCode: string): Promise<MarketStatus> {
    const exchange = await db.exchange.findUnique({
      where: { code: exchangeCode },
    })

    if (!exchange || !exchange.isActive) return "CLOSED"

    const isOpen = await this.isMarketOpen(exchangeCode)
    if (isOpen) return "OPEN"

    // Check if we're in pre-market or post-market hours
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const [openHour, openMin] = exchange.openTime.split(":").map(Number)
    const [closeHour, closeMin] = exchange.closeTime.split(":").map(Number)
    const openMinutes = openHour * 60 + openMin
    const closeMinutes = closeHour * 60 + closeMin

    // Pre-market: 1 hour before open
    if (currentMinutes >= openMinutes - 60 && currentMinutes < openMinutes) {
      return "PRE_MARKET"
    }

    // Post-market: 2 hours after close
    if (currentMinutes > closeMinutes && currentMinutes <= closeMinutes + 120) {
      return "POST_MARKET"
    }

    return "CLOSED"
  }

  // ── Market Feed Ingestion ─────────────────────────────────

  async ingestFeed(input: MarketFeedBatchInput): Promise<{ updated: number }> {
    let updated = 0

    for (const payload of input.quotes) {
      const symbol = await db.symbol.findFirst({
        where: {
          ticker: payload.ticker,
          exchange: { code: payload.exchange },
          isActive: true,
        },
      })

      if (!symbol) {
        logger.warn({ ticker: payload.ticker }, "Symbol not found for feed update")
        continue
      }

      const previousQuote = await db.quote.findUnique({
        where: { symbolId: symbol.id },
      })

      const previousClose = previousQuote ? Number(previousQuote.close) : payload.lastPrice
      const change = payload.lastPrice - previousClose
      const changePct = previousClose > 0 ? (change / previousClose) * 100 : 0

      await db.quote.upsert({
        where: { symbolId: symbol.id },
        create: {
          symbolId: symbol.id,
          open: payload.open ?? payload.lastPrice,
          high: payload.high ?? payload.lastPrice,
          low: payload.low ?? payload.lastPrice,
          close: payload.lastPrice,
          previousClose,
          lastPrice: payload.lastPrice,
          bidPrice: payload.bid,
          askPrice: payload.ask,
          volume: payload.volume,
          change,
          changePct,
          tradedAt: new Date(payload.timestamp),
        },
        update: {
          lastPrice: payload.lastPrice,
          high: payload.high
            ? Math.max(payload.high, previousQuote ? Number(previousQuote.high) : 0)
            : undefined,
          low: payload.low
            ? Math.min(payload.low, previousQuote ? Number(previousQuote.low) : Infinity)
            : undefined,
          bidPrice: payload.bid,
          askPrice: payload.ask,
          volume: payload.volume,
          change,
          changePct,
          tradedAt: new Date(payload.timestamp),
        },
      })

      // Invalidate quote cache
      await redis.del(`quotes:${payload.ticker}`)

      // Emit real-time update via Socket.io
      emitQuoteUpdate(payload.ticker, {
        ticker: payload.ticker,
        lastPrice: payload.lastPrice,
        change,
        changePct,
        volume: payload.volume,
        timestamp: payload.timestamp,
      })

      // Dispatch alert evaluation job
      await alertQueue.add("evaluate" as never, {
        symbolId: symbol.id,
        ticker: payload.ticker,
        lastPrice: payload.lastPrice,
        volume: payload.volume,
      })

      updated++
    }

    return { updated }
  }
}

export const marketService = new MarketService()