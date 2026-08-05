// ============================================================
// app/api/account/profile/route.ts — GET / PUT
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError, getSessionId } from "@/lib/auth"
import { ok, badRequest, unauthorized, forbidden, serverError } from "@/utils/response"
import { withRateLimit } from "@/utils/rate-limit-middleware"
import { db } from "@/lib/db"
import { logger } from "@/utils/logger"
import { z } from "zod"

const UpdateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  nationality: z.string().optional(),
  occupation: z.string().optional(),
  annualIncome: z.string().optional(),
  netWorth: z.string().optional(),
})

export const GET = withRateLimit(
  async (req: NextRequest) => {
    try {
      const user = await requireAuth()
      
      const profile = await db.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          clerkId: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          phone: true,
          dateOfBirth: true,
          address: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
          nationality: true,
          occupation: true,
          annualIncome: true,
          netWorth: true,
          kycStatus: true,
          riskProfile: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      if (!profile) {
        return badRequest("Profile not found")
      }

      return ok(profile)
    } catch (err) {
      if (err instanceof AuthError) {
        return err.status === 401 ? unauthorized() : forbidden(err.code)
      }
      logger.error({ err }, "GET /api/account/profile error")
      return serverError()
    }
  },
  { preset: "authenticated" }
)

export const PUT = withRateLimit(
  async (req: NextRequest) => {
    try {
      const user = await requireAuth()
      
      const body = await req.json()
      const parsed = UpdateProfileSchema.safeParse(body)

      if (!parsed.success) {
        return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>)
      }

      const updated = await db.user.update({
        where: { id: user.id },
        data: parsed.data,
      })

      // Audit log
      const sessionId = getSessionId(req)
      await db.auditLog.create({
        data: {
          userId: user.id,
          clerkSessionId: sessionId,
          action: "PROFILE_UPDATED",
          resource: "User",
          resourceId: user.id,
          newData: parsed.data,
          ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
          userAgent: req.headers.get("user-agent") ?? undefined,
        },
      })

      return ok(updated)
    } catch (err) {
      if (err instanceof AuthError) {
        return err.status === 401 ? unauthorized() : forbidden(err.code)
      }
      logger.error({ err }, "PUT /api/account/profile error")
      return serverError()
    }
  },
  { preset: "authenticated", requireAuth: true }
)
