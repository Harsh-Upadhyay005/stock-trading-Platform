import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { AlertsHeader } from "@/components/alerts/alerts-header"
import { AlertsTable } from "@/components/alerts/alerts-table"
import { Card } from "@/components/ui/card"

export const metadata = {
  title: "Alerts | TradeFlow",
  description: "Manage your price alerts",
}

export default async function AlertsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const activeStatus = searchParams.status || "active"

  return (
    <div className="space-y-6">
      {/* Header */}
      <AlertsHeader />

      {/* Alerts Table */}
      <Suspense fallback={<TableSkeleton />}>
        <AlertsTable userId={userId} activeStatus={activeStatus} />
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
