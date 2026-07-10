// ============================================================
// validators/watchlist.schema.ts
// ============================================================
import { z } from "zod"

export const CreateWatchlistSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(500).optional(),
  visibility: z.enum(["PRIVATE", "PUBLIC"]).default("PRIVATE"),
  isDefault: z.boolean().default(false),
})

export const UpdateWatchlistSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).nullable().optional(),
  visibility: z.enum(["PRIVATE", "PUBLIC"]).optional(),
  isDefault: z.boolean().optional(),
})

export const AddWatchlistItemSchema = z.object({
  symbolId: z.string().cuid("Invalid symbol ID"),
  notes: z.string().max(500).optional(),
})

export const UpdateWatchlistItemSchema = z.object({
  notes: z.string().max(500).nullable().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
})

export const WatchlistQuerySchema = z.object({
  visibility: z.enum(["PRIVATE", "PUBLIC"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type CreateWatchlistInput = z.infer<typeof CreateWatchlistSchema>
export type UpdateWatchlistInput = z.infer<typeof UpdateWatchlistSchema>
export type AddWatchlistItemInput = z.infer<typeof AddWatchlistItemSchema>
export type UpdateWatchlistItemInput = z.infer<typeof UpdateWatchlistItemSchema>
export type WatchlistQueryInput = z.infer<typeof WatchlistQuerySchema>
