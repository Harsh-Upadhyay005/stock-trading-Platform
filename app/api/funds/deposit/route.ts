// ============================================================
// app/api/funds/deposit/route.ts — POST
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError, getSessionId } from "@/lib/auth"
import { created, badRequest, unauthorized, forbidden, serverError } from "@/utils/response"
import { withRateLimit } from "@/utils/rate-limit-middleware"
import { db } from "@/lib/db"
import { logger } from "@/utils/logger"
import { z } from "zod"

const DepositSchema = z.object({
  accountId: z.string(),
  amount: z.number().positive(),
  method: z.enum(['BANK_TRANSFER', 'UPI', 'CARD', 'NET_BANKING']),
})

export const POST = withRateLimit(
  async (req: NextRequest) => {
    try {
      const user = await requireAuth()
      
      const body = await req.json()
      const parsed = DepositSchema.safeParse(body)

      if (!parsed.success) {
        return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>)
      }

      const { accountId, amount, method } = parsed.data

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

      // Create transaction
      const transaction = await db.fundsTransaction.create({
        data: {
          accountId,
          type: 'DEPOSIT',
          amount,
          status: 'COMPLETED', // In paper trading, instantly complete
          method,
          referenceId: `DEP-${Date.now()}`,
        },
      })

      // Update account balance
      await db.tradingAccount.update({
        where: { id: accountId },
        data: {
          balance: {
            increment: amount,
          },
        },
      })

      // Audit log
      const sessionId = getSessionId(req)
      await db.auditLog.create({
        data: {
          userId: user.id,
          clerkSessionId: sessionId,
          action: "FUNDS_DEPOSITED",
          resource: "FundsTransaction",
          resourceId: transaction.id,
          newData: { amount, method },
          ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
          userAgent: req.headers.get("user-agent") ?? undefined,
        },
      })

      return created(transaction)
    } catch (err) {
      if (err instanceof AuthError) {
        return err.status === 401 ? unauthorized() : forbidden(err.code)
      }
      logger.error({ err }, "POST /api/funds/deposit error")
      return serverError()
    }
  },
  { preset: "authenticated", requireAuth: true }
)
