import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
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
  return useQuery({
    queryKey: queryKeys.campaigns.list(params as Record<string, unknown>),
    queryFn: () => {
      const searchParams = params ? new URLSearchParams(params as Record<string, string>) : undefined
      const url = searchParams ? `/campaigns?${searchParams.toString()}` : '/campaigns'
      return api.get<PaginatedResponse<Campaign>>(url)
    },
    enabled: true,
  })
}

// Get single campaign
export function useCampaign(id: string) {
  return useQuery({
    queryKey: queryKeys.campaigns.detail(id),
    queryFn: () => api.get<Campaign>(`/campaigns/${id}`),
    enabled: !!id,
  })
}

// Get campaign analytics
export function useCampaignAnalytics(id: string, period: 'day' | 'week' | 'month' = 'week') {
  return useQuery({
    queryKey: queryKeys.campaigns.analytics(id),
    queryFn: () => api.get<CampaignAnalytics>(`/campaigns/${id}/analytics?period=${period}`),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes for analytics data
  })
}

// Create campaign mutation
export function useCreateCampaign() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateCampaignRequest) => api.post<Campaign>('/campaigns', data),
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
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCampaignRequest }) => 
      api.put<Campaign>(`/campaigns/${id}`, data),
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
  
  return useMutation({
    mutationFn: (id: string) => api.delete(`/campaigns/${id}`),
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
  
  return useMutation({
    mutationFn: (id: string) => api.post<Campaign>(`/campaigns/${id}/start`),
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
  
  return useMutation({
    mutationFn: (id: string) => api.post<Campaign>(`/campaigns/${id}/pause`),
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
  
  return useMutation({
    mutationFn: (id: string) => api.post<Campaign>(`/campaigns/${id}/resume`),
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
  
  return useMutation({
    mutationFn: (id: string) => api.post<Campaign>(`/campaigns/${id}/stop`),
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
