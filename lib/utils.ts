import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency with proper locale and symbol
 */
export function formatCurrency(
  amount: number | string,
  currency: string = "INR",
  locale: string = "en-IN"
): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount)
}

/**
 * Format number with compact notation (1.2K, 1.5M, etc.)
 */
export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  }).format(num)
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`
}

/**
 * Format date/time relative to now (2 hours ago, 3 days ago, etc.)
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return then.toLocaleDateString()
}

/**
 * Format absolute date/time
 */
export function formatDateTime(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Date(date).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  })
}

/**
 * Get status color based on order status
 */
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    OPEN: "text-foreground",
    PENDING: "text-muted-foreground",
    FILLED: "text-foreground font-semibold",
    PARTIALLY_FILLED: "text-muted-foreground",
    CANCELLED: "text-error",
    REJECTED: "text-error",
  }
  return statusColors[status] || "text-muted-foreground"
}

/**
 * Get status badge variant
 */
export function getStatusBadgeVariant(status: string): "success" | "error" | "warning" | "default" {
  const variantMap: Record<string, "success" | "error" | "warning" | "default"> = {
    FILLED: "success",
    OPEN: "default",
    PENDING: "warning",
    CANCELLED: "error",
    REJECTED: "error",
    PARTIALLY_FILLED: "warning",
  }
  return variantMap[status] || "default"
}
