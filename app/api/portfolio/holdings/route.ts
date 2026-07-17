// ============================================================
// app/api/portfolio/holdings/route.ts — GET /api/portfolio/holdings
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError } from "@/lib/auth"
import { portfolioService } from "@/services/portfolio.service"
import { ServiceError } from "@/services/order.service"
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/utils/response"
import { withRateLimit } from "@/utils/rate-limit-middleware"
import { logger } from "@/utils/logger"

export const GET = withRateLimit(
  async (req: NextRequest) => {
    try {
      const user = await requireAuth()
      const accountId = req.nextUrl.searchParams.get("accountId")

      if (!accountId) {
        return badRequest("accountId query parameter is required")
      }

      const holdings = await portfolioService.getHoldings(user.id, accountId)
      return ok(holdings)
    } catch (err) {
      if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
      if (err instanceof ServiceError && err.status === 404) return notFound("Account")
      logger.error({ err }, "GET /api/portfolio/holdings error")
      return serverError()
    }
  },
  { preset: "authenticated" }
)