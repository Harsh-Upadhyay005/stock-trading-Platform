// ============================================================
// validators/market.schema.ts
// ============================================================
import { z } from "zod"

export const QuoteQuerySchema = z.object({
  tickers: z
    .string()
    .transform((val) => val.split(",").map((t) => t.trim().toUpperCase()))
    .pipe(z.array(z.string()).min(1).max(50)),
  exchange: z.string().optional(),
})

export const OHLCVQuerySchema = z.object({
  ticker: z.string().toUpperCase(),
  exchange: z.string().optional(),
  interval: z.enum(["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w", "1mo"]),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(1000).default(100),
})

export const SearchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  exchange: z.string().optional(),
  assetClass: z
    .enum([
      "EQUITY",
      "ETF",
      "OPTION",
      "FUTURE",
      "FOREX",
      "CRYPTO",
      "BOND",
      "MUTUAL_FUND",
      "INDEX",
    ])
    .optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export const MarketFeedBatchSchema = z.object({
  quotes: z.array(
    z.object({
      ticker: z.string(),
      exchange: z.string(),
      lastPrice: z.number(),
      volume: z.number(),
      timestamp: z.string(),
      open: z.number().optional(),
      high: z.number().optional(),
      low: z.number().optional(),
      bid: z.number().optional(),
      ask: z.number().optional(),
    })
  ),
})

export type QuoteQueryInput = z.infer<typeof QuoteQuerySchema>
export type OHLCVQueryInput = z.infer<typeof OHLCVQuerySchema>
export type SearchQueryInput = z.infer<typeof SearchQuerySchema>
export type MarketFeedBatchInput = z.infer<typeof MarketFeedBatchSchema>
