// ============================================================
// app/api/alerts/[id]/route.ts — GET / PATCH / DELETE
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError } from "@/lib/auth"
import { alertService } from "@/services/alert.service"
import { ServiceError } from "@/services/order.service"
import { AlertUpdateSchema } from "@/validators/user.schema"
import {
  ok, noContent, badRequest, unauthorized, forbidden, notFound, serverError,
} from "@/utils/response"
import { logger } from "@/utils/logger"
import type { RouteContext } from "@/types/api"

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<{ id: string }>
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const alerts = await alertService.listAlerts(user.id)
    const alert = alerts.find((a) => a.id === id)

    if (!alert) return notFound("Alert")
    return ok(alert)
  } catch (err) {
    if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
    logger.error({ err }, "GET /api/alerts/[id] error")
    return serverError()
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteContext<{ id: string }>
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await req.json()
    const parsed = AlertUpdateSchema.safeParse(body)

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
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext<{ id: string }>
) {
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
}