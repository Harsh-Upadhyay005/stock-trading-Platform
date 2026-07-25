import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

interface WatchlistPreviewProps {
  userId: string
}

async function getWatchlist(userId: string) {
  return {
    name: "My Stocks",
    items: [
      { symbol: "AAPL", price: 18450, change: 2.36, sparkline: "▁▂▃▅▄▃▅" },
      { symbol: "TSLA", price: 15200, change: -1.20, sparkline: "▅▄▃▂▁▂▃" },
      { symbol: "GOOGL", price: 2800, change: 0.85, sparkline: "▂▃▄▅▆▅▄" },
      { symbol: "MSFT", price: 320, change: 1.42, sparkline: "▃▄▅▆▇▆▅" },
      { symbol: "AMZN", price: 3450, change: 3.12, sparkline: "▂▂▃▄▅▆▇" },
    ],
  }
}

export async function WatchlistPreview({ userId }: WatchlistPreviewProps) {
  const watchlist = await getWatchlist(userId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{watchlist.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {watchlist.items.map((item) => (
            <Link
              key={item.symbol}
              href={`/trade/${item.symbol}`}
              className="flex items-center justify-between hover:bg-muted p-2 -m-2 rounded transition-colors"
            >
              <div className="flex-1">
                <p className="font-semibold">{item.symbol}</p>
                <p className="text-xs font-mono text-muted-foreground">
                  {item.sparkline}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold numeric">
                  {formatCurrency(item.price)}
                </p>
                <p
                  className={`text-xs numeric ${
                    item.change >= 0 ? "" : "text-error"
                  }`}
                >
                  {formatPercent(item.change)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Link href="/watchlists" className="w-full">
          <Button variant="ghost" className="w-full justify-between">
            View All Watchlists
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
