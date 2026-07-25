import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { HoldingsTable } from "@/components/holdings/holdings-table"
import { HoldingsHeader } from "@/components/holdings/holdings-header"
import { HoldingsSummary } from "@/components/holdings/holdings-summary"
import { Card } from "@/components/ui/card"

export const metadata = {
  title: "Holdings | TradeFlow",
  description: "View your current positions",
}

export default async function HoldingsPage({
  searchParams,
}: {
  searchParams: { sort?: string; search?: string }
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Suspense fallback={<HeaderSkeleton />}>
        <HoldingsHeader userId={userId} />
      </Suspense>

      {/* Summary */}
      <Suspense fallback={<SummarySkeleton />}>
        <HoldingsSummary userId={userId} />
      </Suspense>

      {/* Holdings Table */}
      <Suspense fallback={<TableSkeleton />}>
        <HoldingsTable userId={userId} searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

function HeaderSkeleton() {
  return <div className="h-24 bg-muted animate-pulse rounded" />
}

function SummarySkeleton() {
  return <Card className="p-6 h-24 bg-muted animate-pulse" />
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
