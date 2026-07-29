import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { MarketHeader } from "@/components/market/market-header"
import { MarketIndices } from "@/components/market/market-indices"
import { MarketTable } from "@/components/market/market-table"
import { MarketFilters } from "@/components/market/market-filters"
import { Card } from "@/components/ui/card"

export const metadata = {
  title: "Market | TradeFlow",
  description: "Browse and discover trading opportunities",
}

export default async function MarketPage({
  searchParams,
}: {
  searchParams: { tab?: string; search?: string; sector?: string }
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const activeTab = searchParams.tab || "all"

  return (
    <div className="space-y-6">
      {/* Header */}
      <MarketHeader />

      {/* Market Indices */}
      <Suspense fallback={<IndicesSkeleton />}>
        <MarketIndices />
      </Suspense>

      {/* Filters */}
      <Card className="p-4">
        <MarketFilters />
      </Card>

      {/* Market Table */}
      <Suspense fallback={<TableSkeleton />}>
        <MarketTable userId={userId} activeTab={activeTab} searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

function IndicesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 bg-muted animate-pulse rounded" />
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    </Card>
  )
}
