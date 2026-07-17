import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"

interface HoldingsHeaderProps {
  userId: string
}

export async function HoldingsHeader({ userId }: HoldingsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/portfolio">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-semibold">Holdings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Detailed view of your current positions
          </p>
        </div>
      </div>

      <Button variant="ghost">
        <Download className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
    </div>
  )
}
