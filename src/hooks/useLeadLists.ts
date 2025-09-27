import { makeAuthenticatedRequest, makeFormDataRequest } from '@/lib/axios-utils'
import {
    CreateLeadListRequest,
    CsvPreviewResponse,
    LeadList,
    LeadListQuery,
    LeadListView,
    PublishLeadListRequest,
    PublishLeadListResponse,
    UpdateLeadListRequest
} from '@/types/lead-list'
import { useAuth } from '@clerk/nextjs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Query keys
export const leadListKeys = {
  all: ['leadLists'] as const,
  lists: () => [...leadListKeys.all, 'list'] as const,
  list: (filters: LeadListQuery) => [...leadListKeys.lists(), { filters }] as const,
  detail: (id: string) => [...leadListKeys.all, 'detail', id] as const,
  statistics: (id: string) => [...leadListKeys.all, 'statistics', id] as const,
}

// Get lead lists
export function useLeadLists(query?: LeadListQuery) {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: leadListKeys.list(query || {}),
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('Authentication required')

      const params: Record<string, any> = {}
      if (query?.page) params.page = query.page
      if (query?.limit) params.limit = query.limit
      if (query?.search) params.search = query.search
      if (query?.source) params.source = query.source
      if (query?.tags) params.tags = query.tags
      if (query?.creator_id) params.creator_id = query.creator_id
      if (query?.with_stats) params.with_stats = query.with_stats

      return makeAuthenticatedRequest<{
        data: LeadList[]
        pagination: {
          page: number
          limit: number
          total: number
          totalPages: number
        }
        message: string
      }>('GET', '/lead-lists', params, token)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    refetchOnWindowFocus: false,
  })
}

// Get lead list by ID
export function useLeadList(id: string) {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: leadListKeys.detail(id),
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('Authentication required')

      return makeAuthenticatedRequest<LeadListView>('GET', `/lead-lists/${id}`, {}, token)
    },
    enabled: !!id,
  })
}

// Get lead list statistics
export function useLeadListStatistics(id: string) {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: leadListKeys.statistics(id),
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('Authentication required')

      const response = await makeAuthenticatedRequest<{ data: any }>('GET', `/lead-lists/${id}/statistics`, {}, token)
      return response.data
    },
    enabled: !!id,
  })
}

// Create lead list
export function useCreateLeadList() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (data: CreateLeadListRequest) => {
      const token = await getToken()
      if (!token) throw new Error('Authentication required')

      const response = await makeAuthenticatedRequest<{ data: LeadList }>('POST', '/lead-lists', data, token)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadListKeys.lists() })
      toast.success('Lead list created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create lead list')
    },
  })
}

// Update lead list
export function useUpdateLeadList() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateLeadListRequest }) => {
      const token = await getToken()
      if (!token) throw new Error('Authentication required')

      const response = await makeAuthenticatedRequest<{ data: LeadList }>('PUT', `/lead-lists/${id}`, data, token)
      return response.data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: leadListKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leadListKeys.detail(variables.id) })
      toast.success('Lead list updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update lead list')
    },
  })
}

// Delete lead list
export function useDeleteLeadList() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      if (!token) throw new Error('Authentication required')

      return makeAuthenticatedRequest<{ success: boolean }>('DELETE', `/lead-lists/${id}`, {}, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadListKeys.lists() })
      toast.success('Lead list deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete lead list')
    },
  })
}

// Upload CSV
export function useUploadCsv() {
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async ({ file, account_id }: { file: File; account_id: string }) => {
      const token = await getToken()
      if (!token) throw new Error('Authentication required')

      const formData = new FormData()
      formData.append('csv_file', file)
      formData.append('account_id', account_id)
      const response = await makeFormDataRequest<{ data: CsvPreviewResponse; message: string }>('POST', '/lead-lists/upload-csv', formData, token)
      return response.data
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload CSV file')
    },
  })
}


// Publish lead list
export function usePublishLeadList() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (data: PublishLeadListRequest) => {
      const token = await getToken()
      if (!token) throw new Error('Authentication required')

      return makeAuthenticatedRequest<PublishLeadListResponse>('POST', '/lead-lists/publish', data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadListKeys.lists() })
      toast.success('Lead list published successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to publish lead list')
    },
  })
}

// Archive lead list
export function useArchiveLeadList() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      if (!token) throw new Error('Authentication required')

      const response = await makeAuthenticatedRequest<{ data: LeadList }>('POST', `/lead-lists/${id}/archive`, {}, token)
      return response.data
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: leadListKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leadListKeys.detail(id) })
      toast.success('Lead list archived successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to archive lead list')
    },
  })
}

// Activate lead list
export function useActivateLeadList() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      if (!token) throw new Error('Authentication required')

      const response = await makeAuthenticatedRequest<{ data: LeadList }>('POST', `/lead-lists/${id}/activate`, {}, token)
      return response.data
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: leadListKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leadListKeys.detail(id) })
      toast.success('Lead list activated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to activate lead list')
    },
  })
}

// Duplicate lead list
export function useDuplicateLeadList() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const token = await getToken()
      if (!token) throw new Error('Authentication required')

      const response = await makeAuthenticatedRequest<{ data: LeadList }>('POST', `/lead-lists/${id}/duplicate`, { name }, token)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadListKeys.lists() })
      toast.success('Lead list duplicated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to duplicate lead list')
    },
  })
}
