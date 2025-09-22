import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { makeAuthenticatedRequest } from '@/lib/axios-utils'
import { useAuth } from '@clerk/nextjs'
import { queryKeys } from '@/lib/query-client'
import type {
  Campaign,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  CampaignQueryParams,
  CampaignAnalytics
} from '@/types/campaign'
import type { PaginatedResponse } from '@/types/api'

// Get campaigns list
export function useCampaigns(params?: CampaignQueryParams) {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: queryKeys.campaigns.list(params as Record<string, unknown>),
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('Authentication required')

      const searchParams = params ? new URLSearchParams(params as Record<string, string>) : undefined
      const url = searchParams ? `/campaigns?${searchParams.toString()}` : '/campaigns'
      return makeAuthenticatedRequest<PaginatedResponse<Campaign>>('GET', url, {}, token)
    },
    enabled: true,
  })
}

// Get single campaign
export function useCampaign(id: string) {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: queryKeys.campaigns.detail(id),
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('Authentication required')

      return makeAuthenticatedRequest<Campaign>('GET', `/campaigns/${id}`, {}, token)
    },
    enabled: !!id,
  })
}

// Get campaign analytics
export function useCampaignAnalytics(id: string, period: 'day' | 'week' | 'month' = 'week') {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: queryKeys.campaigns.analytics(id),
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('Authentication required')

      return makeAuthenticatedRequest<CampaignAnalytics>('GET', `/campaigns/${id}/analytics?period=${period}`, {}, token)
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes for analytics data
  })
}

// Create campaign mutation
export function useCreateCampaign() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (data: CreateCampaignRequest) => {
      const token = await getToken()
      if (!token) throw new Error('Authentication required')

      return makeAuthenticatedRequest<Campaign>('POST', '/campaigns', data, token)
    },
    onSuccess: (newCampaign) => {
      // Invalidate campaigns list
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.lists() })

      // Add the new campaign to the cache
      queryClient.setQueryData(queryKeys.campaigns.detail(newCampaign.id), newCampaign)

      // Update dashboard stats
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() })
    },
  })
}

// Update campaign mutation
export function useUpdateCampaign() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCampaignRequest }) => {
      const token = await getToken()
      if (!token) throw new Error('Authentication required')

      return makeAuthenticatedRequest<Campaign>('PUT', `/campaigns/${id}`, data, token)
    },
    onSuccess: (updatedCampaign) => {
      // Update the specific campaign in cache
      queryClient.setQueryData(queryKeys.campaigns.detail(updatedCampaign.id), updatedCampaign)

      // Invalidate campaigns list to reflect changes
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.lists() })

      // Update dashboard stats if status changed
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() })
    },
  })
}

// Delete campaign mutation
export function useDeleteCampaign() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      if (!token) throw new Error('Authentication required')

      return makeAuthenticatedRequest('DELETE', `/campaigns/${id}`, {}, token)
    },
    onSuccess: (_, deletedId) => {
      // Remove from campaigns list cache
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.lists() })

      // Remove the specific campaign from cache
      queryClient.removeQueries({ queryKey: queryKeys.campaigns.detail(deletedId) })

      // Update dashboard stats
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() })
    },
  })
}

// Start campaign mutation
export function useStartCampaign() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      if (!token) throw new Error('Authentication required')

      return makeAuthenticatedRequest<Campaign>('POST', `/campaigns/${id}/start`, {}, token)
    },
    onSuccess: (updatedCampaign) => {
      // Update the campaign in cache
      queryClient.setQueryData(queryKeys.campaigns.detail(updatedCampaign.id), updatedCampaign)

      // Invalidate campaigns list
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.lists() })

      // Update dashboard stats
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() })
    },
  })
}

// Pause campaign mutation
export function usePauseCampaign() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      if (!token) throw new Error('Authentication required')

      return makeAuthenticatedRequest<Campaign>('POST', `/campaigns/${id}/pause`, {}, token)
    },
    onSuccess: (updatedCampaign) => {
      // Update the campaign in cache
      queryClient.setQueryData(queryKeys.campaigns.detail(updatedCampaign.id), updatedCampaign)

      // Invalidate campaigns list
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.lists() })

      // Update dashboard stats
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() })
    },
  })
}

// Resume campaign mutation
export function useResumeCampaign() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      if (!token) throw new Error('Authentication required')

      return makeAuthenticatedRequest<Campaign>('POST', `/campaigns/${id}/resume`, {}, token)
    },
    onSuccess: (updatedCampaign) => {
      // Update the campaign in cache
      queryClient.setQueryData(queryKeys.campaigns.detail(updatedCampaign.id), updatedCampaign)

      // Invalidate campaigns list
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.lists() })

      // Update dashboard stats
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() })
    },
  })
}

// Stop campaign mutation
export function useStopCampaign() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      if (!token) throw new Error('Authentication required')

      return makeAuthenticatedRequest<Campaign>('POST', `/campaigns/${id}/stop`, {}, token)
    },
    onSuccess: (updatedCampaign) => {
      // Update the campaign in cache
      queryClient.setQueryData(queryKeys.campaigns.detail(updatedCampaign.id), updatedCampaign)

      // Invalidate campaigns list
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.lists() })

      // Update dashboard stats
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() })
    },
  })
}
