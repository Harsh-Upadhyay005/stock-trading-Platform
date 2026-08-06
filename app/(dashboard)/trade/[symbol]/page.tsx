"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { useInstrumentQuote, usePlaceOrder, usePortfolioSummary } from "@/lib/hooks/use-queries"
import { TableSkeleton } from "@/components/loading/table-skeleton"
import { ErrorMessage } from "@/components/error/error-message"
import { toast } from "sonner"

export default function TradePage({ params }: { params: { symbol: string } }) {
  const symbol = params.symbol.toUpperCase()
  
  // Fetch real-time quote data
  const { data: quote, isLoading: quoteLoading, error: quoteError, refetch: refetchQuote } = useInstrumentQuote(symbol)
  
  // Fetch portfolio summary for available margin
  const { data: portfolio } = usePortfolioSummary("user-id") // TODO: Get from auth context
  
  // Place order mutation
  const placOrderMutation = usePlaceOrder()

  const [orderForm, setOrderForm] = useState({
    side: "BUY",
    type: "MARKET",
    quantity: "1",
    price: "",
    stopLoss: "",
    target: "",
  })

  // Use real quote data or fallback
  const stockData = quote ? {
    symbol: quote.symbol,
    name: quote.name || quote.symbol,
    ltp: quote.ltp || quote.lastPrice || 0,
    change: quote.change || 0,
    changePercent: quote.changePercent || 0,
    open: quote.open || 0,
    high: quote.high || quote.dayHigh || 0,
    low: quote.low || quote.dayLow || 0,
    close: quote.close || quote.previousClose || 0,
    volume: quote.volume || 0,
    avgVolume: quote.avgVolume || 0,
    marketCap: quote.marketCap || 0,
    pe: quote.pe || 0,
    high52w: quote.yearHigh || 0,
    low52w: quote.yearLow || 0,
  } : null

  // Mock order book (WebSocket integration needed)
  const orderBook = {
    bids: [
      { price: stockData ? stockData.ltp - 0.25 : 0, quantity: 150, orders: 5 },
      { price: stockData ? stockData.ltp - 0.50 : 0, quantity: 300, orders: 8 },
      { price: stockData ? stockData.ltp - 0.75 : 0, quantity: 450, orders: 12 },
      { price: stockData ? stockData.ltp - 1.00 : 0, quantity: 200, orders: 6 },
      { price: stockData ? stockData.ltp - 1.25 : 0, quantity: 100, orders: 3 },
    ],
    asks: [
      { price: stockData ? stockData.ltp + 0.25 : 0, quantity: 120, orders: 4 },
      { price: stockData ? stockData.ltp + 0.50 : 0, quantity: 280, orders: 7 },
      { price: stockData ? stockData.ltp + 0.75 : 0, quantity: 380, orders: 10 },
      { price: stockData ? stockData.ltp + 1.00 : 0, quantity: 190, orders: 5 },
      { price: stockData ? stockData.ltp + 1.25 : 0, quantity: 90, orders: 2 },
    ],
  }

  // Mock recent trades (WebSocket integration needed)
  const recentTrades = [
    { time: new Date().toLocaleTimeString(), price: stockData?.ltp || 0, quantity: 50, type: "BUY" },
    { time: new Date(Date.now() - 3000).toLocaleTimeString(), price: stockData ? stockData.ltp - 0.25 : 0, quantity: 100, type: "SELL" },
    { time: new Date(Date.now() - 7000).toLocaleTimeString(), price: stockData?.ltp || 0, quantity: 75, type: "BUY" },
    { time: new Date(Date.now() - 10000).toLocaleTimeString(), price: stockData ? stockData.ltp - 0.50 : 0, quantity: 25, type: "SELL" },
    { time: new Date(Date.now() - 15000).toLocaleTimeString(), price: stockData ? stockData.ltp - 0.25 : 0, quantity: 150, type: "BUY" },
  ]

  // Mock historical data for mini chart
  const chartData = "▁▂▃▅▄▃▅▆▇█▇▆▅▄▅▆▇▆▅▄▃▅▆▇"
  
  if (quoteLoading) {
    return <TableSkeleton />
  }
  
  if (quoteError || !stockData) {
    return <ErrorMessage error={quoteError || new Error('Failed to load quote')} retry={refetchQuote} />
  }

  const calculateTotal = () => {
    const qty = parseInt(orderForm.quantity) || 0
    const price =
      orderForm.type === "MARKET"
        ? stockData.ltp
        : parseFloat(orderForm.price) || 0
    return qty * price
  }
  
  const handlePlaceOrder = async () => {
    try {
      const orderData = {
        symbol: symbol,
        side: orderForm.side as 'BUY' | 'SELL',
        type: orderForm.type as 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'STOP_LOSS_LIMIT',
        quantity: parseInt(orderForm.quantity),
        price: orderForm.type !== 'MARKET' ? parseFloat(orderForm.price) : undefined,
        stopLoss: orderForm.stopLoss ? parseFloat(orderForm.stopLoss) : undefined,
        target: orderForm.target ? parseFloat(orderForm.target) : undefined,
      }
      
      await placOrderMutation.mutateAsync(orderData)
      toast.success(`${orderForm.side} order placed successfully for ${symbol}`)
      
      // Reset form
      setOrderForm({
        ...orderForm,
        quantity: "1",
        price: "",
        stopLoss: "",
        target: "",
      })
    } catch (error) {
      toast.error(`Failed to place order: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Stock Header */}
      <div className="border-b p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">{stockData.symbol}</h1>
              <p className="text-sm text-neutral-600">{stockData.name}</p>
            </div>
            <Badge variant="outline">NSE</Badge>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold font-mono">
              ₹{stockData.ltp.toFixed(2)}
            </div>
            <div
              className={`text-sm font-semibold ${
                stockData.change >= 0 ? "text-black" : "text-neutral-600"
              }`}
            >
              {stockData.change >= 0 ? "+" : ""}
              {stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}
              %)
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Sidebar - Market Depth */}
        <div className="col-span-3 space-y-4 overflow-y-auto">
          <Card>
            <div className="p-4 border-b">
              <h3 className="font-semibold">Market Depth</h3>
            </div>
            <div className="p-4">
              {/* Asks (Sellers) */}
              <div className="space-y-1 mb-4">
                {orderBook.asks.reverse().map((ask, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs hover:bg-neutral-50 p-1 rounded"
                  >
                    <span className="font-mono text-neutral-600">
                      {ask.price.toFixed(2)}
                    </span>
                    <span className="font-mono">{ask.quantity}</span>
                    <span className="text-neutral-500">{ask.orders}</span>
                  </div>
                ))}
              </div>

              {/* Current Price */}
              <div className="py-2 border-y text-center font-bold">
                ₹{stockData.ltp.toFixed(2)}
              </div>

              {/* Bids (Buyers) */}
              <div className="space-y-1 mt-4">
                {orderBook.bids.map((bid, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs hover:bg-neutral-50 p-1 rounded"
                  >
                    <span className="font-mono">{bid.price.toFixed(2)}</span>
                    <span className="font-mono">{bid.quantity}</span>
                    <span className="text-neutral-500">{bid.orders}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Recent Trades */}
          <Card>
            <div className="p-4 border-b">
              <h3 className="font-semibold">Recent Trades</h3>
            </div>
            <div className="p-4 space-y-1">
              {recentTrades.map((trade, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs hover:bg-neutral-50 p-1 rounded"
                >
                  <span className="text-neutral-500 font-mono">
                    {trade.time}
                  </span>
                  <span className="font-mono font-semibold">
                    {trade.price.toFixed(2)}
                  </span>
                  <span
                    className={`font-mono ${
                      trade.type === "BUY" ? "text-black" : "text-neutral-600"
                    }`}
                  >
                    {trade.quantity}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Center - Chart & Info */}
        <div className="col-span-6 space-y-4 overflow-y-auto">
          {/* Mini Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-3">
              <div className="text-xs text-neutral-600 mb-1">Open</div>
              <div className="font-mono font-semibold">
                {stockData.open.toFixed(2)}
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-neutral-600 mb-1">High</div>
              <div className="font-mono font-semibold">
                {stockData.high.toFixed(2)}
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-neutral-600 mb-1">Low</div>
              <div className="font-mono font-semibold">
                {stockData.low.toFixed(2)}
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-neutral-600 mb-1">Prev Close</div>
              <div className="font-mono font-semibold">
                {stockData.close.toFixed(2)}
              </div>
            </Card>
          </div>

          {/* Chart Placeholder */}
          <Card className="p-6 h-96 flex items-center justify-center bg-neutral-50">
            <div className="text-center">
              <div className="text-6xl mb-4 opacity-20">📈</div>
              <div className="font-mono text-4xl mb-4">{chartData}</div>
              <p className="text-neutral-600">
                Chart Component - Integration with TradingView or Chart.js
              </p>
              <p className="text-sm text-neutral-500 mt-2">
                Shows candlestick, line, or bar charts with technical indicators
              </p>
            </div>
          </Card>

          {/* Additional Info */}
          <Card>
            <div className="p-4 border-b">
              <h3 className="font-semibold">Company Information</h3>
            </div>
            <div className="p-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-neutral-600 mb-1">Market Cap</div>
                <div className="font-semibold">₹{stockData.marketCap}T</div>
              </div>
              <div>
                <div className="text-neutral-600 mb-1">P/E Ratio</div>
                <div className="font-semibold">{stockData.pe}</div>
              </div>
              <div>
                <div className="text-neutral-600 mb-1">Volume</div>
                <div className="font-semibold">
                  {(stockData.volume / 1000000).toFixed(2)}M
                </div>
              </div>
              <div>
                <div className="text-neutral-600 mb-1">Avg Volume</div>
                <div className="font-semibold">
                  {(stockData.avgVolume / 1000000).toFixed(2)}M
                </div>
              </div>
              <div>
                <div className="text-neutral-600 mb-1">52W High</div>
                <div className="font-semibold">{stockData.high52w.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-neutral-600 mb-1">52W Low</div>
                <div className="font-semibold">{stockData.low52w.toFixed(2)}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Sidebar - Order Entry */}
        <div className="col-span-3 space-y-4 overflow-y-auto">
          <Card>
            <Tabs defaultValue="buy" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger
                  value="buy"
                  onClick={() => setOrderForm({ ...orderForm, side: "BUY" })}
                >
                  Buy
                </TabsTrigger>
                <TabsTrigger
                  value="sell"
                  onClick={() => setOrderForm({ ...orderForm, side: "SELL" })}
                >
                  Sell
                </TabsTrigger>
              </TabsList>

              <TabsContent value="buy" className="p-4 space-y-4">
                {/* Order Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Order Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    value={orderForm.type}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, type: e.target.value })
                    }
                  >
                    <option value="MARKET">Market</option>
                    <option value="LIMIT">Limit</option>
                    <option value="STOP_LOSS">Stop Loss</option>
                    <option value="STOP_LOSS_LIMIT">Stop Loss Limit</option>
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Quantity
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                    value={orderForm.quantity}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, quantity: e.target.value })
                    }
                    min="1"
                  />
                </div>

                {/* Price (if limit order) */}
                {orderForm.type !== "MARKET" && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Price
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border rounded-lg font-mono"
                      value={orderForm.price}
                      onChange={(e) =>
                        setOrderForm({ ...orderForm, price: e.target.value })
                      }
                      step="0.05"
                    />
                  </div>
                )}

                {/* Advanced Options */}
                <div className="pt-4 border-t">
                  <div className="text-sm font-medium mb-3">
                    Advanced (Optional)
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-neutral-600 mb-1 block">
                        Stop Loss
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                        value={orderForm.stopLoss}
                        onChange={(e) =>
                          setOrderForm({
                            ...orderForm,
                            stopLoss: e.target.value,
                          })
                        }
                        placeholder="Optional"
                        step="0.05"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-600 mb-1 block">
                        Target
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                        value={orderForm.target}
                        onChange={(e) =>
                          setOrderForm({ ...orderForm, target: e.target.value })
                        }
                        placeholder="Optional"
                        step="0.05"
                      />
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-neutral-600">Order Value</span>
                    <span className="font-mono font-semibold">
                      ₹{calculateTotal().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">Available Margin</span>
                    <span className="font-mono text-green-600">
                      ₹{portfolio?.availableMargin?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>

                {/* Place Order Button */}
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={placOrderMutation.isPending}
                >
                  {placOrderMutation.isPending ? 'Placing Order...' : 'Place Buy Order'}
                </Button>
              </TabsContent>

              <TabsContent value="sell" className="p-4 space-y-4">
                {/* Same form fields as buy */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Order Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    value={orderForm.type}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, type: e.target.value })
                    }
                  >
                    <option value="MARKET">Market</option>
                    <option value="LIMIT">Limit</option>
                    <option value="STOP_LOSS">Stop Loss</option>
                    <option value="STOP_LOSS_LIMIT">Stop Loss Limit</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Quantity
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                    value={orderForm.quantity}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, quantity: e.target.value })
                    }
                    min="1"
                  />
                  <p className="text-xs text-neutral-600 mt-1">
                    Available: 50 shares
                  </p>
                </div>

                {orderForm.type !== "MARKET" && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Price
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border rounded-lg font-mono"
                      value={orderForm.price}
                      onChange={(e) =>
                        setOrderForm({ ...orderForm, price: e.target.value })
                      }
                      step="0.05"
                    />
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-neutral-600">Order Value</span>
                    <span className="font-mono font-semibold">
                      ₹{calculateTotal().toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-black"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={placOrderMutation.isPending}
                >
                  {placOrderMutation.isPending ? 'Placing Order...' : 'Place Sell Order'}
                </Button>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Quick Actions */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 text-sm">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                + Add to Watchlist
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                🔔 Set Price Alert
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                📊 View Fundamentals
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
