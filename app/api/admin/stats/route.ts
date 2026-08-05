// ============================================================
// app/api/admin/stats/route.ts — GET
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError } from "@/lib/auth"
import { ok, unauthorized, forbidden, serverError } from "@/utils/response"
import { withRateLimit } from "@/utils/rate-limit-middleware"
import { db } from "@/lib/db"
import { logger } from "@/utils/logger"

export const GET = withRateLimit(
  async (req: NextRequest) => {
    try {
      const user = await requireAuth()
      
      // Check if user is admin (you should have an isAdmin field or role)
      const userData = await db.user.findUnique({
        where: { id: user.id },
        select: { email: true },
      })

      // Simple admin check - in production, use proper role-based access
      const isAdmin = userData?.email?.includes('admin') || false
      
      if (!isAdmin) {
        return forbidden("Access denied - Admin only")
      }

      // Gather stats
      const [
        totalUsers,
        activeUsers,
        totalOrders,
        todayOrders,
        totalVolume,
        todayVolume,
      ] = await Promise.all([
        db.user.count(),
        db.user.count({ where: { status: 'ACTIVE' } }),
        db.order.count(),
        db.order.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        db.order.aggregate({
          where: { status: 'FILLED' },
          _sum: { quantity: true },
        }),
        db.order.aggregate({
          where: {
            status: 'FILLED',
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
          _sum: { quantity: true },
        }),
      ])

      // KYC Stats
      const kycStats = await db.user.groupBy({
        by: ['kycStatus'],
        _count: true,
      })

      // Order Stats
      const orderStats = await db.order.groupBy({
        by: ['status'],
        _count: true,
      })

      return ok({
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
        },
        orders: {
          total: totalOrders,
          today: todayOrders,
          byStatus: orderStats.reduce((acc, stat) => {
            acc[stat.status] = stat._count
            return acc
          }, {} as Record<string, number>),
        },
        volume: {
          total: totalVolume._sum.quantity || 0,
          today: todayVolume._sum.quantity || 0,
        },
        kyc: kycStats.reduce((acc, stat) => {
          acc[stat.kycStatus] = stat._count
          return acc
        }, {} as Record<string, number>),
      })
    } catch (err) {
      if (err instanceof AuthError) {
        return err.status === 401 ? unauthorized() : forbidden(err.code)
      }
      logger.error({ err }, "GET /api/admin/stats error")
      return serverError()
    }
  },
  { preset: "admin" }
)
