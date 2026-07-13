// ============================================================
// services/admin.service.ts — Admin operations
// ============================================================
import { db } from "@/lib/db"
import { logger } from "@/utils/logger"
import { ServiceError } from "./order.service"
import type {
  AdminUserQueryInput,
  UpdateUserStatusInput,
  UpdateUserRoleInput,
  UpdateKYCStatusInput,
  CreateInstrumentInput,
  UpdateInstrumentInput,
  InstrumentQueryInput,
  SystemStatsInput,
} from "@/validators/admin.schema"
import type { Prisma } from "../generated/prisma"

export class AdminService {
  // ── User Management ───────────────────────────────────────

  async listUsers(input: AdminUserQueryInput) {
    const where: Prisma.UserWhereInput = {
      ...(input.role && { role: input.role }),
      ...(input.status && { status: input.status }),
      ...(input.kycStatus && { kycRecord: { status: input.kycStatus } }),
      ...(input.search && {
        OR: [
          { email: { contains: input.search, mode: "insensitive" } },
          { firstName: { contains: input.search, mode: "insensitive" } },
          { lastName: { contains: input.search, mode: "insensitive" } },
          { phone: { contains: input.search, mode: "insensitive" } },
        ],
      }),
      deletedAt: null, // Exclude soft-deleted users
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        include: {
          profile: true,
          kycRecord: { select: { status: true, level: true, submittedAt: true } },
          tradingAccounts: { select: { id: true, type: true, status: true } },
          _count: {
            select: {
              watchlists: true,
              alerts: true,
            },
          },
        },
        orderBy: { [input.sortBy]: input.sortOrder },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      db.user.count({ where }),
    ])

    return { users, total }
  }

  async getUser(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        kycRecord: {
          include: { documents: true },
        },
        riskProfile: true,
        tradingAccounts: {
          include: {
            _count: {
              select: { positions: true, orders: true },
            },
          },
        },
        bankAccounts: true,
        watchlists: { select: { id: true, name: true } },
        alerts: { select: { id: true, status: true } },
        auditLogs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })

    if (!user) {
      throw new ServiceError("User not found", "USER_NOT_FOUND", 404)
    }

    return user
  }

  async updateUserStatus(adminId: string, userId: string, input: UpdateUserStatusInput) {
    const user = await db.user.findUnique({ where: { id: userId } })

    if (!user) {
      throw new ServiceError("User not found", "USER_NOT_FOUND", 404)
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: { status: input.status },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: adminId,
        action: "USER_STATUS_UPDATED",
        resource: "User",
        resourceId: userId,
        oldData: { status: user.status },
        newData: { status: input.status, reason: input.reason },
      },
    })

    logger.info(
      { adminId, userId, oldStatus: user.status, newStatus: input.status },
      "User status updated"
    )

    return updated
  }

  async updateUserRole(adminId: string, userId: string, input: UpdateUserRoleInput) {
    const user = await db.user.findUnique({ where: { id: userId } })

    if (!user) {
      throw new ServiceError("User not found", "USER_NOT_FOUND", 404)
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: { role: input.role },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: adminId,
        action: "USER_ROLE_UPDATED",
        resource: "User",
        resourceId: userId,
        oldData: { role: user.role },
        newData: { role: input.role },
      },
    })

    logger.info({ adminId, userId, oldRole: user.role, newRole: input.role }, "User role updated")

    return updated
  }

  async deleteUser(adminId: string, userId: string): Promise<void> {
    const user = await db.user.findUnique({ where: { id: userId } })

    if (!user) {
      throw new ServiceError("User not found", "USER_NOT_FOUND", 404)
    }

    // Soft delete
    await db.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        status: "DEACTIVATED",
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: adminId,
        action: "USER_DELETED",
        resource: "User",
        resourceId: userId,
        oldData: { status: user.status },
        newData: { deletedAt: new Date() },
      },
    })

    logger.info({ adminId, userId }, "User deleted (soft)")
  }

  // ── KYC Management ────────────────────────────────────────

  async reviewKYC(adminId: string, userId: string, input: UpdateKYCStatusInput) {
    const kycRecord = await db.kYCRecord.findUnique({
      where: { userId },
    })

    if (!kycRecord) {
      throw new ServiceError("KYC record not found", "KYC_NOT_FOUND", 404)
    }

    const updated = await db.kYCRecord.update({
      where: { userId },
      data: {
        status: input.status,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        ...(input.status === "APPROVED" && { approvedAt: new Date() }),
        ...(input.status === "REJECTED" && {
          rejectedAt: new Date(),
          rejectionReason: input.rejectionReason,
        }),
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: adminId,
        action: "KYC_REVIEWED",
        resource: "KYCRecord",
        resourceId: kycRecord.id,
        oldData: { status: kycRecord.status },
        newData: { status: input.status, reason: input.rejectionReason },
      },
    })

    // Update user status if KYC approved
    if (input.status === "APPROVED") {
      await db.user.update({
        where: { id: userId },
        data: { status: "ACTIVE" },
      })
    }

    logger.info({ adminId, userId, kycStatus: input.status }, "KYC reviewed")

    return updated
  }

  async listPendingKYC(page = 1, limit = 20) {
    const where: Prisma.KYCRecordWhereInput = {
      status: { in: ["PENDING", "UNDER_REVIEW"] },
    }

    const [records, total] = await Promise.all([
      db.kYCRecord.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              createdAt: true,
            },
          },
          documents: true,
        },
        orderBy: { submittedAt: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.kYCRecord.count({ where }),
    ])

    return { records, total }
  }

  // ── Instrument Management ─────────────────────────────────

  async listInstruments(input: InstrumentQueryInput) {
    const where: Prisma.SymbolWhereInput = {
      ...(input.exchange && { exchange: { code: input.exchange } }),
      ...(input.assetClass && { assetClass: input.assetClass }),
      ...(input.sector && { sector: input.sector }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      ...(input.isTradable !== undefined && { isTradable: input.isTradable }),
      ...(input.search && {
        OR: [
          { ticker: { contains: input.search, mode: "insensitive" } },
          { name: { contains: input.search, mode: "insensitive" } },
          { isin: { equals: input.search.toUpperCase() } },
        ],
      }),
    }

    const [instruments, total] = await Promise.all([
      db.symbol.findMany({
        where,
        include: {
          exchange: { select: { code: true, name: true } },
          quote: { select: { lastPrice: true, volume: true, tradedAt: true } },
        },
        orderBy: { [input.sortBy]: input.sortOrder },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      db.symbol.count({ where }),
    ])

    return { instruments, total }
  }

  async getInstrument(symbolId: string) {
    const instrument = await db.symbol.findUnique({
      where: { id: symbolId },
      include: {
        exchange: true,
        quote: true,
        fundamentals: true,
        _count: {
          select: {
            positions: true,
            orders: true,
            watchlistItems: true,
            alerts: true,
          },
        },
      },
    })

    if (!instrument) {
      throw new ServiceError("Instrument not found", "INSTRUMENT_NOT_FOUND", 404)
    }

    return instrument
  }

  async createInstrument(adminId: string, input: CreateInstrumentInput) {
    // Check if exchange exists
    const exchange = await db.exchange.findUnique({
      where: { id: input.exchangeId },
    })

    if (!exchange) {
      throw new ServiceError("Exchange not found", "EXCHANGE_NOT_FOUND", 404)
    }

    // Check for duplicate ticker on same exchange
    const existing = await db.symbol.findFirst({
      where: {
        ticker: input.ticker,
        exchangeId: input.exchangeId,
      },
    })

    if (existing) {
      throw new ServiceError(
        "Ticker already exists on this exchange",
        "DUPLICATE_TICKER",
        409
      )
    }

    const instrument = await db.symbol.create({
      data: {
        ticker: input.ticker,
        exchangeId: input.exchangeId,
        name: input.name,
        fullName: input.fullName,
        assetClass: input.assetClass,
        currency: input.currency,
        isin: input.isin,
        lotSize: input.lotSize,
        tickSize: input.tickSize,
        sector: input.sector,
        industry: input.industry,
        isActive: input.isActive,
        isTradable: input.isTradable,
        isShortable: input.isShortable,
        marginable: input.marginable,
      },
      include: {
        exchange: { select: { code: true, name: true } },
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: adminId,
        action: "INSTRUMENT_CREATED",
        resource: "Symbol",
        resourceId: instrument.id,
        newData: { ticker: input.ticker, exchange: exchange.code },
      },
    })

    logger.info({ adminId, symbolId: instrument.id, ticker: input.ticker }, "Instrument created")

    return instrument
  }

  async updateInstrument(adminId: string, symbolId: string, input: UpdateInstrumentInput) {
    const instrument = await db.symbol.findUnique({
      where: { id: symbolId },
    })

    if (!instrument) {
      throw new ServiceError("Instrument not found", "INSTRUMENT_NOT_FOUND", 404)
    }

    const updated = await db.symbol.update({
      where: { id: symbolId },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.fullName !== undefined && { fullName: input.fullName }),
        ...(input.sector !== undefined && { sector: input.sector }),
        ...(input.industry !== undefined && { industry: input.industry }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.isTradable !== undefined && { isTradable: input.isTradable }),
        ...(input.isShortable !== undefined && { isShortable: input.isShortable }),
        ...(input.marginable !== undefined && { marginable: input.marginable }),
        ...(input.lotSize && { lotSize: input.lotSize }),
        ...(input.tickSize && { tickSize: input.tickSize }),
      },
      include: {
        exchange: { select: { code: true, name: true } },
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: adminId,
        action: "INSTRUMENT_UPDATED",
        resource: "Symbol",
        resourceId: symbolId,
        oldData: { ticker: instrument.ticker },
        newData: input,
      },
    })

    logger.info({ adminId, symbolId, ticker: instrument.ticker }, "Instrument updated")

    return updated
  }

  async deleteInstrument(adminId: string, symbolId: string): Promise<void> {
    const instrument = await db.symbol.findUnique({
      where: { id: symbolId },
      include: {
        _count: {
          select: { positions: true, orders: true },
        },
      },
    })

    if (!instrument) {
      throw new ServiceError("Instrument not found", "INSTRUMENT_NOT_FOUND", 404)
    }

    // Check if there are active positions or orders
    if (instrument._count.positions > 0 || instrument._count.orders > 0) {
      throw new ServiceError(
        "Cannot delete instrument with active positions or orders. Set as inactive instead.",
        "INSTRUMENT_IN_USE",
        422
      )
    }

    await db.symbol.delete({ where: { id: symbolId } })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: adminId,
        action: "INSTRUMENT_DELETED",
        resource: "Symbol",
        resourceId: symbolId,
        oldData: { ticker: instrument.ticker },
      },
    })

    logger.info({ adminId, symbolId, ticker: instrument.ticker }, "Instrument deleted")
  }

  // ── System Statistics ─────────────────────────────────────

  async getSystemStats(input: SystemStatsInput) {
    const endDate = new Date()
    let startDate = new Date()

    switch (input.period) {
      case "1D":
        startDate.setDate(endDate.getDate() - 1)
        break
      case "1W":
        startDate.setDate(endDate.getDate() - 7)
        break
      case "1M":
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case "3M":
        startDate.setMonth(endDate.getMonth() - 3)
        break
      case "1Y":
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      case "ALL":
        startDate = new Date(0) // Beginning of time
        break
    }

    const [
      totalUsers,
      activeUsers,
      newUsers,
      totalOrders,
      filledOrders,
      totalVolume,
      activeInstruments,
      totalPositions,
    ] = await Promise.all([
      db.user.count({ where: { deletedAt: null } }),
      db.user.count({ where: { status: "ACTIVE", deletedAt: null } }),
      db.user.count({
        where: { createdAt: { gte: startDate }, deletedAt: null },
      }),
      db.order.count({
        where: { createdAt: { gte: startDate } },
      }),
      db.order.count({
        where: { status: "FILLED", filledAt: { gte: startDate } },
      }),
      db.order.aggregate({
        where: { status: "FILLED", filledAt: { gte: startDate } },
        _sum: { filledQuantity: true },
      }),
      db.symbol.count({ where: { isActive: true, isTradable: true } }),
      db.position.count(),
    ])

    // KYC statistics
    const kycStats = await db.kYCRecord.groupBy({
      by: ["status"],
      _count: true,
    })

    // Order statistics by status
    const orderStats = await db.order.groupBy({
      by: ["status"],
      where: { createdAt: { gte: startDate } },
      _count: true,
    })

    return {
      period: input.period,
      startDate,
      endDate,
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
      },
      kyc: kycStats.reduce(
        (acc, stat) => {
          acc[stat.status.toLowerCase()] = stat._count
          return acc
        },
        {} as Record<string, number>
      ),
      orders: {
        total: totalOrders,
        filled: filledOrders,
        byStatus: orderStats.reduce(
          (acc, stat) => {
            acc[stat.status.toLowerCase()] = stat._count
            return acc
          },
          {} as Record<string, number>
        ),
      },
      trading: {
        totalVolume: Number(totalVolume._sum.filledQuantity ?? 0),
        activePositions: totalPositions,
        activeInstruments,
      },
    }
  }

  // ── Audit Logs ────────────────────────────────────────────

  async getAuditLogs(page = 1, limit = 50, action?: string, userId?: string) {
    const where: Prisma.AuditLogWhereInput = {
      ...(action && { action }),
      ...(userId && { userId }),
    }

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.auditLog.count({ where }),
    ])

    return { logs, total }
  }
}

export const adminService = new AdminService()
