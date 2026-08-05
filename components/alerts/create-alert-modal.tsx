"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface CreateAlertModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateAlertModal({ isOpen, onClose }: CreateAlertModalProps) {
  const [symbol, setSymbol] = useState("")
  const [alertType, setAlertType] = useState("PRICE_ABOVE")
  const [targetValue, setTargetValue] = useState("")
  const [message, setMessage] = useState("")

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/20" onClick={onClose} />
      <div className="relative bg-background border border-border rounded-md p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Create Price Alert</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Symbol */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
              Symbol
            </label>
            <input
              type="text"
              placeholder="AAPL, TSLA, GOOGL..."
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full h-10 px-3 text-sm bg-input border border-border rounded-sm focus:border-foreground focus:outline-none"
            />
          </div>

          {/* Alert Type */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
              Alert Type
            </label>
            <select
              value={alertType}
              onChange={(e) => setAlertType(e.target.value)}
              className="w-full h-10 px-3 text-sm bg-input border border-border rounded-sm focus:border-foreground focus:outline-none"
            >
              <option value="PRICE_ABOVE">Price Above</option>
              <option value="PRICE_BELOW">Price Below</option>
              <option value="PERCENT_CHANGE">% Change</option>
              <option value="VOLUME_SPIKE">Volume Spike</option>
            </select>
          </div>

          {/* Target Value */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
              Target Value
            </label>
            <input
              type="number"
              placeholder={
                alertType === "PERCENT_CHANGE" ? "5" : "2500"
              }
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              className="w-full h-10 px-3 text-sm bg-input border border-border rounded-sm focus:border-foreground focus:outline-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {alertType === "PRICE_ABOVE" && "Alert when price goes above this value"}
              {alertType === "PRICE_BELOW" && "Alert when price goes below this value"}
              {alertType === "PERCENT_CHANGE" && "Alert when price changes by this %"}
              {alertType === "VOLUME_SPIKE" && "Alert when volume increases by this %"}
            </p>
          </div>

          {/* Message (Optional) */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
              Message (Optional)
            </label>
            <textarea
              placeholder="Custom alert message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm bg-input border border-border rounded-sm focus:border-foreground focus:outline-none resize-none"
            />
          </div>

          {/* Notification Channels */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
              Notify Via
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Email</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">SMS</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Push Notification</span>
              </label>
            </div>
          </div>

          {/* Expiration */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
              Expiration (Optional)
            </label>
            <input
              type="date"
              className="w-full h-10 px-3 text-sm bg-input border border-border rounded-sm focus:border-foreground focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary">Create Alert</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
