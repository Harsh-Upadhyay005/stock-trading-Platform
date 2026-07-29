"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Search, Filter, X } from "lucide-react"

export function OrderFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [symbol, setSymbol] = useState(searchParams.get("symbol") || "")
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams)
    if (symbol) {
      params.set("symbol", symbol)
    } else {
      params.delete("symbol")
    }
    router.push(`/orders?${params.toString()}`)
  }

  const clearFilters = () => {
    setSymbol("")
    router.push("/orders")
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by symbol..."
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full h-10 pl-10 pr-4 text-sm bg-input border border-border rounded-sm focus:border-foreground focus:outline-none"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <Button variant="secondary" size="md" onClick={handleSearch}>
          Search
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
        </Button>

        {(symbol || searchParams.toString()) && (
          <Button variant="ghost" size="icon" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted rounded-md">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
              Side
            </label>
            <select className="w-full h-9 px-3 text-sm bg-input border border-border rounded-sm">
              <option value="">All</option>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
              Type
            </label>
            <select className="w-full h-9 px-3 text-sm bg-input border border-border rounded-sm">
              <option value="">All</option>
              <option value="MARKET">Market</option>
              <option value="LIMIT">Limit</option>
              <option value="STOP">Stop</option>
              <option value="STOP_LIMIT">Stop Limit</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
              Status
            </label>
            <select className="w-full h-9 px-3 text-sm bg-input border border-border rounded-sm">
              <option value="">All</option>
              <option value="OPEN">Open</option>
              <option value="FILLED">Filled</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
              Date Range
            </label>
            <select className="w-full h-9 px-3 text-sm bg-input border border-border rounded-sm">
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
