"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function ToolsPage() {
  const [brokerageCalc, setBrokerageCalc] = useState({
    buyPrice: "",
    sellPrice: "",
    quantity: "",
  })

  const [marginCalc, setMarginCalc] = useState({
    price: "",
    quantity: "",
    leverage: "5",
  })

  const calculateBrokerage = () => {
    const buy = parseFloat(brokerageCalc.buyPrice) || 0
    const sell = parseFloat(brokerageCalc.sellPrice) || 0
    const qty = parseInt(brokerageCalc.quantity) || 0

    const buyValue = buy * qty
    const sellValue = sell * qty
    const pnl = sellValue - buyValue

    const brokerage = Math.min(20, buyValue * 0.0005) + Math.min(20, sellValue * 0.0005)
    const stt = sellValue * 0.001
    const exchangeFee = (buyValue + sellValue) * 0.0002
    const gst = (brokerage + exchangeFee) * 0.18
    const totalCharges = brokerage + stt + exchangeFee + gst

    return {
      pnl,
      totalCharges,
      netPnl: pnl - totalCharges,
    }
  }

  const calculateMargin = () => {
    const price = parseFloat(marginCalc.price) || 0
    const qty = parseInt(marginCalc.quantity) || 0
    const leverage = parseFloat(marginCalc.leverage) || 1

    const totalValue = price * qty
    const requiredMargin = totalValue / leverage
    const exposure = totalValue

    return {
      totalValue,
      requiredMargin,
      exposure,
    }
  }

  const brokerageResult = calculateBrokerage()
  const marginResult = calculateMargin()

  const tools = [
    {
      icon: "🧮",
      title: "Brokerage Calculator",
      description: "Calculate brokerage and taxes for your trades",
      category: "Trading",
    },
    {
      icon: "📊",
      title: "Margin Calculator",
      description: "Calculate required margin and leverage exposure",
      category: "Trading",
    },
    {
      icon: "💹",
      title: "SIP Calculator",
      description: "Calculate returns from systematic investments",
      category: "Investment",
    },
    {
      icon: "📈",
      title: "Target Calculator",
      description: "Set profit targets and stop loss levels",
      category: "Trading",
    },
    {
      icon: "💰",
      title: "Tax Calculator",
      description: "Estimate tax liability on capital gains",
      category: "Finance",
    },
    {
      icon: "🎯",
      title: "Position Sizer",
      description: "Calculate optimal position size based on risk",
      category: "Risk",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Trading Tools</h1>
        <p className="text-sm text-neutral-600 mt-1">
          Essential calculators and tools for traders
        </p>
      </div>

      {/* Featured Calculators */}
      <div className="grid grid-cols-2 gap-6">
        {/* Brokerage Calculator */}
        <Card>
          <div className="p-6 border-b bg-neutral-50">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span>🧮</span> Brokerage Calculator
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Buy Price</label>
              <input
                type="number"
                className="w-full px-4 py-2 border rounded-lg font-mono"
                placeholder="0.00"
                value={brokerageCalc.buyPrice}
                onChange={(e) =>
                  setBrokerageCalc({ ...brokerageCalc, buyPrice: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Sell Price</label>
              <input
                type="number"
                className="w-full px-4 py-2 border rounded-lg font-mono"
                placeholder="0.00"
                value={brokerageCalc.sellPrice}
                onChange={(e) =>
                  setBrokerageCalc({ ...brokerageCalc, sellPrice: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Quantity</label>
              <input
                type="number"
                className="w-full px-4 py-2 border rounded-lg font-mono"
                placeholder="0"
                value={brokerageCalc.quantity}
                onChange={(e) =>
                  setBrokerageCalc({ ...brokerageCalc, quantity: e.target.value })
                }
              />
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Gross P&L</span>
                <span className={`font-mono font-semibold ${brokerageResult.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{brokerageResult.pnl.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Total Charges</span>
                <span className="font-mono text-red-600">
                  ₹{brokerageResult.totalCharges.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-bold">Net P&L</span>
                <span className={`font-mono font-bold text-lg ${brokerageResult.netPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{brokerageResult.netPnl.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Margin Calculator */}
        <Card>
          <div className="p-6 border-b bg-neutral-50">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span>📊</span> Margin Calculator
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Price</label>
              <input
                type="number"
                className="w-full px-4 py-2 border rounded-lg font-mono"
                placeholder="0.00"
                value={marginCalc.price}
                onChange={(e) =>
                  setMarginCalc({ ...marginCalc, price: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Quantity</label>
              <input
                type="number"
                className="w-full px-4 py-2 border rounded-lg font-mono"
                placeholder="0"
                value={marginCalc.quantity}
                onChange={(e) =>
                  setMarginCalc({ ...marginCalc, quantity: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Leverage</label>
              <select
                className="w-full px-4 py-2 border rounded-lg"
                value={marginCalc.leverage}
                onChange={(e) =>
                  setMarginCalc({ ...marginCalc, leverage: e.target.value })
                }
              >
                <option value="1">1x (No Leverage)</option>
                <option value="2">2x</option>
                <option value="3">3x</option>
                <option value="4">4x</option>
                <option value="5">5x</option>
              </select>
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Total Value</span>
                <span className="font-mono font-semibold">
                  ₹{marginResult.totalValue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Exposure</span>
                <span className="font-mono font-semibold">
                  ₹{marginResult.exposure.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-bold">Required Margin</span>
                <span className="font-mono font-bold text-lg text-green-600">
                  ₹{marginResult.requiredMargin.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* All Tools Grid */}
      <div>
        <h2 className="text-xl font-bold mb-4">All Tools</h2>
        <div className="grid grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Card
              key={tool.title}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="text-4xl mb-3">{tool.icon}</div>
              <h3 className="font-semibold mb-2">{tool.title}</h3>
              <p className="text-sm text-neutral-600 mb-3">{tool.description}</p>
              <Badge variant="outline" className="text-xs">
                {tool.category}
              </Badge>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <Card className="p-6 bg-neutral-50">
        <h3 className="font-semibold mb-4">Quick Links</h3>
        <div className="grid grid-cols-4 gap-3">
          <Button variant="outline" size="sm">
            📚 Trading Guide
          </Button>
          <Button variant="outline" size="sm">
            📊 Market Analysis
          </Button>
          <Button variant="outline" size="sm">
            💡 Strategy Builder
          </Button>
          <Button variant="outline" size="sm">
            🎓 Learning Center
          </Button>
        </div>
      </Card>
    </div>
  )
}
