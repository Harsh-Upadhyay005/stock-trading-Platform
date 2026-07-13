// ============================================================
// lib/brokers/mock.ts — Mock broker for testing
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
import { logger } from "@/utils/logger"

export class MockBroker implements BrokerAdapter {
  private connected = false
  private orders: Map<string, any> = new Map()
  private positions: Map<string, BrokerPosition> = new Map()

  async connect(): Promise<void> {
    this.connected = true
    logger.info("Mock broker connected")
  }

  async disconnect(): Promise<void> {
    this.connected = false
    logger.info("Mock broker disconnected")
  }

  isConnected(): boolean {
    return this.connected
  }

  async placeOrder(order: PlaceOrderRequest): Promise<BrokerOrderResponse> {
    const orderId = `MOCK${Date.now()}`
    
    this.orders.set(orderId, {
      ...order,
      status: order.type === "MARKET" ? "FILLED" : "OPEN",
      filledQuantity: order.type === "MARKET" ? order.quantity : 0,
      avgFillPrice: order.limitPrice || 100,
      timestamp: new Date(),
    })

    logger.info({ orderId, symbol: order.symbol }, "Mock order placed")

    return {
      brokerOrderId: orderId,
      status: order.type === "MARKET" ? "FILLED" : "PENDING",
      filledQuantity: order.type === "MARKET" ? order.quantity : 0,
      avgFillPrice: order.type === "MARKET" ? (order.limitPrice || 100) : undefined,
      timestamp: new Date(),
    }
  }

  async cancelOrder(orderId: string): Promise<void> {
    const order = this.orders.get(orderId)
    if (order) {
      order.status = "CANCELLED"
    }
    logger.info({ orderId }, "Mock order cancelled")
  }

  async modifyOrder(
    orderId: string,
    modifications: OrderModifications
  ): Promise<BrokerOrderResponse> {
    const order = this.orders.get(orderId)
    if (order) {
      Object.assign(order, modifications)
    }
    logger.info({ orderId, modifications }, "Mock order modified")

    return {
      brokerOrderId: orderId,
      status: "OPEN",
      filledQuantity: 0,
      timestamp: new Date(),
    }
  }

  async getOrderStatus(orderId: string): Promise<BrokerOrderResponse> {
    const order = this.orders.get(orderId)
    
    if (!order) {
      return {
        brokerOrderId: orderId,
        status: "REJECTED",
        filledQuantity: 0,
        timestamp: new Date(),
        message: "Order not found",
      }
    }

    return {
      brokerOrderId: orderId,
      status: order.status,
      filledQuantity: order.filledQuantity,
      avgFillPrice: order.avgFillPrice,
      timestamp: order.timestamp,
    }
  }

  async getPositions(): Promise<BrokerPosition[]> {
    return Array.from(this.positions.values())
  }

  async getPosition(symbolId: string): Promise<BrokerPosition | null> {
    return this.positions.get(symbolId) || null
  }

  async getQuote(symbol: string): Promise<BrokerQuote> {
    // Generate mock quote with some randomness
    const basePrice = 100 + Math.random() * 100
    
    return {
      symbol,
      lastPrice: basePrice,
      bidPrice: basePrice - 0.05,
      askPrice: basePrice + 0.05,
      volume: Math.floor(Math.random() * 1000000),
      timestamp: new Date(),
    }
  }

  async getQuotes(symbols: string[]): Promise<BrokerQuote[]> {
    return Promise.all(symbols.map((symbol) => this.getQuote(symbol)))
  }

  async getAccountInfo(): Promise<BrokerAccountInfo> {
    return {
      accountId: "MOCK_ACCOUNT",
      cashBalance: 100000,
      buyingPower: 100000,
      totalValue: 100000,
    }
  }
}

export function createMockBroker(): MockBroker {
  return new MockBroker()
}
