// ============================================================
// app/api/admin/users/route.ts — Admin user management
// ============================================================
import { type NextRequest } from "next/server"
import { requireRole, AuthError } from "@/lib/auth"
import { db } from "@/lib/db"
import { AdminUserQuerySchema, AdminUpdateUserSchema } from "@/validators/user.schema"
import {
  ok, badRequest, unauthorized, forbidden, notFound,
  serverError, buildPaginationMeta,
} from "@/utils/response"
import { logger } from "@/utils/logger"

// ── GET /api/admin/users ──────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    await requireRole("ADMIN")

    const params = Object.fromEntries(req.nextUrl.searchParams)
    const parsed = AdminUserQuerySchema.safeParse(params)

    if (!parsed.success) {
      return badRequest("Invalid query", parsed.error.flatten().fieldErrors as Record<string, string[]>)
    }

    const { search, role, status, kycStatus, page, limit, sortBy, sortOrder } = parsed.data

    const where = {
      ...(role && { role }),
      ...(status && { status }),
      ...(kycStatus && { kycRecord: { status: kycStatus } }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: "insensitive" as const } },
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      deletedAt: null,
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true, clerkId: true, email: true, firstName: true, lastName: true,
          role: true, status: true, createdAt: true,
          kycRecord: { select: { status: true, level: true } },
          tradingAccounts: { select: { id: true, type: true, status: true } },
          _count: { select: { tradingAccounts: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ])

    const meta = buildPaginationMeta(total, page, limit)
    return ok(users, meta)
  } catch (err) {
    if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
    logger.error({ err }, "GET /api/admin/users error")
    return serverError()
  }
}

// ── PATCH /api/admin/users?userId=xxx ────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireRole("ADMIN")

    const userId = req.nextUrl.searchParams.get("userId")
    if (!userId) return badRequest("userId query parameter required")

    const body = await req.json()
    const parsed = AdminUpdateUserSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>)
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return notFound("User")

    const updated = await db.user.update({
      where: { id: userId },
      data: parsed.data,
      select: { id: true, email: true, role: true, status: true, updatedAt: true },
    })

    await db.auditLog.create({
      data: {
        userId: admin.id,
        action: "ADMIN_USER_UPDATED",
        resource: "User",
        resourceId: userId,
        oldData: { role: user.role, status: user.status },
        newData: parsed.data,
      },
    })

    return ok(updated)
  } catch (err) {
    if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
    logger.error({ err }, "PATCH /api/admin/users error")
    return serverError()
  }
}