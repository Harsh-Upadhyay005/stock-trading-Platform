import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, formatPercent } from "@/lib/utils"

interface HoldingsSummaryProps {
  userId: string
}

async function getSummary(userId: string) {
  // Mock data
  return {
    totalPositions: 5,
    totalMarketValue: 1000000,
    totalPnL: 245680,
    totalPnLPercent: 24.57,
    todayPnL: 23450,
    todayPnLPercent: 2.35,
  }
}

export async function HoldingsSummary({ userId }: HoldingsSummaryProps) {
  const data = await getSummary(userId)

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Total Positions
            </p>
            <p className="text-2xl font-semibold numeric mt-1">
              {data.totalPositions}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Total Market Value
            </p>
            <p className="text-2xl font-semibold numeric mt-1">
              {formatCurrency(data.totalMarketValue)}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Total P&L
            </p>
            <p
              className={`text-2xl font-semibold numeric mt-1 ${
                data.totalPnL >= 0 ? "" : "text-error"
              }`}
            >
              {data.totalPnL >= 0 && "+"}
              {formatCurrency(data.totalPnL)}
            </p>
            <p
              className={`text-sm numeric ${
                data.totalPnLPercent >= 0 ? "" : "text-error"
              }`}
            >
              {formatPercent(data.totalPnLPercent)}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Today's P&L
            </p>
            <p
              className={`text-2xl font-semibold numeric mt-1 ${
                data.todayPnL >= 0 ? "" : "text-error"
              }`}
            >
              {data.todayPnL >= 0 && "+"}
              {formatCurrency(data.todayPnL)}
            </p>
            <p
              className={`text-sm numeric ${
                data.todayPnLPercent >= 0 ? "" : "text-error"
              }`}
            >
              {formatPercent(data.todayPnLPercent)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
