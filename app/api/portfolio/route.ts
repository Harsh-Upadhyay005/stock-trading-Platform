// ============================================================
// app/api/portfolio/route.ts — GET /api/portfolio
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError } from "@/lib/auth"
import { portfolioService } from "@/services/portfolio.service"
import { PortfolioQuerySchema } from "@/validators/portfolio.schema"
import { ok, badRequest, unauthorized, forbidden, serverError } from "@/utils/response"
import { withRateLimit } from "@/utils/rate-limit-middleware"
import { logger } from "@/utils/logger"

export const GET = withRateLimit(
  async (req: NextRequest) => {
    try {
      const user = await requireAuth()
      
      const params = Object.fromEntries(req.nextUrl.searchParams)
      const parsed = PortfolioQuerySchema.safeParse(params)

      if (!parsed.success) {
        return badRequest("Invalid query parameters", parsed.error.flatten().fieldErrors as Record<string, string[]>)
      }

      const summary = await portfolioService.getSummary(user.id, parsed.data.accountId)
      return ok(summary)
    } catch (err) {
      if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
      logger.error({ err }, "GET /api/portfolio error")
      return serverError()
    }
  },
  { preset: "authenticated" }
)
