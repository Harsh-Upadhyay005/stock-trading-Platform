"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { TableSkeleton } from "@/components/loading/table-skeleton"
import { ErrorMessage } from "@/components/error/error-message"
import { toast } from "sonner"

export default function BankingPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
    accountType: "SAVINGS" as "SAVINGS" | "CURRENT",
    isPrimary: false,
  })

  const queryClient = useQueryClient()

  // Fetch bank accounts
  const { data: accounts, isLoading, error, refetch } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: async () => {
      const response = await fetch('/api/account/bank-accounts')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      return data.result || []
    },
  })

  // Add bank account mutation
  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/account/bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to add')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] })
      setShowAddForm(false)
      setFormData({
        accountHolderName: "",
        accountNumber: "",
        ifscCode: "",
        bankName: "",
        branchName: "",
        accountType: "SAVINGS",
        isPrimary: false,
      })
      toast.success('Bank account added successfully!')
    },
    onError: (error) => {
      toast.error(`Failed to add bank account: ${error.message}`)
    },
  })

  // Delete bank account mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/account/bank-accounts/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] })
      toast.success('Bank account deleted successfully!')
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addMutation.mutate(formData)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this bank account?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) return <TableSkeleton />
  if (error) return <ErrorMessage error={error} retry={refetch} />

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bank Accounts</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Manage your bank accounts for fund transfers
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : '+ Add Bank Account'}
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card className="p-6">
          <h3 className="font-semibold mb-6">Add New Bank Account</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.accountHolderName}
                  onChange={(e) =>
                    setFormData({ ...formData, accountHolderName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border rounded-lg font-mono"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">
                  IFSC Code *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border rounded-lg font-mono"
                  value={formData.ifscCode}
                  onChange={(e) =>
                    setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })
                  }
                  pattern="^[A-Z]{4}0[A-Z0-9]{6}$"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">
                  Bank Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.bankName}
                  onChange={(e) =>
                    setFormData({ ...formData, bankName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">
                  Branch Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.branchName}
                  onChange={(e) =>
                    setFormData({ ...formData, branchName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">
                  Account Type *
                </label>
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.accountType}
                  onChange={(e) =>
                    setFormData({ ...formData, accountType: e.target.value as "SAVINGS" | "CURRENT" })
                  }
                >
                  <option value="SAVINGS">Savings</option>
                  <option value="CURRENT">Current</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPrimary"
                checked={formData.isPrimary}
                onChange={(e) =>
                  setFormData({ ...formData, isPrimary: e.target.checked })
                }
              />
              <label htmlFor="isPrimary" className="text-sm">
                Set as primary account for withdrawals
              </label>
            </div>

            <Button type="submit" disabled={addMutation.isPending}>
              {addMutation.isPending ? 'Adding...' : 'Add Bank Account'}
            </Button>
          </form>
        </Card>
      )}

      {/* Bank Accounts List */}
      {accounts && accounts.length > 0 ? (
        <div className="space-y-4">
          {accounts.map((account: any) => (
            <Card key={account.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold">{account.bankName}</h3>
                    {account.isPrimary && (
                      <Badge className="bg-black text-white">Primary</Badge>
                    )}
                    <Badge variant={account.isVerified ? "default" : "outline"}>
                      {account.isVerified ? "Verified" : "Pending Verification"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-neutral-600">Account Holder</div>
                      <div className="font-semibold">{account.accountHolderName}</div>
                    </div>
                    <div>
                      <div className="text-neutral-600">Account Number</div>
                      <div className="font-mono font-semibold">
                        ****{account.accountNumber.slice(-4)}
                      </div>
                    </div>
                    <div>
                      <div className="text-neutral-600">IFSC Code</div>
                      <div className="font-mono">{account.ifscCode}</div>
                    </div>
                    <div>
                      <div className="text-neutral-600">Account Type</div>
                      <div>{account.accountType}</div>
                    </div>
                    {account.branchName && (
                      <div>
                        <div className="text-neutral-600">Branch</div>
                        <div>{account.branchName}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-neutral-600">Added On</div>
                      <div>{new Date(account.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(account.id)}
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4 opacity-20">🏦</div>
          <h3 className="text-lg font-semibold mb-2">No Bank Accounts</h3>
          <p className="text-sm text-neutral-600 mb-4">
            Add a bank account to enable fund withdrawals
          </p>
          <Button onClick={() => setShowAddForm(true)}>
            Add Your First Bank Account
          </Button>
        </Card>
      )}

      {/* Info */}
      <Card className="p-6 bg-neutral-50">
        <h3 className="font-semibold mb-3">Important Information</h3>
        <ul className="space-y-2 text-sm text-neutral-600">
          <li>• Bank account must be in your name as per PAN card</li>
          <li>• Verification usually takes 1-2 business days</li>
          <li>• You can add multiple accounts but only one can be primary</li>
          <li>• Withdrawals will be processed to your primary account</li>
          <li>• Ensure IFSC code is correct to avoid transfer failures</li>
        </ul>
      </Card>
    </div>
  )
}
