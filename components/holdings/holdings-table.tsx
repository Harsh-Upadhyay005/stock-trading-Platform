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
import { ChevronDown, ChevronUp, Search, TrendingUp, X } from "lucide-react"
import { useHoldings } from "@/lib/hooks/use-queries"
import { TableSkeleton } from "@/components/loading/table-skeleton"
import { ErrorMessage } from "@/components/error/error-message"

interface HoldingsTableProps {
  userId: string
  searchParams: any
}

export function HoldingsTable({ userId, searchParams }: HoldingsTableProps) {
  // Fetch holdings from API
  const { data: holdings = [], isLoading, error } = useHoldings(userId)
  
  const [sortColumn, setSortColumn] = useState<string>("marketValue")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("desc")
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className="p-6">
        <TableSkeleton rows={5} />
      </Card>
    )
  }

  // Error state
  if (error) {
    return <ErrorMessage error={error} />
  }

  const filteredHoldings = holdings.filter(
    (h: any) =>
      h.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedHoldings = [...filteredHoldings].sort((a: any, b: any) => {
    const aVal = a[sortColumn as keyof typeof a]
    const bVal = b[sortColumn as keyof typeof b]
    const multiplier = sortDirection === "asc" ? 1 : -1
    return aVal > bVal ? multiplier : -multiplier
  })

  return (
    <Card className="p-6">
      {/* Search and Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search symbols or company names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-sm bg-input border border-border rounded-sm focus:border-foreground focus:outline-none"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:text-foreground"
              onClick={() => handleSort("symbol")}
            >
              <div className="flex items-center gap-2">
                Symbol
                {sortColumn === "symbol" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  ))}
              </div>
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead
              className="cursor-pointer hover:text-foreground"
              onClick={() => handleSort("quantity")}
            >
              <div className="flex items-center gap-2">
                Quantity
                {sortColumn === "quantity" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  ))}
              </div>
            </TableHead>
            <TableHead>Avg Cost</TableHead>
            <TableHead>Current Price</TableHead>
            <TableHead
              className="cursor-pointer hover:text-foreground"
              onClick={() => handleSort("marketValue")}
            >
              <div className="flex items-center gap-2">
                Market Value
                {sortColumn === "marketValue" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  ))}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:text-foreground"
              onClick={() => handleSort("totalReturn")}
            >
              <div className="flex items-center gap-2">
                Total Return
                {sortColumn === "totalReturn" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  ))}
              </div>
            </TableHead>
            <TableHead>Today's Return</TableHead>
            <TableHead>Weight</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedHoldings.map((holding) => (
            <>
              <TableRow
                key={holding.symbol}
                className="cursor-pointer"
                onClick={() =>
                  setExpandedRow(
                    expandedRow === holding.symbol ? null : holding.symbol
                  )
                }
              >
                <TableCell>
                  <Link
                    href={`/trade/${holding.symbol}`}
                    className="font-semibold hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {holding.symbol}
                  </Link>
                </TableCell>
                <TableCell className="text-sm">{holding.name}</TableCell>
                <TableCell>{holding.quantity}</TableCell>
                <TableCell>{formatCurrency(holding.avgCost)}</TableCell>
                <TableCell>{formatCurrency(holding.currentPrice)}</TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(holding.marketValue)}
                </TableCell>
                <TableCell>
                  <div>
                    <p
                      className={`font-semibold ${
                        holding.totalReturn >= 0 ? "" : "text-error"
                      }`}
                    >
                      {holding.totalReturn >= 0 && "+"}
                      {formatCurrency(holding.totalReturn)}
                    </p>
                    <p
                      className={`text-xs ${
                        holding.totalReturnPercent >= 0 ? "" : "text-error"
                      }`}
                    >
                      {formatPercent(holding.totalReturnPercent)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p
                      className={`font-semibold ${
                        holding.todayReturn >= 0 ? "" : "text-error"
                      }`}
                    >
                      {holding.todayReturn >= 0 && "+"}
                      {formatCurrency(holding.todayReturn)}
                    </p>
                    <p
                      className={`text-xs ${
                        holding.todayReturnPercent >= 0 ? "" : "text-error"
                      }`}
                    >
                      {formatPercent(holding.todayReturnPercent)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{holding.weight.toFixed(2)}%</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/trade/${holding.symbol}?action=buy`}>
                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/trade/${holding.symbol}?action=sell`}>
                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                        Close
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>

              {/* Expanded Row */}
              {expandedRow === holding.symbol && (
                <TableRow>
                  <TableCell colSpan={10} className="bg-muted">
                    <div className="p-4 space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                          Price Chart (7 Days)
                        </p>
                        <p className="font-mono text-lg">{holding.sparkline}</p>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Purchase Value
                          </p>
                          <p className="font-semibold numeric">
                            {formatCurrency(holding.avgCost * holding.quantity)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Current Value
                          </p>
                          <p className="font-semibold numeric">
                            {formatCurrency(holding.marketValue)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Unrealized P&L
                          </p>
                          <p
                            className={`font-semibold numeric ${
                              holding.totalReturn >= 0 ? "" : "text-error"
                            }`}
                          >
                            {holding.totalReturn >= 0 && "+"}
                            {formatCurrency(holding.totalReturn)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Day Change
                          </p>
                          <p
                            className={`font-semibold numeric ${
                              holding.todayReturn >= 0 ? "" : "text-error"
                            }`}
                          >
                            {holding.todayReturn >= 0 && "+"}
                            {formatCurrency(holding.todayReturn)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>

      <p className="text-sm text-muted-foreground mt-4">
        Showing {sortedHoldings.length} position{sortedHoldings.length !== 1 && "s"}
      </p>
    </Card>
  )
}
