import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, formatPercent } from "@/lib/utils"

interface PortfolioMetricsProps {
  userId: string
}

async function getPortfolioMetrics(userId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/portfolio/summary?accountId=${userId}`,
      {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch portfolio metrics')
    }

    const data = await response.json()
    return data.summary || data || {
      totalValue: 0,
      cash: 0,
      invested: 0,
      totalReturn: 0,
      totalReturnPercent: 0,
    }
  } catch (error) {
    console.error('Error fetching portfolio metrics:', error)
    return {
      totalValue: 0,
      cash: 0,
      invested: 0,
      totalReturn: 0,
      totalReturnPercent: 0,
    }
  }
}

export async function PortfolioMetrics({ userId }: PortfolioMetricsProps) {
  const data = await getPortfolioMetrics(userId)

  const metrics = [
    {
      label: "Total Value",
      value: formatCurrency(data.totalValue),
      subValue: null,
      highlight: true,
    },
    {
      label: "Cash Balance",
      value: formatCurrency(data.cash),
      subValue: `${((data.cash / data.totalValue) * 100).toFixed(1)}% of total`,
    },
    {
      label: "Invested Value",
      value: formatCurrency(data.invested),
      subValue: `${((data.invested / data.totalValue) * 100).toFixed(1)}% of total`,
    },
    {
      label: "Total Return",
      value: formatCurrency(data.totalReturn),
      subValue: formatPercent(data.totalReturnPercent),
      positive: data.totalReturn >= 0,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              {metric.label}
            </p>
            <p
              className={`text-2xl font-bold numeric ${
                metric.highlight
                  ? ""
                  : metric.positive !== undefined
                  ? metric.positive
                    ? ""
                    : "text-error"
                  : ""
              }`}
            >
              {metric.value}
            </p>
            {metric.subValue && (
              <p
                className={`text-sm mt-1 numeric ${
                  metric.positive !== undefined
                    ? metric.positive
                      ? ""
                      : "text-error"
                    : "text-muted-foreground"
                }`}
              >
                {metric.subValue}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
