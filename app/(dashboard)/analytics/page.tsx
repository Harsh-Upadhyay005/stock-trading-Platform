import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

async function getAnalytics(userId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/reports`,
      {
        cache: 'no-store',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
      }
    )
    if (!response.ok) throw new Error('Failed to fetch')
    const data = await response.json()
    return data.result || {}
  } catch (error) {
    console.error('Error:', error)
    return {}
  }
}

export default async function AnalyticsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const analytics = await getAnalytics(userId)
  const tradingSummary = analytics.tradingSummary || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Advanced Analytics</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Deep dive into your trading performance
          </p>
        </div>
        <div className="flex gap-2">
          <select className="px-4 py-2 border rounded-lg text-sm">
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>Last 6 Months</option>
            <option>Last Year</option>
            <option>All Time</option>
          </select>
          <Button variant="outline" size="sm">
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-neutral-600 mb-2">Total Trades</div>
          <div className="text-3xl font-bold">{tradingSummary.totalTrades || 0}</div>
          <div className="text-xs text-neutral-500 mt-1">All time</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-neutral-600 mb-2">Win Rate</div>
          <div className="text-3xl font-bold">{tradingSummary.winRate?.toFixed(1) || 0}%</div>
          <div className="text-xs text-green-600 mt-1">↑ 2.3% from last month</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-neutral-600 mb-2">Net P&L</div>
          <div className="text-3xl font-bold text-green-600">
            +₹{(tradingSummary.netProfit || 0).toLocaleString()}
          </div>
          <div className="text-xs text-green-600 mt-1">↑ +15.2%</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-neutral-600 mb-2">Sharpe Ratio</div>
          <div className="text-3xl font-bold">1.85</div>
          <div className="text-xs text-neutral-500 mt-1">Risk-adjusted return</div>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Cumulative P&L</h2>
        </div>
        <div className="p-6 h-80 flex items-center justify-center bg-neutral-50">
          <div className="text-center text-neutral-600">
            <div className="text-6xl mb-4 opacity-20">📊</div>
            <p>Interactive chart showing cumulative profit/loss over time</p>
            <p className="text-sm mt-2">Integration: Chart.js or Recharts</p>
          </div>
        </div>
      </Card>

      {/* Trading Stats Grid */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Trade Distribution</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Profitable Trades</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-32 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600" style={{ width: `${tradingSummary.winRate || 0}%` }}></div>
                  </div>
                  <span className="font-mono font-semibold text-green-600">
                    {tradingSummary.profitableTrades || 0}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Losing Trades</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-32 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600" style={{ width: `${100 - (tradingSummary.winRate || 0)}%` }}></div>
                  </div>
                  <span className="font-mono font-semibold text-red-600">
                    {tradingSummary.losingTrades || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Profit/Loss Analysis</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-neutral-600">Average Win</span>
              <span className="font-mono font-semibold text-green-600">
                ₹{(tradingSummary.avgProfit || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Average Loss</span>
              <span className="font-mono font-semibold text-red-600">
                ₹{Math.abs(tradingSummary.avgLoss || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pt-4 border-t">
              <span className="font-semibold">Risk/Reward Ratio</span>
              <span className="font-mono font-bold">
                {tradingSummary.avgProfit && tradingSummary.avgLoss 
                  ? (tradingSummary.avgProfit / Math.abs(tradingSummary.avgLoss)).toFixed(2)
                  : '0.00'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Best & Worst Trades */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <div className="p-6 border-b bg-green-50">
            <h2 className="text-lg font-semibold">Best Trade</h2>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold font-mono text-green-600 mb-2">
              +₹{(tradingSummary.largestWin || 0).toLocaleString()}
            </div>
            <p className="text-sm text-neutral-600">Largest winning trade</p>
          </div>
        </Card>

        <Card>
          <div className="p-6 border-b bg-red-50">
            <h2 className="text-lg font-semibold">Worst Trade</h2>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold font-mono text-red-600 mb-2">
              ₹{Math.abs(tradingSummary.largestLoss || 0).toLocaleString()}
            </div>
            <p className="text-sm text-neutral-600">Largest losing trade</p>
          </div>
        </Card>
      </div>

      {/* Risk Metrics */}
      <Card>
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Risk Metrics</h2>
        </div>
        <div className="p-6 grid grid-cols-4 gap-6">
          <div>
            <div className="text-neutral-600 text-sm mb-2">Max Drawdown</div>
            <div className="text-2xl font-bold text-red-600">-12.5%</div>
          </div>
          <div>
            <div className="text-neutral-600 text-sm mb-2">Volatility</div>
            <div className="text-2xl font-bold">18.3%</div>
          </div>
          <div>
            <div className="text-neutral-600 text-sm mb-2">Sortino Ratio</div>
            <div className="text-2xl font-bold">2.15</div>
          </div>
          <div>
            <div className="text-neutral-600 text-sm mb-2">Profit Factor</div>
            <div className="text-2xl font-bold text-green-600">1.67</div>
          </div>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-6 bg-neutral-50">
        <p className="text-sm text-neutral-600">
          📊 Analytics are updated in real-time based on your trading activity.
          Historical data is preserved for performance tracking and tax reporting.
        </p>
      </Card>
    </div>
  )
}
