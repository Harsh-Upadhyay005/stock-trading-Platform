import { formatCurrency, formatPercent } from "@/lib/utils"

interface DashboardHeaderProps {
  userId: string
}

async function getPortfolioSummary(userId: string) {
  try {
    // In mock mode, return sample data
    return {
      totalValue: 1245680,
      todayPnL: 23450,
      todayPnLPercent: 1.92,
      userName: "John",
    }
  } catch (error) {
    console.error("Error fetching portfolio summary:", error)
    return {
      totalValue: 0,
      todayPnL: 0,
      todayPnLPercent: 0,
      userName: "User",
    }
  }
}

export async function DashboardHeader({ userId }: DashboardHeaderProps) {
  const data = await getPortfolioSummary(userId)

  return (
    <div className="space-y-3">
      {/* Welcome Message */}
      <h1 className="text-2xl font-semibold">
        Welcome back, {data.userName}
      </h1>

      {/* Portfolio Value */}
      <div className="flex items-end gap-4">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
            Total Portfolio Value
          </p>
          <p className="text-5xl font-bold numeric">
            {formatCurrency(data.totalValue)}
          </p>
        </div>

        {/* Today's P&L */}
        <div className="mb-2">
          <p
            className={`text-2xl font-semibold numeric ${
              data.todayPnL >= 0 ? "text-foreground" : "text-error"
            }`}
          >
            {data.todayPnL >= 0 && "+"}
            {formatCurrency(data.todayPnL)}
          </p>
          <p
            className={`text-sm numeric ${
              data.todayPnLPercent >= 0 ? "text-foreground" : "text-error"
            }`}
          >
            {formatPercent(data.todayPnLPercent)}
          </p>
        </div>
      </div>
    </div>
  )
}
