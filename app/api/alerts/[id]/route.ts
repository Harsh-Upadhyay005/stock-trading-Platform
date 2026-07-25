// ============================================================
// app/api/alerts/[id]/route.ts — GET / PATCH / DELETE
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError } from "@/lib/auth"
import { alertService } from "@/services/alert.service"
import { ServiceError } from "@/services/order.service"
import { UpdateAlertSchema } from "@/validators/alert.schema"
import {
  ok, noContent, badRequest, unauthorized, forbidden, notFound, serverError,
} from "@/utils/response"
import { withRateLimit } from "@/utils/rate-limit-middleware"
import { logger } from "@/utils/logger"
import type { RouteContext } from "@/types/api"

export const GET = withRateLimit(
  async (_req: NextRequest, { params }: RouteContext<{ id: string }>) => {
    try {
      const user = await requireAuth()
      const { id } = await params

      const alert = await alertService.getAlert(user.id, id)
      return ok(alert)
    } catch (err) {
      if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
      logger.error({ err }, "GET /api/alerts/[id] error")
      return serverError()
    }
  },
  { preset: "authenticated" }
)

export const PATCH = withRateLimit(
  async (req: NextRequest, { params }: RouteContext<{ id: string }>) => {
    try {
      const user = await requireAuth()
      const { id } = await params
      const body = await req.json()
      const parsed = UpdateAlertSchema.safeParse(body)

      if (!parsed.success) {
        return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>)
      }

      const alert = await alertService.updateAlert(user.id, id, parsed.data)
      return ok(alert)
    } catch (err) {
      if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
      if (err instanceof ServiceError && err.status === 404) return notFound("Alert")
      logger.error({ err }, "PATCH /api/alerts/[id] error")
      return serverError()
    }
  },
  { preset: "authenticated" }
)

export const DELETE = withRateLimit(
  async (_req: NextRequest, { params }: RouteContext<{ id: string }>) => {
    try {
      const user = await requireAuth()
      const { id } = await params
      await alertService.deleteAlert(user.id, id)
      return noContent()
    } catch (err) {
      if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
      if (err instanceof ServiceError && err.status === 404) return notFound("Alert")
      logger.error({ err }, "DELETE /api/alerts/[id] error")
      return serverError()
    }
  },
  { preset: "authenticated" }
)