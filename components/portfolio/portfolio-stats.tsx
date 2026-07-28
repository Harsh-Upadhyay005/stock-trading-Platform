import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatCurrency, formatPercent } from "@/lib/utils"

interface PortfolioStatsProps {
  userId: string
}

async function getPortfolioStats(userId: string) {
  // Mock data
  return {
    winRate: 68.5,
    avgWin: 8500,
    avgLoss: 3200,
    bestTrade: 45000,
    worstTrade: -12000,
    totalFees: 0,
    totalDividends: 15000,
    totalTaxes: 36852,
  }
}

export async function PortfolioStats({ userId }: PortfolioStatsProps) {
  const stats = await getPortfolioStats(userId)

  const statsData = [
    { label: "Win Rate", value: `${stats.winRate.toFixed(1)}%` },
    { label: "Avg Win", value: formatCurrency(stats.avgWin) },
    { label: "Avg Loss", value: formatCurrency(stats.avgLoss) },
    { label: "Best Trade", value: formatCurrency(stats.bestTrade) },
    { label: "Worst Trade", value: formatCurrency(stats.worstTrade), negative: true },
    { label: "Total Fees", value: formatCurrency(stats.totalFees) },
    { label: "Dividends", value: formatCurrency(stats.totalDividends) },
    { label: "Taxes Paid", value: formatCurrency(stats.totalTaxes) },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {statsData.map((stat) => (
            <div key={stat.label}>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {stat.label}
              </p>
              <p
                className={`text-lg font-semibold numeric mt-1 ${
                  stat.negative ? "text-error" : ""
                }`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
