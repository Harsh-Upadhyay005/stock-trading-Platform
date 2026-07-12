// ============================================================
// services/watchlist.service.ts — Watchlist management
// ============================================================
import { db } from "@/lib/db"
import { logger } from "@/utils/logger"
import { ServiceError } from "./order.service"
import type {
  CreateWatchlistInput,
  UpdateWatchlistInput,
  AddWatchlistItemInput,
  UpdateWatchlistItemInput,
  WatchlistQueryInput,
} from "@/validators/watchlist.schema"
import type { Prisma } from "../generated/prisma"

export class WatchlistService {
  // ── Watchlist CRUD ────────────────────────────────────────

  async createWatchlist(userId: string, input: CreateWatchlistInput) {
    // If this is set as default, unset other defaults
    if (input.isDefault) {
      await db.watchlist.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    const watchlist = await db.watchlist.create({
      data: {
        userId,
        name: input.name,
        description: input.description,
        visibility: input.visibility,
        isDefault: input.isDefault,
      },
    })

    logger.info({ watchlistId: watchlist.id, userId, name: input.name }, "Watchlist created")
    return watchlist
  }

  async listWatchlists(userId: string, input: WatchlistQueryInput) {
    const where: Prisma.WatchlistWhereInput = {
      OR: [
        { userId }, // User's own watchlists
        { visibility: "PUBLIC" }, // Public watchlists
      ],
      ...(input.visibility && { visibility: input.visibility }),
    }

    const [watchlists, total] = await Promise.all([
      db.watchlist.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          items: {
            include: {
              symbol: {
                select: {
                  id: true,
                  ticker: true,
                  name: true,
                  logoUrl: true,
                  exchange: { select: { code: true } },
                  quote: true,
                },
              },
            },
            orderBy: { sortOrder: "asc" },
          },
          _count: { select: { items: true } },
        },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
        orderBy: [
          { isDefault: "desc" }, // Default watchlist first
          { updatedAt: "desc" },
        ],
      }),
      db.watchlist.count({ where }),
    ])

    return { watchlists, total }
  }

  async getWatchlist(userId: string, watchlistId: string) {
    const watchlist = await db.watchlist.findFirst({
      where: {
        id: watchlistId,
        OR: [{ userId }, { visibility: "PUBLIC" }],
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        items: {
          include: {
            symbol: {
              select: {
                id: true,
                ticker: true,
                name: true,
                assetClass: true,
                currency: true,
                sector: true,
                logoUrl: true,
                exchange: { select: { code: true, name: true } },
                quote: true,
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    })

    if (!watchlist) {
      throw new ServiceError("Watchlist not found", "WATCHLIST_NOT_FOUND", 404)
    }

    return watchlist
  }

  async updateWatchlist(userId: string, watchlistId: string, input: UpdateWatchlistInput) {
    const watchlist = await db.watchlist.findFirst({
      where: { id: watchlistId, userId },
    })

    if (!watchlist) {
      throw new ServiceError("Watchlist not found", "WATCHLIST_NOT_FOUND", 404)
    }

    // If setting as default, unset other defaults
    if (input.isDefault) {
      await db.watchlist.updateMany({
        where: { userId, isDefault: true, id: { not: watchlistId } },
        data: { isDefault: false },
      })
    }

    return db.watchlist.update({
      where: { id: watchlistId },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.visibility && { visibility: input.visibility }),
        ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
      },
      include: {
        items: {
          include: {
            symbol: {
              select: {
                ticker: true,
                name: true,
                logoUrl: true,
                exchange: { select: { code: true } },
              },
            },
          },
        },
      },
    })
  }

  async deleteWatchlist(userId: string, watchlistId: string): Promise<void> {
    const watchlist = await db.watchlist.findFirst({
      where: { id: watchlistId, userId },
    })

    if (!watchlist) {
      throw new ServiceError("Watchlist not found", "WATCHLIST_NOT_FOUND", 404)
    }

    await db.watchlist.delete({ where: { id: watchlistId } })
    logger.info({ watchlistId, userId }, "Watchlist deleted")
  }

  // ── Watchlist Items ───────────────────────────────────────

  async addItem(userId: string, watchlistId: string, input: AddWatchlistItemInput) {
    // Verify watchlist ownership
    const watchlist = await db.watchlist.findFirst({
      where: { id: watchlistId, userId },
    })

    if (!watchlist) {
      throw new ServiceError("Watchlist not found", "WATCHLIST_NOT_FOUND", 404)
    }

    // Verify symbol exists
    const symbol = await db.symbol.findUnique({
      where: { id: input.symbolId, isActive: true },
    })

    if (!symbol) {
      throw new ServiceError("Symbol not found", "SYMBOL_NOT_FOUND", 404)
    }

    // Check if already exists
    const existing = await db.watchlistItem.findFirst({
      where: { watchlistId, symbolId: input.symbolId },
    })

    if (existing) {
      throw new ServiceError(
        "Symbol already in watchlist",
        "SYMBOL_ALREADY_IN_WATCHLIST",
        409
      )
    }

    // Get max sort order
    const maxOrder = await db.watchlistItem.findFirst({
      where: { watchlistId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    })

    const item = await db.watchlistItem.create({
      data: {
        watchlistId,
        symbolId: input.symbolId,
        notes: input.notes,
        sortOrder: (maxOrder?.sortOrder ?? 0) + 1,
      },
      include: {
        symbol: {
          select: {
            ticker: true,
            name: true,
            assetClass: true,
            currency: true,
            logoUrl: true,
            exchange: { select: { code: true } },
            quote: true,
          },
        },
      },
    })

    logger.info(
      { watchlistId, symbolId: input.symbolId, ticker: symbol.ticker },
      "Symbol added to watchlist"
    )
    return item
  }

  async updateItem(
    userId: string,
    watchlistId: string,
    itemId: string,
    input: UpdateWatchlistItemInput
  ) {
    // Verify watchlist ownership
    const watchlist = await db.watchlist.findFirst({
      where: { id: watchlistId, userId },
    })

    if (!watchlist) {
      throw new ServiceError("Watchlist not found", "WATCHLIST_NOT_FOUND", 404)
    }

    const item = await db.watchlistItem.findFirst({
      where: { id: itemId, watchlistId },
    })

    if (!item) {
      throw new ServiceError("Watchlist item not found", "ITEM_NOT_FOUND", 404)
    }

    return db.watchlistItem.update({
      where: { id: itemId },
      data: {
        ...(input.notes !== undefined && { notes: input.notes }),
        ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      },
      include: {
        symbol: {
          select: {
            ticker: true,
            name: true,
            logoUrl: true,
            exchange: { select: { code: true } },
            quote: true,
          },
        },
      },
    })
  }

  async removeItem(userId: string, watchlistId: string, itemId: string): Promise<void> {
    // Verify watchlist ownership
    const watchlist = await db.watchlist.findFirst({
      where: { id: watchlistId, userId },
    })

    if (!watchlist) {
      throw new ServiceError("Watchlist not found", "WATCHLIST_NOT_FOUND", 404)
    }

    const item = await db.watchlistItem.findFirst({
      where: { id: itemId, watchlistId },
    })

    if (!item) {
      throw new ServiceError("Watchlist item not found", "ITEM_NOT_FOUND", 404)
    }

    await db.watchlistItem.delete({ where: { id: itemId } })
    logger.info({ watchlistId, itemId }, "Symbol removed from watchlist")
  }

  async reorderItems(
    userId: string,
    watchlistId: string,
    itemIds: string[]
  ): Promise<void> {
    // Verify watchlist ownership
    const watchlist = await db.watchlist.findFirst({
      where: { id: watchlistId, userId },
    })

    if (!watchlist) {
      throw new ServiceError("Watchlist not found", "WATCHLIST_NOT_FOUND", 404)
    }

    // Update sort orders
    await Promise.all(
      itemIds.map((itemId, index) =>
        db.watchlistItem.updateMany({
          where: { id: itemId, watchlistId },
          data: { sortOrder: index },
        })
      )
    )

    logger.info({ watchlistId, itemCount: itemIds.length }, "Watchlist items reordered")
  }

  // ── Bulk Operations ───────────────────────────────────────

  async addMultipleItems(
    userId: string,
    watchlistId: string,
    symbolIds: string[]
  ): Promise<{ added: number; skipped: number }> {
    // Verify watchlist ownership
    const watchlist = await db.watchlist.findFirst({
      where: { id: watchlistId, userId },
    })

    if (!watchlist) {
      throw new ServiceError("Watchlist not found", "WATCHLIST_NOT_FOUND", 404)
    }

    // Get existing items
    const existingItems = await db.watchlistItem.findMany({
      where: { watchlistId, symbolId: { in: symbolIds } },
      select: { symbolId: true },
    })

    const existingSymbolIds = new Set(existingItems.map((item) => item.symbolId))
    const newSymbolIds = symbolIds.filter((id) => !existingSymbolIds.has(id))

    // Get max sort order
    const maxOrder = await db.watchlistItem.findFirst({
      where: { watchlistId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    })

    let sortOrder = (maxOrder?.sortOrder ?? 0) + 1

    // Add new items
    await Promise.all(
      newSymbolIds.map((symbolId) =>
        db.watchlistItem.create({
          data: {
            watchlistId,
            symbolId,
            sortOrder: sortOrder++,
          },
        })
      )
    )

    logger.info(
      { watchlistId, added: newSymbolIds.length, skipped: existingSymbolIds.size },
      "Bulk add to watchlist"
    )

    return {
      added: newSymbolIds.length,
      skipped: existingSymbolIds.size,
    }
  }

  async clearWatchlist(userId: string, watchlistId: string): Promise<number> {
    // Verify watchlist ownership
    const watchlist = await db.watchlist.findFirst({
      where: { id: watchlistId, userId },
    })

    if (!watchlist) {
      throw new ServiceError("Watchlist not found", "WATCHLIST_NOT_FOUND", 404)
    }

    const result = await db.watchlistItem.deleteMany({
      where: { watchlistId },
    })

    logger.info({ watchlistId, deleted: result.count }, "Watchlist cleared")
    return result.count
  }
}

export const watchlistService = new WatchlistService()
