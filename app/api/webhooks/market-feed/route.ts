// ============================================================
// app/api/webhooks/market-feed/route.ts
// Inbound market data feed — secured by shared secret
// ============================================================
import { type NextRequest } from "next/server"
import { marketService } from "@/services/market.service"
import { MarketFeedBatchSchema } from "@/validators/market.schema"
import { ok, badRequest, unauthorized, serverError } from "@/utils/response"
import { logger } from "@/utils/logger"
import { createHmac, timingSafeEqual } from "crypto"

function verifySignature(payload: string, signature: string | null): boolean {
  if (!signature) return false
  const secret = process.env.MARKET_FEED_SECRET
  if (!secret) return false

  const expected = createHmac("sha256", secret).update(payload).digest("hex")
  const expectedBuf = Buffer.from(`sha256=${expected}`)
  const receivedBuf = Buffer.from(signature)

  // Constant-time comparison to prevent timing attacks
  if (expectedBuf.length !== receivedBuf.length) return false
  return timingSafeEqual(expectedBuf, receivedBuf)
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get("x-feed-signature")

    if (!verifySignature(rawBody, signature)) {
      logger.warn("Market feed signature verification failed")
      return unauthorized("Invalid feed signature")
    }

    let body: unknown
    try {
      body = JSON.parse(rawBody)
    } catch {
      return badRequest("Invalid JSON body")
    }

    const parsed = MarketFeedBatchSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest("Invalid feed payload", parsed.error.flatten().fieldErrors as Record<string, string[]>)
    }

    const result = await marketService.ingestFeed(parsed.data)
    logger.info({ updated: result.updated }, "Market feed ingested")

    return ok(result)
  } catch (err) {
    logger.error({ err }, "POST /api/webhooks/market-feed error")
    return serverError()
  }
}