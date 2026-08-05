// ============================================================
// app/api/notifications/route.ts — GET /api/notifications
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
      
      const unreadParam = req.nextUrl.searchParams.get('unread')
      const unreadOnly = unreadParam === 'true'

      const notifications = await db.notification.findMany({
        where: {
          userId: user.id,
          ...(unreadOnly && { read: false }),
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      })

      return ok(notifications)
    } catch (err) {
      if (err instanceof AuthError) {
        return err.status === 401 ? unauthorized() : forbidden(err.code)
      }
      logger.error({ err }, "GET /api/notifications error")
      return serverError()
    }
  },
  { preset: "authenticated" }
)
