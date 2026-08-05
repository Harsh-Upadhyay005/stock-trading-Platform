// ============================================================
// app/api/market/indices/route.ts — GET
// ============================================================
import { type NextRequest } from "next/server"
import { ok, serverError } from "@/utils/response"
import { withRateLimit } from "@/utils/rate-limit-middleware"
import { marketService } from "@/services/market.service"
import { logger } from "@/utils/logger"

export const GET = withRateLimit(
  async (req: NextRequest) => {
    try {
      // Fetch major indices
      const indices = await marketService.getQuotes({
        tickers: '^NSEI,^BSESN,^GSPC,^DJI', // NIFTY, SENSEX, S&P 500, DOW
      })

      return ok(indices)
    } catch (err) {
      logger.error({ err }, "GET /api/market/indices error")
      return serverError()
    }
  },
  { preset: "marketData" }
)
