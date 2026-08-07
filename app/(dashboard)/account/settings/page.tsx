"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { useAccountSettings, useUpdateAccountSettings } from "@/lib/hooks/use-queries"
import { TableSkeleton } from "@/components/loading/table-skeleton"
import { ErrorMessage } from "@/components/error/error-message"
import { toast } from "sonner"

export default function SettingsPage() {
  const { data: settings, isLoading, error, refetch } = useAccountSettings("user-id") // TODO: Get from auth context
  const updateMutation = useUpdateAccountSettings()
  
  const [notifications, setNotifications] = useState({
    email: {
      orderExecutions: true,
      priceAlerts: true,
      marginCalls: true,
      newsletter: false,
    },
    sms: {
      orderExecutions: true,
      priceAlerts: false,
      marginCalls: true,
    },
    push: {
      orderExecutions: true,
      priceAlerts: true,
      marginCalls: true,
    },
  })

  const [security, setSecurity] = useState({
    twoFactorAuth: true,
    biometric: false,
    sessionTimeout: "30",
  })
  
  // Load settings when data is available
  useEffect(() => {
    if (settings) {
      if (settings.notifications) setNotifications(settings.notifications)
      if (settings.security) setSecurity(settings.security)
    }
  }, [settings])
  
  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ notifications, security })
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    }
  }
  
  if (isLoading) {
    return <TableSkeleton />
  }
  
  if (error) {
    return <ErrorMessage error={error} retry={refetch} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-neutral-600 mt-1">
          Manage your account preferences and security
        </p>
      </div>

      {/* Account Information */}
      <Card>
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Account Information</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">User ID</div>
              <div className="text-sm text-neutral-600 mt-1 font-mono">
                TF123456
              </div>
            </div>
            <Badge variant="outline">Active</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Account Type</div>
              <div className="text-sm text-neutral-600 mt-1">
                Individual Trading Account
              </div>
            </div>
            <Button variant="ghost" size="sm">
              Upgrade
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Member Since</div>
              <div className="text-sm text-neutral-600 mt-1">
                January 2024
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Security Settings */}
      <Card>
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Security & Privacy</h2>
        </div>
        <div className="divide-y">
          <div className="p-6 flex items-center justify-between">
            <div>
              <div className="font-semibold">Two-Factor Authentication</div>
              <div className="text-sm text-neutral-600 mt-1">
                Add an extra layer of security to your account
              </div>
            </div>
            <Button
              variant={security.twoFactorAuth ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setSecurity({
                  ...security,
                  twoFactorAuth: !security.twoFactorAuth,
                })
              }
            >
              {security.twoFactorAuth ? "Enabled" : "Disabled"}
            </Button>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div>
              <div className="font-semibold">Biometric Login</div>
              <div className="text-sm text-neutral-600 mt-1">
                Use fingerprint or face ID to login
              </div>
            </div>
            <Button
              variant={security.biometric ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setSecurity({ ...security, biometric: !security.biometric })
              }
            >
              {security.biometric ? "Enabled" : "Disabled"}
            </Button>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div>
              <div className="font-semibold">Session Timeout</div>
              <div className="text-sm text-neutral-600 mt-1">
                Automatically log out after inactivity
              </div>
            </div>
            <select
              className="px-3 py-2 border rounded-lg text-sm"
              value={security.sessionTimeout}
              onChange={(e) =>
                setSecurity({ ...security, sessionTimeout: e.target.value })
              }
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="never">Never</option>
            </select>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div>
              <div className="font-semibold">Change Password</div>
              <div className="text-sm text-neutral-600 mt-1">
                Last changed 30 days ago
              </div>
            </div>
            <Button variant="outline" size="sm">
              Change
            </Button>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div>
              <div className="font-semibold">Active Sessions</div>
              <div className="text-sm text-neutral-600 mt-1">
                3 devices currently logged in
              </div>
            </div>
            <Button variant="outline" size="sm">
              Manage
            </Button>
          </div>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Notification Preferences</h2>
        </div>

        {/* Email Notifications */}
        <div className="p-6 border-b">
          <h3 className="font-semibold mb-4">Email Notifications</h3>
          <div className="space-y-3">
            {Object.entries(notifications.email).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between">
                <span className="text-sm">
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() =>
                    setNotifications({
                      ...notifications,
                      email: { ...notifications.email, [key]: !value },
                    })
                  }
                  className="w-4 h-4"
                />
              </label>
            ))}
          </div>
        </div>

        {/* SMS Notifications */}
        <div className="p-6 border-b">
          <h3 className="font-semibold mb-4">SMS Notifications</h3>
          <div className="space-y-3">
            {Object.entries(notifications.sms).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between">
                <span className="text-sm">
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() =>
                    setNotifications({
                      ...notifications,
                      sms: { ...notifications.sms, [key]: !value },
                    })
                  }
                  className="w-4 h-4"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Push Notifications */}
        <div className="p-6">
          <h3 className="font-semibold mb-4">Push Notifications</h3>
          <div className="space-y-3">
            {Object.entries(notifications.push).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between">
                <span className="text-sm">
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() =>
                    setNotifications({
                      ...notifications,
                      push: { ...notifications.push, [key]: !value },
                    })
                  }
                  className="w-4 h-4"
                />
              </label>
            ))}
          </div>
        </div>
      </Card>

      {/* Trading Preferences */}
      <Card>
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Trading Preferences</h2>
        </div>
        <div className="divide-y">
          <div className="p-6 flex items-center justify-between">
            <div>
              <div className="font-semibold">Default Order Type</div>
              <div className="text-sm text-neutral-600 mt-1">
                Pre-fill order forms with this type
              </div>
            </div>
            <select className="px-3 py-2 border rounded-lg text-sm">
              <option>Market</option>
              <option>Limit</option>
              <option>Stop Loss</option>
            </select>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div>
              <div className="font-semibold">Order Confirmation</div>
              <div className="text-sm text-neutral-600 mt-1">
                Require confirmation before placing orders
              </div>
            </div>
            <Button variant="default" size="sm">
              Enabled
            </Button>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div>
              <div className="font-semibold">Chart Type</div>
              <div className="text-sm text-neutral-600 mt-1">
                Default chart style for market data
              </div>
            </div>
            <select className="px-3 py-2 border rounded-lg text-sm">
              <option>Candlestick</option>
              <option>Line</option>
              <option>Bar</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Data & Privacy</h2>
        </div>
        <div className="p-6 space-y-4">
          <Button variant="outline" className="w-full justify-start">
            Download My Data
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Export Trading History
          </Button>
          <Button variant="outline" className="w-full justify-start text-red-600">
            Delete Account
          </Button>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button className="flex-1">Save Changes</Button>
        <Button variant="outline">Cancel</Button>
      </div>
    </div>
  )
}
