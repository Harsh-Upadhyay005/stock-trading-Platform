// ============================================================
// validators/portfolio.schema.ts
// ============================================================
import { z } from "zod"

export const PortfolioQuerySchema = z.object({
  accountId: z.string().cuid().optional(),
})

export const HoldingsQuerySchema = z.object({
  accountId: z.string().cuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["marketValue", "unrealizedPnl", "dayPnl", "quantity"]).default("marketValue"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

export const PerformanceQuerySchema = z.object({
  accountId: z.string().cuid().optional(),
  period: z.enum(["1D", "1W", "1M", "3M", "6M", "1Y", "YTD", "ALL"]).default("1M"),
})

export type PortfolioQueryInput = z.infer<typeof PortfolioQuerySchema>
export type HoldingsQueryInput = z.infer<typeof HoldingsQuerySchema>
export type PerformanceQueryInput = z.infer<typeof PerformanceQuerySchema>
