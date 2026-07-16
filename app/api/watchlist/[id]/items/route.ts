// ============================================================
// app/api/watchlist/[id]/items/route.ts — POST (add item)
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError } from "@/lib/auth"
import { watchlistService } from "@/services/watchlist.service"
import { ServiceError } from "@/services/order.service"
import { AddWatchlistItemSchema } from "@/validators/watchlist.schema"
import {
  created, badRequest, unauthorized, forbidden, notFound, conflict, serverError,
} from "@/utils/response"
import { withRateLimit } from "@/utils/rate-limit-middleware"
import { logger } from "@/utils/logger"
import type { RouteContext } from "@/types/api"

export const POST = withRateLimit(
  async (req: NextRequest, { params }: RouteContext<{ id: string }>) => {
    try {
      const user = await requireAuth()
      const { id: watchlistId } = await params
      const body = await req.json()
      const parsed = AddWatchlistItemSchema.safeParse(body)

      if (!parsed.success) {
        return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>)
      }

      const item = await watchlistService.addItem(user.id, watchlistId, parsed.data)
      return created(item)
    } catch (err) {
      if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
      if (err instanceof ServiceError) {
        if (err.status === 404) return notFound(err.code)
        if (err.status === 409) return conflict(err.message)
      }
      logger.error({ err }, "POST /api/watchlist/[id]/items error")
      return serverError()
    }
  },
  { preset: "authenticated" }
)
