// ============================================================
// app/api/orders/route.ts — GET (list) / POST (create)
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError, getSessionId } from "@/lib/auth"
import { orderService, ServiceError } from "@/services/order.service"
import { CreateOrderSchema, OrderQuerySchema } from "@/validators/order.schema"
import {
  ok, created, badRequest, unauthorized, forbidden,
  notFound, unprocessable, serverError, buildPaginationMeta,
} from "@/utils/response"
import { withRateLimit } from "@/utils/rate-limit-middleware"
import { db } from "@/lib/db"
import { logger } from "@/utils/logger"

// ── GET /api/orders ──────────────────────────────────────────
export const GET = withRateLimit(
  async (req: NextRequest) => {
    try {
      const user = await requireAuth()

      const params = Object.fromEntries(req.nextUrl.searchParams)
      const parsed = OrderQuerySchema.safeParse(params)

      if (!parsed.success) {
        return badRequest("Invalid query parameters", parsed.error.flatten().fieldErrors as Record<string, string[]>)
      }

      const { orders, total } = await orderService.listOrders(user.id, parsed.data)
      const meta = buildPaginationMeta(total, parsed.data.page, parsed.data.limit)

      return ok(orders, meta)
    } catch (err) {
      if (err instanceof AuthError) {
        return err.status === 401 ? unauthorized() : forbidden(err.code)
      }
      logger.error({ err }, "GET /api/orders error")
      return serverError()
    }
  },
  { preset: "orders" }
)

// ── POST /api/orders ─────────────────────────────────────────
export const POST = withRateLimit(
  async (req: NextRequest) => {
    try {
      const user = await requireAuth()

      const body = await req.json()
      const parsed = CreateOrderSchema.safeParse(body)

      if (!parsed.success) {
        return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>)
      }

      const order = await orderService.createOrder(user.id, parsed.data)

      // Audit log
      const sessionId = getSessionId(req)
      await db.auditLog.create({
        data: {
          userId: user.id,
          clerkSessionId: sessionId,
          action: "ORDER_PLACED",
          resource: "Order",
          resourceId: order.id,
          newData: { side: order.side, type: order.type, quantity: Number(order.quantity) },
          ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
          userAgent: req.headers.get("user-agent") ?? undefined,
        },
      })

      return created(order)
    } catch (err) {
      if (err instanceof AuthError) {
        return err.status === 401 ? unauthorized() : forbidden(err.code)
      }
      if (err instanceof ServiceError) {
        if (err.status === 404) return notFound(err.code)
        if (err.status === 422) return unprocessable(err.message)
        if (err.status === 403) return forbidden(err.message)
      }
      logger.error({ err }, "POST /api/orders error")
      return serverError()
    }
  },
  { preset: "orders", requireAuth: true }
)