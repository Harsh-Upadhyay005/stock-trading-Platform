// ============================================================
// app/api/market/quotes/route.ts — GET /api/market/quotes
// ============================================================
import { type NextRequest } from "next/server"
import { marketService } from "@/services/market.service"
import { QuoteQuerySchema } from "@/validators/market.schema"
import { ok, badRequest, serverError } from "@/utils/response"
import { logger } from "@/utils/logger"

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams)
    const parsed = QuoteQuerySchema.safeParse(params)

    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors as Record<string, string[]>
      return badRequest("Invalid query parameters", details)
    }

    const quotes = await marketService.getQuotes(parsed.data)
    return ok(quotes)
  } catch (err) {
    logger.error({ err }, "GET /api/market/quotes error")
    return serverError()
  }
}