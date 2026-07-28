import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye, Download } from "lucide-react"

interface PortfolioHeaderProps {
  userId: string
}

export async function PortfolioHeader({ userId }: PortfolioHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-semibold">Portfolio</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Comprehensive portfolio analysis and performance tracking
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/portfolio/holdings">
          <Button variant="primary">
            <Eye className="h-4 w-4 mr-2" />
            View Holdings
          </Button>
        </Link>
        <Button variant="ghost">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  )
}
