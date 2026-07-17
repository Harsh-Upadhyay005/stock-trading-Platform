// ============================================================
// app/api/watchlist/route.ts — GET / POST
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError } from "@/lib/auth"
import { watchlistService } from "@/services/watchlist.service"
import { ServiceError } from "@/services/order.service"
import { CreateWatchlistSchema, WatchlistQuerySchema } from "@/validators/watchlist.schema"
import {
  ok, created, badRequest, unauthorized, forbidden,
  conflict, serverError, buildPaginationMeta,
} from "@/utils/response"
import { withRateLimit } from "@/utils/rate-limit-middleware"
import { logger } from "@/utils/logger"

// ── GET /api/watchlist ────────────────────────────────────────
export const GET = withRateLimit(
  async (req: NextRequest) => {
    try {
      const user = await requireAuth()

      const params = Object.fromEntries(req.nextUrl.searchParams)
      const parsed = WatchlistQuerySchema.safeParse(params)

      if (!parsed.success) {
        return badRequest("Invalid query parameters", parsed.error.flatten().fieldErrors as Record<string, string[]>)
      }

      const { watchlists, total } = await watchlistService.listWatchlists(user.id, parsed.data)
      const meta = buildPaginationMeta(total, parsed.data.page, parsed.data.limit)

      return ok(watchlists, meta)
    } catch (err) {
      if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
      logger.error({ err }, "GET /api/watchlist error")
      return serverError()
    }
  },
  { preset: "authenticated" }
)

// ── POST /api/watchlist ───────────────────────────────────────
export const POST = withRateLimit(
  async (req: NextRequest) => {
    try {
      const user = await requireAuth()
      const body = await req.json()
      const parsed = CreateWatchlistSchema.safeParse(body)

      if (!parsed.success) {
        return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>)
      }

      const watchlist = await watchlistService.createWatchlist(user.id, parsed.data)
      return created(watchlist)
    } catch (err) {
      if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
      if (err instanceof ServiceError && err.status === 409) return conflict(err.message)
      logger.error({ err }, "POST /api/watchlist error")
      return serverError()
    }
  },
  { preset: "authenticated" }
)