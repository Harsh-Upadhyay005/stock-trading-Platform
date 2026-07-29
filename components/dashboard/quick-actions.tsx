"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Star, Bell } from "lucide-react"

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Link href="/trade?action=buy" className="block">
          <Button variant="primary" className="w-full justify-start gap-2">
            <TrendingUp className="h-4 w-4" />
            Buy Stock
          </Button>
        </Link>

        <Link href="/trade?action=sell" className="block">
          <Button variant="secondary" className="w-full justify-start gap-2">
            <TrendingDown className="h-4 w-4" />
            Sell Stock
          </Button>
        </Link>

        <Link href="/watchlists" className="block">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Star className="h-4 w-4" />
            Add to Watchlist
          </Button>
        </Link>

        <Link href="/alerts" className="block">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Bell className="h-4 w-4" />
            Set Alert
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
