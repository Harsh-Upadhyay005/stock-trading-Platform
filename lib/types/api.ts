/**
 * TypeScript types for API responses
 */

// Market Types
export interface Quote {
  symbol: string
  name: string
  ltp: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface OHLCV {
  timestamp: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface SearchResult {
  symbol: string
  name: string
  exchange: string
  type: string
}

// Order Types
export interface Order {
  id: string
  accountId: string
  symbolId: string
  symbol: string
  name: string
  side: 'BUY' | 'SELL'
  type: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'STOP_LOSS_LIMIT'
  status: 'PENDING' | 'FILLED' | 'PARTIAL' | 'CANCELLED' | 'REJECTED'
  quantity: number
  filledQuantity: number
  price?: number
  avgPrice?: number
  stopLoss?: number
  target?: number
  placedAt: string
  executedAt?: string
  cancelledAt?: string
  rejectedAt?: string
  rejectionReason?: string
}

// Portfolio Types
export interface Holding {
  id: string
  symbol: string
  name: string
  quantity: number
  avgPrice: number
  ltp: number
  invested: number
  current: number
  pnl: number
  pnlPercent: number
  dayChange: number
  dayChangePercent: number
}

export interface Position {
  id: string
  symbol: string
  name: string
  quantity: number
  avgPrice: number
  ltp: number
  pnl: number
  pnlPercent: number
  dayChange: number
  dayChangePercent: number
}

export interface PortfolioSummary {
  totalInvested: number
  currentValue: number
  totalPnL: number
  totalPnLPercent: number
  dayPnL: number
  dayPnLPercent: number
  holdings: number
}

// Account Types
export interface UserProfile {
  id: string
  email: string
  name: string
  phone: string
  pan: string
  dateOfBirth: string
  address: string
  city: string
  state: string
  pincode: string
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
  riskProfile: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' | 'VERY_AGGRESSIVE'
}

export interface BankAccount {
  id: string
  bankName: string
  accountNumber: string
  ifsc: string
  accountType: 'SAVINGS' | 'CURRENT'
  isPrimary: boolean
  isVerified: boolean
  addedOn: string
}

export interface AccountBalance {
  total: number
  available: number
  used: number
  withdrawable: number
}

// Alert Types
export interface Alert {
  id: string
  symbolId: string
  symbol: string
  name: string
  condition: 'ABOVE' | 'BELOW'
  targetPrice: number
  currentPrice: number
  status: 'ACTIVE' | 'TRIGGERED' | 'EXPIRED'
  message?: string
  createdAt: string
  triggeredAt?: string
}

// Watchlist Types
export interface Watchlist {
  id: string
  name: string
  symbols: WatchlistSymbol[]
  createdAt: string
  updatedAt: string
}

export interface WatchlistSymbol {
  id: string
  symbol: string
  name: string
  ltp: number
  change: number
  changePercent: number
}

// Transaction Types
export interface Transaction {
  id: string
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRADE_CREDIT' | 'TRADE_DEBIT'
  amount: number
  method: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  reference: string
  date: string
}

// Activity Types
export interface Activity {
  id: string
  type: 'TRADE' | 'ACCOUNT' | 'SECURITY' | 'ALERT' | 'SYSTEM'
  action: string
  details: string
  timestamp: string
  status: 'SUCCESS' | 'FAILED' | 'PENDING'
  ip: string
  device: string
}

// Notification Types
export interface Notification {
  id: string
  type: 'ORDER' | 'ALERT' | 'SYSTEM' | 'MARKET' | 'ACCOUNT'
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

// Admin Types
export interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalOrders: number
  totalVolume: number
  revenue: number
  pendingKyc: number
}

export interface AdminUser {
  id: string
  name: string
  email: string
  phone: string
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE'
  balance: number
  joinedDate: string
  lastActive: string
  totalOrders: number
  totalVolume: number
}

export interface Instrument {
  id: string
  symbol: string
  name: string
  exchange: string
  segment: string
  isin: string
  lotSize: number
  tickSize: number
  status: 'ACTIVE' | 'SUSPENDED'
  tradable: boolean
  lastUpdated: string
}

// API Response Wrappers
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  success: false
  message: string
  errors?: Array<{
    field: string
    message: string
  }>
}
