// ============================================================
// app/api/notifications/read-all/route.ts — POST
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError } from "@/lib/auth"
import { ok, unauthorized, forbidden, serverError } from "@/utils/response"
import { withRateLimit } from "@/utils/rate-limit-middleware"
import { db } from "@/lib/db"
import { logger } from "@/utils/logger"

export const POST = withRateLimit(
  async (req: NextRequest) => {
    try {
      const user = await requireAuth()
      
      const result = await db.notification.updateMany({
        where: {
          userId: user.id,
          read: false,
        },
        data: {
          read: true,
        },
      })

      return ok({ updated: result.count })
    } catch (err) {
      if (err instanceof AuthError) {
        return err.status === 401 ? unauthorized() : forbidden(err.code)
      }
      logger.error({ err }, "POST /api/notifications/read-all error")
      return serverError()
    }
  },
  { preset: "authenticated" }
)
