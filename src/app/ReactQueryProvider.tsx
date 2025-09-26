'use client'

import React from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

function ReactQueryProvider({ children }: React.PropsWithChildren) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false, // Don't refetch on window focus to prevent loops
        staleTime: 0, // Always consider data stale
        refetchOnMount: true, // Refetch when component mounts
        refetchOnReconnect: false, // Don't refetch on reconnect to prevent loops
        gcTime: 1000, // Short cache time (1 second) instead of 0
        retry: false, // Don't retry failed requests
        refetchInterval: false, // Don't auto-refetch
        refetchIntervalInBackground: false, // Don't refetch in background
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default ReactQueryProvider
