// ============================================================
// app/api/activity/route.ts — GET /api/activity
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
      
      const type = req.nextUrl.searchParams.get('type')
      const limitParam = req.nextUrl.searchParams.get('limit')
      const limit = limitParam ? parseInt(limitParam, 10) : 50

      const activities = await db.auditLog.findMany({
        where: {
          userId: user.id,
          ...(type && { action: type }),
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: limit,
      })

      return ok(activities)
    } catch (err) {
      if (err instanceof AuthError) {
        return err.status === 401 ? unauthorized() : forbidden(err.code)
      }
      logger.error({ err }, "GET /api/activity error")
      return serverError()
    }
  },
  { preset: "authenticated" }
)
