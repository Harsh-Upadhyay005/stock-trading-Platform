// ============================================================
// app/api/account/settings/route.ts — GET / PUT
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError, getSessionId } from "@/lib/auth"
import { ok, badRequest, unauthorized, forbidden, serverError } from "@/utils/response"
import { withRateLimit } from "@/utils/rate-limit-middleware"
import { db } from "@/lib/db"
import { logger } from "@/utils/logger"
import { z } from "zod"

const SettingsSchema = z.object({
  notifications: z.object({
    email: z.object({
      orderExecutions: z.boolean(),
      priceAlerts: z.boolean(),
      marginCalls: z.boolean(),
      newsletter: z.boolean(),
    }).optional(),
    sms: z.object({
      orderExecutions: z.boolean(),
      priceAlerts: z.boolean(),
      marginCalls: z.boolean(),
    }).optional(),
    push: z.object({
      orderExecutions: z.boolean(),
      priceAlerts: z.boolean(),
      marginCalls: z.boolean(),
    }).optional(),
  }).optional(),
  security: z.object({
    twoFactorAuth: z.boolean(),
    biometric: z.boolean(),
    sessionTimeout: z.string(),
  }).optional(),
})

export const GET = withRateLimit(
  async (req: NextRequest) => {
    try {
      const user = await requireAuth()
      
      const settings = await db.userSettings.findUnique({
        where: { userId: user.id },
      })

      if (!settings) {
        // Return default settings
        return ok({
          notifications: {
            email: {
              orderExecutions: true,
              priceAlerts: true,
              marginCalls: true,
              newsletter: false,
            },
            sms: {
              orderExecutions: true,
              priceAlerts: false,
              marginCalls: true,
            },
            push: {
              orderExecutions: true,
              priceAlerts: true,
              marginCalls: true,
            },
          },
          security: {
            twoFactorAuth: false,
            biometric: false,
            sessionTimeout: "30",
          },
        })
      }

      return ok(settings.preferences)
    } catch (err) {
      if (err instanceof AuthError) {
        return err.status === 401 ? unauthorized() : forbidden(err.code)
      }
      logger.error({ err }, "GET /api/account/settings error")
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
      const parsed = SettingsSchema.safeParse(body)

      if (!parsed.success) {
        return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>)
      }

      const updated = await db.userSettings.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          preferences: parsed.data as any,
        },
        update: {
          preferences: parsed.data as any,
        },
      })

      // Audit log
      const sessionId = getSessionId(req)
      await db.auditLog.create({
        data: {
          userId: user.id,
          clerkSessionId: sessionId,
          action: "SETTINGS_UPDATED",
          resource: "UserSettings",
          resourceId: updated.id,
          newData: parsed.data,
          ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
          userAgent: req.headers.get("user-agent") ?? undefined,
        },
      })

      return ok(updated.preferences)
    } catch (err) {
      if (err instanceof AuthError) {
        return err.status === 401 ? unauthorized() : forbidden(err.code)
      }
      logger.error({ err }, "PUT /api/account/settings error")
      return serverError()
    }
  },
  { preset: "authenticated", requireAuth: true }
)
