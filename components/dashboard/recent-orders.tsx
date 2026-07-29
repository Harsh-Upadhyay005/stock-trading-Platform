import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatRelativeTime, getStatusBadgeVariant } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

interface RecentOrdersProps {
  userId: string
}

async function getRecentOrders(userId: string) {
  // Mock data for testing
  return [
    {
      id: "12345",
      symbol: "AAPL",
      side: "BUY",
      quantity: 100,
      status: "FILLED",
      price: 18450,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: "12344",
      symbol: "TSLA",
      side: "SELL",
      quantity: 50,
      status: "FILLED",
      price: 15200,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    },
    {
      id: "12343",
      symbol: "GOOGL",
      side: "BUY",
      quantity: 25,
      status: "OPEN",
      price: 2800,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
    {
      id: "12342",
      symbol: "MSFT",
      side: "BUY",
      quantity: 75,
      status: "CANCELLED",
      price: 320,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
    {
      id: "12341",
      symbol: "AMZN",
      side: "SELL",
      quantity: 10,
      status: "FILLED",
      price: 3450,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
  ]
}

export async function RecentOrders({ userId }: RecentOrdersProps) {
  const orders = await getRecentOrders(userId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-start justify-between text-sm border-b border-border pb-3 last:border-0 last:pb-0"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    #{order.id}
                  </span>
                  <Badge
                    variant={
                      order.side === "BUY" ? "success" : "default"
                    }
                  >
                    {order.side}
                  </Badge>
                </div>
                <p className="font-semibold mt-1">{order.symbol}</p>
                <p className="text-xs text-muted-foreground">
                  {order.quantity} @ {formatCurrency(order.price)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatRelativeTime(order.createdAt)}
                </p>
              </div>
              <Badge variant={getStatusBadgeVariant(order.status)}>
                {order.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Link href="/orders" className="w-full">
          <Button variant="ghost" className="w-full justify-between">
            View All Orders
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
