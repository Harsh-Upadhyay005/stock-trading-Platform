import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

interface PortfolioSummaryProps {
  userId: string
}

async function getPortfolioData(userId: string) {
  // Mock data for testing
  return {
    cash: 250000,
    invested: 1000000,
    totalValue: 1245680,
    todayReturn: 23450,
    todayReturnPercent: 1.92,
    totalReturn: 245680,
    totalReturnPercent: 24.57,
  }
}

export async function PortfolioSummary({ userId }: PortfolioSummaryProps) {
  const data = await getPortfolioData(userId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Cash Balance
            </p>
            <p className="text-2xl font-semibold numeric mt-1">
              {formatCurrency(data.cash)}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Invested Value
            </p>
            <p className="text-2xl font-semibold numeric mt-1">
              {formatCurrency(data.invested)}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Total Value
            </p>
            <p className="text-2xl font-semibold numeric mt-1">
              {formatCurrency(data.totalValue)}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Total Return
            </p>
            <p className={`text-2xl font-semibold numeric mt-1 ${data.totalReturn >= 0 ? "" : "text-error"}`}>
              {data.totalReturn >= 0 && "+"}
              {formatCurrency(data.totalReturn)}
            </p>
            <p className={`text-sm numeric ${data.totalReturnPercent >= 0 ? "" : "text-error"}`}>
              {formatPercent(data.totalReturnPercent)}
            </p>
          </div>
        </div>

        {/* Simple Allocation Visualization */}
        <div className="pt-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            Allocation
          </p>
          <div className="flex gap-1 h-2">
            <div
              className="bg-foreground"
              style={{ width: `${(data.invested / data.totalValue) * 100}%` }}
            />
            <div
              className="bg-muted-foreground"
              style={{ width: `${(data.cash / data.totalValue) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs">
            <span className="text-muted-foreground">
              ● Invested {((data.invested / data.totalValue) * 100).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">
              ■ Cash {((data.cash / data.totalValue) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href="/portfolio" className="w-full">
          <Button variant="ghost" className="w-full justify-between">
            View Full Portfolio
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
