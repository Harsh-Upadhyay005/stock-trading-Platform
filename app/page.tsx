import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const { userId } = await auth()

  // If user is logged in, redirect to dashboard
  if (userId) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold uppercase tracking-tight">
            TradeFlow
          </div>
          <div className="flex items-center gap-2">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-16 text-center max-w-3xl">
          <h1 className="text-6xl font-bold mb-6">
            Trade Smarter,
            <br />
            Not Harder
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Professional stock trading platform with real-time market data,
            advanced charting, and seamless order execution. Start trading in minutes.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button variant="primary" size="lg">
                Start Trading
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="secondary" size="lg">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16 text-left">
            <div className="border border-border rounded-md p-6">
              <h3 className="font-semibold mb-2">Real-Time Data</h3>
              <p className="text-sm text-muted-foreground">
                Live market quotes and instant order execution for seamless trading experience.
              </p>
            </div>
            <div className="border border-border rounded-md p-6">
              <h3 className="font-semibold mb-2">Advanced Charts</h3>
              <p className="text-sm text-muted-foreground">
                Professional charting tools with technical indicators and drawing tools.
              </p>
            </div>
            <div className="border border-border rounded-md p-6">
              <h3 className="font-semibold mb-2">Zero Commission</h3>
              <p className="text-sm text-muted-foreground">
                Trade stocks with zero commission fees. Keep more of your profits.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © 2024 TradeFlow. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
