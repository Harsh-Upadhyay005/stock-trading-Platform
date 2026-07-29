import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, formatPercent } from "@/lib/utils"

const indices = [
  { name: "NIFTY 50", value: 19234.50, change: 152.30, changePercent: 0.80 },
  { name: "SENSEX", value: 64890.25, change: 412.50, changePercent: 0.64 },
  { name: "S&P 500", value: 4567.80, change: 23.40, changePercent: 0.51 },
  { name: "DOW JONES", value: 34567.90, change: 156.70, changePercent: 0.45 },
]

export async function MarketIndices() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {indices.map((index) => (
        <Card key={index.name}>
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              {index.name}
            </p>
            <p className="text-2xl font-bold numeric">
              {formatCurrency(index.value)}
            </p>
            <p
              className={`text-sm mt-1 numeric ${
                index.change >= 0 ? "" : "text-error"
              }`}
            >
              {index.change >= 0 && "+"}
              {formatCurrency(index.change)} ({formatPercent(index.changePercent)})
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
