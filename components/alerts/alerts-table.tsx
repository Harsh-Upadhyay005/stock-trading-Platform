import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { formatDateTime } from "@/lib/utils"
import { Edit2, Trash2 } from "lucide-react"

interface AlertsTableProps {
  userId: string
  activeStatus: string
}

async function getAlerts(userId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/alerts`,
      {
        cache: 'no-store',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
      }
    )
    if (!response.ok) throw new Error('Failed to fetch alerts')
    const data = await response.json()
    return data.result || []
  } catch (error) {
    console.error('Error fetching alerts:', error)
    // Fallback to mock data
    return [
      {
        id: "1",
        symbol: "AAPL",
        type: "PRICE_ABOVE",
        condition: "Price > ₹18,500",
        status: "ACTIVE",
        message: "Apple reached target price",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        triggeredAt: null,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        id: "2",
        symbol: "TSLA",
        type: "PRICE_BELOW",
        condition: "Price < ₹15,000",
        status: "TRIGGERED",
        message: "Tesla dropped below threshold",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        triggeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        expiresAt: null,
      },
      {
        id: "3",
        symbol: "GOOGL",
        type: "PERCENT_CHANGE",
        condition: "Change > 5%",
        status: "ACTIVE",
        message: "",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        triggeredAt: null,
        expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      },
      {
        id: "4",
        symbol: "MSFT",
        type: "VOLUME_SPIKE",
        condition: "Volume > 200%",
        status: "ACTIVE",
        message: "Unusual activity detected",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        triggeredAt: null,
        expiresAt: null,
      },
      {
        id: "5",
        symbol: "AMZN",
        type: "PRICE_ABOVE",
        condition: "Price > ₹3,500",
        status: "EXPIRED",
        message: "",
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        triggeredAt: null,
        expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ]
  }
}

export async function AlertsTable({ userId, activeStatus }: AlertsTableProps) {
  const allAlerts = await getAlerts(userId)

  // Filter by status
  const filteredAlerts = allAlerts.filter((alert) => {
    if (activeStatus === "all") return true
    if (activeStatus === "active") return alert.status === "ACTIVE"
    if (activeStatus === "triggered") return alert.status === "TRIGGERED"
    if (activeStatus === "expired") return alert.status === "EXPIRED"
    return true
  })

  return (
    <Card className="p-6">
      {/* Tabs */}
      <Tabs defaultValue={activeStatus} className="mb-6">
        <TabsList>
          <Link href="/alerts?status=all">
            <TabsTrigger value="all">All</TabsTrigger>
          </Link>
          <Link href="/alerts?status=active">
            <TabsTrigger value="active">Active</TabsTrigger>
          </Link>
          <Link href="/alerts?status=triggered">
            <TabsTrigger value="triggered">Triggered</TabsTrigger>
          </Link>
          <Link href="/alerts?status=expired">
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </Link>
        </TabsList>

        <TabsContent value={activeStatus}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Triggered</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>
                    <Link
                      href={`/trade/${alert.symbol}`}
                      className="font-semibold hover:underline"
                    >
                      {alert.symbol}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs uppercase">
                    {alert.type.replace("_", " ")}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {alert.condition}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        alert.status === "ACTIVE"
                          ? "success"
                          : alert.status === "TRIGGERED"
                          ? "warning"
                          : "default"
                      }
                    >
                      {alert.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {alert.message || "—"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatDateTime(alert.createdAt, { month: "short", day: "numeric" })}
                  </TableCell>
                  <TableCell className="text-xs">
                    {alert.triggeredAt
                      ? formatDateTime(alert.triggeredAt, { month: "short", day: "numeric" })
                      : "—"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {alert.expiresAt
                      ? formatDateTime(alert.expiresAt, { month: "short", day: "numeric" })
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <p className="text-sm text-muted-foreground mt-4">
            Showing {filteredAlerts.length} alert{filteredAlerts.length !== 1 && "s"}
          </p>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
