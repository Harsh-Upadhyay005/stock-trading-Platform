import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

interface TopHoldingsProps {
  userId: string
}

async function getTopHoldings(userId: string) {
  // Mock data
  return [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      quantity: 120,
      currentPrice: 18450,
      totalValue: 2214000,
      pnl: 369000,
      pnlPercent: 20.0,
      sparkline: "▁▂▃▅▄▃▅▆▇",
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      quantity: 50,
      currentPrice: 15200,
      totalValue: 760000,
      pnl: 20000,
      pnlPercent: 2.7,
      sparkline: "▅▄▃▂▁▂▃▄",
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      quantity: 25,
      currentPrice: 2800,
      totalValue: 70000,
      pnl: 1250,
      pnlPercent: 1.8,
      sparkline: "▂▃▄▅▆▅▄▃",
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      quantity: 100,
      currentPrice: 320,
      totalValue: 32000,
      pnl: -800,
      pnlPercent: -2.4,
      sparkline: "▅▆▇▆▅▄▃▂",
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      quantity: 30,
      currentPrice: 3450,
      totalValue: 103500,
      pnl: 4500,
      pnlPercent: 4.5,
      sparkline: "▂▂▃▄▅▅▆▇",
    },
  ]
}

export async function TopHoldings({ userId }: TopHoldingsProps) {
  const holdings = await getTopHoldings(userId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Holdings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {holdings.map((holding) => (
            <Link
              key={holding.symbol}
              href={`/trade/${holding.symbol}`}
              className="block hover:bg-muted p-2 -m-2 rounded transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="font-semibold">{holding.symbol}</p>
                    <p className="text-xs text-muted-foreground">
                      {holding.quantity} shares
                    </p>
                  </div>
                  <p className="text-sm numeric mt-1">
                    {formatCurrency(holding.currentPrice)}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    {holding.sparkline}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold numeric">
                    {formatCurrency(holding.totalValue)}
                  </p>
                  <p
                    className={`text-xs numeric ${
                      holding.pnl >= 0 ? "" : "text-error"
                    }`}
                  >
                    {holding.pnl >= 0 && "+"}
                    {formatPercent(holding.pnlPercent)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Link href="/portfolio/holdings" className="w-full">
          <Button variant="ghost" className="w-full justify-between">
            View All Holdings
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
