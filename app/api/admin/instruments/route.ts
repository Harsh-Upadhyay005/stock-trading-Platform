// ============================================================
// app/api/admin/instruments/route.ts — GET / POST
// ============================================================
import { type NextRequest } from "next/server"
import { requireAdmin, AuthError } from "@/lib/auth"
import { adminService } from "@/services/admin.service"
import { ServiceError } from "@/services/order.service"
import {
  CreateInstrumentSchema,
  InstrumentQuerySchema,
} from "@/validators/admin.schema"
import {
  ok,
  created,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  serverError,
  buildPaginationMeta,
} from "@/utils/response"
import { withRateLimit } from "@/utils/rate-limit-middleware"
import { logger } from "@/utils/logger"

export const GET = withRateLimit(
  async (req: NextRequest) => {
    try {
      await requireAdmin()

      const params = Object.fromEntries(req.nextUrl.searchParams)
      const parsed = InstrumentQuerySchema.safeParse(params)

      if (!parsed.success) {
        return badRequest(
          "Invalid query parameters",
          parsed.error.flatten().fieldErrors as Record<string, string[]>
        )
      }

      const { instruments, total } = await adminService.listInstruments(parsed.data)
      const meta = buildPaginationMeta(total, parsed.data.page, parsed.data.limit)

      return ok(instruments, meta)
    } catch (err) {
      if (err instanceof AuthError)
        return err.status === 401 ? unauthorized() : forbidden(err.code)
      logger.error({ err }, "GET /api/admin/instruments error")
      return serverError()
    }
  },
  { preset: "admin" }
)

export const POST = withRateLimit(
  async (req: NextRequest) => {
    try {
      const admin = await requireAdmin()
      const body = await req.json()
      const parsed = CreateInstrumentSchema.safeParse(body)

      if (!parsed.success) {
        return badRequest(
          "Validation failed",
          parsed.error.flatten().fieldErrors as Record<string, string[]>
        )
      }

      const instrument = await adminService.createInstrument(admin.id, parsed.data)
      return created(instrument)
    } catch (err) {
      if (err instanceof AuthError)
        return err.status === 401 ? unauthorized() : forbidden(err.code)
      if (err instanceof ServiceError) {
        if (err.status === 404) return notFound(err.code)
        if (err.status === 409) return conflict(err.message)
      }
      logger.error({ err }, "POST /api/admin/instruments error")
      return serverError()
    }
  },
  { preset: "admin" }
)
