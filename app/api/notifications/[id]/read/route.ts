// ============================================================
// app/api/notifications/[id]/read/route.ts — POST
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError } from "@/lib/auth"
import { ok, notFound, unauthorized, forbidden, serverError } from "@/utils/response"
import { withRateLimit } from "@/utils/rate-limit-middleware"
import { db } from "@/lib/db"
import { logger } from "@/utils/logger"

export const POST = withRateLimit(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const user = await requireAuth()
      
      const notification = await db.notification.findUnique({
        where: { id: params.id },
      })

      if (!notification || notification.userId !== user.id) {
        return notFound("Notification not found")
      }

      const updated = await db.notification.update({
        where: { id: params.id },
        data: { read: true },
      })

      return ok(updated)
    } catch (err) {
      if (err instanceof AuthError) {
        return err.status === 401 ? unauthorized() : forbidden(err.code)
      }
      logger.error({ err }, "POST /api/notifications/[id]/read error")
      return serverError()
    }
  },
  { preset: "authenticated" }
)
