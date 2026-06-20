// ============================================================
// validators/market.schema.ts
// ============================================================
import { z } from "zod"

export const QuoteQuerySchema = z.object({
  tickers: z
    .string()
    .transform((v) => v.split(",").map((t) => t.trim().toUpperCase()))
    .pipe(z.string().toUpperCase().array().min(1).max(50)),
  exchange: z.string().optional(),
})

export const OHLCVQuerySchema = z.object({
  ticker: z.string().min(1).max(12).toUpperCase(),
  exchange: z.string().optional(),
  interval: z.enum(["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w", "1mo"]).default("1d"),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(1000).default(200),
})

export const SearchQuerySchema = z.object({
  q: z.string().min(1).max(100).trim(),
  assetClass: z
    .enum(["EQUITY", "ETF", "OPTION", "FUTURE", "FOREX", "CRYPTO", "BOND", "MUTUAL_FUND", "INDEX"])
    .optional(),
  exchange: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export const MarketFeedSchema = z.object({
  ticker: z.string().min(1).max(12),
  exchange: z.string().min(1).max(10),
  lastPrice: z.number().positive(),
  volume: z.number().int().nonnegative(),
  timestamp: z.string().datetime(),
  open: z.number().positive().optional(),
  high: z.number().positive().optional(),
  low: z.number().positive().optional(),
  bid: z.number().positive().optional(),
  ask: z.number().positive().optional(),
})

export const MarketFeedBatchSchema = z.object({
  quotes: z.array(MarketFeedSchema).min(1).max(500),
})

export type QuoteQueryInput = z.infer<typeof QuoteQuerySchema>
export type OHLCVQueryInput = z.infer<typeof OHLCVQuerySchema>
export type SearchQueryInput = z.infer<typeof SearchQuerySchema>
export type MarketFeedBatchInput = z.infer<typeof MarketFeedBatchSchema>