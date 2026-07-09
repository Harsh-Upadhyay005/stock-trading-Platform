// ============================================================
// app/api/orders/[id]/cancel/route.ts — POST /api/orders/[id]/cancel
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError, getSessionId } from "@/lib/auth"
import { orderService, ServiceError } from "@/services/order.service"
import { db } from "@/lib/db"
import {
  ok, unauthorized, forbidden, notFound, unprocessable, serverError,
} from "@/utils/response"
import { logger } from "@/utils/logger"
import type { RouteContext } from "@/types/api"

export async function POST(
  req: NextRequest,
  { params }: RouteContext<{ id: string }>
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const order = await orderService.cancelOrder(user.id, id)

    // Audit log
    const sessionId = await getSessionId()
    await db.auditLog.create({
      data: {
        userId: user.id,
        clerkSessionId: sessionId,
        action: "ORDER_CANCELLED",
        resource: "Order",
        resourceId: id,
        newData: { status: "CANCELLED" },
        ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
        userAgent: req.headers.get("user-agent") ?? undefined,
      },
    })

    return ok(order)
  } catch (err) {
    if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
    if (err instanceof ServiceError) {
      if (err.status === 404) return notFound("Order")
      if (err.status === 422) return unprocessable(err.message)
    }
    logger.error({ err }, "POST /api/orders/[id]/cancel error")
    return serverError()
  }
}