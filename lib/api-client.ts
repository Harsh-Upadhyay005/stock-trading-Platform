/**
 * API Client for TradeFlow Backend
 * Handles all HTTP requests to backend APIs
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options

    // Build URL with query params
    let url = `${this.baseUrl}${endpoint}`
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value))
      })
      url += `?${searchParams.toString()}`
    }

    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || 'Request failed')
      }

      return response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Market Data APIs
  market = {
    getQuotes: (symbols: string[]) =>
      this.request('/market/quotes', {
        params: { tickers: symbols.join(',') },
      }),

    getOHLCV: (symbol: string, interval: string = '1d', limit: number = 100) =>
      this.request('/market/ohlcv', {
        params: { symbol, interval, limit },
      }),

    searchSymbols: (query: string) =>
      this.request('/market/search', {
        params: { q: query },
      }),
  }

  // Order APIs
  orders = {
    getAll: () => this.request('/orders'),

    getById: (id: string) => this.request(`/orders/${id}`),

    create: (data: {
      accountId: string
      symbolId: string
      side: 'BUY' | 'SELL'
      type: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'STOP_LOSS_LIMIT'
      quantity: number
      price?: number
      stopLoss?: number
      target?: number
    }) =>
      this.request('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    cancel: (id: string) =>
      this.request(`/orders/${id}`, {
        method: 'DELETE',
      }),
  }

  // Portfolio APIs
  portfolio = {
    getHoldings: (accountId: string) =>
      this.request('/portfolio/holdings', {
        params: { accountId },
      }),

    getPositions: (accountId: string) =>
      this.request('/portfolio/positions', {
        params: { accountId },
      }),

    getSummary: (accountId: string) =>
      this.request('/portfolio/summary', {
        params: { accountId },
      }),
  }

  // Account APIs
  account = {
    getProfile: () => this.request('/account/profile'),

    updateProfile: (data: any) =>
      this.request('/account/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    getBankAccounts: () => this.request('/account/bank-accounts'),

    addBankAccount: (data: any) =>
      this.request('/account/bank-accounts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getKYCStatus: () => this.request('/account/kyc'),

    getBalance: (accountId: string) =>
      this.request('/account/balance', {
        params: { accountId },
      }),
  }

  // Alert APIs
  alerts = {
    getAll: () => this.request('/alerts'),

    getById: (id: string) => this.request(`/alerts/${id}`),

    create: (data: {
      symbolId: string
      condition: 'ABOVE' | 'BELOW'
      targetPrice: number
      message?: string
    }) =>
      this.request('/alerts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: any) =>
      this.request(`/alerts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      this.request(`/alerts/${id}`, {
        method: 'DELETE',
      }),
  }

  // Watchlist APIs
  watchlists = {
    getAll: () => this.request('/watchlists'),

    getById: (id: string) => this.request(`/watchlists/${id}`),

    create: (data: { name: string }) =>
      this.request('/watchlists', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    addSymbol: (watchlistId: string, symbolId: string) =>
      this.request(`/watchlists/${watchlistId}/symbols`, {
        method: 'POST',
        body: JSON.stringify({ symbolId }),
      }),

    removeSymbol: (watchlistId: string, symbolId: string) =>
      this.request(`/watchlists/${watchlistId}/symbols/${symbolId}`, {
        method: 'DELETE',
      }),

    delete: (id: string) =>
      this.request(`/watchlists/${id}`, {
        method: 'DELETE',
      }),
  }

  // Admin APIs
  admin = {
    getStats: () => this.request('/admin/stats'),

    getUsers: (params?: { status?: string; kycStatus?: string }) =>
      this.request('/admin/users', { params }),

    updateUser: (userId: string, data: any) =>
      this.request(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    getInstruments: (params?: { exchange?: string; segment?: string }) =>
      this.request('/admin/instruments', { params }),

    updateInstrument: (id: string, data: any) =>
      this.request(`/admin/instruments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  }

  // Funds APIs
  funds = {
    getTransactions: (accountId: string) =>
      this.request('/funds/transactions', {
        params: { accountId },
      }),

    deposit: (data: {
      accountId: string
      amount: number
      method: string
    }) =>
      this.request('/funds/deposit', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    withdraw: (data: {
      accountId: string
      amount: number
      bankAccountId: string
    }) =>
      this.request('/funds/withdraw', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  }

  // Activity APIs
  activity = {
    getLog: (params?: { type?: string; limit?: number }) =>
      this.request('/activity', { params }),
  }

  // Notifications APIs
  notifications = {
    getAll: (params?: { unread?: boolean }) =>
      this.request('/notifications', { params }),

    markAsRead: (id: string) =>
      this.request(`/notifications/${id}/read`, {
        method: 'POST',
      }),

    markAllAsRead: () =>
      this.request('/notifications/read-all', {
        method: 'POST',
      }),
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
