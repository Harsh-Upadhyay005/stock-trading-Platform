import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

async function getAccountSummary(userId: string) {
  try {
    const [portfolio, orders] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/portfolio`, {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': userId },
      }).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/orders`, {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': userId },
      }).then(r => r.json()),
    ])
    
    return {
      portfolio: portfolio.result || {},
      orders: orders.result || [],
    }
  } catch (error) {
    console.error('Error fetching summary:', error)
    return { portfolio: {}, orders: [] }
  }
}

export default async function SummaryPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { portfolio, orders } = await getAccountSummary(userId)
  
  // Calculate statistics
  const totalOrders = orders.length
  const executedOrders = orders.filter((o: any) => o.status === 'FILLED').length
  const cancelledOrders = orders.filter((o: any) => o.status === 'CANCELLED').length
  const rejectedOrders = orders.filter((o: any) => o.status === 'REJECTED').length
  
  // Mock account summary data (use real data where available)
  const summary = {
    accountId: "TF123456",
    accountType: "Individual",
    accountStatus: "ACTIVE",
    kycStatus: "VERIFIED",
    memberSince: "2024-01-15",
    
    // Financial Overview
    totalBalance: portfolio.balance || 250000,
    availableMargin: portfolio.availableMargin || 175000,
    usedMargin: portfolio.usedMargin || 75000,
    collateral: 0,
    
    // Portfolio Summary
    portfolioValue: portfolio.totalValue || 285000,
    invested: portfolio.invested || 240000,
    pnl: portfolio.totalPnL || 45000,
    pnlPercent: portfolio.totalReturn || 18.75,
    holdings: portfolio.totalHoldings || 8,
    
    // Trading Statistics
    totalOrders,
    executedOrders,
    cancelledOrders,
    rejectedOrders,
    totalTrades: executedOrders,
    profitableTrades: Math.floor(executedOrders * 0.57),
    losingTrades: executedOrders - Math.floor(executedOrders * 0.57),
    winRate: executedOrders > 0 ? (Math.floor(executedOrders * 0.57) / executedOrders * 100) : 0,
    
    // Month-to-Date
    mtdOrders: orders.filter((o: any) => new Date(o.createdAt) > new Date(new Date().getFullYear(), new Date().getMonth(), 1)).length,
    mtdVolume: 5678900,
    mtdPnL: portfolio.dayPnL || 12345,
    
    // Charges & Fees
    brokerage: 2456,
    taxes: 1234,
    totalCharges: 3690,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Account Summary</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Complete overview of your trading account
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Download Report
          </Button>
          <Button variant="outline" size="sm">
            Print
          </Button>
        </div>
      </div>

      {/* Account Info */}
      <Card>
        <div className="p-6 border-b bg-neutral-50">
          <h2 className="text-lg font-semibold">Account Information</h2>
        </div>
        <div className="p-6 grid grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-neutral-600 mb-1">Account ID</div>
            <div className="font-mono font-semibold">{summary.accountId}</div>
          </div>
          <div>
            <div className="text-sm text-neutral-600 mb-1">Account Type</div>
            <div className="font-semibold">{summary.accountType}</div>
          </div>
          <div>
            <div className="text-sm text-neutral-600 mb-1">Status</div>
            <Badge className="bg-black text-white">{summary.accountStatus}</Badge>
          </div>
          <div>
            <div className="text-sm text-neutral-600 mb-1">KYC Status</div>
            <Badge className="bg-black text-white">{summary.kycStatus}</Badge>
          </div>
          <div>
            <div className="text-sm text-neutral-600 mb-1">Member Since</div>
            <div className="font-semibold">
              {new Date(summary.memberSince).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-neutral-600 mb-1">Last Login</div>
            <div className="font-semibold">Today, 09:15 AM</div>
          </div>
        </div>
      </Card>

      {/* Financial Overview */}
      <Card>
        <div className="p-6 border-b bg-neutral-50">
          <h2 className="text-lg font-semibold">Financial Overview</h2>
        </div>
        <div className="p-6 grid grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-neutral-600 mb-2">Total Balance</div>
            <div className="text-2xl font-bold font-mono">
              ₹{summary.totalBalance.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-neutral-600 mb-2">Available Margin</div>
            <div className="text-2xl font-bold font-mono text-green-600">
              ₹{summary.availableMargin.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-neutral-600 mb-2">Used Margin</div>
            <div className="text-2xl font-bold font-mono">
              ₹{summary.usedMargin.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-neutral-600 mb-2">Collateral</div>
            <div className="text-2xl font-bold font-mono">
              ₹{summary.collateral.toLocaleString()}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Portfolio Summary */}
        <Card>
          <div className="p-6 border-b bg-neutral-50">
            <h2 className="text-lg font-semibold">Portfolio Summary</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Current Value</span>
              <span className="font-mono font-semibold text-xl">
                ₹{summary.portfolioValue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Total Invested</span>
              <span className="font-mono font-semibold">
                ₹{summary.invested.toLocaleString()}
              </span>
            </div>
            <div className="pt-4 border-t flex justify-between items-center">
              <span className="font-semibold">Total P&L</span>
              <div className="text-right">
                <div className="font-mono font-bold text-xl text-green-600">
                  +₹{summary.pnl.toLocaleString()}
                </div>
                <div className="text-sm text-green-600">
                  +{summary.pnlPercent.toFixed(2)}%
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-neutral-600">Active Holdings</span>
              <span className="font-mono font-semibold">{summary.holdings}</span>
            </div>
          </div>
        </Card>

        {/* Trading Statistics */}
        <Card>
          <div className="p-6 border-b bg-neutral-50">
            <h2 className="text-lg font-semibold">Trading Statistics (All Time)</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-neutral-600">Total Orders</span>
              <span className="font-mono font-semibold">
                {summary.totalOrders}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Executed</span>
              <span className="font-mono text-green-600">
                {summary.executedOrders}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Cancelled</span>
              <span className="font-mono">{summary.cancelledOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Rejected</span>
              <span className="font-mono">{summary.rejectedOrders}</span>
            </div>
            <div className="pt-4 border-t flex justify-between">
              <span className="text-neutral-600">Profitable Trades</span>
              <span className="font-mono text-green-600">
                {summary.profitableTrades}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Losing Trades</span>
              <span className="font-mono text-red-600">
                {summary.losingTrades}
              </span>
            </div>
            <div className="pt-4 border-t flex justify-between">
              <span className="font-semibold">Win Rate</span>
              <span className="font-mono font-bold">
                {summary.winRate.toFixed(2)}%
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Month to Date */}
      <Card>
        <div className="p-6 border-b bg-neutral-50">
          <h2 className="text-lg font-semibold">Month to Date (March 2024)</h2>
        </div>
        <div className="p-6 grid grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-neutral-600 mb-2">Orders Placed</div>
            <div className="text-3xl font-bold font-mono">{summary.mtdOrders}</div>
          </div>
          <div>
            <div className="text-sm text-neutral-600 mb-2">Trading Volume</div>
            <div className="text-3xl font-bold font-mono">
              ₹{(summary.mtdVolume / 100000).toFixed(1)}L
            </div>
          </div>
          <div>
            <div className="text-sm text-neutral-600 mb-2">Net P&L</div>
            <div className="text-3xl font-bold font-mono text-green-600">
              +₹{summary.mtdPnL.toLocaleString()}
            </div>
          </div>
        </div>
      </Card>

      {/* Charges & Fees */}
      <Card>
        <div className="p-6 border-b bg-neutral-50">
          <h2 className="text-lg font-semibold">Charges & Fees (MTD)</h2>
        </div>
        <div className="p-6 grid grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-neutral-600 mb-2">Brokerage</div>
            <div className="text-2xl font-bold font-mono">
              ₹{summary.brokerage.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-neutral-600 mb-2">Taxes & Charges</div>
            <div className="text-2xl font-bold font-mono">
              ₹{summary.taxes.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-neutral-600 mb-2">Total Charges</div>
            <div className="text-2xl font-bold font-mono text-red-600">
              ₹{summary.totalCharges.toLocaleString()}
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Links */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-3">
          <Button variant="outline">View Holdings</Button>
          <Button variant="outline">Order History</Button>
          <Button variant="outline">Tax Reports</Button>
          <Button variant="outline">Update Profile</Button>
        </div>
      </Card>

      {/* Disclaimer */}
      <Card className="p-6 bg-neutral-50">
        <p className="text-sm text-neutral-600">
          📋 This summary is generated as of {new Date().toLocaleDateString()}.
          All figures are approximate and for reference only. Please refer to
          contract notes for exact details.
        </p>
      </Card>
    </div>
  )
}
