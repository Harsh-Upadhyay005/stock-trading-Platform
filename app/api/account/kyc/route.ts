// ============================================================
// app/api/account/kyc/route.ts — GET / POST
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError, getSessionId } from "@/lib/auth"
import { ok, badRequest, unauthorized, forbidden, serverError } from "@/utils/response"
import { withRateLimit } from "@/utils/rate-limit-middleware"
import { db } from "@/lib/db"
import { logger } from "@/utils/logger"
import { z } from "zod"

const KYCSchema = z.object({
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/),
  aadhaarNumber: z.string().regex(/^\d{12}$/),
  dateOfBirth: z.string(),
  address: z.string().min(1),
})

export const GET = withRateLimit(
  async (req: NextRequest) => {
    try {
      const user = await requireAuth()
      
      // Get user's KYC status
      const userData = await db.user.findUnique({
        where: { id: user.id },
        select: {
          kycStatus: true,
          kycSubmittedAt: true,
          kycVerifiedAt: true,
          panNumber: true,
          aadhaarNumber: true,
          dateOfBirth: true,
          address: true,
        },
      })

      return ok({
        status: userData?.kycStatus || 'PENDING',
        submittedAt: userData?.kycSubmittedAt,
        verifiedAt: userData?.kycVerifiedAt,
        hasDocuments: !!(userData?.panNumber && userData?.aadhaarNumber),
      })
    } catch (err) {
      if (err instanceof AuthError) {
        return err.status === 401 ? unauthorized() : forbidden(err.code)
      }
      logger.error({ err }, "GET /api/account/kyc error")
      return serverError()
    }
  },
  { preset: "authenticated" }
)

export const POST = withRateLimit(
  async (req: NextRequest) => {
    try {
      const user = await requireAuth()
      
      const body = await req.json()
      const parsed = KYCSchema.safeParse(body)

      if (!parsed.success) {
        return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>)
      }

      // Update user with KYC information
      const updated = await db.user.update({
        where: { id: user.id },
        data: {
          panNumber: parsed.data.panNumber,
          aadhaarNumber: parsed.data.aadhaarNumber,
          dateOfBirth: parsed.data.dateOfBirth,
          address: parsed.data.address,
          kycStatus: 'PENDING',
          kycSubmittedAt: new Date(),
        },
      })

      // In paper trading mode, auto-verify
      if (process.env.BROKER_TYPE === 'mock') {
        await db.user.update({
          where: { id: user.id },
          data: {
            kycStatus: 'VERIFIED',
            kycVerifiedAt: new Date(),
          },
        })
      }

      // Audit log
      const sessionId = getSessionId(req)
      await db.auditLog.create({
        data: {
          userId: user.id,
          clerkSessionId: sessionId,
          action: "KYC_SUBMITTED",
          resource: "User",
          resourceId: user.id,
          newData: { kycStatus: 'PENDING' },
          ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
          userAgent: req.headers.get("user-agent") ?? undefined,
        },
      })

      return ok({
        status: process.env.BROKER_TYPE === 'mock' ? 'VERIFIED' : 'PENDING',
        message: process.env.BROKER_TYPE === 'mock' 
          ? 'KYC verified instantly (Paper Trading Mode)'
          : 'KYC submitted for verification',
      })
    } catch (err) {
      if (err instanceof AuthError) {
        return err.status === 401 ? unauthorized() : forbidden(err.code)
      }
      logger.error({ err }, "POST /api/account/kyc error")
      return serverError()
    }
  },
  { preset: "authenticated", requireAuth: true }
)
