"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface Watchlist {
  id: string
  name: string
  itemCount: number
  isPublic: boolean
}

interface WatchlistSidebarProps {
  userId: string
  watchlists: Watchlist[]
}

export function WatchlistSidebar({ userId, watchlists }: WatchlistSidebarProps) {
  const pathname = usePathname()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  return (
    <div className="w-64 border-r border-border bg-background">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            My Watchlists
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <nav className="p-2">
        {watchlists.map((watchlist) => {
          const isActive = pathname.includes(watchlist.id)
          
          return (
            <div key={watchlist.id} className="relative group">
              <Link href={`/watchlists/${watchlist.id}`}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start mb-1",
                    isActive && "bg-muted font-medium"
                  )}
                  size="sm"
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{watchlist.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {watchlist.itemCount}
                      </span>
                    </div>
                  </div>
                </Button>
              </Link>

              {/* Actions Menu */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveMenu(activeMenu === watchlist.id ? null : watchlist.id)
                  }}
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>

                {activeMenu === watchlist.id && (
                  <div className="absolute right-0 top-full mt-1 bg-background border border-border rounded-md shadow-lg py-1 z-10 min-w-[120px]">
                    <button className="w-full px-3 py-1.5 text-xs text-left hover:bg-muted flex items-center gap-2">
                      <Edit2 className="h-3 w-3" />
                      Rename
                    </button>
                    <button className="w-full px-3 py-1.5 text-xs text-left hover:bg-muted flex items-center gap-2 text-error">
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-foreground/20"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative bg-background border border-border rounded-md p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Watchlist</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="My Watchlist"
                  className="w-full h-10 px-3 text-sm bg-input border border-border rounded-sm focus:border-foreground focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="public" />
                <label htmlFor="public" className="text-sm">
                  Make public
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary">Create</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
