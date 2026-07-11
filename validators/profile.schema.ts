// ============================================================
// validators/profile.schema.ts
// ============================================================
import { z } from "zod"

// ── User Profile ─────────────────────────────────────────────
export const UpdateProfileSchema = z.object({
  dateOfBirth: z.coerce.date().optional(),
  bio: z.string().max(1000).optional(),
  country: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  postalCode: z.string().max(20).optional(),
  nationality: z.string().max(100).optional(),
  occupation: z.string().max(100).optional(),
  annualIncome: z.number().positive().optional(),
  netWorth: z.number().positive().optional(),
  investmentGoals: z.array(z.string().max(100)).max(10).optional(),
})

// ── KYC Submission ───────────────────────────────────────────
export const SubmitKYCSchema = z.object({
  level: z.number().int().min(1).max(3).default(1),
  taxId: z.string().min(1).max(50).optional(), // PAN/SSN
  documents: z
    .array(
      z.object({
        docType: z.enum(["passport", "national_id", "driving_license", "utility_bill", "bank_statement"]),
        docNumber: z.string().max(100).optional(),
        fileUrl: z.string().url(),
        fileHash: z.string().length(64), // SHA-256 hash
        mimeType: z.string(),
        issuedAt: z.coerce.date().optional(),
        expiresAt: z.coerce.date().optional(),
      })
    )
    .min(1)
    .max(10),
})

// ── Risk Profile ─────────────────────────────────────────────
export const UpdateRiskProfileSchema = z.object({
  riskLevel: z.enum(["CONSERVATIVE", "MODERATE", "AGGRESSIVE", "SPECULATIVE"]).optional(),
  maxPositionSize: z.number().min(0.01).max(100).optional(), // % of portfolio
  maxDailyLoss: z.number().min(0.01).max(100).optional(), // % of portfolio
  allowedAssets: z
    .array(
      z.enum([
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
    )
    .optional(),
  marginEnabled: z.boolean().optional(),
  shortSellingAllowed: z.boolean().optional(),
  optionsLevel: z.number().int().min(0).max(3).optional(), // 0=none,1=covered,2=spreads,3=naked
})

// ── Bank Account ─────────────────────────────────────────────
export const AddBankAccountSchema = z.object({
  accountHolder: z.string().min(1).max(200),
  bankName: z.string().min(1).max(200),
  accountNumber: z.string().min(1).max(100), // will be encrypted
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/).optional(), // India
  routingNumber: z.string().regex(/^\d{9}$/).optional(), // USA
  accountType: z.enum(["savings", "checking", "current"]),
  currency: z.string().length(3).default("INR"),
  isPrimary: z.boolean().default(false),
})

export const UpdateBankAccountSchema = z.object({
  isPrimary: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

// ── Trading Account ──────────────────────────────────────────
export const CreateTradingAccountSchema = z.object({
  type: z.enum(["CASH", "MARGIN", "RETIREMENT", "DEMO"]),
  currency: z.string().length(3).default("INR"),
})

// ── Notification Preferences ─────────────────────────────────
export const UpdateNotificationPreferenceSchema = z.object({
  preferences: z.array(
    z.object({
      type: z.enum([
        "ORDER_FILLED",
        "ORDER_REJECTED",
        "PRICE_ALERT",
        "DEPOSIT_CONFIRMED",
        "WITHDRAWAL_PROCESSED",
        "KYC_STATUS_CHANGE",
        "SYSTEM_ANNOUNCEMENT",
        "MARGIN_CALL",
        "ACCOUNT_ACTIVITY",
      ]),
      channel: z.enum(["IN_APP", "EMAIL", "SMS", "PUSH"]),
      enabled: z.boolean(),
    })
  ),
})

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
export type SubmitKYCInput = z.infer<typeof SubmitKYCSchema>
export type UpdateRiskProfileInput = z.infer<typeof UpdateRiskProfileSchema>
export type AddBankAccountInput = z.infer<typeof AddBankAccountSchema>
export type UpdateBankAccountInput = z.infer<typeof UpdateBankAccountSchema>
export type CreateTradingAccountInput = z.infer<typeof CreateTradingAccountSchema>
export type UpdateNotificationPreferenceInput = z.infer<typeof UpdateNotificationPreferenceSchema>
