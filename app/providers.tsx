'use client'

/**
 * React Query Provider
 * Wraps the app with QueryClientProvider for data fetching
 * Install: npm install @tanstack/react-query @tanstack/react-query-devtools
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: Data is considered fresh for 1 minute
            staleTime: 60 * 1000,
            // Retry failed requests 3 times
            retry: 3,
            // Don't refetch on window focus (can be enabled per-query)
            refetchOnWindowFocus: false,
            // Don't refetch on reconnect (can be enabled per-query)
            refetchOnReconnect: false,
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query Devtools - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  )
}
