/**
 * Custom React Query hooks for data fetching
 * These hooks wrap the API client with React Query
 * Install: npm install @tanstack/react-query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api-client'

// Market Data Hooks
export function useMarketQuotes(symbols: string[]) {
  return useQuery({
    queryKey: ['market', 'quotes', symbols],
    queryFn: () => apiClient.market.getQuotes(symbols),
    enabled: symbols.length > 0,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  })
}

export function useSymbolSearch(query: string) {
  return useQuery({
    queryKey: ['market', 'search', query],
    queryFn: () => apiClient.market.searchSymbols(query),
    enabled: query.length > 2, // Only search if query is 3+ characters
  })
}

// Order Hooks
export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => apiClient.orders.getAll(),
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => apiClient.orders.getById(id),
    enabled: !!id,
  })
}

export function usePlaceOrder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: apiClient.orders.create,
    onSuccess: () => {
      // Invalidate orders list to refetch
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => apiClient.orders.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

// Portfolio Hooks
export function useHoldings(accountId: string) {
  return useQuery({
    queryKey: ['portfolio', 'holdings', accountId],
    queryFn: () => apiClient.portfolio.getHoldings(accountId),
    enabled: !!accountId,
  })
}

export function usePositions(accountId: string) {
  return useQuery({
    queryKey: ['portfolio', 'positions', accountId],
    queryFn: () => apiClient.portfolio.getPositions(accountId),
    enabled: !!accountId,
    refetchInterval: 5000, // Refetch every 5 seconds
  })
}

export function usePortfolioSummary(accountId: string) {
  return useQuery({
    queryKey: ['portfolio', 'summary', accountId],
    queryFn: () => apiClient.portfolio.getSummary(accountId),
    enabled: !!accountId,
  })
}

// Account Hooks
export function useProfile() {
  return useQuery({
    queryKey: ['account', 'profile'],
    queryFn: () => apiClient.account.getProfile(),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: apiClient.account.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'profile'] })
    },
  })
}

export function useBankAccounts() {
  return useQuery({
    queryKey: ['account', 'bankAccounts'],
    queryFn: () => apiClient.account.getBankAccounts(),
  })
}

export function useKYCStatus() {
  return useQuery({
    queryKey: ['account', 'kyc'],
    queryFn: () => apiClient.account.getKYCStatus(),
  })
}

export function useAccountBalance(accountId: string) {
  return useQuery({
    queryKey: ['account', 'balance', accountId],
    queryFn: () => apiClient.account.getBalance(accountId),
    enabled: !!accountId,
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

// Alert Hooks
export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: () => apiClient.alerts.getAll(),
  })
}

export function useCreateAlert() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: apiClient.alerts.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}

export function useDeleteAlert() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => apiClient.alerts.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}

// Watchlist Hooks
export function useWatchlists() {
  return useQuery({
    queryKey: ['watchlists'],
    queryFn: () => apiClient.watchlists.getAll(),
  })
}

export function useWatchlist(id: string) {
  return useQuery({
    queryKey: ['watchlists', id],
    queryFn: () => apiClient.watchlists.getById(id),
    enabled: !!id,
  })
}

export function useCreateWatchlist() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: apiClient.watchlists.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] })
    },
  })
}

// Funds Hooks
export function useFundsTransactions(accountId: string) {
  return useQuery({
    queryKey: ['funds', 'transactions', accountId],
    queryFn: () => apiClient.funds.getTransactions(accountId),
    enabled: !!accountId,
  })
}

export function useDepositFunds() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: apiClient.funds.deposit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funds'] })
      queryClient.invalidateQueries({ queryKey: ['account', 'balance'] })
    },
  })
}

// Activity Hooks
export function useActivityLog(params?: { type?: string; limit?: number }) {
  return useQuery({
    queryKey: ['activity', params],
    queryFn: () => apiClient.activity.getLog(params),
  })
}

// Notification Hooks
export function useNotifications(unread?: boolean) {
  return useQuery({
    queryKey: ['notifications', { unread }],
    queryFn: () => apiClient.notifications.getAll({ unread }),
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => apiClient.notifications.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

// Admin Hooks
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => apiClient.admin.getStats(),
  })
}

export function useAdminUsers(params?: { status?: string; kycStatus?: string }) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => apiClient.admin.getUsers(params),
  })
}

export function useAdminInstruments(params?: { exchange?: string; segment?: string }) {
  return useQuery({
    queryKey: ['admin', 'instruments', params],
    queryFn: () => apiClient.admin.getInstruments(params),
  })
}
