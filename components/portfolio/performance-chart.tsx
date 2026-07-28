"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const periods = [
  { label: "1D", value: "1d" },
  { label: "1W", value: "1w" },
  { label: "1M", value: "1m" },
  { label: "3M", value: "3m" },
  { label: "6M", value: "6m" },
  { label: "1Y", value: "1y" },
  { label: "ALL", value: "all" },
]

// Mock chart data
const generateChartData = (period: string) => {
  const points = period === "1d" ? 24 : period === "1w" ? 7 : 12
  const values: number[] = []
  let value = 1000000

  for (let i = 0; i < points; i++) {
    value += (Math.random() - 0.3) * 50000
    values.push(value)
  }

  return values
}

interface PerformanceChartProps {
  userId: string
}

export function PerformanceChart({ userId }: PerformanceChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("1m")
  const data = generateChartData(selectedPeriod)

  // Calculate ASCII chart
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min

  const chartHeight = 12
  const chartWidth = 60

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * chartWidth
    const y = chartHeight - ((value - min) / range) * chartHeight
    return { x: Math.round(x), y: Math.round(y) }
  })

  // Generate ASCII chart
  const chart: string[][] = []
  for (let y = 0; y <= chartHeight; y++) {
    chart[y] = new Array(chartWidth + 1).fill(" ")
  }

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]

    // Draw line between points
    const steps = Math.abs(p2.x - p1.x)
    for (let step = 0; step <= steps; step++) {
      const t = steps === 0 ? 0 : step / steps
      const x = Math.round(p1.x + (p2.x - p1.x) * t)
      const y = Math.round(p1.y + (p2.y - p1.y) * t)
      if (y >= 0 && y <= chartHeight && x >= 0 && x <= chartWidth) {
        chart[y][x] = "█"
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Performance</CardTitle>
          <div className="flex gap-1">
            {periods.map((period) => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value ? "primary" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod(period.value)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Value Labels */}
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span className="numeric">₹{(max / 100000).toFixed(1)}L</span>
          <span className="numeric">₹{(min / 100000).toFixed(1)}L</span>
        </div>

        {/* ASCII Chart */}
        <div className="font-mono text-xs leading-tight overflow-x-auto">
          {chart.map((row, i) => (
            <div key={i}>{row.join("")}</div>
          ))}
        </div>

        {/* Time Labels */}
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>
            {selectedPeriod === "1d"
              ? "9:00 AM"
              : selectedPeriod === "1w"
              ? "Mon"
              : "Jan"}
          </span>
          <span>
            {selectedPeriod === "1d"
              ? "3:30 PM"
              : selectedPeriod === "1w"
              ? "Fri"
              : "Dec"}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Period Return</p>
            <p className="text-lg font-semibold numeric mt-1">
              +{((data[data.length - 1] - data[0]) / data[0] * 100).toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">High</p>
            <p className="text-lg font-semibold numeric mt-1">
              ₹{(max / 100000).toFixed(2)}L
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Low</p>
            <p className="text-lg font-semibold numeric mt-1">
              ₹{(min / 100000).toFixed(2)}L
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
