import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

async function getOrderDetails(orderId: string, userId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/orders/${orderId}`,
      {
        cache: 'no-store',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
      }
    )
    if (!response.ok) throw new Error('Failed to fetch order')
    const data = await response.json()
    return data.result || null
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const orderData = await getOrderDetails(params.id, userId)

  if (!orderData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4 opacity-20">📋</div>
          <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
          <p className="text-sm text-neutral-600">
            The order you're looking for doesn't exist or you don't have access to it.
          </p>
        </Card>
      </div>
    )
  }

  // Use real order data or fallback
  const order = {
    id: orderData.id || params.id,
    symbol: orderData.instrument?.symbol || orderData.symbol || "UNKNOWN",
    name: orderData.instrument?.name || "Unknown Instrument",
    side: orderData.side,
    type: orderData.type,
    status: orderData.status,
    quantity: Number(orderData.quantity),
    filledQuantity: Number(orderData.filledQuantity || 0),
    price: Number(orderData.price || 0),
    avgPrice: Number(orderData.avgFillPrice || orderData.price || 0),
    totalValue: Number(orderData.filledQuantity || 0) * Number(orderData.avgFillPrice || orderData.price || 0),
    placedAt: orderData.createdAt,
    executedAt: orderData.updatedAt,
    validity: orderData.validity || "DAY",
    exchange: orderData.exchange || "NSE",
    segment: orderData.instrument?.segment || "CASH",
    placedAt: "2024-03-20T15:30:00",
    executedAt: "2024-03-20T15:30:05",
    validity: "DAY",
    exchange: "NSE",
    segment: "CASH",
    charges: {
      brokerage: 20,
      stt: 24.57,
      exchangeFee: 5.12,
      gst: 3.60,
      sebiTurnover: 0.10,
      stampDuty: 2.46,
      total: 55.85,
    },
  }

  // Mock execution history
  const executions = [
    {
      time: "15:30:05",
      quantity: 6,
      price: 2456.75,
      value: 14740.50,
    },
    {
      time: "15:30:08",
      quantity: 4,
      price: 2456.90,
      value: 9827.60,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "FILLED":
        return "bg-black text-white"
      case "PARTIAL":
        return "bg-neutral-600 text-white"
      case "PENDING":
        return "bg-neutral-200"
      case "CANCELLED":
        return "bg-neutral-100"
      case "REJECTED":
        return "bg-neutral-100"
      default:
        return "bg-neutral-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">Order #{order.id}</h1>
            <Badge className={getStatusColor(order.status)}>
              {order.status}
            </Badge>
          </div>
          <p className="text-sm text-neutral-600">
            Placed on {new Date(order.placedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Download Receipt
          </Button>
          <Button variant="outline" size="sm">
            Report Issue
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="col-span-2 space-y-6">
          {/* Instrument Info */}
          <Card>
            <div className="p-6 border-b bg-neutral-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-mono">
                    {order.symbol}
                  </h2>
                  <p className="text-sm text-neutral-600">{order.name}</p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    order.side === "BUY"
                      ? "border-black text-black"
                      : "border-neutral-400"
                  }
                >
                  {order.side}
                </Badge>
              </div>
            </div>

            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-neutral-600 mb-1">Order Type</div>
                <div className="font-semibold">{order.type}</div>
              </div>
              <div>
                <div className="text-sm text-neutral-600 mb-1">Validity</div>
                <div className="font-semibold">{order.validity}</div>
              </div>
              <div>
                <div className="text-sm text-neutral-600 mb-1">Exchange</div>
                <div className="font-semibold">{order.exchange}</div>
              </div>
              <div>
                <div className="text-sm text-neutral-600 mb-1">Segment</div>
                <div className="font-semibold">{order.segment}</div>
              </div>
            </div>
          </Card>

          {/* Order Quantities */}
          <Card>
            <div className="p-6 border-b">
              <h3 className="font-semibold">Quantity & Price</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-neutral-600 mb-1">
                  Ordered Quantity
                </div>
                <div className="text-2xl font-bold font-mono">
                  {order.quantity}
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-600 mb-1">
                  Filled Quantity
                </div>
                <div className="text-2xl font-bold font-mono text-green-600">
                  {order.filledQuantity}
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-600 mb-1">Order Price</div>
                <div className="text-2xl font-bold font-mono">
                  ₹{order.price.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-600 mb-1">
                  Average Price
                </div>
                <div className="text-2xl font-bold font-mono">
                  ₹{order.avgPrice.toFixed(2)}
                </div>
              </div>
            </div>
          </Card>

          {/* Execution History */}
          <Card>
            <div className="p-6 border-b">
              <h3 className="font-semibold">Execution History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-neutral-50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-sm">Time</th>
                    <th className="text-right p-4 font-semibold text-sm">
                      Quantity
                    </th>
                    <th className="text-right p-4 font-semibold text-sm">
                      Price
                    </th>
                    <th className="text-right p-4 font-semibold text-sm">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {executions.map((exec, index) => (
                    <tr key={index} className="hover:bg-neutral-50">
                      <td className="p-4 font-mono text-sm">{exec.time}</td>
                      <td className="p-4 text-right font-mono">
                        {exec.quantity}
                      </td>
                      <td className="p-4 text-right font-mono">
                        ₹{exec.price.toFixed(2)}
                      </td>
                      <td className="p-4 text-right font-mono font-semibold">
                        ₹{exec.value.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Timeline */}
          <Card>
            <div className="p-6 border-b">
              <h3 className="font-semibold">Order Timeline</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-black mt-2"></div>
                <div className="flex-1">
                  <div className="font-semibold">Order Placed</div>
                  <div className="text-sm text-neutral-600">
                    {new Date(order.placedAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-black mt-2"></div>
                <div className="flex-1">
                  <div className="font-semibold">Order Executed</div>
                  <div className="text-sm text-neutral-600">
                    {new Date(order.executedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Value Summary */}
          <Card>
            <div className="p-6 border-b">
              <h3 className="font-semibold">Value Summary</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Order Value</span>
                <span className="font-mono font-semibold">
                  ₹{order.totalValue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Total Charges</span>
                <span className="font-mono font-semibold text-red-600">
                  ₹{order.charges.total.toFixed(2)}
                </span>
              </div>
              <div className="pt-4 border-t flex justify-between">
                <span className="font-bold">Net Amount</span>
                <span className="font-mono font-bold text-lg">
                  ₹{(order.totalValue + order.charges.total).toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          {/* Charges Breakdown */}
          <Card>
            <div className="p-6 border-b">
              <h3 className="font-semibold">Charges Breakdown</h3>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Brokerage</span>
                <span className="font-mono">
                  ₹{order.charges.brokerage.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">STT</span>
                <span className="font-mono">₹{order.charges.stt.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Exchange Fee</span>
                <span className="font-mono">
                  ₹{order.charges.exchangeFee.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">GST</span>
                <span className="font-mono">₹{order.charges.gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">SEBI Turnover</span>
                <span className="font-mono">
                  ₹{order.charges.sebiTurnover.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Stamp Duty</span>
                <span className="font-mono">
                  ₹{order.charges.stampDuty.toFixed(2)}
                </span>
              </div>
              <div className="pt-3 border-t flex justify-between font-semibold">
                <span>Total</span>
                <span className="font-mono">
                  ₹{order.charges.total.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 text-sm">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                Place Similar Order
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Add to Watchlist
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                View Symbol Details
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
