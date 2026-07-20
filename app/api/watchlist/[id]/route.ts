// ============================================================
// app/api/watchlist/[id]/route.ts — GET / PATCH / DELETE
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError } from "@/lib/auth"
import { watchlistService } from "@/services/watchlist.service"
import { ServiceError } from "@/services/order.service"
import { UpdateWatchlistSchema } from "@/validators/watchlist.schema"
import {
  ok, noContent, badRequest, unauthorized, forbidden, notFound, serverError,
} from "@/utils/response"
import { withRateLimit } from "@/utils/rate-limit-middleware"
import { logger } from "@/utils/logger"
import type { RouteContext } from "@/types/api"

export const GET = withRateLimit(
  async (_req: NextRequest, { params }: RouteContext<{ id: string }>) => {
    try {
      const user = await requireAuth()
      const { id } = await params

      const watchlist = await watchlistService.getWatchlist(user.id, id)
      return ok(watchlist)
    } catch (err) {
      if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
      if (err instanceof ServiceError && err.status === 404) return notFound("Watchlist")
      logger.error({ err }, "GET /api/watchlist/[id] error")
      return serverError()
    }
  },
  { preset: "authenticated" }
)

export const PATCH = withRateLimit(
  async (req: NextRequest, { params }: RouteContext<{ id: string }>) => {
    try {
      const user = await requireAuth()
      const { id } = await params
      const body = await req.json()
      const parsed = UpdateWatchlistSchema.safeParse(body)

      if (!parsed.success) {
        return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>)
      }

      const watchlist = await watchlistService.updateWatchlist(user.id, id, parsed.data)
      return ok(watchlist)
    } catch (err) {
      if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
      if (err instanceof ServiceError && err.status === 404) return notFound("Watchlist")
      logger.error({ err }, "PATCH /api/watchlist/[id] error")
      return serverError()
    }
  },
  { preset: "authenticated" }
)

export const DELETE = withRateLimit(
  async (_req: NextRequest, { params }: RouteContext<{ id: string }>) => {
    try {
      const user = await requireAuth()
      const { id } = await params
      await watchlistService.deleteWatchlist(user.id, id)
      return noContent()
    } catch (err) {
      if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
      if (err instanceof ServiceError && err.status === 404) return notFound("Watchlist")
      logger.error({ err }, "DELETE /api/watchlist/[id] error")
      return serverError()
    }
  },
  { preset: "authenticated" }
)
