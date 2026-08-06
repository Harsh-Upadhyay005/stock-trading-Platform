"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { useNotifications, useMarkNotificationRead } from "@/lib/hooks/use-queries"
import { TableSkeleton } from "@/components/loading/table-skeleton"
import { ErrorMessage } from "@/components/error/error-message"
import { toast } from "sonner"

export default function NotificationsPage() {
  const [filter, setFilter] = useState("ALL")
  
  // Fetch notifications
  const { data: notifications, isLoading, error, refetch } = useNotifications("user-id") // TODO: Get from auth context
  
  // Mark as read mutation
  const markReadMutation = useMarkNotificationRead()
  
  if (isLoading) {
    return <TableSkeleton />
  }
  
  if (error) {
    return <ErrorMessage error={error} retry={refetch} />
  }
  
  const notificationList = notifications || []
    {
      id: "1",
      type: "ORDER",
      title: "Order Executed",
      message: "Your BUY order for RELIANCE @ ₹2,456.75 has been filled",
      timestamp: "2024-03-20T15:30:00",
      read: false,
      priority: "HIGH",
    },
    {
      id: "2",
      type: "ALERT",
      title: "Price Alert Triggered",
      message: "TCS has reached your target price of ₹3,500",
      timestamp: "2024-03-20T14:20:00",
      read: false,
      priority: "MEDIUM",
    },
    {
      id: "3",
      type: "SYSTEM",
      title: "Margin Call",
      message: "Your account margin has fallen below minimum requirements",
      timestamp: "2024-03-20T13:15:00",
      read: true,
      priority: "HIGH",
    },
    {
      id: "4",
      type: "MARKET",
      title: "Market Update",
      message: "NIFTY 50 crosses 22,000 mark",
      timestamp: "2024-03-20T12:00:00",
      read: true,
      priority: "LOW",
    },
    {
      id: "5",
      type: "ORDER",
      title: "Order Cancelled",
      message: "Your pending LIMIT order for INFY has been cancelled",
      timestamp: "2024-03-20T11:30:00",
      read: true,
      priority: "MEDIUM",
    },
    {
      id: "6",
      type: "ACCOUNT",
      title: "Deposit Successful",
      message: "₹50,000 has been credited to your account",
      timestamp: "2024-03-20T10:00:00",
      read: true,
      priority: "MEDIUM",
    },
    {
      id: "7",
      type: "ALERT",
      title: "Stop Loss Hit",
      message: "Your stop loss for HDFC @ ₹1,550 has been triggered",
      timestamp: "2024-03-19T16:45:00",
      read: true,
      priority: "HIGH",
    },
    {
      id: "8",
      type: "SYSTEM",
      title: "KYC Verified",
      message: "Your KYC documents have been verified successfully",
      timestamp: "2024-03-19T14:00:00",
      read: true,
      priority: "MEDIUM",
    },
  const filteredNotifications =
    filter === "ALL"
      ? notificationList
      : filter === "UNREAD"
      ? notificationList.filter((n) => !n.read)
      : notificationList.filter((n) => n.type === filter)

  const unreadCount = notificationList.filter((n) => !n.read).length

  const getIcon = (type: string) => {
    switch (type) {
      case "ORDER":
        return "📋"
      case "ALERT":
        return "🔔"
      case "SYSTEM":
        return "⚙️"
      case "MARKET":
        return "📊"
      case "ACCOUNT":
        return "💰"
      default:
        return "📢"
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return <Badge className="bg-black text-white">High Priority</Badge>
      case "MEDIUM":
        return <Badge variant="outline">Medium</Badge>
      case "LOW":
        return <Badge className="bg-neutral-200">Low</Badge>
      default:
        return null
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await markReadMutation.mutateAsync(id)
      toast.success('Notification marked as read')
    } catch (error) {
      toast.error('Failed to mark notification as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      // In real app, batch update via API
      await Promise.all(
        notificationList
          .filter(n => !n.read)
          .map(n => markReadMutation.mutateAsync(n.id))
      )
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-neutral-600 mt-1">
            {unreadCount} unread notifications
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Mark All as Read
          </Button>
          <Button variant="outline" size="sm">
            Settings
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <Tabs defaultValue="ALL" className="w-full">
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="ALL" onClick={() => setFilter("ALL")}>
              All
            </TabsTrigger>
            <TabsTrigger value="UNREAD" onClick={() => setFilter("UNREAD")}>
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="ORDER" onClick={() => setFilter("ORDER")}>
              Orders
            </TabsTrigger>
            <TabsTrigger value="ALERT" onClick={() => setFilter("ALERT")}>
              Alerts
            </TabsTrigger>
            <TabsTrigger value="MARKET" onClick={() => setFilter("MARKET")}>
              Market
            </TabsTrigger>
            <TabsTrigger value="ACCOUNT" onClick={() => setFilter("ACCOUNT")}>
              Account
            </TabsTrigger>
            <TabsTrigger value="SYSTEM" onClick={() => setFilter("SYSTEM")}>
              System
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4 opacity-20">🔔</div>
            <h3 className="text-lg font-semibold mb-2">No notifications</h3>
            <p className="text-sm text-neutral-600">
              You're all caught up! Check back later for updates.
            </p>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-6 transition-all hover:shadow-md ${
                !notification.read ? "bg-neutral-50 border-l-4 border-black" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="text-3xl flex-shrink-0">
                  {getIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        {notification.message}
                      </p>
                    </div>
                    {getPriorityBadge(notification.priority)}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <span>
                        {new Date(notification.timestamp).toLocaleString()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {notification.type}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Load More */}
      {filteredNotifications.length > 0 && (
        <div className="text-center">
          <Button variant="outline">Load More Notifications</Button>
        </div>
      )}
    </div>
  )
}
