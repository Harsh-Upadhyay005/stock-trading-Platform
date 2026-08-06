import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { WatchlistSidebar } from "@/components/watchlist/watchlist-sidebar"
import { WatchlistTable } from "@/components/watchlist/watchlist-table"
import { Card } from "@/components/ui/card"

export const metadata = {
  title: "Watchlists | TradeFlow",
  description: "Manage your watchlists",
}

async function getWatchlists(userId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/watchlists`,
      {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch watchlists')
    }

    const data = await response.json()
    return data.watchlists || data || []
  } catch (error) {
    console.error('Error fetching watchlists:', error)
    return []
  }
}

async function getDefaultWatchlist(userId: string) {
  try {
    const watchlists = await getWatchlists(userId)
    if (watchlists.length === 0) {
      return { id: null, name: 'No Watchlist', items: [] }
    }

    // Fetch details of first watchlist
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/watchlists/${watchlists[0].id}`,
      {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch watchlist details')
    }

    const data = await response.json()
    return data.watchlist || data || { id: null, name: 'Empty', items: [] }
  } catch (error) {
    console.error('Error fetching watchlist details:', error)
    return { id: null, name: 'Error', items: [] }
  }
}
        sparkline: "▂▃▄▅▆▅▄",
        notes: "Buy on dips",
      },
      {
        id: "4",
        symbol: "MSFT",
        name: "Microsoft Corp.",
        price: 320,
        change: 4.5,
        changePercent: 1.42,
        volume: 9800000,
        marketCap: 2400000000000,
        sparkline: "▃▄▅▆▇▆▅",
      },
      {
        id: "5",
        symbol: "AMZN",
        name: "Amazon.com Inc.",
        price: 3450,
        change: 105,
        changePercent: 3.12,
        volume: 6700000,
        marketCap: 1700000000000,
        sparkline: "▂▂▃▄▅▆▇",
      },
      {
        id: "6",
        symbol: "NVDA",
        name: "NVIDIA Corp.",
        price: 450,
        change: 12,
        changePercent: 2.74,
        volume: 15200000,
        marketCap: 1100000000000,
        sparkline: "▁▂▄▆▇▆▅",
      },
      {
        id: "7",
        symbol: "META",
        name: "Meta Platforms",
        price: 485,
        change: -8,
        changePercent: -1.62,
        volume: 7800000,
        marketCap: 1250000000000,
        sparkline: "▅▆▅▄▃▂▁",
      },
      {
        id: "8",
        symbol: "NFLX",
        name: "Netflix Inc.",
        price: 625,
        change: 18,
        changePercent: 2.97,
        volume: 4200000,
        marketCap: 280000000000,
        sparkline: "▂▃▃▄▅▆▇",
      },
    ],
  }
}

export default async function WatchlistsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const watchlists = await getWatchlists(userId)
  const defaultWatchlist = await getDefaultWatchlist(userId)

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Sidebar */}
      <Suspense fallback={<SidebarSkeleton />}>
        <WatchlistSidebar userId={userId} watchlists={watchlists} />
      </Suspense>

      {/* Main Content */}
      <Suspense fallback={<ContentSkeleton />}>
        <WatchlistTable
          watchlistId={defaultWatchlist.id}
          watchlistName={defaultWatchlist.name}
          items={defaultWatchlist.items}
        />
      </Suspense>
    </div>
  )
}

function SidebarSkeleton() {
  return (
    <div className="w-64 border-r border-border">
      <div className="p-4 space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-muted animate-pulse rounded" />
        ))}
      </div>
    </div>
  )
}

function ContentSkeleton() {
  return (
    <div className="flex-1">
      <Card className="p-6 h-full">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </Card>
    </div>
  )
}
