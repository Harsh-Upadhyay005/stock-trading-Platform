'use client'

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useActivityLog } from "@/lib/hooks/use-queries"
import { TableSkeleton } from "@/components/loading/table-skeleton"
import { ErrorMessage } from "@/components/error/error-message"

export default function ActivityPage() {
  const [filter, setFilter] = useState("ALL")
  
  // Fetch activity log from API
  const { data: activities = [], isLoading, error, refetch } = useActivityLog({ 
    type: filter === "ALL" ? undefined : filter 
  })

  const filteredActivities = filter === "ALL" 
    ? activities 
    : activities.filter((a: any) => a.type === filter)

  const unreadCount = activities.filter((a: any) => !a.read).length

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-neutral-200 rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => (
            <Card key={i} className="p-4 h-20 bg-neutral-100 animate-pulse" />
          ))}
        </div>
        <Card className="p-6">
          <TableSkeleton rows={8} />
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <ErrorMessage error={error} retry={refetch} />
      </div>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "TRADE":
        return "📈"
      case "ACCOUNT":
        return "👤"
      case "SECURITY":
        return "🔒"
      case "ALERT":
        return "🔔"
      default:
        return "📋"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <Badge className="bg-black text-white">Success</Badge>
      case "FAILED":
        return <Badge className="bg-neutral-200">Failed</Badge>
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Activity Log</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Complete history of your account activities
          </p>
        </div>
        <div className="flex gap-2">
          <select className="px-4 py-2 border rounded-lg text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
            <option>All time</option>
          </select>
          <Button variant="outline" size="sm">
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-sm text-neutral-600 mb-1">Total Activities</div>
          <div className="text-2xl font-bold">{activities.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 mb-1">Trades</div>
          <div className="text-2xl font-bold">
            {activities.filter((a) => a.type === "TRADE").length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 mb-1">Account</div>
          <div className="text-2xl font-bold">
            {activities.filter((a) => a.type === "ACCOUNT").length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 mb-1">Security</div>
          <div className="text-2xl font-bold">
            {activities.filter((a) => a.type === "SECURITY").length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 mb-1">Failed</div>
          <div className="text-2xl font-bold text-red-600">
            {activities.filter((a) => a.status === "FAILED").length}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-2">
          <Button
            variant={filter === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("ALL")}
          >
            All
          </Button>
          <Button
            variant={filter === "TRADE" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("TRADE")}
          >
            Trades
          </Button>
          <Button
            variant={filter === "ACCOUNT" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("ACCOUNT")}
          >
            Account
          </Button>
          <Button
            variant={filter === "SECURITY" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("SECURITY")}
          >
            Security
          </Button>
          <Button
            variant={filter === "ALERT" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("ALERT")}
          >
            Alerts
          </Button>
        </div>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Activity Timeline</h2>
        </div>

        <div className="divide-y">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="p-6 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="text-2xl flex-shrink-0">
                  {getTypeIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-semibold mb-1">{activity.action}</h3>
                      <p className="text-sm text-neutral-600">
                        {activity.details}
                      </p>
                    </div>
                    {getStatusBadge(activity.status)}
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      🕐 {new Date(activity.timestamp).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      📍 {activity.ip}
                    </span>
                    <span className="flex items-center gap-1">
                      💻 {activity.device}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                </div>

                {/* View Details */}
                <Button variant="ghost" size="sm">
                  Details
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="p-4 border-t text-center">
          <Button variant="outline" size="sm">
            Load More Activities
          </Button>
        </div>
      </Card>

      {/* Security Notice */}
      <Card className="p-6 bg-neutral-50">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🔒</div>
          <div>
            <h3 className="font-semibold mb-2">Security Tips</h3>
            <ul className="text-sm text-neutral-600 space-y-1">
              <li>
                • Review your activity log regularly for suspicious activities
              </li>
              <li>
                • If you notice any unauthorized access, change your password
                immediately
              </li>
              <li>• Enable two-factor authentication for enhanced security</li>
              <li>• Never share your login credentials with anyone</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
