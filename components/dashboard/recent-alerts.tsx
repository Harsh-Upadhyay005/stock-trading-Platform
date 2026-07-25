import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatRelativeTime } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

interface RecentAlertsProps {
  userId: string
}

async function getRecentAlerts(userId: string) {
  return [
    {
      id: "1",
      symbol: "AAPL",
      message: "Price crossed ₹18,500",
      triggeredAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
    },
    {
      id: "2",
      symbol: "TSLA",
      message: "Price dropped below ₹15,000",
      triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: "3",
      symbol: "GOOGL",
      message: "Volume spike detected",
      triggeredAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    },
  ]
}

export async function RecentAlerts({ userId }: RecentAlertsProps) {
  const alerts = await getRecentAlerts(userId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="border-b border-border pb-3 last:border-0 last:pb-0"
            >
              <p className="font-semibold text-sm">{alert.symbol}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {alert.message}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatRelativeTime(alert.triggeredAt)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Link href="/alerts" className="w-full">
          <Button variant="ghost" className="w-full justify-between">
            View All Alerts
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
