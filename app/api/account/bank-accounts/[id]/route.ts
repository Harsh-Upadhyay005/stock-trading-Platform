// ============================================================
// app/api/account/bank-accounts/[id]/route.ts — DELETE / PUT
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError, getSessionId } from "@/lib/auth"
import { ok, notFound, unauthorized, forbidden, serverError } from "@/utils/response"
import { withRateLimit } from "@/utils/rate-limit-middleware"
import { db } from "@/lib/db"
import { logger } from "@/utils/logger"

export const DELETE = withRateLimit(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const user = await requireAuth()
      
      const bankAccount = await db.bankAccount.findUnique({
        where: { id: params.id },
      })

      if (!bankAccount || bankAccount.userId !== user.id) {
        return notFound("Bank account not found")
      }

      await db.bankAccount.delete({
        where: { id: params.id },
      })

      // Audit log
      const sessionId = getSessionId(req)
      await db.auditLog.create({
        data: {
          userId: user.id,
          clerkSessionId: sessionId,
          action: "BANK_ACCOUNT_DELETED",
          resource: "BankAccount",
          resourceId: params.id,
          oldData: { bankName: bankAccount.bankName },
          ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
          userAgent: req.headers.get("user-agent") ?? undefined,
        },
      })

      return ok({ message: "Bank account deleted successfully" })
    } catch (err) {
      if (err instanceof AuthError) {
        return err.status === 401 ? unauthorized() : forbidden(err.code)
      }
      logger.error({ err }, "DELETE /api/account/bank-accounts/[id] error")
      return serverError()
    }
  },
  { preset: "authenticated", requireAuth: true }
)
