import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface AssetAllocationProps {
  userId: string
}

async function getAllocationData(userId: string) {
  // Mock data
  return [
    { sector: "Technology", percentage: 40, value: 498272 },
    { sector: "Finance", percentage: 30, value: 373704 },
    { sector: "Healthcare", percentage: 20, value: 249136 },
    { sector: "Consumer", percentage: 10, value: 124568 },
  ]
}

export async function AssetAllocation({ userId }: AssetAllocationProps) {
  const data = await getAllocationData(userId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Horizontal Bar Chart */}
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.sector}>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium">{item.sector}</span>
                <span className="numeric text-muted-foreground">
                  {item.percentage}%
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground transition-all"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 numeric">
                ₹{(item.value / 100000).toFixed(2)}L
              </p>
            </div>
          ))}
        </div>

        {/* ASCII Pie Chart Representation */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-center gap-8">
            {data.map((item, index) => (
              <div key={item.sector} className="text-center">
                <div className="text-4xl font-bold numeric">{item.percentage}%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {item.sector}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
