// ============================================================
// types/market.ts
// ============================================================
import type { AssetClass, MarketStatus } from "../../generated/prisma"

export type QuoteData = {
  symbolId: string
  ticker: string
  name: string
  exchange: string
  lastPrice: number
  open: number
  high: number
  low: number
  close: number
  previousClose: number
  change: number
  changePct: number
  volume: number
  avgVolume: number | null
  bidPrice: number | null
  askPrice: number | null
  weekHigh52: number | null
  weekLow52: number | null
  marketStatus: MarketStatus
  tradedAt: Date
}

export type OHLCVBar = {
  timestamp: Date
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type OHLCVInterval = "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d" | "1w" | "1mo"

export type SymbolSearchResult = {
  id: string
  ticker: string
  name: string
  exchange: string
  assetClass: AssetClass
  currency: string
  sector: string | null
  logoUrl: string | null
  isActive: boolean
  isTradable: boolean
}

export type MarketFeedPayload = {
  ticker: string
  exchange: string
  lastPrice: number
  volume: number
  timestamp: string
  open?: number
  high?: number
  low?: number
  bid?: number
  ask?: number
}

export { AssetClass, MarketStatus }