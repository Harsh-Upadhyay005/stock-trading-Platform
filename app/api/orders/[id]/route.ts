// ============================================================
// app/api/orders/[id]/route.ts — GET / PATCH / DELETE
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError } from "@/lib/auth"
import { orderService, ServiceError } from "@/services/order.service"
import { UpdateOrderSchema } from "@/validators/order.schema"
import {
  ok, noContent, badRequest, unauthorized, forbidden,
  notFound, unprocessable, serverError,
} from "@/utils/response"
import { withRateLimit } from "@/utils/rate-limit-middleware"
import { logger } from "@/utils/logger"
import type { RouteContext } from "@/types/api"

// ── GET /api/orders/[id] ──────────────────────────────────────
export const GET = withRateLimit(
  async (_req: NextRequest, { params }: RouteContext<{ id: string }>) => {
    try {
      const user = await requireAuth()
      const { id } = await params
      const order = await orderService.getOrder(user.id, id)
      return ok(order)
    } catch (err) {
      if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
      if (err instanceof ServiceError && err.status === 404) return notFound("Order")
      logger.error({ err }, "GET /api/orders/[id] error")
      return serverError()
    }
  },
  { preset: "orders" }
)

// ── PATCH /api/orders/[id] ────────────────────────────────────
export const PATCH = withRateLimit(
  async (req: NextRequest, { params }: RouteContext<{ id: string }>) => {
    try {
      const user = await requireAuth()
      const { id } = await params
      const body = await req.json()
      const parsed = UpdateOrderSchema.safeParse(body)

      if (!parsed.success) {
        return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>)
      }

      const order = await orderService.updateOrder(user.id, id, parsed.data)
      return ok(order)
    } catch (err) {
      if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
      if (err instanceof ServiceError) {
        if (err.status === 404) return notFound("Order")
        if (err.status === 422) return unprocessable(err.message)
      }
      logger.error({ err }, "PATCH /api/orders/[id] error")
      return serverError()
    }
  },
  { preset: "orders" }
)

// ── DELETE /api/orders/[id] ───────────────────────────────────
export const DELETE = withRateLimit(
  async (_req: NextRequest, { params }: RouteContext<{ id: string }>) => {
    try {
      const user = await requireAuth()
      const { id } = await params
      await orderService.deleteOrder(user.id, id)
      return noContent()
    } catch (err) {
      if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
      if (err instanceof ServiceError && err.status === 404) return notFound("Order")
      logger.error({ err }, "DELETE /api/orders/[id] error")
      return serverError()
    }
  },
  { preset: "orders" }
)