"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { PageSkeleton } from "@/components/loading/page-skeleton"
import { ErrorMessage } from "@/components/error/error-message"

type Instrument = {
  id: string
  symbol: string
  name: string
  exchange: string
  segment: string
  isin: string | null
  lotSize: number
  tickSize: number
  tradable: boolean
  updatedAt: string
}

export default function AdminInstrumentsPage() {
  const [filter, setFilter] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-instruments', filter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filter === 'EQUITY') {
        params.append('segment', 'EQ')
      } else if (filter === 'OPTIONS') {
        params.append('segment', 'OPTIDX')
      } else if (filter === 'TRADABLE') {
        params.append('tradable', 'true')
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/admin/instruments?${params}`)
      if (!response.ok) throw new Error('Failed to fetch instruments')
      return response.json()
    },
  })

  const updateInstrumentMutation = useMutation({
    mutationFn: async ({ instrumentId, action }: { instrumentId: string; action: string }) => {
      const response = await fetch('/api/admin/instruments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instrumentId, action }),
      })
      if (!response.ok) throw new Error('Failed to update instrument')
      return response.json()
    },
    onSuccess: () => {
      toast.success('Instrument updated successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-instruments'] })
    },
    onError: (error: Error) => {
      toast.error(`Update failed: ${error.message}`)
    },
  })

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorMessage message="Failed to load instruments" />

  const instruments: Instrument[] = data?.instruments || []
  const filteredInstruments = instruments

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Instruments Management</h1>
        <p className="text-sm text-neutral-600 mt-1">
          Manage tradable instruments and their properties
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-neutral-600 mb-1">Total Instruments</div>
          <div className="text-2xl font-bold">{instruments.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 mb-1">Equity</div>
          <div className="text-2xl font-bold">
            {instruments.filter((i) => i.segment === "EQ").length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 mb-1">Options</div>
          <div className="text-2xl font-bold">
            {instruments.filter((i) => i.segment === "OPTIDX" || i.segment === "OPTSTK").length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 mb-1">Tradable</div>
          <div className="text-2xl font-bold">
            {instruments.filter((i) => i.tradable).length}
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
              All
            </Button>
            <Button
              variant={filter === "EQUITY" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("EQUITY")}
            >
              Equity
            </Button>
            <Button
              variant={filter === "OPTIONS" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("OPTIONS")}
            >
              Options
            </Button>
            <Button
              variant={filter === "TRADABLE" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("TRADABLE")}
            >
              Tradable
            </Button>
          </div>
          <div className="flex gap-2">
            <input
              type="search"
              placeholder="Search instruments..."
              className="px-3 py-2 border rounded-lg text-sm w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="outline" size="sm">
              + Add Instrument
            </Button>
            <Button variant="outline" size="sm">
              Sync from Exchange
            </Button>
          </div>
        </div>
      </Card>

      {/* Instruments Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-neutral-50">
              <tr>
                <th className="text-left p-4 font-semibold text-sm">Symbol</th>
                <th className="text-left p-4 font-semibold text-sm">Name</th>
                <th className="text-left p-4 font-semibold text-sm">
                  Exchange
                </th>
                <th className="text-left p-4 font-semibold text-sm">Segment</th>
                <th className="text-left p-4 font-semibold text-sm">ISIN</th>
                <th className="text-right p-4 font-semibold text-sm">
                  Lot Size
                </th>
                <th className="text-right p-4 font-semibold text-sm">
                  Tick Size
                </th>
                <th className="text-left p-4 font-semibold text-sm">Status</th>
                <th className="text-right p-4 font-semibold text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredInstruments.map((instrument) => (
                <tr
                  key={instrument.id}
                  className="hover:bg-neutral-50 transition-colors"
                >
                  <td className="p-4">
                    <div className="font-mono font-semibold">
                      {instrument.symbol}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="max-w-xs">
                      <div className="font-semibold truncate">
                        {instrument.name}
                      </div>
                      <div className="text-sm text-neutral-600">
                        Updated{" "}
                        {new Date(instrument.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline">{instrument.exchange}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge
                      className={
                        instrument.segment === "EQ"
                          ? "bg-black text-white"
                          : "bg-neutral-200"
                      }
                    >
                      {instrument.segment}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="font-mono text-sm">{instrument.isin || 'N/A'}</div>
                  </td>
                  <td className="p-4 text-right font-mono">
                    {instrument.lotSize}
                  </td>
                  <td className="p-4 text-right font-mono">
                    {instrument.tickSize}
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      {instrument.tradable ? (
                        <Badge variant="default">✓ Tradable</Badge>
                      ) : (
                        <Badge variant="outline">✗ Not Tradable</Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                      <select 
                        className="px-2 py-1 border rounded text-xs"
                        onChange={(e) => {
                          if (e.target.value) {
                            updateInstrumentMutation.mutate({
                              instrumentId: instrument.id,
                              action: e.target.value
                            })
                            e.target.value = ''
                          }
                        }}
                      >
                        <option value="">Actions</option>
                        {instrument.tradable ? (
                          <option value="DISABLE_TRADING">Disable Trading</option>
                        ) : (
                          <option value="ENABLE_TRADING">Enable Trading</option>
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
            Showing {filteredInstruments.length} of {instruments.length}{" "}
            instruments
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

      {/* Bulk Actions */}
      <Card className="p-6 bg-neutral-50">
        <h3 className="font-semibold mb-4">Bulk Operations</h3>
        <div className="flex gap-3">
          <Button variant="outline">Import CSV</Button>
          <Button variant="outline">Export All</Button>
          <Button variant="outline">Sync All from Exchange</Button>
          <Button variant="outline">Bulk Update</Button>
        </div>
      </Card>
    </div>
  )
}
