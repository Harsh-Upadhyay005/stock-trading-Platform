'use client'

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { usePositions } from "@/lib/hooks/use-queries"
import { TableSkeleton } from "@/components/loading/table-skeleton"
import { ErrorMessage } from "@/components/error/error-message"
import { EmptyState } from "@/components/ui/empty-state"

export default function PositionsPage() {
  // Replace with actual accountId from auth/context
  const accountId = "user-account-id"
  const { data: positions = [], isLoading, error, refetch } = usePositions(accountId)

  // Calculate summary
  const summary = {
    totalInvested: positions.reduce((sum: number, p: any) => sum + (p.invested || 0), 0),
    currentValue: positions.reduce((sum: number, p: any) => sum + (p.current || 0), 0),
    totalPnL: positions.reduce((sum: number, p: any) => sum + (p.pnl || 0), 0),
    dayPnL: positions.reduce((sum: number, p: any) => sum + ((p.dayChange || 0) * (p.quantity || 0)), 0),
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-neutral-200 rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <Card key={i} className="p-6 h-24 bg-neutral-100 animate-pulse" />
          ))}
        </div>
        <Card className="p-6">
          <TableSkeleton rows={5} />
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Positions</h1>
        <ErrorMessage error={error} retry={refetch} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Positions</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Your open trading positions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Exit All
          </Button>
          <Button variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-neutral-600 mb-2">Total Invested</div>
          <div className="text-2xl font-bold font-mono">
            ₹{summary.totalInvested.toLocaleString()}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-neutral-600 mb-2">Current Value</div>
          <div className="text-2xl font-bold font-mono">
            ₹{summary.currentValue.toLocaleString()}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-neutral-600 mb-2">Total P&L</div>
          <div
            className={`text-2xl font-bold font-mono ${
              summary.totalPnL >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {summary.totalPnL >= 0 ? "+" : ""}₹
            {Math.abs(summary.totalPnL).toLocaleString()}
          </div>
          <div
            className={`text-sm ${
              summary.totalPnL >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {((summary.totalPnL / summary.totalInvested) * 100).toFixed(2)}%
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-neutral-600 mb-2">Today's P&L</div>
          <div
            className={`text-2xl font-bold font-mono ${
              summary.dayPnL >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {summary.dayPnL >= 0 ? "+" : ""}₹
            {Math.abs(summary.dayPnL).toFixed(2)}
          </div>
        </Card>
      </div>

      {/* Positions Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-neutral-50">
              <tr>
                <th className="text-left p-4 font-semibold">Instrument</th>
                <th className="text-right p-4 font-semibold">Qty</th>
                <th className="text-right p-4 font-semibold">Avg Price</th>
                <th className="text-right p-4 font-semibold">LTP</th>
                <th className="text-right p-4 font-semibold">Day Change</th>
                <th className="text-right p-4 font-semibold">P&L</th>
                <th className="text-right p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {positions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="text-6xl mb-4 opacity-20">📊</div>
                    <h3 className="text-lg font-semibold mb-2">
                      No open positions
                    </h3>
                    <p className="text-sm text-neutral-600 mb-4">
                      You don't have any open trading positions
                    </p>
                    <Button variant="outline">Start Trading</Button>
                  </td>
                </tr>
              ) : (
                positions.map((position) => (
                  <tr
                    key={position.id}
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <div className="font-mono font-semibold">
                          {position.symbol}
                        </div>
                        <div className="text-sm text-neutral-600">
                          {position.name}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right font-mono">
                      {position.quantity}
                    </td>
                    <td className="p-4 text-right font-mono">
                      ₹{position.avgPrice.toFixed(2)}
                    </td>
                    <td className="p-4 text-right font-mono font-semibold">
                      ₹{position.ltp.toFixed(2)}
                    </td>
                    <td className="p-4 text-right">
                      <div
                        className={`font-mono ${
                          position.dayChange >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {position.dayChange >= 0 ? "+" : ""}
                        {position.dayChange.toFixed(2)}
                      </div>
                      <div
                        className={`text-xs ${
                          position.dayChangePercent >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        ({position.dayChangePercent >= 0 ? "+" : ""}
                        {position.dayChangePercent.toFixed(2)}%)
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div
                        className={`font-mono font-semibold ${
                          position.pnl >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {position.pnl >= 0 ? "+" : ""}₹
                        {Math.abs(position.pnl).toFixed(2)}
                      </div>
                      <div
                        className={`text-xs ${
                          position.pnlPercent >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        ({position.pnlPercent >= 0 ? "+" : ""}
                        {position.pnlPercent.toFixed(2)}%)
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          Exit
                        </Button>
                        <Button variant="ghost" size="sm">
                          Add
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Info */}
      <Card className="p-6 bg-neutral-50">
        <div className="flex items-start gap-3">
          <div className="text-2xl">ℹ️</div>
          <div>
            <h3 className="font-semibold mb-2">About Positions</h3>
            <ul className="text-sm text-neutral-600 space-y-1">
              <li>• Positions show your current holdings from intraday trades</li>
              <li>
                • P&L is calculated based on average buy price vs current market
                price
              </li>
              <li>
                • Day Change shows today's price movement from yesterday's close
              </li>
              <li>• You can exit positions partially or fully at any time</li>
              <li>
                • Positions are automatically converted to holdings at end of day
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
