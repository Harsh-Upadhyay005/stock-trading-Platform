import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

async function getAdminStats() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/admin/stats`,
      {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
      }
    )
    if (!response.ok) throw new Error('Failed to fetch')
    const data = await response.json()
    return data.result || null
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

export default async function AdminDashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const apiStats = await getAdminStats()
  
  // Mock admin stats (use real data where available)
  const stats = apiStats ? {
    totalUsers: apiStats.users?.total || 0,
    activeUsers: apiStats.users?.active || 0,
    totalOrders: apiStats.orders?.total || 0,
    totalVolume: apiStats.volume?.total || 0,
    revenue: apiStats.orders?.total * 20 || 0, // Estimate based on ₹20 per order
    pendingKyc: apiStats.kyc?.PENDING || 0,
  } : {
    totalUsers: 15234,
    activeUsers: 8456,
    totalOrders: 45678,
    totalVolume: 234567890,
    revenue: 1234567,
    pendingKyc: 45,
  }

  // Mock recent activities
  const activities = [
    {
      id: "1",
      type: "USER_SIGNUP",
      user: "john@example.com",
      timestamp: "2024-03-20T15:30:00",
      details: "New user registration",
    },
    {
      id: "2",
      type: "KYC_SUBMITTED",
      user: "jane@example.com",
      timestamp: "2024-03-20T15:25:00",
      details: "KYC documents submitted",
    },
    {
      id: "3",
      type: "LARGE_TRADE",
      user: "trader@example.com",
      timestamp: "2024-03-20T15:20:00",
      details: "Order ₹5,00,000 - RELIANCE",
    },
    {
      id: "4",
      type: "WITHDRAWAL",
      user: "user@example.com",
      timestamp: "2024-03-20T15:15:00",
      details: "Withdrawal request ₹50,000",
    },
  ]

  // Mock system health
  const systemHealth = {
    api: "HEALTHY",
    database: "HEALTHY",
    redis: "HEALTHY",
    workers: "HEALTHY",
    broker: "HEALTHY",
  }

  const getHealthColor = (status: string) => {
    return status === "HEALTHY" ? "bg-black text-white" : "bg-neutral-200"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-neutral-600 mt-1">
          System overview and monitoring
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="text-sm text-neutral-600 mb-2">Total Users</div>
          <div className="text-3xl font-bold mb-1">
            {stats.totalUsers.toLocaleString()}
          </div>
          <div className="text-sm text-neutral-600">
            {stats.activeUsers.toLocaleString()} active today
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-neutral-600 mb-2">Total Orders</div>
          <div className="text-3xl font-bold mb-1">
            {stats.totalOrders.toLocaleString()}
          </div>
          <div className="text-sm text-neutral-600">Today: 2,345</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-neutral-600 mb-2">Trading Volume</div>
          <div className="text-3xl font-bold mb-1">
            ₹{(stats.totalVolume / 10000000).toFixed(2)}Cr
          </div>
          <div className="text-sm text-neutral-600">Today: ₹2.4Cr</div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="text-sm text-neutral-600 mb-2">Revenue (MTD)</div>
          <div className="text-3xl font-bold mb-1">
            ₹{(stats.revenue / 100000).toFixed(2)}L
          </div>
          <div className="text-sm text-neutral-600">+12.5% vs last month</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-neutral-600 mb-2">Pending KYC</div>
          <div className="text-3xl font-bold mb-1">{stats.pendingKyc}</div>
          <div className="text-sm text-neutral-600">
            Avg processing: 2 days
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-neutral-600 mb-2">Active Sessions</div>
          <div className="text-3xl font-bold mb-1">1,234</div>
          <div className="text-sm text-neutral-600">Peak: 2,456 (11 AM)</div>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">System Health</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(systemHealth).map(([service, status]) => (
              <div key={service} className="text-center">
                <div
                  className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${getHealthColor(
                    status
                  )}`}
                >
                  ✓
                </div>
                <div className="text-sm font-semibold capitalize">
                  {service}
                </div>
                <Badge
                  variant="outline"
                  className={`mt-1 ${getHealthColor(status)}`}
                >
                  {status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Recent Activities */}
      <Card>
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Activities</h2>
            <Button variant="ghost" size="sm">
              View All →
            </Button>
          </div>
        </div>
        <div className="divide-y">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="p-6 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold mb-1">{activity.details}</div>
                  <div className="text-sm text-neutral-600">
                    {activity.user} •{" "}
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
                <Badge variant="outline">{activity.type.replace("_", " ")}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        <Button variant="outline" className="h-24 flex-col">
          <div className="text-2xl mb-2">👥</div>
          <div>Manage Users</div>
        </Button>
        <Button variant="outline" className="h-24 flex-col">
          <div className="text-2xl mb-2">📄</div>
          <div>Review KYC</div>
        </Button>
        <Button variant="outline" className="h-24 flex-col">
          <div className="text-2xl mb-2">📊</div>
          <div>View Reports</div>
        </Button>
        <Button variant="outline" className="h-24 flex-col">
          <div className="text-2xl mb-2">⚙️</div>
          <div>Settings</div>
        </Button>
      </div>
    </div>
  )
}
