// ============================================================
// app/api/portfolio/route.ts — GET /api/portfolio
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError } from "@/lib/auth"
import { portfolioService } from "@/services/portfolio.service"
import { ok, unauthorized, forbidden, serverError } from "@/utils/response"
import { logger } from "@/utils/logger"

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const accountId = req.nextUrl.searchParams.get("accountId") ?? undefined

    const summary = await portfolioService.getSummary(user.id, accountId)
    return ok(summary)
  } catch (err) {
    if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
    logger.error({ err }, "GET /api/portfolio error")
    return serverError()
  }
}