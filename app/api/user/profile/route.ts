// ============================================================
// app/api/user/profile/route.ts — GET / PATCH
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError } from "@/lib/auth"
import { userService } from "@/services/user.service"
import { UpdateProfileSchema } from "@/validators/profile.schema"
import {
  ok, badRequest, unauthorized, forbidden, serverError,
} from "@/utils/response"
import { withRateLimit } from "@/utils/rate-limit-middleware"
import { logger } from "@/utils/logger"

export const GET = withRateLimit(
  async (_req: NextRequest) => {
    try {
      const user = await requireAuth()
      const profile = await userService.getProfile(user.id)
      return ok(profile)
    } catch (err) {
      if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
      logger.error({ err }, "GET /api/user/profile error")
      return serverError()
    }
  },
  { preset: "authenticated" }
)

export const PATCH = withRateLimit(
  async (req: NextRequest) => {
    try {
      const user = await requireAuth()
      const body = await req.json()
      const parsed = UpdateProfileSchema.safeParse(body)

      if (!parsed.success) {
        return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>)
      }

      const profile = await userService.updateProfile(user.id, parsed.data)
      return ok(profile)
    } catch (err) {
      if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
      logger.error({ err }, "PATCH /api/user/profile error")
      return serverError()
    }
  },
  { preset: "authenticated" }
)
