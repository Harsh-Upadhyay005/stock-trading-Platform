"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { apiClient } from "@/lib/api-client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { TableSkeleton } from "@/components/loading/table-skeleton"
import { ErrorMessage } from "@/components/error/error-message"
import { toast } from "sonner"

export default function FundsPage() {
  const [amount, setAmount] = useState("")
  const [selectedMethod, setSelectedMethod] = useState("UPI")
  const queryClient = useQueryClient()

  // Fetch transactions
  const { data: transactions, isLoading, error, refetch } = useQuery({
    queryKey: ['funds-transactions'],
    queryFn: async () => {
      const response = await fetch('/api/funds/transactions?accountId=default')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      return data.result || []
    },
  })

  // Fetch portfolio for balance
  const { data: portfolio } = useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const response = await fetch('/api/portfolio')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      return data.result || {}
    },
  })

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (data: { amount: number; method: string }) => {
      const response = await fetch('/api/funds/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, accountId: 'default' }),
      })
      if (!response.ok) throw new Error('Deposit failed')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funds-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
      setAmount("")
      toast.success('Funds deposited successfully!')
    },
    onError: (error) => {
      toast.error(`Deposit failed: ${error.message}`)
    },
  })

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: number }) => {
      const response = await fetch('/api/funds/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, accountId: 'default', bankAccountId: 'default' }),
      })
      if (!response.ok) throw new Error('Withdrawal failed')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funds-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
      setAmount("")
      toast.success('Withdrawal initiated successfully!')
    },
    onError: (error) => {
      toast.error(`Withdrawal failed: ${error.message}`)
    },
  })

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    depositMutation.mutate({ amount: parseFloat(amount), method: selectedMethod })
  }

  const handleWithdraw = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (parseFloat(amount) > (balance.withdrawable || 0)) {
      toast.error('Insufficient withdrawable balance')
      return
    }
    withdrawMutation.mutate({ amount: parseFloat(amount) })
  }

  const balance = {
    available: portfolio?.availableMargin || 125000,
    used: portfolio?.usedMargin || 75000,
    total: portfolio?.balance || 200000,
    withdrawable: portfolio?.availableMargin || 100000,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Funds</h1>
        <p className="text-sm text-neutral-600 mt-1">
          Manage your account balance and transactions
        </p>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-neutral-600 mb-2">Total Balance</div>
          <div className="text-3xl font-bold font-mono">
            ₹{balance.total.toLocaleString()}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-neutral-600 mb-2">Available</div>
          <div className="text-3xl font-bold font-mono text-green-600">
            ₹{balance.available.toLocaleString()}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-neutral-600 mb-2">Used in Trades</div>
          <div className="text-3xl font-bold font-mono">
            ₹{balance.used.toLocaleString()}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-neutral-600 mb-2">Withdrawable</div>
          <div className="text-3xl font-bold font-mono">
            ₹{balance.withdrawable.toLocaleString()}
          </div>
        </Card>
      </div>

      {/* Add/Withdraw Funds */}
      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="deposit">Add Funds</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw Funds</TabsTrigger>
        </TabsList>

        {/* Deposit Tab */}
        <TabsContent value="deposit">
          <Card className="p-6">
            <h3 className="font-semibold mb-6">Add Funds to Your Account</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border rounded-lg font-mono text-lg"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                {[5000, 10000, 25000, 50000].map((amt) => (
                  <Button
                    key={amt}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(amt.toString())}
                  >
                    ₹{amt.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 cursor-pointer hover:border-black transition-colors"
                  onClick={() => setSelectedMethod("UPI")}
                  style={{ borderWidth: selectedMethod === "UPI" ? '2px' : '1px' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">💳</div>
                    <div>
                      <div className="font-semibold">UPI</div>
                      <div className="text-xs text-neutral-600">Instant</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 cursor-pointer hover:border-black transition-colors"
                  onClick={() => setSelectedMethod("NET_BANKING")}
                  style={{ borderWidth: selectedMethod === "NET_BANKING" ? '2px' : '1px' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🏦</div>
                    <div>
                      <div className="font-semibold">Net Banking</div>
                      <div className="text-xs text-neutral-600">Instant</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 cursor-pointer hover:border-black transition-colors"
                  onClick={() => setSelectedMethod("BANK_TRANSFER")}
                  style={{ borderWidth: selectedMethod === "BANK_TRANSFER" ? '2px' : '1px' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📱</div>
                    <div>
                      <div className="font-semibold">NEFT/RTGS</div>
                      <div className="text-xs text-neutral-600">1-2 days</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 cursor-pointer hover:border-black transition-colors"
                  onClick={() => setSelectedMethod("CARD")}
                  style={{ borderWidth: selectedMethod === "CARD" ? '2px' : '1px' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">⚡</div>
                    <div>
                      <div className="font-semibold">Debit/Credit Card</div>
                      <div className="text-xs text-neutral-600">Instant</div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full" 
              disabled={!amount || depositMutation.isPending}
              onClick={handleDeposit}
            >
              {depositMutation.isPending ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </Card>
        </TabsContent>

        {/* Withdraw Tab */}
        <TabsContent value="withdraw">
          <Card className="p-6">
            <h3 className="font-semibold mb-6">Withdraw Funds</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border rounded-lg font-mono text-lg"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  max={balance.withdrawable}
                />
                <p className="text-sm text-neutral-600 mt-1">
                  Maximum withdrawable: ₹{balance.withdrawable.toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Bank Account
                </label>
                <select className="w-full px-4 py-3 border rounded-lg">
                  <option>HDFC Bank - ****6789 (Primary)</option>
                  <option>ICICI Bank - ****4321</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-neutral-50 rounded-lg mb-6">
              <p className="text-sm text-neutral-600">
                ⏱️ Withdrawal processing time: 1-2 business days
              </p>
            </div>

            <Button 
              size="lg" 
              className="w-full" 
              disabled={!amount || withdrawMutation.isPending}
              onClick={handleWithdraw}
            >
              {withdrawMutation.isPending ? 'Processing...' : 'Initiate Withdrawal'}
            </Button>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction History */}
      {isLoading ? (
        <TableSkeleton />
      ) : error ? (
        <ErrorMessage error={error} retry={refetch} />
      ) : (
      <Card>
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Transaction History</h2>
              <p className="text-sm text-neutral-600 mt-1">
                Last 30 days activity
              </p>
            </div>
            <Button variant="outline" size="sm">
              Export CSV
            </Button>
          </div>
        </div>

        <div className="divide-y">
          {transactions && transactions.length > 0 ? (
            transactions.map((txn: any) => (
            <div
              key={txn.id}
              className="p-6 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      txn.type === "DEPOSIT" || txn.type === "TRADE_CREDIT"
                        ? "bg-black text-white"
                        : "bg-neutral-100"
                    }`}
                  >
                    {txn.type === "DEPOSIT" || txn.type === "TRADE_CREDIT"
                      ? "↓"
                      : "↑"}
                  </div>
                  <div>
                    <div className="font-semibold mb-1">
                      {txn.type.replace("_", " ")}
                    </div>
                    <div className="text-sm text-neutral-600">
                      {txn.method} • Ref: {txn.referenceId || 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-mono font-semibold text-lg ${
                      txn.type === "DEPOSIT" || txn.type === "TRADE_CREDIT"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {txn.type === "DEPOSIT" || txn.type === "TRADE_CREDIT"
                      ? "+"
                      : "-"}
                    ₹{Number(txn.amount).toLocaleString()}
                  </div>
                  <div className="text-sm text-neutral-600 mt-1">
                    {new Date(txn.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <Badge
                  variant={txn.status === "COMPLETED" ? "default" : "outline"}
                >
                  {txn.status}
                </Badge>
              </div>
            </div>
          ))
          ) : (
            <div className="p-12 text-center text-neutral-600">
              No transactions yet
            </div>
          )}
        </div>
      </Card>
      )}

      {/* Info */}
      <Card className="p-6 bg-neutral-50">
        <h3 className="font-semibold mb-3">Important Information</h3>
        <ul className="space-y-2 text-sm text-neutral-600">
          <li>• Instant deposits via UPI, Net Banking, and IMPS</li>
          <li>• NEFT/RTGS deposits take 1-2 business days</li>
          <li>• Withdrawals are processed within 1-2 business days</li>
          <li>• No charges for deposits and withdrawals</li>
          <li>• Funds used in open positions cannot be withdrawn</li>
        </ul>
      </Card>
    </div>
  )
}
