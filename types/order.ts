// ============================================================
// types/order.ts
// ============================================================
import type { Order, OrderFill, Symbol, Exchange } from "../generated/prisma"

export type OrderWithDetails = Order & {
  symbol: Pick<Symbol, "id" | "ticker" | "name" | "currency" | "assetClass"> & {
    exchange?: Pick<Exchange, "code" | "name">
  }
  fills: OrderFill[]
}
