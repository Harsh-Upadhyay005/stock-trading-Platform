// ============================================================
// validators/alert.schema.ts
// ============================================================
import { z } from "zod"

export const CreateAlertSchema = z.object({
  symbolId: z.string().cuid("Invalid symbol ID"),
  type: z.enum([
    "PRICE_ABOVE",
    "PRICE_BELOW",
    "PERCENT_CHANGE",
    "VOLUME_SPIKE",
    "NEWS",
    "EARNINGS",
    "DIVIDEND",
  ]),
  targetValue: z.number().positive("Target value must be positive"),
  message: z.string().max(500).optional(),
  expiresAt: z.coerce.date().optional(),
})

export const UpdateAlertSchema = z.object({
  targetValue: z.number().positive().optional(),
  message: z.string().max(500).nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  status: z.enum(["ACTIVE", "TRIGGERED", "EXPIRED", "CANCELLED"]).optional(),
})

export const AlertQuerySchema = z.object({
  symbolId: z.string().cuid().optional(),
  type: z
    .enum([
      "PRICE_ABOVE",
      "PRICE_BELOW",
      "PERCENT_CHANGE",
      "VOLUME_SPIKE",
      "NEWS",
      "EARNINGS",
      "DIVIDEND",
    ])
    .optional(),
  status: z.enum(["ACTIVE", "TRIGGERED", "EXPIRED", "CANCELLED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "triggeredAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

export type CreateAlertInput = z.infer<typeof CreateAlertSchema>
export type UpdateAlertInput = z.infer<typeof UpdateAlertSchema>
export type AlertQueryInput = z.infer<typeof AlertQuerySchema>
