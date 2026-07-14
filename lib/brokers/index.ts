// ============================================================
// lib/brokers/index.ts — Broker factory
// ============================================================
import type { BrokerAdapter } from "./types"
import { createZerodhaBroker } from "./zerodha"
import { createAlpacaBroker } from "./alpaca"
import { createMockBroker } from "./mock"
import { logger } from "@/utils/logger"

export * from "./types"

export type BrokerType = "zerodha" | "alpaca" | "mock"

/**
 * Get the configured broker instance
 * Reads from environment variable BROKER_TYPE
 */
export function getBroker(): BrokerAdapter {
  const brokerType = (process.env.BROKER_TYPE || "mock").toLowerCase() as BrokerType

  switch (brokerType) {
    case "zerodha":
      logger.info("Using Zerodha broker")
      return createZerodhaBroker()

    case "alpaca":
      logger.info("Using Alpaca broker")
      return createAlpacaBroker()

    case "mock":
      logger.info("Using Mock broker (for testing)")
      return createMockBroker()

    default:
      logger.warn({ brokerType }, "Unknown broker type, falling back to mock")
      return createMockBroker()
  }
}

/**
 * Get a specific broker instance
 */
export function createBroker(type: BrokerType): BrokerAdapter {
  switch (type) {
    case "zerodha":
      return createZerodhaBroker()
    case "alpaca":
      return createAlpacaBroker()
    case "mock":
      return createMockBroker()
  }
}
