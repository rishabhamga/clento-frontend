import { useQuery } from '@tanstack/react-query'
import { makeAuthenticatedRequest } from '@/lib/axios-utils'
import { useAuth } from '@clerk/nextjs'

export interface ConnectedAccount {
  id: string
  user_id: string
  organization_id: string
  provider: 'linkedin' | 'email'
  provider_account_id: string
  display_name: string
  email?: string
  profile_picture_url?: string
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  capabilities: string[]
  metadata: Record<string, any>
  last_synced_at?: string
  created_at: string
  updated_at: string
}


// Query keys
export const connectedAccountKeys = {
  all: ['connectedAccounts'] as const,
  lists: () => [...connectedAccountKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...connectedAccountKeys.lists(), { filters }] as const,
  detail: (id: string) => [...connectedAccountKeys.all, 'detail', id] as const,
}

// Get connected accounts
export function useConnectedAccounts(provider?: 'linkedin' | 'email') {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: connectedAccountKeys.list({ provider }),
    queryFn: async () => {
      try {
        const token = await getToken()
        if (!token) throw new Error('Authentication required')

        const params = new URLSearchParams()
        if (provider) {
          params.append('provider', provider)
        }

        const url = params.toString() ? `/accounts?${params.toString()}` : '/accounts'
        console.log('Fetching connected accounts:', url)

        const response = await makeAuthenticatedRequest<{
          success: boolean
          data: ConnectedAccount[]
          meta: { total: number }
        }>('GET', url, {}, token)

        console.log('Connected accounts API response:', response)
        console.log('Connected accounts data:', response.data)
        console.log('Connected accounts count:', response.data?.length || 0)

        // The response structure is: { success: true, data: [...], meta: {...} }
        const accounts = Array.isArray(response) ? response : (response.data || [])

        return {
          success: true,
          data: {
            data: accounts,
            pagination: {
              page: 1,
              limit: 20,
              total: accounts.length,
              pageCount: Math.ceil(accounts.length / 20),
            }
          }
        }
      } catch (error) {
        console.error('Error fetching connected accounts:', error)
        // Don't throw error, return empty data instead
        return {
          success: false,
          data: {
            data: [],
            pagination: {
              page: 1,
              limit: 20,
              total: 0,
              pageCount: 0,
            }
          }
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Disable retries to prevent multiple API calls
    refetchOnWindowFocus: false, // Disable refetch on window focus
  })
}

// Get connected account by ID
export function useConnectedAccount(id: string) {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: connectedAccountKeys.detail(id),
    queryFn: async () => {
      try {
        const token = await getToken()
        if (!token) throw new Error('Authentication required')

        const response = await makeAuthenticatedRequest<ConnectedAccount>('GET', `/accounts/${id}`, {}, token)
        return {
          success: true,
          data: response
        }
      } catch (error) {
        console.error('Error fetching connected account:', error)
        throw new Error('Account not found')
      }
    },
    enabled: !!id,
  })
}
