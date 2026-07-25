"use client"

import { useState } from "react"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { Search, Bell, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left: Logo + Menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="text-xl font-bold uppercase tracking-tight">
              TradeFlow
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 ml-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
            <Link href="/trade">
              <Button variant="ghost" size="sm">
                Trade
              </Button>
            </Link>
            <Link href="/portfolio">
              <Button variant="ghost" size="sm">
                Portfolio
              </Button>
            </Link>
            <Link href="/market">
              <Button variant="ghost" size="sm">
                Market
              </Button>
            </Link>
            <Link href="/alerts">
              <Button variant="ghost" size="sm">
                Alerts
              </Button>
            </Link>
          </nav>
        </div>

        {/* Right: Search + Notifications + User */}
        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="hidden md:block relative">
            <input
              type="text"
              placeholder="Search symbols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 h-9 px-3 pl-9 text-sm bg-muted border border-transparent rounded-sm focus:border-foreground focus:outline-none transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          {/* Mobile Search */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-foreground" />
          </Button>

          {/* User Menu */}
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
              },
            }}
          />
        </div>
      </div>
    </header>
  )
}
