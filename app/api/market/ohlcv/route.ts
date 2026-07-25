// ============================================================
// app/api/market/ohlcv/route.ts — GET /api/market/ohlcv
// ============================================================
import { type NextRequest } from "next/server"
import { marketService } from "@/services/market.service"
import { OHLCVQuerySchema } from "@/validators/market.schema"
import { ok, badRequest, serverError } from "@/utils/response"
import { withRateLimit } from "@/utils/rate-limit-middleware"
import { logger } from "@/utils/logger"

export const GET = withRateLimit(
  async (req: NextRequest) => {
    try {
      const params = Object.fromEntries(req.nextUrl.searchParams)
      const parsed = OHLCVQuerySchema.safeParse(params)

      if (!parsed.success) {
        return badRequest("Invalid query parameters", parsed.error.flatten().fieldErrors as Record<string, string[]>)
      }

      const bars = await marketService.getOHLCV(parsed.data)
      return ok(bars)
    } catch (err) {
      logger.error({ err }, "GET /api/market/ohlcv error")
      return serverError()
    }
  },
  { preset: "marketData" }
)