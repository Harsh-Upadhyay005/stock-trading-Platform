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
  // Mock data - replace with actual API call
  const allOrders = [
    {
      id: "ORD-12345",
      symbol: "AAPL",
      side: "BUY",
      type: "LIMIT",
      status: "OPEN",
      quantity: 100,
      filled: 0,
      price: 18400,
      filledPrice: null,
      amount: 1840000,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "ORD-12344",
      symbol: "TSLA",
      side: "SELL",
      type: "MARKET",
      status: "FILLED",
      quantity: 50,
      filled: 50,
      price: null,
      filledPrice: 15200,
      amount: 760000,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
      id: "ORD-12343",
      symbol: "GOOGL",
      side: "BUY",
      type: "STOP",
      status: "OPEN",
      quantity: 25,
      filled: 0,
      price: 2850,
      filledPrice: null,
      amount: 71250,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
    {
      id: "ORD-12342",
      symbol: "MSFT",
      side: "BUY",
      type: "LIMIT",
      status: "CANCELLED",
      quantity: 75,
      filled: 0,
      price: 320,
      filledPrice: null,
      amount: 24000,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
    {
      id: "ORD-12341",
      symbol: "AMZN",
      side: "SELL",
      type: "MARKET",
      status: "FILLED",
      quantity: 10,
      filled: 10,
      price: null,
      filledPrice: 3450,
      amount: 34500,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: "ORD-12340",
      symbol: "NVDA",
      side: "BUY",
      type: "LIMIT",
      status: "PARTIALLY_FILLED",
      quantity: 200,
      filled: 150,
      price: 450,
      filledPrice: 448,
      amount: 90000,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    {
      id: "ORD-12339",
      symbol: "META",
      side: "SELL",
      type: "STOP_LIMIT",
      status: "REJECTED",
      quantity: 30,
      filled: 0,
      price: 485,
      filledPrice: null,
      amount: 14550,
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    },
  ]

  return allOrders
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
