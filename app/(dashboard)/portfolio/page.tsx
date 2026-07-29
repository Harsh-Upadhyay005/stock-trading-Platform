import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { PortfolioHeader } from "@/components/portfolio/portfolio-header"
import { PortfolioMetrics } from "@/components/portfolio/portfolio-metrics"
import { PerformanceChart } from "@/components/portfolio/performance-chart"
import { AssetAllocation } from "@/components/portfolio/asset-allocation"
import { RecentActivity } from "@/components/portfolio/recent-activity"
import { PortfolioStats } from "@/components/portfolio/portfolio-stats"
import { Card } from "@/components/ui/card"

export const metadata = {
  title: "Portfolio | TradeFlow",
  description: "Your portfolio overview and performance",
}

export default async function PortfolioPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Suspense fallback={<HeaderSkeleton />}>
        <PortfolioHeader userId={userId} />
      </Suspense>

      {/* Metrics Cards */}
      <Suspense fallback={<MetricsSkeleton />}>
        <PortfolioMetrics userId={userId} />
      </Suspense>

      {/* Performance Chart */}
      <Suspense fallback={<ChartSkeleton />}>
        <PerformanceChart userId={userId} />
      </Suspense>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<CardSkeleton />}>
          <AssetAllocation userId={userId} />
        </Suspense>

        <Suspense fallback={<CardSkeleton />}>
          <PortfolioStats userId={userId} />
        </Suspense>
      </div>

      {/* Recent Activity */}
      <Suspense fallback={<CardSkeleton />}>
        <RecentActivity userId={userId} />
      </Suspense>
    </div>
  )
}

function HeaderSkeleton() {
  return <div className="h-24 bg-muted animate-pulse rounded" />
}

function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-muted animate-pulse rounded" />
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return <Card className="p-6 h-96 bg-muted animate-pulse" />
}

function CardSkeleton() {
  return <Card className="p-6 h-64 bg-muted animate-pulse" />
}
