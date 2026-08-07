"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { PageSkeleton } from "@/components/loading/page-skeleton"
import { ErrorMessage } from "@/components/error/error-message"

type User = {
  id: string
  name: string
  email: string
  phone: string | null
  kycStatus: string
  accountStatus: string
  balance: number
  joinedDate: string
  lastActive: string | null
  totalOrders: number
  totalVolume: number
}

export default function AdminUsersPage() {
  const [filter, setFilter] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users', filter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filter !== 'ALL') {
        if (['ACTIVE', 'SUSPENDED', 'INACTIVE'].includes(filter)) {
          params.append('status', filter)
        } else {
          params.append('kycStatus', filter)
        }
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/admin/users?${params}`)
      if (!response.ok) throw new Error('Failed to fetch users')
      return response.json()
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: string }) => {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId, action }),
      })
      if (!response.ok) throw new Error('Failed to update user')
      return response.json()
    },
    onSuccess: () => {
      toast.success('User updated successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (error: Error) => {
      toast.error(`Update failed: ${error.message}`)
    },
  })

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorMessage message="Failed to load users" />

  const users: User[] = data?.users || []
  const filteredUsers =
    filter === "ALL"
      ? users
      : users.filter((u) => u.accountStatus === filter || u.kycStatus === filter)

  const getKycBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <Badge className="bg-black text-white">Verified</Badge>
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>
      case "REJECTED":
        return <Badge className="bg-neutral-200">Rejected</Badge>
      default:
        return null
    }
  }

  const getAccountBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="outline">● Active</Badge>
      case "SUSPENDED":
        return <Badge className="bg-neutral-200">◌ Suspended</Badge>
      case "INACTIVE":
        return <Badge variant="outline">◌ Inactive</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-sm text-neutral-600 mt-1">
          View and manage all platform users
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-neutral-600 mb-1">Total Users</div>
          <div className="text-2xl font-bold">{users.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 mb-1">Active</div>
          <div className="text-2xl font-bold">
            {users.filter((u) => u.accountStatus === "ACTIVE").length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 mb-1">Pending KYC</div>
          <div className="text-2xl font-bold">
            {users.filter((u) => u.kycStatus === "PENDING").length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 mb-1">Suspended</div>
          <div className="text-2xl font-bold">
            {users.filter((u) => u.accountStatus === "SUSPENDED").length}
          </div>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={filter === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("ALL")}
            >
              All Users
            </Button>
            <Button
              variant={filter === "ACTIVE" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("ACTIVE")}
            >
              Active
            </Button>
            <Button
              variant={filter === "PENDING" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("PENDING")}
            >
              Pending KYC
            </Button>
            <Button
              variant={filter === "SUSPENDED" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("SUSPENDED")}
            >
              Suspended
            </Button>
          </div>
          <div className="flex gap-2">
            <input
              type="search"
              placeholder="Search users..."
              className="px-3 py-2 border rounded-lg text-sm w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-neutral-50">
              <tr>
                <th className="text-left p-4 font-semibold text-sm">User</th>
                <th className="text-left p-4 font-semibold text-sm">Contact</th>
                <th className="text-left p-4 font-semibold text-sm">Status</th>
                <th className="text-right p-4 font-semibold text-sm">Balance</th>
                <th className="text-right p-4 font-semibold text-sm">Orders</th>
                <th className="text-right p-4 font-semibold text-sm">Volume</th>
                <th className="text-left p-4 font-semibold text-sm">
                  Last Active
                </th>
                <th className="text-right p-4 font-semibold text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-neutral-50 transition-colors"
                >
                  <td className="p-4">
                    <div>
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-sm text-neutral-600">
                        Joined {new Date(user.joinedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div>{user.email}</div>
                      <div className="text-neutral-600">{user.phone || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      {getKycBadge(user.kycStatus)}
                      {getAccountBadge(user.accountStatus)}
                    </div>
                  </td>
                  <td className="p-4 text-right font-mono">
                    ₹{user.balance.toLocaleString()}
                  </td>
                  <td className="p-4 text-right font-mono">
                    {user.totalOrders}
                  </td>
                  <td className="p-4 text-right font-mono">
                    ₹{(user.totalVolume / 100000).toFixed(1)}L
                  </td>
                  <td className="p-4 text-sm text-neutral-600">
                    {user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Never'}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                      <select 
                        className="px-2 py-1 border rounded text-xs"
                        onChange={(e) => {
                          if (e.target.value) {
                            updateUserMutation.mutate({
                              userId: user.id,
                              action: e.target.value
                            })
                            e.target.value = ''
                          }
                        }}
                      >
                        <option value="">Actions</option>
                        {user.accountStatus !== 'SUSPENDED' && (
                          <option value="SUSPEND">Suspend Account</option>
                        )}
                        {user.accountStatus !== 'ACTIVE' && (
                          <option value="ACTIVATE">Activate Account</option>
                        )}
                        {user.kycStatus === 'PENDING' && (
                          <>
                            <option value="VERIFY_KYC">Verify KYC</option>
                            <option value="REJECT_KYC">Reject KYC</option>
                          </>
                        )}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t flex items-center justify-between">
          <div className="text-sm text-neutral-600">
            Showing {filteredUsers.length} of {users.length} users
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
