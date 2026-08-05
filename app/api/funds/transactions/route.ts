// ============================================================
// app/api/funds/transactions/route.ts — GET
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError } from "@/lib/auth"
import { ok, badRequest, unauthorized, forbidden, serverError } from "@/utils/response"
import { withRateLimit } from "@/utils/rate-limit-middleware"
import { db } from "@/lib/db"
import { logger } from "@/utils/logger"

export const GET = withRateLimit(
  async (req: NextRequest) => {
    try {
      const user = await requireAuth()
      
      const accountId = req.nextUrl.searchParams.get('accountId')

      if (!accountId) {
        return badRequest("accountId is required")
      }

      // Verify account belongs to user
      const account = await db.tradingAccount.findFirst({
        where: {
          id: accountId,
          userId: user.id,
        },
      })

      if (!account) {
        return forbidden("Access denied")
      }

      const transactions = await db.fundsTransaction.findMany({
        where: {
          accountId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 100,
      })

      return ok(transactions)
    } catch (err) {
      if (err instanceof AuthError) {
        return err.status === 401 ? unauthorized() : forbidden(err.code)
      }
      logger.error({ err }, "GET /api/funds/transactions error")
      return serverError()
    }
  },
  { preset: "authenticated" }
)
