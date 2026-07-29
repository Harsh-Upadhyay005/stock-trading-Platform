"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function MarketStatus() {
  const isMarketOpen = true // Mock data

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  isMarketOpen ? "bg-foreground" : "bg-error"
                }`}
              />
              <span className="text-sm font-medium">
                {isMarketOpen ? "OPEN" : "CLOSED"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Exchange</span>
            <span className="text-sm font-medium">NSE</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Next Close</span>
            <span className="text-sm font-medium">3:30 PM IST</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
