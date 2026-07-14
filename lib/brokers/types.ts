
// lib/brokers/types.ts — Broker adapter interface


export interface BrokerAdapter {
  // Connection
  connect(): Promise<void>
  disconnect(): Promise<void>
  isConnected(): boolean

  // Orders
  placeOrder(order: PlaceOrderRequest): Promise<BrokerOrderResponse>
  cancelOrder(orderId: string): Promise<void>
  modifyOrder(orderId: string, modifications: OrderModifications): Promise<BrokerOrderResponse>
  getOrderStatus(orderId: string): Promise<BrokerOrderResponse>

  // Positions
  getPositions(): Promise<BrokerPosition[]>
  getPosition(symbolId: string): Promise<BrokerPosition | null>

  // Market Data
  getQuote(symbol: string): Promise<BrokerQuote>
  getQuotes(symbols: string[]): Promise<BrokerQuote[]>

  // Account
  getAccountInfo(): Promise<BrokerAccountInfo>
}

export type PlaceOrderRequest = {
  symbol: string
  side: "BUY" | "SELL"
  type: "MARKET" | "LIMIT" | "STOP" | "STOP_LIMIT"
  quantity: number
  limitPrice?: number
  stopPrice?: number
  duration?: "DAY" | "GTC" | "IOC" | "FOK"
}

export type OrderModifications = {
  quantity?: number
  limitPrice?: number
  stopPrice?: number
}

export type BrokerOrderResponse = {
  brokerOrderId: string
  status: "PENDING" | "OPEN" | "FILLED" | "PARTIALLY_FILLED" | "CANCELLED" | "REJECTED"
  filledQuantity: number
  avgFillPrice?: number
  timestamp: Date
  message?: string
}

export type BrokerPosition = {
  symbol: string
  quantity: number
  avgCostBasis: number
  currentPrice: number
  marketValue: number
  unrealizedPnl: number
  side: "LONG" | "SHORT"
}

export type BrokerQuote = {
  symbol: string
  lastPrice: number
  bidPrice?: number
  askPrice?: number
  volume: number
  timestamp: Date
}

export type BrokerAccountInfo = {
  accountId: string
  cashBalance: number
  buyingPower: number
  totalValue: number
  marginUsed?: number
}

export class BrokerError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = "BrokerError"
  }
}
