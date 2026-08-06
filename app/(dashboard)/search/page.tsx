"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { TableSkeleton } from "@/components/loading/table-skeleton"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Search with debounce
  useEffect(() => {
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await apiClient.market.searchSymbols(query)
        setSearchResults(results.result || [])
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Mock search results
  const recentSearches = ["RELIANCE", "TCS", "INFY", "HDFCBANK"]

  const trendingStocks = [
    { symbol: "RELIANCE", name: "Reliance Industries Ltd", price: 2456.75, change: 1.88 },
    { symbol: "TCS", name: "Tata Consultancy Services", price: 3512.40, change: -0.45 },
    { symbol: "INFY", name: "Infosys Ltd", price: 1456.90, change: 2.15 },
    { symbol: "HDFCBANK", name: "HDFC Bank Ltd", price: 1567.30, change: 0.87 },
  ]

  const sectors = [
    { name: "Banking", count: 45, icon: "🏦" },
    { name: "Technology", count: 38, icon: "💻" },
    { name: "Energy", count: 22, icon: "⚡" },
    { name: "FMCG", count: 28, icon: "🛒" },
    { name: "Pharma", count: 31, icon: "💊" },
    { name: "Auto", count: 19, icon: "🚗" },
  ]

  // Mock search results
  const searchResults = query
    ? [
        { symbol: "RELIANCE", name: "Reliance Industries Ltd", exchange: "NSE", type: "EQUITY" },
        { symbol: "RELINFRA", name: "Reliance Infrastructure Ltd", exchange: "NSE", type: "EQUITY" },
        { symbol: "RPOWER", name: "Reliance Power Ltd", exchange: "NSE", type: "EQUITY" },
      ].filter(
        (s) =>
          s.symbol.toLowerCase().includes(query.toLowerCase()) ||
          s.name.toLowerCase().includes(query.toLowerCase())
      )
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Search Stocks</h1>
        <p className="text-sm text-neutral-600 mt-1">
          Find stocks, indices, and other instruments
        </p>
      </div>

      {/* Search Bar */}
      <Card className="p-6">
        <div className="relative">
          <input
            type="search"
            placeholder="Search by symbol or company name..."
            className="w-full px-6 py-4 border-2 rounded-lg text-lg pr-12"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl">
            🔍
          </div>
        </div>

        {/* Recent Searches */}
        {!query && (
          <div className="mt-4">
            <div className="text-sm text-neutral-600 mb-2">Recent searches:</div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search) => (
                <Button
                  key={search}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery(search)}
                >
                  {search}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Search Results */}
      {query && searchResults.length > 0 && (
        <Card>
          <div className="p-6 border-b">
            <h2 className="font-semibold">Search Results ({searchResults.length})</h2>
          </div>
          <div className="divide-y">
            {searchResults.map((result) => (
              <Link
                key={result.symbol}
                href={`/trade/${result.symbol}`}
                className="block"
              >
                <div className="p-6 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono font-semibold text-lg mb-1">
                        {result.symbol}
                      </div>
                      <div className="text-sm text-neutral-600">{result.name}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{result.exchange}</Badge>
                      <Badge>{result.type}</Badge>
                      <Button variant="ghost" size="sm">
                        Trade →
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {query && searchResults.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4 opacity-20">🔍</div>
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-sm text-neutral-600">
            Try searching with a different keyword
          </p>
        </Card>
      )}

      {/* Browse by Sector */}
      {!query && (
        <>
          <div>
            <h2 className="text-xl font-bold mb-4">Browse by Sector</h2>
            <div className="grid grid-cols-3 gap-4">
              {sectors.map((sector) => (
                <Card
                  key={sector.name}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{sector.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold mb-1">{sector.name}</div>
                      <div className="text-sm text-neutral-600">
                        {sector.count} stocks
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      →
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Trending Stocks */}
          <Card>
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Trending Stocks</h2>
            </div>
            <div className="divide-y">
              {trendingStocks.map((stock) => (
                <Link
                  key={stock.symbol}
                  href={`/trade/${stock.symbol}`}
                  className="block"
                >
                  <div className="p-6 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-mono font-semibold mb-1">
                          {stock.symbol}
                        </div>
                        <div className="text-sm text-neutral-600">
                          {stock.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold">
                          ₹{stock.price.toFixed(2)}
                        </div>
                        <div
                          className={`text-sm ${
                            stock.change >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {stock.change >= 0 ? "+" : ""}
                          {stock.change.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
