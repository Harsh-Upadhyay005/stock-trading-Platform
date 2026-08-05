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
import { formatCurrency, formatDateTime, getStatusBadgeVariant } from "@/lib/utils"
import { Download, X } from "lucide-react"

interface OrdersTableProps {
  userId: string
  activeTab: string
  searchParams: any
}

async function getOrders(userId: string, filters: any) {
  try {
    // Call the real API endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/orders`, {
      cache: 'no-store', // Always fetch fresh data
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch orders')
    }

    const data = await response.json()
    return data.orders || data || []
  } catch (error) {
    console.error('Error fetching orders:', error)
    // Return empty array on error - handle in UI
    return []
  }
}

export async function OrdersTable({ userId, activeTab, searchParams }: OrdersTableProps) {
  const orders = await getOrders(userId, searchParams)

  // Filter by tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true
    if (activeTab === "open") return order.status === "OPEN" || order.status === "PENDING"
    if (activeTab === "filled") return order.status === "FILLED"
    if (activeTab === "cancelled") return order.status === "CANCELLED"
    if (activeTab === "rejected") return order.status === "REJECTED"
    return true
  })

  return (
    <Card className="p-6">
      {/* Tabs */}
      <Tabs defaultValue={activeTab} className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <Link href="/orders?tab=all">
              <TabsTrigger value="all">All</TabsTrigger>
            </Link>
            <Link href="/orders?tab=open">
              <TabsTrigger value="open">Open</TabsTrigger>
            </Link>
            <Link href="/orders?tab=filled">
              <TabsTrigger value="filled">Filled</TabsTrigger>
            </Link>
            <Link href="/orders?tab=cancelled">
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </Link>
            <Link href="/orders?tab=rejected">
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </Link>
          </TabsList>

          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <TabsContent value={activeTab}>
          {/* Orders Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Side</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Qty / Filled</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Filled Price</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">
                    {order.id}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/trade/${order.symbol}`}
                      className="font-semibold hover:underline"
                    >
                      {order.symbol}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={order.side === "BUY" ? "success" : "default"}
                    >
                      {order.side}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{order.type}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {order.quantity} / {order.filled}
                  </TableCell>
                  <TableCell>
                    {order.price ? formatCurrency(order.price) : "Market"}
                  </TableCell>
                  <TableCell>
                    {order.filledPrice ? formatCurrency(order.filledPrice) : "—"}
                  </TableCell>
                  <TableCell>{formatCurrency(order.amount)}</TableCell>
                  <TableCell className="text-xs">
                    {formatDateTime(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    {(order.status === "OPEN" || order.status === "PENDING") && (
                      <Button variant="ghost" size="sm">
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing {filteredOrders.length} orders
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
