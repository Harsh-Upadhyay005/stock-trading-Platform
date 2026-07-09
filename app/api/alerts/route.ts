// ============================================================
// app/api/alerts/route.ts — GET / POST
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError } from "@/lib/auth"
import { alertService } from "@/services/alert.service"
import { ServiceError } from "@/services/order.service"
import { AlertCreateSchema } from "@/validators/user.schema"
import {
  ok, created, badRequest, unauthorized, forbidden, notFound, serverError,
} from "@/utils/response"
import { logger } from "@/utils/logger"

// ── GET /api/alerts ───────────────────────────────────────────
export async function GET(_req: NextRequest) {
  try {
    const user = await requireAuth()
    const alerts = await alertService.listAlerts(user.id)
    return ok(alerts)
  } catch (err) {
    if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
    logger.error({ err }, "GET /api/alerts error")
    return serverError()
  }
}

// ── POST /api/alerts ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const parsed = AlertCreateSchema.safeParse(body)

    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>)
    }

    const alert = await alertService.createAlert(user.id, parsed.data)
    return created(alert)
  } catch (err) {
    if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
    if (err instanceof ServiceError && err.status === 404) return notFound("Symbol")
    logger.error({ err }, "POST /api/alerts error")
    return serverError()
  }
}