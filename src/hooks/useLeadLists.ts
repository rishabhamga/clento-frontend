import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  leadListsApi,
  CreateLeadListRequest,
  UpdateLeadListRequest,
  LeadListQuery,
  CsvPreviewRequest,
  PublishLeadListRequest
} from '@/lib/api/lead-lists'

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
  return useQuery({
    queryKey: leadListKeys.list(query || {}),
    queryFn: () => leadListsApi.getLeadLists(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    refetchOnWindowFocus: false,
  })
}

// Get lead list by ID
export function useLeadList(id: string) {
  return useQuery({
    queryKey: leadListKeys.detail(id),
    queryFn: () => leadListsApi.getLeadListById(id),
    enabled: !!id,
  })
}

// Get lead list statistics
export function useLeadListStatistics(id: string) {
  return useQuery({
    queryKey: leadListKeys.statistics(id),
    queryFn: () => leadListsApi.getLeadListStatistics(id),
    enabled: !!id,
  })
}

// Create lead list
export function useCreateLeadList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLeadListRequest) => leadListsApi.createLeadList(data),
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

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadListRequest }) =>
      leadListsApi.updateLeadList(id, data),
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

  return useMutation({
    mutationFn: (id: string) => leadListsApi.deleteLeadList(id),
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
  return useMutation({
    mutationFn: (file: File) => leadListsApi.uploadCsv(file),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload CSV file')
    },
  })
}

// Preview CSV
export function usePreviewCsv() {
  return useMutation({
    mutationFn: (data: CsvPreviewRequest) => leadListsApi.previewCsv(data),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to preview CSV')
    },
  })
}

// Publish lead list
export function usePublishLeadList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PublishLeadListRequest) => leadListsApi.publishLeadList(data),
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

  return useMutation({
    mutationFn: (id: string) => leadListsApi.archiveLeadList(id),
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

  return useMutation({
    mutationFn: (id: string) => leadListsApi.activateLeadList(id),
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

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      leadListsApi.duplicateLeadList(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadListKeys.lists() })
      toast.success('Lead list duplicated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to duplicate lead list')
    },
  })
}
