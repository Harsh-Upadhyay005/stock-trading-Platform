// ============================================================
// types/order.ts
// ============================================================
import type {
  Order,
  OrderFill,
  Symbol,
  OrderSide,
  OrderType,
  OrderStatus,
  OrderDuration,
} from "../../generated/prisma"

export type OrderWithDetails = Order & {
  symbol: Pick<Symbol, "id" | "ticker" | "name" | "currency" | "assetClass">
  fills: OrderFill[]
}

export type CreateOrderInput = {
  symbolId: string
  accountId: string
  side: OrderSide
  type: OrderType
  duration: OrderDuration
  quantity: number
  limitPrice?: number
  stopPrice?: number
  trailAmount?: number
  trailPercent?: number
  extendedHours?: boolean
  clientOrderId?: string
  notes?: string
}

export type UpdateOrderInput = {
  limitPrice?: number
  stopPrice?: number
  quantity?: number
}

export type OrderSummary = {
  total: number
  open: number
  filled: number
  cancelled: number
  rejected: number
}

export { OrderSide, OrderType, OrderStatus, OrderDuration }