// ============================================================
// app/api/market/search/route.ts — GET /api/market/search
// ============================================================
import { type NextRequest } from "next/server"
import { marketService } from "@/services/market.service"
import { SearchQuerySchema } from "@/validators/market.schema"
import { ok, badRequest, serverError } from "@/utils/response"
import { withRateLimit } from "@/utils/rate-limit-middleware"
import { logger } from "@/utils/logger"

export const GET = withRateLimit(
  async (req: NextRequest) => {
    try {
      const params = Object.fromEntries(req.nextUrl.searchParams)
      const parsed = SearchQuerySchema.safeParse(params)

      if (!parsed.success) {
        return badRequest("Invalid query parameters", parsed.error.flatten().fieldErrors as Record<string, string[]>)
      }

      const results = await marketService.searchSymbols(parsed.data)
      return ok(results)
    } catch (err) {
      logger.error({ err }, "GET /api/market/search error")
      return serverError()
    }
  },
  { preset: "marketData" }
)