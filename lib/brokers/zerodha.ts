// ============================================================
// lib/brokers/zerodha.ts — Zerodha Kite Connect adapter
// Documentation: https://kite.trade/docs/connect/v3/
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

// Install: npm install kiteconnect
// import { KiteConnect } from "kiteconnect"

export class ZerodhaBroker implements BrokerAdapter {
  private kite: any // KiteConnect instance
  private connected = false

  constructor(
    private apiKey: string,
    private accessToken: string
  ) {
    // Uncomment when kiteconnect is installed
    // this.kite = new KiteConnect({ api_key: apiKey })
    // this.kite.setAccessToken(accessToken)
  }

  async connect(): Promise<void> {
    try {
      // Test connection by getting profile
      // await this.kite.getProfile()
      this.connected = true
      logger.info("Zerodha broker connected")
    } catch (err) {
      logger.error({ err }, "Zerodha connection failed")
      throw new BrokerError("Failed to connect to Zerodha", "CONNECTION_FAILED", 500)
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false
    logger.info("Zerodha broker disconnected")
  }

  isConnected(): boolean {
    return this.connected
  }

  async placeOrder(order: PlaceOrderRequest): Promise<BrokerOrderResponse> {
    if (!this.connected) {
      throw new BrokerError("Broker not connected", "NOT_CONNECTED", 500)
    }

    try {
      // Map order types
      const variety = "regular" // or "amo", "co", "iceberg"
      const exchange = "NSE" // or "BSE" - should come from symbol data

      const orderParams = {
        exchange,
        tradingsymbol: order.symbol,
        transaction_type: order.side === "BUY" ? "BUY" : "SELL",
        quantity: order.quantity,
        product: "CNC", // or "MIS" for intraday, "NRML" for F&O
        order_type: this.mapOrderType(order.type),
        validity: this.mapDuration(order.duration),
        ...(order.limitPrice && { price: order.limitPrice }),
        ...(order.stopPrice && { trigger_price: order.stopPrice }),
      }

      // Uncomment when kiteconnect is installed
      // const response = await this.kite.placeOrder(variety, orderParams)
      
      // Mock response for now
      const response = {
        order_id: `ZRO${Date.now()}`,
      }

      logger.info({ orderId: response.order_id, symbol: order.symbol }, "Zerodha order placed")

      return {
        brokerOrderId: response.order_id,
        status: "PENDING",
        filledQuantity: 0,
        timestamp: new Date(),
      }
    } catch (err: any) {
      logger.error({ err, order }, "Zerodha order placement failed")
      throw new BrokerError(
        err.message || "Order placement failed",
        err.error_type || "ORDER_FAILED",
        err.status_code || 500
      )
    }
  }

  async cancelOrder(orderId: string): Promise<void> {
    if (!this.connected) {
      throw new BrokerError("Broker not connected", "NOT_CONNECTED", 500)
    }

    try {
      // Uncomment when kiteconnect is installed
      // await this.kite.cancelOrder("regular", orderId)
      logger.info({ orderId }, "Zerodha order cancelled")
    } catch (err: any) {
      logger.error({ err, orderId }, "Zerodha order cancellation failed")
      throw new BrokerError(
        err.message || "Order cancellation failed",
        err.error_type || "CANCEL_FAILED",
        err.status_code || 500
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
      if (modifications.quantity) params.quantity = modifications.quantity
      if (modifications.limitPrice) params.price = modifications.limitPrice
      if (modifications.stopPrice) params.trigger_price = modifications.stopPrice

      // Uncomment when kiteconnect is installed
      // const response = await this.kite.modifyOrder("regular", orderId, params)

      logger.info({ orderId, modifications }, "Zerodha order modified")

      return {
        brokerOrderId: orderId,
        status: "OPEN",
        filledQuantity: 0,
        timestamp: new Date(),
      }
    } catch (err: any) {
      logger.error({ err, orderId }, "Zerodha order modification failed")
      throw new BrokerError(
        err.message || "Order modification failed",
        err.error_type || "MODIFY_FAILED",
        err.status_code || 500
      )
    }
  }

  async getOrderStatus(orderId: string): Promise<BrokerOrderResponse> {
    if (!this.connected) {
      throw new BrokerError("Broker not connected", "NOT_CONNECTED", 500)
    }

    try {
      // Uncomment when kiteconnect is installed
      // const orders = await this.kite.getOrders()
      // const order = orders.find((o: any) => o.order_id === orderId)

      // Mock response
      const order = {
        order_id: orderId,
        status: "COMPLETE",
        filled_quantity: 10,
        average_price: 2450.50,
      }

      if (!order) {
        throw new BrokerError("Order not found", "ORDER_NOT_FOUND", 404)
      }

      return {
        brokerOrderId: order.order_id,
        status: this.mapOrderStatus(order.status),
        filledQuantity: order.filled_quantity || 0,
        avgFillPrice: order.average_price,
        timestamp: new Date(),
      }
    } catch (err: any) {
      logger.error({ err, orderId }, "Failed to get Zerodha order status")
      throw new BrokerError(
        err.message || "Failed to get order status",
        err.error_type || "STATUS_FAILED",
        err.status_code || 500
      )
    }
  }

  async getPositions(): Promise<BrokerPosition[]> {
    if (!this.connected) {
      throw new BrokerError("Broker not connected", "NOT_CONNECTED", 500)
    }

    try {
      // Uncomment when kiteconnect is installed
      // const positions = await this.kite.getPositions()
      // return positions.net.map(this.mapPosition)

      // Mock response
      return []
    } catch (err: any) {
      logger.error({ err }, "Failed to get Zerodha positions")
      throw new BrokerError(
        err.message || "Failed to get positions",
        err.error_type || "POSITIONS_FAILED",
        err.status_code || 500
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
      // Uncomment when kiteconnect is installed
      // const instruments = [`NSE:${symbol}`]
      // const quotes = await this.kite.getQuote(instruments)
      // const quote = quotes[instruments[0]]

      // Mock response
      const quote = {
        last_price: 2450.50,
        ohlc: { open: 2440, high: 2460, low: 2435, close: 2445 },
        volume: 1000000,
      }

      return {
        symbol,
        lastPrice: quote.last_price,
        volume: quote.volume,
        timestamp: new Date(),
      }
    } catch (err: any) {
      logger.error({ err, symbol }, "Failed to get Zerodha quote")
      throw new BrokerError(
        err.message || "Failed to get quote",
        err.error_type || "QUOTE_FAILED",
        err.status_code || 500
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
      // Uncomment when kiteconnect is installed
      // const margins = await this.kite.getMargins()
      // const equity = margins.equity

      // Mock response
      const equity = {
        net: 100000,
        available: {
          live_balance: 95000,
        },
      }

      return {
        accountId: "ZERODHA",
        cashBalance: equity.available.live_balance,
        buyingPower: equity.available.live_balance,
        totalValue: equity.net,
      }
    } catch (err: any) {
      logger.error({ err }, "Failed to get Zerodha account info")
      throw new BrokerError(
        err.message || "Failed to get account info",
        err.error_type || "ACCOUNT_FAILED",
        err.status_code || 500
      )
    }
  }

  // Helper methods
  private mapOrderType(type: string): string {
    const map: Record<string, string> = {
      MARKET: "MARKET",
      LIMIT: "LIMIT",
      STOP: "SL",
      STOP_LIMIT: "SL-M",
    }
    return map[type] || "MARKET"
  }

  private mapDuration(duration?: string): string {
    const map: Record<string, string> = {
      DAY: "DAY",
      GTC: "IOC", // Zerodha doesn't have GTC, using IOC
      IOC: "IOC",
      FOK: "IOC",
    }
    return map[duration || "DAY"] || "DAY"
  }

  private mapOrderStatus(status: string): BrokerOrderResponse["status"] {
    const map: Record<string, BrokerOrderResponse["status"]> = {
      PENDING: "PENDING",
      OPEN: "OPEN",
      COMPLETE: "FILLED",
      CANCELLED: "CANCELLED",
      REJECTED: "REJECTED",
    }
    return map[status] || "PENDING"
  }
}

// Factory function
export function createZerodhaBroker(): ZerodhaBroker {
  const apiKey = process.env.ZERODHA_API_KEY
  const accessToken = process.env.ZERODHA_ACCESS_TOKEN

  if (!apiKey || !accessToken) {
    throw new Error("ZERODHA_API_KEY and ZERODHA_ACCESS_TOKEN must be set in environment")
  }

  return new ZerodhaBroker(apiKey, accessToken)
}
