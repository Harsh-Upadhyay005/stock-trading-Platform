import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { formatCurrency, formatPercent, formatCompactNumber } from "@/lib/utils"
import { Star, TrendingUp } from "lucide-react"

interface MarketTableProps {
  userId: string
  activeTab: string
  searchParams: any
}

// Mock data
const stocks = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 18450,
    change: 425,
    changePercent: 2.36,
    volume: 12500000,
    marketCap: 2850000000000,
    sparkline: "▁▂▃▅▄▃▅",
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 15200,
    change: -185,
    changePercent: -1.20,
    volume: 8200000,
    marketCap: 750000000000,
    sparkline: "▅▄▃▂▁▂▃",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 2800,
    change: 24,
    changePercent: 0.85,
    volume: 5100000,
    marketCap: 1800000000000,
    sparkline: "▂▃▄▅▆▅▄",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: 320,
    change: 4.5,
    changePercent: 1.42,
    volume: 9800000,
    marketCap: 2400000000000,
    sparkline: "▃▄▅▆▇▆▅",
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 3450,
    change: 105,
    changePercent: 3.12,
    volume: 6700000,
    marketCap: 1700000000000,
    sparkline: "▂▂▃▄▅▆▇",
  },
]

async function getStocks(filters: any) {
  // Mock - return all stocks
  return stocks
}

export async function MarketTable({ userId, activeTab, searchParams }: MarketTableProps) {
  const allStocks = await getStocks(searchParams)

  // Filter by tab
  const filteredStocks = allStocks.filter((stock) => {
    if (activeTab === "all") return true
    if (activeTab === "active") return stock.volume > 7000000
    if (activeTab === "gainers") return stock.changePercent > 0
    if (activeTab === "losers") return stock.changePercent < 0
    if (activeTab === "highs") return stock.changePercent > 2
    if (activeTab === "lows") return stock.changePercent < -2
    return true
  })

  return (
    <Card className="p-6">
      {/* Tabs */}
      <Tabs defaultValue={activeTab} className="mb-6">
        <TabsList>
          <Link href="/market?tab=all">
            <TabsTrigger value="all">All Stocks</TabsTrigger>
          </Link>
          <Link href="/market?tab=active">
            <TabsTrigger value="active">Most Active</TabsTrigger>
          </Link>
          <Link href="/market?tab=gainers">
            <TabsTrigger value="gainers">Gainers</TabsTrigger>
          </Link>
          <Link href="/market?tab=losers">
            <TabsTrigger value="losers">Losers</TabsTrigger>
          </Link>
          <Link href="/market?tab=highs">
            <TabsTrigger value="highs">New Highs</TabsTrigger>
          </Link>
          <Link href="/market?tab=lows">
            <TabsTrigger value="lows">New Lows</TabsTrigger>
          </Link>
        </TabsList>

        <TabsContent value={activeTab}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Market Cap</TableHead>
                <TableHead>Chart</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStocks.map((stock) => (
                <TableRow key={stock.symbol}>
                  <TableCell>
                    <Link
                      href={`/trade/${stock.symbol}`}
                      className="font-semibold hover:underline"
                    >
                      {stock.symbol}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">{stock.name}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(stock.price)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p
                        className={`font-semibold ${
                          stock.change >= 0 ? "" : "text-error"
                        }`}
                      >
                        {stock.change >= 0 && "+"}
                        {formatCurrency(stock.change)}
                      </p>
                      <p
                        className={`text-xs ${
                          stock.changePercent >= 0 ? "" : "text-error"
                        }`}
                      >
                        {formatPercent(stock.changePercent)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{formatCompactNumber(stock.volume)}</TableCell>
                  <TableCell>{formatCompactNumber(stock.marketCap)}</TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-muted-foreground">
                      {stock.sparkline}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Star className="h-4 w-4" />
                      </Button>
                      <Link href={`/trade/${stock.symbol}`}>
                        <Button variant="ghost" size="sm">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Trade
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing {filteredStocks.length} stocks
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" disabled>
                Previous
              </Button>
              <Button variant="ghost" size="sm" className="bg-foreground text-background">
                1
              </Button>
              <Button variant="ghost" size="sm">
                2
              </Button>
              <Button variant="ghost" size="sm">
                3
              </Button>
              <Button variant="ghost" size="sm">
                Next
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
