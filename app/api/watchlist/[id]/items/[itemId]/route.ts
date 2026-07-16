// ============================================================
// app/api/watchlist/[id]/items/[itemId]/route.ts — PATCH / DELETE
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError } from "@/lib/auth"
import { watchlistService } from "@/services/watchlist.service"
import { ServiceError } from "@/services/order.service"
import { UpdateWatchlistItemSchema } from "@/validators/watchlist.schema"
import {
  ok, noContent, badRequest, unauthorized, forbidden, notFound, serverError,
} from "@/utils/response"
import { withRateLimit } from "@/utils/rate-limit-middleware"
import { logger } from "@/utils/logger"
import type { RouteContext } from "@/types/api"

export const PATCH = withRateLimit(
  async (req: NextRequest, { params }: RouteContext<{ id: string; itemId: string }>) => {
    try {
      const user = await requireAuth()
      const { id: watchlistId, itemId } = await params
      const body = await req.json()
      const parsed = UpdateWatchlistItemSchema.safeParse(body)

      if (!parsed.success) {
        return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>)
      }

      const item = await watchlistService.updateItem(user.id, watchlistId, itemId, parsed.data)
      return ok(item)
    } catch (err) {
      if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
      if (err instanceof ServiceError && err.status === 404) return notFound(err.code)
      logger.error({ err }, "PATCH /api/watchlist/[id]/items/[itemId] error")
      return serverError()
    }
  },
  { preset: "authenticated" }
)

export const DELETE = withRateLimit(
  async (_req: NextRequest, { params }: RouteContext<{ id: string; itemId: string }>) => {
    try {
      const user = await requireAuth()
      const { id: watchlistId, itemId } = await params
      await watchlistService.removeItem(user.id, watchlistId, itemId)
      return noContent()
    } catch (err) {
      if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
      if (err instanceof ServiceError && err.status === 404) return notFound(err.code)
      logger.error({ err }, "DELETE /api/watchlist/[id]/items/[itemId] error")
      return serverError()
    }
  },
  { preset: "authenticated" }
)
