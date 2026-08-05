// ============================================================
// app/api/reports/route.ts — GET
// ============================================================
import { type NextRequest } from "next/server"
import { requireAuth, AuthError } from "@/lib/auth"
import { ok, unauthorized, forbidden, serverError } from "@/utils/response"
import { withRateLimit } from "@/utils/rate-limit-middleware"
import { db } from "@/lib/db"
import { logger } from "@/utils/logger"

export const GET = withRateLimit(
  async (req: NextRequest) => {
    try {
      const user = await requireAuth()
      
      // Get trading summary
      const orders = await db.order.findMany({
        where: {
          account: {
            userId: user.id,
          },
          status: 'FILLED',
        },
        select: {
          side: true,
          quantity: true,
          avgFillPrice: true,
          createdAt: true,
        },
      })

      // Calculate P&L and statistics
      const totalTrades = orders.length
      let totalProfit = 0
      let totalLoss = 0
      let profitableTrades = 0
      let losingTrades = 0
      let largestWin = 0
      let largestLoss = 0

      // Group by month for monthly performance
      const monthlyData: Record<string, { trades: number; profit: number }> = {}

      orders.forEach((order) => {
        // Simplified P&L calculation (would need more complex logic in real app)
        const pnl = Math.random() * 1000 - 500 // Mock P&L
        
        if (pnl > 0) {
          totalProfit += pnl
          profitableTrades++
          if (pnl > largestWin) largestWin = pnl
        } else {
          totalLoss += Math.abs(pnl)
          losingTrades++
          if (Math.abs(pnl) > Math.abs(largestLoss)) largestLoss = pnl
        }

        // Group by month
        const monthKey = new Date(order.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        })
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { trades: 0, profit: 0 }
        }
        monthlyData[monthKey].trades++
        monthlyData[monthKey].profit += pnl
      })

      const netProfit = totalProfit - totalLoss
      const winRate = totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0
      const avgProfit = profitableTrades > 0 ? totalProfit / profitableTrades : 0
      const avgLoss = losingTrades > 0 ? totalLoss / losingTrades : 0

      // Monthly performance array
      const monthlyPerformance = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        trades: data.trades,
        profit: data.profit,
        return: data.profit / 100000 * 100, // Assuming 1L capital
      }))

      // Tax summary (simplified)
      const taxSummary = {
        shortTermGains: netProfit * 0.7, // Assume 70% short term
        longTermGains: netProfit * 0.3, // Assume 30% long term
        totalGains: netProfit,
        stcgTax: netProfit * 0.7 * 0.15, // 15% STCG
        ltcgTax: Math.max(0, netProfit * 0.3 - 100000) * 0.10, // 10% LTCG above 1L
        totalTax: 0,
        transactions: totalTrades,
      }
      taxSummary.totalTax = taxSummary.stcgTax + taxSummary.ltcgTax

      return ok({
        tradingSummary: {
          totalTrades,
          profitableTrades,
          losingTrades,
          winRate,
          totalProfit,
          totalLoss,
          netProfit,
          avgProfit,
          avgLoss,
          largestWin,
          largestLoss,
        },
        taxSummary,
        monthlyPerformance,
        generatedReports: [], // Placeholder for saved reports
      })
    } catch (err) {
      if (err instanceof AuthError) {
        return err.status === 401 ? unauthorized() : forbidden(err.code)
      }
      logger.error({ err }, "GET /api/reports error")
      return serverError()
    }
  },
  { preset: "authenticated" }
)
