// ============================================================
// lib/brokers/alpaca.ts — Alpaca Markets adapter
// Documentation: https://alpaca.markets/docs/
// ============================================================
import type {
  BrokerAdapter,
  PlaceOrderRequest,
  BrokerOrderResponse,
  BrokerPosition,
  BrokerQuote,
  BrokerAccountInfo,
  OrderModifications,
} from "./types"
import { BrokerError } from "./types"
import { logger } from "@/utils/logger"

// Install: npm install @alpacahq/alpaca-trade-api
// import Alpaca from "@alpacahq/alpaca-trade-api"

export class AlpacaBroker implements BrokerAdapter {
  private alpaca: any // Alpaca instance
  private connected = false

  constructor(
    private apiKey: string,
    private apiSecret: string,
    private baseUrl: string = "https://paper-api.alpaca.markets"
  ) {
    // Uncomment when @alpacahq/alpaca-trade-api is installed
    // this.alpaca = new Alpaca({
    //   keyId: apiKey,
    //   secretKey: apiSecret,
    //   baseUrl: baseUrl,
    //   usePolygon: false,
    // })
  }

  async connect(): Promise<void> {
    try {
      // Test connection by getting account
      // await this.alpaca.getAccount()
      this.connected = true
      logger.info({ baseUrl: this.baseUrl }, "Alpaca broker connected")
    } catch (err) {
      logger.error({ err }, "Alpaca connection failed")
      throw new BrokerError("Failed to connect to Alpaca", "CONNECTION_FAILED", 500)
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false
    logger.info("Alpaca broker disconnected")
  }

  isConnected(): boolean {
    return this.connected
  }

  async placeOrder(order: PlaceOrderRequest): Promise<BrokerOrderResponse> {
    if (!this.connected) {
      throw new BrokerError("Broker not connected", "NOT_CONNECTED", 500)
    }

    try {
      const orderParams = {
        symbol: order.symbol,
        qty: order.quantity,
        side: order.side.toLowerCase(),
        type: order.type.toLowerCase(),
        time_in_force: this.mapDuration(order.duration),
        ...(order.limitPrice && { limit_price: order.limitPrice }),
        ...(order.stopPrice && { stop_price: order.stopPrice }),
      }

      // Uncomment when @alpacahq/alpaca-trade-api is installed
      // const response = await this.alpaca.createOrder(orderParams)

      // Mock response
      const response = {
        id: `ALP${Date.now()}`,
        status: "accepted",
      }

      logger.info({ orderId: response.id, symbol: order.symbol }, "Alpaca order placed")

      return {
        brokerOrderId: response.id,
        status: "PENDING",
        filledQuantity: 0,
        timestamp: new Date(),
      }
    } catch (err: any) {
      logger.error({ err, order }, "Alpaca order placement failed")
      throw new BrokerError(
        err.message || "Order placement failed",
        err.code || "ORDER_FAILED",
        err.statusCode || 500
      )
    }
  }

  async cancelOrder(orderId: string): Promise<void> {
    if (!this.connected) {
      throw new BrokerError("Broker not connected", "NOT_CONNECTED", 500)
    }

    try {
      // Uncomment when @alpacahq/alpaca-trade-api is installed
      // await this.alpaca.cancelOrder(orderId)
      logger.info({ orderId }, "Alpaca order cancelled")
    } catch (err: any) {
      logger.error({ err, orderId }, "Alpaca order cancellation failed")
      throw new BrokerError(
        err.message || "Order cancellation failed",
        err.code || "CANCEL_FAILED",
        err.statusCode || 500
      )
    }
  }

  async modifyOrder(
    orderId: string,
    modifications: OrderModifications
  ): Promise<BrokerOrderResponse> {
    if (!this.connected) {
      throw new BrokerError("Broker not connected", "NOT_CONNECTED", 500)
    }

    try {
      const params: any = {}
      if (modifications.quantity) params.qty = modifications.quantity
      if (modifications.limitPrice) params.limit_price = modifications.limitPrice
      if (modifications.stopPrice) params.stop_price = modifications.stopPrice

      // Uncomment when @alpacahq/alpaca-trade-api is installed
      // const response = await this.alpaca.replaceOrder(orderId, params)

      logger.info({ orderId, modifications }, "Alpaca order modified")

      return {
        brokerOrderId: orderId,
        status: "OPEN",
        filledQuantity: 0,
        timestamp: new Date(),
      }
    } catch (err: any) {
      logger.error({ err, orderId }, "Alpaca order modification failed")
      throw new BrokerError(
        err.message || "Order modification failed",
        err.code || "MODIFY_FAILED",
        err.statusCode || 500
      )
    }
  }

  async getOrderStatus(orderId: string): Promise<BrokerOrderResponse> {
    if (!this.connected) {
      throw new BrokerError("Broker not connected", "NOT_CONNECTED", 500)
    }

    try {
      // Uncomment when @alpacahq/alpaca-trade-api is installed
      // const order = await this.alpaca.getOrder(orderId)

      // Mock response
      const order = {
        id: orderId,
        status: "filled",
        filled_qty: "10",
        filled_avg_price: "178.25",
      }

      return {
        brokerOrderId: order.id,
        status: this.mapOrderStatus(order.status),
        filledQuantity: parseFloat(order.filled_qty || "0"),
        avgFillPrice: parseFloat(order.filled_avg_price || "0"),
        timestamp: new Date(),
      }
    } catch (err: any) {
      logger.error({ err, orderId }, "Failed to get Alpaca order status")
      throw new BrokerError(
        err.message || "Failed to get order status",
        err.code || "STATUS_FAILED",
        err.statusCode || 500
      )
    }
  }

  async getPositions(): Promise<BrokerPosition[]> {
    if (!this.connected) {
      throw new BrokerError("Broker not connected", "NOT_CONNECTED", 500)
    }

    try {
      // Uncomment when @alpacahq/alpaca-trade-api is installed
      // const positions = await this.alpaca.getPositions()
      // return positions.map(this.mapPosition)

      // Mock response
      return []
    } catch (err: any) {
      logger.error({ err }, "Failed to get Alpaca positions")
      throw new BrokerError(
        err.message || "Failed to get positions",
        err.code || "POSITIONS_FAILED",
        err.statusCode || 500
      )
    }
  }

  async getPosition(symbolId: string): Promise<BrokerPosition | null> {
    const positions = await this.getPositions()
    return positions.find((p) => p.symbol === symbolId) || null
  }

  async getQuote(symbol: string): Promise<BrokerQuote> {
    if (!this.connected) {
      throw new BrokerError("Broker not connected", "NOT_CONNECTED", 500)
    }

    try {
      // Uncomment when @alpacahq/alpaca-trade-api is installed
      // const quote = await this.alpaca.getLatestTrade(symbol)

      // Mock response
      const quote = {
        p: 178.25, // price
        s: 100,    // size
        t: new Date().toISOString(),
      }

      return {
        symbol,
        lastPrice: quote.p,
        volume: quote.s,
        timestamp: new Date(quote.t),
      }
    } catch (err: any) {
      logger.error({ err, symbol }, "Failed to get Alpaca quote")
      throw new BrokerError(
        err.message || "Failed to get quote",
        err.code || "QUOTE_FAILED",
        err.statusCode || 500
      )
    }
  }

  async getQuotes(symbols: string[]): Promise<BrokerQuote[]> {
    return Promise.all(symbols.map((symbol) => this.getQuote(symbol)))
  }

  async getAccountInfo(): Promise<BrokerAccountInfo> {
    if (!this.connected) {
      throw new BrokerError("Broker not connected", "NOT_CONNECTED", 500)
    }

    try {
      // Uncomment when @alpacahq/alpaca-trade-api is installed
      // const account = await this.alpaca.getAccount()

      // Mock response
      const account = {
        id: "ALPACA",
        cash: "100000.00",
        buying_power: "95000.00",
        portfolio_value: "105000.00",
      }

      return {
        accountId: account.id,
        cashBalance: parseFloat(account.cash),
        buyingPower: parseFloat(account.buying_power),
        totalValue: parseFloat(account.portfolio_value),
      }
    } catch (err: any) {
      logger.error({ err }, "Failed to get Alpaca account info")
      throw new BrokerError(
        err.message || "Failed to get account info",
        err.code || "ACCOUNT_FAILED",
        err.statusCode || 500
      )
    }
  }

  // Helper methods
  private mapDuration(duration?: string): string {
    const map: Record<string, string> = {
      DAY: "day",
      GTC: "gtc",
      IOC: "ioc",
      FOK: "fok",
    }
    return map[duration || "DAY"] || "day"
  }

  private mapOrderStatus(status: string): BrokerOrderResponse["status"] {
    const map: Record<string, BrokerOrderResponse["status"]> = {
      accepted: "PENDING",
      pending_new: "PENDING",
      new: "OPEN",
      partially_filled: "PARTIALLY_FILLED",
      filled: "FILLED",
      canceled: "CANCELLED",
      rejected: "REJECTED",
    }
    return map[status] || "PENDING"
  }

  private mapPosition(pos: any): BrokerPosition {
    const qty = parseFloat(pos.qty)
    const avgEntryPrice = parseFloat(pos.avg_entry_price)
    const currentPrice = parseFloat(pos.current_price)
    const marketValue = parseFloat(pos.market_value)

    return {
      symbol: pos.symbol,
      quantity: Math.abs(qty),
      avgCostBasis: avgEntryPrice,
      currentPrice,
      marketValue: Math.abs(marketValue),
      unrealizedPnl: parseFloat(pos.unrealized_pl),
      side: qty > 0 ? "LONG" : "SHORT",
    }
  }
}

// Factory function
export function createAlpacaBroker(): AlpacaBroker {
  const apiKey = process.env.ALPACA_API_KEY
  const apiSecret = process.env.ALPACA_API_SECRET
  const baseUrl = process.env.ALPACA_BASE_URL || "https://paper-api.alpaca.markets"

  if (!apiKey || !apiSecret) {
    throw new Error("ALPACA_API_KEY and ALPACA_API_SECRET must be set in environment")
  }

  return new AlpacaBroker(apiKey, apiSecret, baseUrl)
}
