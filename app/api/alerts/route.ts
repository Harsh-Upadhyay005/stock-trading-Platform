// ============================================================
// app/api/alerts/route.ts — GET / POST
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError } from "@/lib/auth"
import { alertService } from "@/services/alert.service"
import { ServiceError } from "@/services/order.service"
import { CreateAlertSchema, AlertQuerySchema } from "@/validators/alert.schema"
import {
  ok, created, badRequest, unauthorized, forbidden, notFound, conflict, serverError, buildPaginationMeta,
} from "@/utils/response"
import { withRateLimit } from "@/utils/rate-limit-middleware"
import { logger } from "@/utils/logger"

// ── GET /api/alerts ───────────────────────────────────────────
export const GET = withRateLimit(
  async (req: NextRequest) => {
    try {
      const user = await requireAuth()
      
      const params = Object.fromEntries(req.nextUrl.searchParams)
      const parsed = AlertQuerySchema.safeParse(params)

      if (!parsed.success) {
        return badRequest("Invalid query parameters", parsed.error.flatten().fieldErrors as Record<string, string[]>)
      }

      const { alerts, total } = await alertService.listAlerts(user.id, parsed.data)
      const meta = buildPaginationMeta(total, parsed.data.page, parsed.data.limit)

      return ok(alerts, meta)
    } catch (err) {
      if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
      logger.error({ err }, "GET /api/alerts error")
      return serverError()
    }
  },
  { preset: "authenticated" }
)

// ── POST /api/alerts ──────────────────────────────────────────
export const POST = withRateLimit(
  async (req: NextRequest) => {
    try {
      const user = await requireAuth()
      const body = await req.json()
      const parsed = CreateAlertSchema.safeParse(body)

      if (!parsed.success) {
        return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>)
      }

      const alert = await alertService.createAlert(user.id, parsed.data)
      return created(alert)
    } catch (err) {
      if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
      if (err instanceof ServiceError) {
        if (err.status === 404) return notFound("Symbol")
        if (err.status === 409) return conflict(err.message)
      }
      logger.error({ err }, "POST /api/alerts error")
      return serverError()
    }
  },
  { preset: "authenticated" }
)