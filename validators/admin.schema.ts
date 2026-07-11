// ============================================================
// validators/admin.schema.ts
// ============================================================
import { z } from "zod"

// ── User Management ──────────────────────────────────────────
export const AdminUserQuerySchema = z.object({
  role: z.enum(["INVESTOR", "TRADER", "ADMIN", "SUPER_ADMIN"]).optional(),
  status: z
    .enum(["ONBOARDING", "ACTIVE", "SUSPENDED", "BANNED", "DEACTIVATED"])
    .optional(),
  kycStatus: z
    .enum(["NOT_SUBMITTED", "PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "EXPIRED"])
    .optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "email", "status"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

export const UpdateUserStatusSchema = z.object({
  status: z.enum(["ONBOARDING", "ACTIVE", "SUSPENDED", "BANNED", "DEACTIVATED"]),
  reason: z.string().max(500).optional(),
})

export const UpdateUserRoleSchema = z.object({
  role: z.enum(["INVESTOR", "TRADER", "ADMIN", "SUPER_ADMIN"]),
})

export const UpdateKYCStatusSchema = z.object({
  status: z.enum(["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "EXPIRED"]),
  rejectionReason: z.string().max(500).optional(),
})

// ── Instrument Management ────────────────────────────────────
export const CreateInstrumentSchema = z.object({
  ticker: z.string().min(1).max(12).toUpperCase(),
  exchangeId: z.string().cuid("Invalid exchange ID"),
  name: z.string().min(1).max(200),
  fullName: z.string().max(500).optional(),
  assetClass: z.enum([
    "EQUITY",
    "ETF",
    "OPTION",
    "FUTURE",
    "FOREX",
    "CRYPTO",
    "BOND",
    "MUTUAL_FUND",
    "INDEX",
  ]),
  currency: z.string().length(3).default("INR"),
  isin: z.string().length(12).optional(),
  lotSize: z.number().int().positive().default(1),
  tickSize: z.number().positive().default(0.05),
  sector: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  isActive: z.boolean().default(true),
  isTradable: z.boolean().default(true),
  isShortable: z.boolean().default(false),
  marginable: z.boolean().default(false),
})

export const UpdateInstrumentSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  fullName: z.string().max(500).nullable().optional(),
  sector: z.string().max(100).nullable().optional(),
  industry: z.string().max(100).nullable().optional(),
  isActive: z.boolean().optional(),
  isTradable: z.boolean().optional(),
  isShortable: z.boolean().optional(),
  marginable: z.boolean().optional(),
  lotSize: z.number().int().positive().optional(),
  tickSize: z.number().positive().optional(),
})

export const InstrumentQuerySchema = z.object({
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
  sector: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  isTradable: z.coerce.boolean().optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["ticker", "name", "createdAt"]).default("ticker"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
})

// ── System Operations ────────────────────────────────────────
export const SystemStatsSchema = z.object({
  period: z.enum(["1D", "1W", "1M", "3M", "1Y", "ALL"]).default("1M"),
})

export type AdminUserQueryInput = z.infer<typeof AdminUserQuerySchema>
export type UpdateUserStatusInput = z.infer<typeof UpdateUserStatusSchema>
export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>
export type UpdateKYCStatusInput = z.infer<typeof UpdateKYCStatusSchema>
export type CreateInstrumentInput = z.infer<typeof CreateInstrumentSchema>
export type UpdateInstrumentInput = z.infer<typeof UpdateInstrumentSchema>
export type InstrumentQueryInput = z.infer<typeof InstrumentQuerySchema>
export type SystemStatsInput = z.infer<typeof SystemStatsSchema>
