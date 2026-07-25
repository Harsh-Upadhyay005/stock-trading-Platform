"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Wallet,
  LineChart,
  Star,
  Bell,
  User,
  CreditCard,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  className?: string
}

const menuItems = [
  {
    title: "MENU",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      { icon: TrendingUp, label: "Trade", href: "/trade" },
      { icon: Package, label: "Orders", href: "/orders" },
      { icon: Wallet, label: "Portfolio", href: "/portfolio" },
      { icon: LineChart, label: "Market", href: "/market" },
      { icon: Star, label: "Watchlists", href: "/watchlists" },
      { icon: Bell, label: "Alerts", href: "/alerts" },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      { icon: User, label: "Profile", href: "/account/profile" },
      { icon: CreditCard, label: "Banking", href: "/account/banking" },
      { icon: FileText, label: "KYC", href: "/account/kyc" },
      { icon: Settings, label: "Settings", href: "/account/settings" },
    ],
  },
]

export function Sidebar({ collapsed, onToggle, className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] border-r border-border bg-background transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-60",
        className
      )}
    >
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((section, idx) => (
            <div key={idx} className="mb-6">
              {!collapsed && (
                <div className="px-4 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {section.title}
                  </span>
                </div>
              )}
              <div className="space-y-1 px-2">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                  
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3",
                          collapsed && "justify-center px-2",
                          isActive && "bg-muted font-medium"
                        )}
                        size="sm"
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {!collapsed && (
                          <span className="text-sm">{item.label}</span>
                        )}
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={onToggle}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span className="ml-2 text-sm">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  )
}
