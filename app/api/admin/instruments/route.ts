// ============================================================
// app/api/admin/instruments/route.ts — Instrument management
// ============================================================
import { type NextRequest } from "next/server"
import { requireRole, AuthError } from "@/lib/auth"
import { db } from "@/lib/db"
import { InstrumentCreateSchema } from "@/validators/user.schema"
import {
  ok, created, badRequest, unauthorized, forbidden, conflict, serverError,
} from "@/utils/response"
import { logger } from "@/utils/logger"

// ── GET /api/admin/instruments ────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    await requireRole("ADMIN")

    const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1")
    const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "50")
    const search = req.nextUrl.searchParams.get("search") ?? undefined

    const symbols = await db.symbol.findMany({
      where: search
        ? {
            OR: [
              { ticker: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
              { isin: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: { exchange: { select: { code: true, name: true } } },
      orderBy: { ticker: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    })

    return ok(symbols)
  } catch (err) {
    if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
    logger.error({ err }, "GET /api/admin/instruments error")
    return serverError()
  }
}

// ── POST /api/admin/instruments ───────────────────────────────
export async function POST(req: NextRequest) {
  try {
    await requireRole("ADMIN")

    const body = await req.json()
    const parsed = InstrumentCreateSchema.safeParse(body)

    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string[]>)
    }

    const existing = await db.symbol.findUnique({
      where: { ticker_exchangeId: { ticker: parsed.data.ticker, exchangeId: parsed.data.exchangeId } },
    })
    if (existing) return conflict(`${parsed.data.ticker} already listed on this exchange`)

    const symbol = await db.symbol.create({
      data: parsed.data,
      include: { exchange: { select: { code: true, name: true } } },
    })

    return created(symbol)
  } catch (err) {
    if (err instanceof AuthError) return err.status === 401 ? unauthorized() : forbidden(err.code)
    logger.error({ err }, "POST /api/admin/instruments error")
    return serverError()
  }
}