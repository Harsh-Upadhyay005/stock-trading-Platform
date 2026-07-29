"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Search, Filter, X } from "lucide-react"

export function MarketFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams)
    if (search) {
      params.set("search", search)
    } else {
      params.delete("search")
    }
    router.push(`/market?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch("")
    router.push("/market")
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search symbols or companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

        {(search || searchParams.toString()) && (
          <Button variant="ghost" size="icon" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted rounded-md">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
              Exchange
            </label>
            <select className="w-full h-9 px-3 text-sm bg-input border border-border rounded-sm">
              <option value="">All</option>
              <option value="NSE">NSE</option>
              <option value="BSE">BSE</option>
              <option value="NYSE">NYSE</option>
              <option value="NASDAQ">NASDAQ</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
              Sector
            </label>
            <select className="w-full h-9 px-3 text-sm bg-input border border-border rounded-sm">
              <option value="">All</option>
              <option value="technology">Technology</option>
              <option value="finance">Finance</option>
              <option value="healthcare">Healthcare</option>
              <option value="consumer">Consumer</option>
              <option value="energy">Energy</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
              Price Range
            </label>
            <select className="w-full h-9 px-3 text-sm bg-input border border-border rounded-sm">
              <option value="">All</option>
              <option value="0-100">₹0 - ₹100</option>
              <option value="100-500">₹100 - ₹500</option>
              <option value="500-1000">₹500 - ₹1,000</option>
              <option value="1000+">₹1,000+</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
              Market Cap
            </label>
            <select className="w-full h-9 px-3 text-sm bg-input border border-border rounded-sm">
              <option value="">All</option>
              <option value="large">Large Cap</option>
              <option value="mid">Mid Cap</option>
              <option value="small">Small Cap</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
