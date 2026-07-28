import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDateTime } from "@/lib/utils"

interface RecentActivityProps {
  userId: string
}

async function getRecentActivity(userId: string) {
  // Mock data
  return [
    {
      id: "1",
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: "BUY",
      symbol: "AAPL",
      amount: -184500,
      balance: 1245680,
    },
    {
      id: "2",
      date: new Date(Date.now() - 5 * 60 * 60 * 1000),
      type: "SELL",
      symbol: "TSLA",
      amount: 760000,
      balance: 1430180,
    },
    {
      id: "3",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      type: "DEPOSIT",
      symbol: null,
      amount: 100000,
      balance: 670180,
    },
    {
      id: "4",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      type: "DIVIDEND",
      symbol: "MSFT",
      amount: 2400,
      balance: 570180,
    },
    {
      id: "5",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      type: "BUY",
      symbol: "GOOGL",
      amount: -70000,
      balance: 567780,
    },
    {
      id: "6",
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      type: "SELL",
      symbol: "AMZN",
      amount: 34500,
      balance: 637780,
    },
    {
      id: "7",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      type: "WITHDRAWAL",
      symbol: null,
      amount: -50000,
      balance: 603280,
    },
    {
      id: "8",
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      type: "BUY",
      symbol: "NVDA",
      amount: -90000,
      balance: 653280,
    },
    {
      id: "9",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      type: "DIVIDEND",
      symbol: "AAPL",
      amount: 1200,
      balance: 743280,
    },
    {
      id: "10",
      date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      type: "SELL",
      symbol: "META",
      amount: 48500,
      balance: 742080,
    },
  ]
}

export async function RecentActivity({ userId }: RecentActivityProps) {
  const activities = await getRecentActivity(userId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Balance After</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="text-xs">
                  {formatDateTime(activity.date, { month: "short", day: "numeric" })}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      activity.type === "BUY"
                        ? "success"
                        : activity.type === "SELL"
                        ? "default"
                        : activity.type === "DEPOSIT" || activity.type === "DIVIDEND"
                        ? "success"
                        : "warning"
                    }
                  >
                    {activity.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {activity.symbol ? (
                    <span className="font-semibold">{activity.symbol}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell
                  className={activity.amount >= 0 ? "" : "text-error"}
                >
                  {activity.amount >= 0 && "+"}
                  {formatCurrency(activity.amount)}
                </TableCell>
                <TableCell>{formatCurrency(activity.balance)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
