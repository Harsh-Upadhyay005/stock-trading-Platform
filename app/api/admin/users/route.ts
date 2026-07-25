// ============================================================
// app/api/admin/users/route.ts — GET (list users)
// ============================================================
import { type NextRequest } from "next/server"
import { requireAdmin, AuthError } from "@/lib/auth"
import { adminService } from "@/services/admin.service"
import { AdminUserQuerySchema } from "@/validators/admin.schema"
import {
  ok,
  badRequest,
  unauthorized,
  forbidden,
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
      const parsed = AdminUserQuerySchema.safeParse(params)

      if (!parsed.success) {
        return badRequest(
          "Invalid query parameters",
          parsed.error.flatten().fieldErrors as Record<string, string[]>
        )
      }

      const { users, total } = await adminService.listUsers(parsed.data)
      const meta = buildPaginationMeta(total, parsed.data.page, parsed.data.limit)

      return ok(users, meta)
    } catch (err) {
      if (err instanceof AuthError)
        return err.status === 401 ? unauthorized() : forbidden(err.code)
      logger.error({ err }, "GET /api/admin/users error")
      return serverError()
    }
  },
  { preset: "admin" }
)
