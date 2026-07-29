import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PortfolioSummary } from "@/components/dashboard/portfolio-summary"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { TopHoldings } from "@/components/dashboard/top-holdings"
import { MarketMovers } from "@/components/dashboard/market-movers"
import { WatchlistPreview } from "@/components/dashboard/watchlist-preview"
import { RecentAlerts } from "@/components/dashboard/recent-alerts"
import { MarketStatus } from "@/components/dashboard/market-status"

export const metadata = {
  title: "Dashboard | TradeFlow",
  description: "Your trading dashboard",
}

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Suspense fallback={<HeaderSkeleton />}>
        <DashboardHeader userId={userId} />
      </Suspense>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - 2/4 width */}
        <div className="lg:col-span-2 space-y-6">
          <Suspense fallback={<CardSkeleton />}>
            <PortfolioSummary userId={userId} />
          </Suspense>

          <Suspense fallback={<CardSkeleton />}>
            <TopHoldings userId={userId} />
          </Suspense>

          <Suspense fallback={<CardSkeleton />}>
            <WatchlistPreview userId={userId} />
          </Suspense>
        </div>

        {/* Middle Column - 1/4 width */}
        <div className="lg:col-span-1 space-y-6">
          <QuickActions />

          <Suspense fallback={<CardSkeleton />}>
            <MarketStatus />
          </Suspense>

          <Suspense fallback={<CardSkeleton />}>
            <MarketMovers />
          </Suspense>
        </div>

        {/* Right Column - 1/4 width */}
        <div className="lg:col-span-1 space-y-6">
          <Suspense fallback={<CardSkeleton />}>
            <RecentOrders userId={userId} />
          </Suspense>

          <Suspense fallback={<CardSkeleton />}>
            <RecentAlerts userId={userId} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function HeaderSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-8 w-48 bg-muted animate-pulse rounded" />
      <div className="h-12 w-64 bg-muted animate-pulse rounded" />
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="border border-border rounded-md p-6 space-y-4">
      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      <div className="h-8 w-full bg-muted animate-pulse rounded" />
      <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
    </div>
  )
}
