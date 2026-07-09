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
import { rateLimit, getIdentifier } from "@/utils/rate-limit"
import { db } from "@/lib/db"
import { logger } from "@/utils/logger"

// ── GET /api/orders ──────────────────────────────────────────
export async function GET(req: NextRequest) {
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
}

// ── POST /api/orders ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()

    // Rate limit: 10 order creations per minute per user
    const limiter = await rateLimit(getIdentifier(req, user.id), {
      limit: 10,
      windowSec: 60,
      prefix: "orders:create",
    })
    if (limiter.limited) return limiter.response

    const body = await req.json()
    const parsed = CreateOrderSchema.safeParse(body)

    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>)
    }

    const order = await orderService.createOrder(user.id, parsed.data)

    // Audit log
    const sessionId = await getSessionId()
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
}