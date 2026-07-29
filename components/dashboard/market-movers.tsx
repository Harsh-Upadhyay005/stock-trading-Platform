"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatPercent } from "@/lib/utils"

const gainers = [
  { symbol: "RELIANCE", price: 2450, change: 5.2 },
  { symbol: "TCS", price: 3890, change: 3.8 },
  { symbol: "INFY", price: 1620, change: 2.9 },
]

const losers = [
  { symbol: "HDFC", price: 1580, change: -2.4 },
  { symbol: "ICICI", price: 980, change: -1.8 },
  { symbol: "SBIN", price: 620, change: -1.2 },
]

export function MarketMovers() {
  const [activeTab, setActiveTab] = useState<"gainers" | "losers">("gainers")
  const data = activeTab === "gainers" ? gainers : losers

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Movers</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tabs */}
        <div className="flex gap-1 mb-4 p-1 bg-muted rounded">
          <Button
            variant={activeTab === "gainers" ? "primary" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab("gainers")}
          >
            Gainers
          </Button>
          <Button
            variant={activeTab === "losers" ? "primary" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab("losers")}
          >
            Losers
          </Button>
        </div>

        {/* List */}
        <div className="space-y-3">
          {data.map((stock) => (
            <Link
              key={stock.symbol}
              href={`/trade/${stock.symbol}`}
              className="flex items-center justify-between hover:bg-muted p-2 -m-2 rounded transition-colors"
            >
              <div>
                <p className="font-semibold text-sm">{stock.symbol}</p>
                <p className="text-xs numeric">
                  {formatCurrency(stock.price)}
                </p>
              </div>
              <p
                className={`text-sm font-medium numeric ${
                  stock.change >= 0 ? "" : "text-error"
                }`}
              >
                {formatPercent(stock.change)}
              </p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
