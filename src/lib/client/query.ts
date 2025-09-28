import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { getConfig } from '@/lib/client/localstorage'

import type { AppConfig, Collection, QueryResult } from '@/lib/types'

export function useGetConfig() {
  return useQuery({
    queryKey: ['config'],
    queryFn: getConfig,
    retry: false,
  })
}

function authParamsString(config?: AppConfig) {
  if (config?.authType === 'basic') {
    return `&authType=basic&&username=${config.username}&password=${config.password}`
  } else if (config?.authType === 'token') {
    return `&authType=token&&token=${config.token}`
  } else {
    return ''
  }
}

export function useGetCollections(config?: AppConfig) {
  return useQuery({
    queryKey: ['collections', config?.connectionString], // Remove timestamp to prevent infinite loop
    queryFn: async (): Promise<Array<{ id: string; name: string; count: number }>> => {
      // Add cache-busting parameter
      const cacheBuster = Date.now()
      const response = await fetch(
        `/api/collections?connectionString=${config?.connectionString}&token=${config?.token}&_t=${cacheBuster}`,
        {
          cache: 'no-store', // Disable browser caching
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      )
      if (!response.ok) {
        throw new Error(`API getCollections returns response code: ${response.status}, message: ${response.statusText}`)
      }
      const data = await response.json()
      // Handle both old format (array of strings) and new format (array of objects)
      if (Array.isArray(data) && data.length > 0) {
        if (typeof data[0] === 'string') {
          // Old format: array of strings - return with default values
          return data.map((id: string) => ({ id, name: id, count: 0 }))
        } else if (typeof data[0] === 'object' && data[0].id) {
          // New format: array of objects with id, name, count - return the full objects
          return data
        }
      }
      return []
    },
    enabled: !!config?.connectionString,
    retry: false,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnMount: false, // Don't refetch when component mounts if data is fresh
    refetchOnWindowFocus: false, // Don't refetch on window focus to prevent loops
  })
}

export function useGetCollectionRecords(config?: AppConfig, collectionName?: string, page?: number, query?: string) {
  return useQuery({
    queryKey: ['collections', collectionName, 'records', query, page], // Remove timestamp to prevent infinite loop
    queryFn: async (): Promise<QueryResult> => {
      try {
        const cacheBuster = Date.now()
        if (query === undefined || query === '') {
          const response = await fetch(
            `/api/collections/${collectionName}/records?connectionString=${config?.connectionString}&token=${config?.token}&page=${page}&_t=${cacheBuster}`,
            {
              cache: 'no-store',
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              }
            }
          )
          if (!response.ok) {
            throw new Error(`API getRecords returns response code: ${response.status}, message: ${response.statusText}`)
          }
          const data = await response.json()
          console.log('useGetCollectionRecords GET response:', data)
          return data
        } else {
          const response = await fetch(
            `/api/collections/${collectionName}/records?connectionString=${config?.connectionString}&token=${config?.token}&_t=${cacheBuster}`,
            {
              method: 'POST',
              cache: 'no-store',
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ query: query }),
            }
          )
          if (!response.ok) {
            throw new Error(
              `API queryRecords returns response code: ${response.status}, message: ${response.statusText}`
            )
          }
          const data = await response.json()
          console.log('useGetCollectionRecords POST response:', data)
          return data
        }
      } catch (error) {
        console.error('Error in useGetCollectionRecords:', error)
        throw error
      }
    },
    enabled: !!config?.connectionString,
    retry: false,
    staleTime: 0,
    gcTime: 1000, // Short cache time (1 second)
    refetchOnWindowFocus: false, // Don't refetch on window focus to prevent loops
  })
}

export function useGetCollectionCount(config?: AppConfig, collectionName?: string) {
  return useQuery({
    queryKey: ['collections', collectionName, 'count'], // Remove timestamp to prevent infinite loop
    queryFn: async (): Promise<{ count: number }> => {
      const cacheBuster = Date.now()
      const response = await fetch(
        `/api/collections/${collectionName}/count?connectionString=${config?.connectionString}&token=${config?.token}&_t=${cacheBuster}`,
        {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      )
      if (!response.ok) {
        throw new Error(`API getCount returns response code: ${response.status}, message: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: !!config?.connectionString && !!collectionName,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  })
}




export function useCreateCollection(config?: AppConfig) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (collectionData: any) => {
      const response = await fetch(
        `/api/collections/create?connectionString=${config?.connectionString}&token=${config?.token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(collectionData),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to create collection: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      // Simply refetch collections
      queryClient.refetchQueries({ queryKey: ['collections', config?.connectionString] })
    },
  })
}

export function useDeleteCollection(config?: AppConfig) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (collectionName: string) => {
      const response = await fetch(
        `/api/collections/${collectionName}?connectionString=${config?.connectionString}&token=${config?.token}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to delete collection: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      // Simply refetch collections - no complex cache management needed
      queryClient.refetchQueries({ queryKey: ['collections', config?.connectionString] })
    },
  })
}

export function useAddDocument(config?: AppConfig, collectionName?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (documentData: any) => {
      const response = await fetch(
        `/api/collections/${collectionName}/documents?connectionString=${config?.connectionString}&token=${config?.token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(documentData),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to add document: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      // Simply refetch relevant data
      queryClient.refetchQueries({ queryKey: ['collections', collectionName, 'records'] })
      queryClient.refetchQueries({ queryKey: ['collections', collectionName, 'count'] })
      queryClient.refetchQueries({ queryKey: ['collections', config?.connectionString] })
    },
  })
}

export function useDeleteDocument(config?: AppConfig, collectionName?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(
        `/api/collections/${collectionName}/documents/${documentId}?connectionString=${config?.connectionString}&token=${config?.token}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to delete document: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      // Simply refetch relevant data
      queryClient.refetchQueries({ queryKey: ['collections', collectionName, 'records'] })
      queryClient.refetchQueries({ queryKey: ['collections', collectionName, 'count'] })
      queryClient.refetchQueries({ queryKey: ['collections', config?.connectionString] })
    },
  })
}
