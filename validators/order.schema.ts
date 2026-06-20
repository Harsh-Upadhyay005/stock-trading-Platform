// ============================================================
// validators/order.schema.ts
// ============================================================
import { z } from "zod"

export const CreateOrderSchema = z
  .object({
    accountId: z.string().cuid("Invalid account ID"),
    symbolId: z.string().cuid("Invalid symbol ID"),
    side: z.enum(["BUY", "SELL", "SELL_SHORT", "BUY_TO_COVER"]),
    type: z.enum(["MARKET", "LIMIT", "STOP", "STOP_LIMIT", "TRAILING_STOP", "OCO", "BRACKET"]),
    duration: z.enum(["DAY", "GTC", "IOC", "FOK", "GTD", "EXT"]).default("DAY"),
    quantity: z.number().positive("Quantity must be positive").max(1_000_000),
    limitPrice: z.number().positive().optional(),
    stopPrice: z.number().positive().optional(),
    trailAmount: z.number().positive().optional(),
    trailPercent: z.number().positive().max(100).optional(),
    extendedHours: z.boolean().default(false),
    clientOrderId: z.string().max(64).optional(),
    notes: z.string().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "LIMIT" && !data.limitPrice) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "limitPrice required for LIMIT orders", path: ["limitPrice"] })
    }
    if (data.type === "STOP" && !data.stopPrice) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "stopPrice required for STOP orders", path: ["stopPrice"] })
    }
    if (data.type === "STOP_LIMIT" && (!data.stopPrice || !data.limitPrice)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Both stopPrice and limitPrice required for STOP_LIMIT", path: ["stopPrice"] })
    }
    if (data.type === "TRAILING_STOP" && !data.trailAmount && !data.trailPercent) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Either trailAmount or trailPercent required", path: ["trailAmount"] })
    }
  })

export const UpdateOrderSchema = z.object({
  limitPrice: z.number().positive().optional(),
  stopPrice: z.number().positive().optional(),
  quantity: z.number().positive().max(1_000_000).optional(),
})

export const OrderQuerySchema = z.object({
  accountId: z.string().cuid().optional(),
  status: z.enum(["PENDING", "OPEN", "PARTIALLY_FILLED", "FILLED", "CANCELLED", "REJECTED", "EXPIRED"]).optional(),
  side: z.enum(["BUY", "SELL", "SELL_SHORT", "BUY_TO_COVER"]).optional(),
  symbolId: z.string().cuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "filledAt", "quantity"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>
export type UpdateOrderInput = z.infer<typeof UpdateOrderSchema>
export type OrderQueryInput = z.infer<typeof OrderQuerySchema>