// ============================================================
// validators/user.schema.ts
// ============================================================
import { z } from "zod"

export const WatchlistCreateSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(500).optional(),
  visibility: z.enum(["PRIVATE", "PUBLIC"]).default("PRIVATE"),
})

export const WatchlistUpdateSchema = WatchlistCreateSchema.partial()

export const WatchlistItemSchema = z.object({
  symbolId: z.string().cuid("Invalid symbol ID"),
  notes: z.string().max(500).optional(),
  sortOrder: z.number().int().optional(),
})

export const AlertCreateSchema = z.object({
  symbolId: z.string().cuid("Invalid symbol ID"),
  type: z.enum(["PRICE_ABOVE", "PRICE_BELOW", "PERCENT_CHANGE", "VOLUME_SPIKE", "NEWS", "EARNINGS", "DIVIDEND"]),
  targetValue: z.number().positive(),
  message: z.string().max(500).optional(),
  expiresAt: z.coerce.date().optional(),
})

export const AlertUpdateSchema = AlertCreateSchema.partial()

export const AdminUserQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(["INVESTOR", "TRADER", "ADMIN", "SUPER_ADMIN"]).optional(),
  status: z.enum(["ONBOARDING", "ACTIVE", "SUSPENDED", "BANNED", "DEACTIVATED"]).optional(),
  kycStatus: z.enum(["NOT_SUBMITTED", "PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "EXPIRED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "email", "status"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

export const AdminUpdateUserSchema = z.object({
  role: z.enum(["INVESTOR", "TRADER", "ADMIN", "SUPER_ADMIN"]).optional(),
  status: z.enum(["ONBOARDING", "ACTIVE", "SUSPENDED", "BANNED", "DEACTIVATED"]).optional(),
})

export const InstrumentCreateSchema = z.object({
  ticker: z.string().min(1).max(20).toUpperCase(),
  exchangeId: z.string().cuid(),
  name: z.string().min(1).max(200),
  fullName: z.string().max(500).optional(),
  assetClass: z.enum(["EQUITY", "ETF", "OPTION", "FUTURE", "FOREX", "CRYPTO", "BOND", "MUTUAL_FUND", "INDEX"]),
  currency: z.string().length(3).toUpperCase().default("INR"),
  isin: z.string().length(12).optional(),
  lotSize: z.number().int().positive().default(1),
  tickSize: z.number().positive().default(0.05),
  sector: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  isShortable: z.boolean().default(false),
  marginable: z.boolean().default(false),
  description: z.string().max(2000).optional(),
})

export type WatchlistCreateInput = z.infer<typeof WatchlistCreateSchema>
export type WatchlistUpdateInput = z.infer<typeof WatchlistUpdateSchema>
export type WatchlistItemInput = z.infer<typeof WatchlistItemSchema>
export type AlertCreateInput = z.infer<typeof AlertCreateSchema>
export type AdminUserQueryInput = z.infer<typeof AdminUserQuerySchema>
export type AdminUpdateUserInput = z.infer<typeof AdminUpdateUserSchema>
export type InstrumentCreateInput = z.infer<typeof InstrumentCreateSchema>