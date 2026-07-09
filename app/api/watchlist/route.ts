// ============================================================
// app/api/watchlist/route.ts — GET / POST
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError } from "@/lib/auth"
import { db } from "@/lib/db"
import { WatchlistCreateSchema, WatchlistItemSchema } from "@/validators/user.schema"
import {
  ok, created, badRequest, unauthorized, forbidden,
  conflict, serverError,
} from "@/utils/response"
import { logger } from "@/utils/logger"

// ── GET /api/watchlist ────────────────────────────────────────
export async function GET(_req: NextRequest) {
  try {
    const user = await requireAuth()

    const watchlists = await db.watchlist.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            symbol: {
              select: {
                id: true, ticker: true, name: true,
                assetClass: true, currency: true, logoUrl: true,
                quote: { select: { lastPrice: true, changePct: true, marketStatus: true } },
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        _count: { select: { items: true } },
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    })

    return ok(watchlists)
  } catch (err) {
    if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
    logger.error({ err }, "GET /api/watchlist error")
    return serverError()
  }
}

// ── POST /api/watchlist ───────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()

    // Allow creating watchlist with optional initial symbols
    const parsed = WatchlistCreateSchema.extend({
      symbols: WatchlistItemSchema.array().optional(),
    }).safeParse(body)

    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>)
    }

    const { symbols, ...watchlistData } = parsed.data

    // Enforce max 20 watchlists per user
    const count = await db.watchlist.count({ where: { userId: user.id } })
    if (count >= 20) {
      return conflict("Maximum of 20 watchlists allowed per account")
    }

    const watchlist = await db.watchlist.create({
      data: {
        ...watchlistData,
        userId: user.id,
        items: symbols
          ? {
              create: symbols.map((s, i) => ({
                symbolId: s.symbolId,
                notes: s.notes,
                sortOrder: s.sortOrder ?? i,
              })),
            }
          : undefined,
      },
      include: { items: true, _count: { select: { items: true } } },
    })

    return created(watchlist)
  } catch (err) {
    if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
    logger.error({ err }, "POST /api/watchlist error")
    return serverError()
  }
}