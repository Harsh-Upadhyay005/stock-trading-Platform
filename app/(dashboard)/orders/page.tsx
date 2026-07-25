import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { OrdersTable } from "@/components/orders/orders-table"
import { OrderFilters } from "@/components/orders/order-filters"
import { Card } from "@/components/ui/card"

export const metadata = {
  title: "Orders | TradeFlow",
  description: "View and manage your orders",
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { tab?: string; symbol?: string; status?: string }
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const activeTab = searchParams.tab || "all"

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage your trading orders
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <OrderFilters />
      </Card>

      {/* Orders Table */}
      <Suspense fallback={<TableSkeleton />}>
        <OrdersTable userId={userId} activeTab={activeTab} searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

function TableSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    </Card>
  )
}
