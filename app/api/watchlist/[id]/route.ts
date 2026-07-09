// ============================================================
// app/api/watchlist/[id]/route.ts — GET / PATCH / DELETE
// Also handles POST (add symbol) and DELETE body (remove symbol)
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError } from "@/lib/auth"
import { db } from "@/lib/db"
import { WatchlistUpdateSchema, WatchlistItemSchema } from "@/validators/user.schema"
import {
  ok, noContent, badRequest, unauthorized, forbidden,
  notFound, conflict, serverError,
} from "@/utils/response"
import { logger } from "@/utils/logger"
import type { RouteContext } from "@/types/api"

// ── GET /api/watchlist/[id] ───────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: RouteContext<{ id: string }>
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const watchlist = await db.watchlist.findFirst({
      where: { id, userId: user.id },
      include: {
        items: {
          include: {
            symbol: {
              include: {
                exchange: { select: { code: true } },
                quote: true,
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    })

    if (!watchlist) return notFound("Watchlist")
    return ok(watchlist)
  } catch (err) {
    if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
    logger.error({ err }, "GET /api/watchlist/[id] error")
    return serverError()
  }
}

// ── PATCH /api/watchlist/[id] — update watchlist metadata ────
export async function PATCH(
  req: NextRequest,
  { params }: RouteContext<{ id: string }>
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const existing = await db.watchlist.findFirst({ where: { id, userId: user.id } })
    if (!existing) return notFound("Watchlist")

    const body = await req.json()
    const parsed = WatchlistUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>)
    }

    const updated = await db.watchlist.update({
      where: { id },
      data: parsed.data,
    })

    return ok(updated)
  } catch (err) {
    if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
    logger.error({ err }, "PATCH /api/watchlist/[id] error")
    return serverError()
  }
}

// ── DELETE /api/watchlist/[id] — delete watchlist ────────────
export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext<{ id: string }>
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const existing = await db.watchlist.findFirst({ where: { id, userId: user.id } })
    if (!existing) return notFound("Watchlist")

    if (existing.isDefault) {
      return badRequest("Cannot delete the default watchlist")
    }

    await db.watchlist.delete({ where: { id } })
    return noContent()
  } catch (err) {
    if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
    logger.error({ err }, "DELETE /api/watchlist/[id] error")
    return serverError()
  }
}

// ── POST /api/watchlist/[id] — add symbol to watchlist ───────
export async function POST(
  req: NextRequest,
  { params }: RouteContext<{ id: string }>
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const watchlist = await db.watchlist.findFirst({ where: { id, userId: user.id } })
    if (!watchlist) return notFound("Watchlist")

    const body = await req.json()
    const parsed = WatchlistItemSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>)
    }

    // Check symbol exists
    const symbol = await db.symbol.findUnique({ where: { id: parsed.data.symbolId } })
    if (!symbol) return notFound("Symbol")

    // Check duplicate
    const exists = await db.watchlistItem.findUnique({
      where: { watchlistId_symbolId: { watchlistId: id, symbolId: parsed.data.symbolId } },
    })
    if (exists) return conflict("Symbol already in watchlist")

    // Count items — max 100 per watchlist
    const itemCount = await db.watchlistItem.count({ where: { watchlistId: id } })
    if (itemCount >= 100) return conflict("Watchlist is full (max 100 symbols)")

    const item = await db.watchlistItem.create({
      data: {
        watchlistId: id,
        symbolId: parsed.data.symbolId,
        notes: parsed.data.notes,
        sortOrder: parsed.data.sortOrder ?? itemCount,
      },
      include: {
        symbol: { select: { ticker: true, name: true, assetClass: true, currency: true } },
      },
    })

    return ok(item)
  } catch (err) {
    if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
    logger.error({ err }, "POST /api/watchlist/[id] error")
    return serverError()
  }
}