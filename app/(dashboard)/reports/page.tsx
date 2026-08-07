"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useReports } from "@/lib/hooks/use-queries"
import { TableSkeleton } from "@/components/loading/table-skeleton"
import { ErrorMessage } from "@/components/error/error-message"

export default function ReportsPage() {
  // Fetch reports data
  const { data, isLoading, error, refetch } = useReports("user-id") // TODO: Get from auth context
  
  if (isLoading) {
    return <TableSkeleton />
  }
  
  if (error) {
    return <ErrorMessage error={error} retry={refetch} />
  }
  
  const tradingSummary = data?.tradingSummary || {
    totalTrades: 0,
    profitableTrades: 0,
    losingTrades: 0,
    winRate: 0,
    totalProfit: 0,
    totalLoss: 0,
    netProfit: 0,
    avgProfit: 0,
    avgLoss: 0,
    largestWin: 0,
    largestLoss: 0,
  }

  const taxSummary = data?.taxSummary || {
    shortTermGains: 0,
    longTermGains: 0,
    totalGains: 0,
    stcgTax: 0,
    ltcgTax: 0,
    totalTax: 0,
    transactions: 0,
  }

  const monthlyData = data?.monthlyPerformance || []
  const reports = data?.generatedReports || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-sm text-neutral-600 mt-1">
            View your trading performance and tax reports
          </p>
        </div>
        <div className="flex gap-2">
          <select className="px-4 py-2 border rounded-lg text-sm">
            <option>FY 2023-24</option>
            <option>FY 2022-23</option>
            <option>FY 2021-22</option>
          </select>
          <Button variant="outline" size="sm">
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="trading" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="tax">Tax</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        {/* Trading Tab */}
        <TabsContent value="trading" className="space-y-6">
          {/* Trading Summary */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="text-sm text-neutral-600 mb-2">Total Trades</div>
              <div className="text-3xl font-bold">
                {tradingSummary.totalTrades}
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-neutral-600 mb-2">Win Rate</div>
              <div className="text-3xl font-bold">
                {tradingSummary.winRate.toFixed(1)}%
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-neutral-600 mb-2">Net P&L</div>
              <div className="text-3xl font-bold text-green-600">
                +₹{tradingSummary.netProfit.toLocaleString()}
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-neutral-600 mb-2">Avg Profit</div>
              <div className="text-3xl font-bold">
                ₹{tradingSummary.avgProfit.toFixed(0)}
              </div>
            </Card>
          </div>

          {/* Detailed Stats */}
          <Card>
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Performance Metrics</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Profitable Trades</span>
                    <span className="font-mono font-semibold">
                      {tradingSummary.profitableTrades}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Losing Trades</span>
                    <span className="font-mono font-semibold">
                      {tradingSummary.losingTrades}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Total Profit</span>
                    <span className="font-mono font-semibold text-green-600">
                      +₹{tradingSummary.totalProfit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Total Loss</span>
                    <span className="font-mono font-semibold text-red-600">
                      ₹{tradingSummary.totalLoss.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Average Profit</span>
                    <span className="font-mono font-semibold">
                      ₹{tradingSummary.avgProfit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Average Loss</span>
                    <span className="font-mono font-semibold">
                      ₹{tradingSummary.avgLoss.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Largest Win</span>
                    <span className="font-mono font-semibold text-green-600">
                      ₹{tradingSummary.largestWin.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Largest Loss</span>
                    <span className="font-mono font-semibold text-red-600">
                      ₹{tradingSummary.largestLoss.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Monthly Performance */}
          <Card>
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Monthly Performance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-neutral-50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Month</th>
                    <th className="text-right p-4 font-semibold">Trades</th>
                    <th className="text-right p-4 font-semibold">P&L</th>
                    <th className="text-right p-4 font-semibold">Return %</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {monthlyData.map((row, index) => (
                    <tr key={index} className="hover:bg-neutral-50">
                      <td className="p-4">{row.month}</td>
                      <td className="p-4 text-right font-mono">{row.trades}</td>
                      <td
                        className={`p-4 text-right font-mono font-semibold ${
                          row.profit >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {row.profit >= 0 ? "+" : ""}₹
                        {row.profit.toLocaleString()}
                      </td>
                      <td
                        className={`p-4 text-right font-mono font-semibold ${
                          row.return >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {row.return >= 0 ? "+" : ""}
                        {row.return.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Tax Tab */}
        <TabsContent value="tax" className="space-y-6">
          {/* Tax Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="text-sm text-neutral-600 mb-2">Total Gains</div>
              <div className="text-3xl font-bold">
                ₹{taxSummary.totalGains.toLocaleString()}
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-neutral-600 mb-2">
                Estimated Tax
              </div>
              <div className="text-3xl font-bold text-red-600">
                ₹{taxSummary.totalTax.toLocaleString()}
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-neutral-600 mb-2">Transactions</div>
              <div className="text-3xl font-bold">
                {taxSummary.transactions}
              </div>
            </Card>
          </div>

          {/* Tax Breakdown */}
          <Card>
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Tax Breakdown (FY 2023-24)</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* STCG */}
              <div>
                <h3 className="font-semibold mb-3">
                  Short Term Capital Gains (STCG)
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Total STCG</span>
                    <span className="font-mono font-semibold">
                      ₹{taxSummary.shortTermGains.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Tax Rate</span>
                    <span className="font-mono">15%</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Tax Liability</span>
                    <span className="font-mono font-semibold text-red-600">
                      ₹{taxSummary.stcgTax.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* LTCG */}
              <div>
                <h3 className="font-semibold mb-3">
                  Long Term Capital Gains (LTCG)
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Total LTCG</span>
                    <span className="font-mono font-semibold">
                      ₹{taxSummary.longTermGains.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">
                      Tax Rate (above ₹1L)
                    </span>
                    <span className="font-mono">10%</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Tax Liability</span>
                    <span className="font-mono font-semibold text-red-600">
                      ₹{taxSummary.ltcgTax.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t">
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total Tax Liability</span>
                  <span className="font-mono font-bold text-red-600">
                    ₹{taxSummary.totalTax.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-6 bg-neutral-50">
            <h3 className="font-semibold mb-4">Tax Report Actions</h3>
            <div className="flex gap-3">
              <Button>Download PDF</Button>
              <Button variant="outline">Export to Excel</Button>
              <Button variant="outline">Email to CA</Button>
            </div>
            <p className="text-sm text-neutral-600 mt-4">
              ⚠️ This is an estimated tax calculation. Please consult with a tax
              professional for accurate filing.
            </p>
          </Card>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4 opacity-20">📊</div>
            <h3 className="text-lg font-semibold mb-2">
              Portfolio Reports Coming Soon
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              Detailed portfolio analytics and insights will be available here
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generated Reports */}
      <Card>
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Generated Reports</h2>
        </div>
        <div className="divide-y">
          {reports.map((report) => (
            <div
              key={report.id}
              className="p-6 hover:bg-neutral-50 transition-colors flex items-center justify-between"
            >
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{report.name}</h3>
                <div className="text-sm text-neutral-600">
                  {report.period} • Generated on{" "}
                  {new Date(report.generated).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge>{report.type}</Badge>
                <Badge className="bg-black text-white">{report.status}</Badge>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
