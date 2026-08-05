"use client"

import { useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { Star, TrendingUp, X, Plus, GripVertical } from "lucide-react"

interface WatchlistItem {
  id: string
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  sparkline: string
  notes?: string
}

interface WatchlistTableProps {
  watchlistId: string
  watchlistName: string
  items: WatchlistItem[]
}

export function WatchlistTable({
  watchlistId,
  watchlistName,
  items,
}: WatchlistTableProps) {
  const [editingName, setEditingName] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchSymbol, setSearchSymbol] = useState("")

  return (
    <div className="flex-1 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        {editingName ? (
          <input
            type="text"
            defaultValue={watchlistName}
            className="text-2xl font-semibold bg-transparent border-b-2 border-foreground focus:outline-none"
            onBlur={() => setEditingName(false)}
            autoFocus
          />
        ) : (
          <h2
            className="text-2xl font-semibold cursor-pointer hover:opacity-70"
            onClick={() => setEditingName(true)}
          >
            {watchlistName}
          </h2>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Symbol
          </Button>
          <Button variant="ghost" size="icon">
            <Star className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search in watchlist..."
          className="w-full h-10 px-3 text-sm bg-input border border-border rounded-sm focus:border-foreground focus:outline-none"
        />
      </div>

      {/* Table */}
      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Change</TableHead>
              <TableHead>Volume</TableHead>
              <TableHead>Market Cap</TableHead>
              <TableHead>Chart</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/trade/${item.symbol}`}
                    className="font-semibold hover:underline"
                  >
                    {item.symbol}
                  </Link>
                </TableCell>
                <TableCell className="text-sm">{item.name}</TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(item.price)}
                </TableCell>
                <TableCell>
                  <div>
                    <p
                      className={`font-semibold ${
                        item.change >= 0 ? "" : "text-error"
                      }`}
                    >
                      {item.change >= 0 && "+"}
                      {formatCurrency(item.change)}
                    </p>
                    <p
                      className={`text-xs ${
                        item.changePercent >= 0 ? "" : "text-error"
                      }`}
                    >
                      {formatPercent(item.changePercent)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{(item.volume / 1000000).toFixed(1)}M</TableCell>
                <TableCell>{(item.marketCap / 1000000000).toFixed(1)}B</TableCell>
                <TableCell>
                  <span className="font-mono text-sm text-muted-foreground">
                    {item.sparkline}
                  </span>
                </TableCell>
                <TableCell>
                  <input
                    type="text"
                    placeholder="Add note..."
                    defaultValue={item.notes}
                    className="w-full h-8 px-2 text-xs bg-input border border-border rounded-sm focus:border-foreground focus:outline-none"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/trade/${item.symbol}`}>
                      <Button variant="ghost" size="icon">
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Add Symbol Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-foreground/20"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-background border border-border rounded-md p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Symbol</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                  Symbol
                </label>
                <input
                  type="text"
                  placeholder="AAPL, TSLA, GOOGL..."
                  value={searchSymbol}
                  onChange={(e) => setSearchSymbol(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-input border border-border rounded-sm focus:border-foreground focus:outline-none"
                />
              </div>

              {searchSymbol && (
                <div className="border border-border rounded-md p-2 max-h-48 overflow-y-auto">
                  {["AAPL", "TSLA", "GOOGL", "MSFT", "AMZN"]
                    .filter((s) =>
                      s.toLowerCase().includes(searchSymbol.toLowerCase())
                    )
                    .map((symbol) => (
                      <button
                        key={symbol}
                        className="w-full text-left px-3 py-2 hover:bg-muted rounded-sm"
                        onClick={() => {
                          setShowAddModal(false)
                          setSearchSymbol("")
                        }}
                      >
                        <p className="font-semibold">{symbol}</p>
                        <p className="text-xs text-muted-foreground">
                          Company Name
                        </p>
                      </button>
                    ))}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowAddModal(false)
                    setSearchSymbol("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
