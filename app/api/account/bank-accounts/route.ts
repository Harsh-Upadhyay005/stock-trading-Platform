// ============================================================
// app/api/account/bank-accounts/route.ts — GET / POST
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError, getSessionId } from "@/lib/auth"
import { ok, created, badRequest, unauthorized, forbidden, serverError } from "@/utils/response"
import { withRateLimit } from "@/utils/rate-limit-middleware"
import { db } from "@/lib/db"
import { logger } from "@/utils/logger"
import { z } from "zod"

const BankAccountSchema = z.object({
  accountHolderName: z.string().min(1),
  accountNumber: z.string().min(1),
  ifscCode: z.string().min(1),
  bankName: z.string().min(1),
  branchName: z.string().optional(),
  accountType: z.enum(['SAVINGS', 'CURRENT']),
  isPrimary: z.boolean().optional(),
})

export const GET = withRateLimit(
  async (req: NextRequest) => {
    try {
      const user = await requireAuth()
      
      const bankAccounts = await db.bankAccount.findMany({
        where: { userId: user.id },
        orderBy: { isPrimary: 'desc' },
      })

      return ok(bankAccounts)
    } catch (err) {
      if (err instanceof AuthError) {
        return err.status === 401 ? unauthorized() : forbidden(err.code)
      }
      logger.error({ err }, "GET /api/account/bank-accounts error")
      return serverError()
    }
  },
  { preset: "authenticated" }
)

export const POST = withRateLimit(
  async (req: NextRequest) => {
    try {
      const user = await requireAuth()
      
      const body = await req.json()
      const parsed = BankAccountSchema.safeParse(body)

      if (!parsed.success) {
        return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>)
      }

      // If setting as primary, unset other primary accounts
      if (parsed.data.isPrimary) {
        await db.bankAccount.updateMany({
          where: { userId: user.id, isPrimary: true },
          data: { isPrimary: false },
        })
      }

      const bankAccount = await db.bankAccount.create({
        data: {
          ...parsed.data,
          userId: user.id,
          isVerified: false, // Requires verification
        },
      })

      // Audit log
      const sessionId = getSessionId(req)
      await db.auditLog.create({
        data: {
          userId: user.id,
          clerkSessionId: sessionId,
          action: "BANK_ACCOUNT_ADDED",
          resource: "BankAccount",
          resourceId: bankAccount.id,
          newData: { bankName: bankAccount.bankName },
          ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
          userAgent: req.headers.get("user-agent") ?? undefined,
        },
      })

      return created(bankAccount)
    } catch (err) {
      if (err instanceof AuthError) {
        return err.status === 401 ? unauthorized() : forbidden(err.code)
      }
      logger.error({ err }, "POST /api/account/bank-accounts error")
      return serverError()
    }
  },
  { preset: "authenticated", requireAuth: true }
)
