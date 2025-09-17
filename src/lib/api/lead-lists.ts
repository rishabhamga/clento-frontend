import { api } from '../api'

export interface LeadList {
  id: string
  organization_id: string
  name: string
  description?: string
  source: 'csv_import' | 'filter_search' | 'api' | 'manual'
  total_leads: number
  status: 'draft' | 'active' | 'archived'
  tags: string[]
  filters: Record<string, any>
  file_url?: string
  file_size?: number
  creator_id: string
  created_at: string
  updated_at: string
  statistics?: {
    total_leads: number
    new_leads: number
    contacted_leads: number
    replied_leads: number
    connected_leads: number
  }
}

export interface LeadListView {
    csvData: {
        headers: string[];
        data: Record<string, any>[];
        totalRows: number;
        validRows: number;
        errors: string[];
    },
    leadList: {
        id: string;
        organization_id: string | null;
        creator_id: string | null;
        name: string;
        description: string | null;
        source: string; // max(50) is runtime validation only
        status: "draft" | "processing" | "completed" | "failed" | "archived";
        total_leads: number | null;
        processed_leads: number | null;
        failed_leads: number | null;
        original_filename: string | null;
        csv_file_url: string | null;
        sample_csv_url: string | null;
        file_size: bigint | null;
        processing_started_at: string | null; // ISO datetime string
        processing_completed_at: string | null; // ISO datetime string
        error_message: string | null;
        connected_account_id: string | null;
        tags: string[] | null;
        filters: Record<string, any> | null;
        metadata: Record<string, any> | null;
        stats: Record<string, any> | null;
        created_at: string | null; // ISO datetime string
        updated_at: string | null; // ISO datetime string
      }

}

export interface CreateLeadListRequest {
  name: string
  description?: string
  source: 'csv_import' | 'filter_search' | 'api' | 'manual'
  tags?: string[]
  filters?: Record<string, any>
}

export interface UpdateLeadListRequest {
  name?: string
  description?: string
  status?: 'draft' | 'active' | 'archived'
  connected_account_id?: string
  tags?: string[]
  filters?: Record<string, any>
}

export interface LeadListQuery {
  page?: number
  limit?: number
  search?: string
  source?: string
  tags?: string
  creator_id?: string
  with_stats?: boolean
}

export interface CsvPreviewRequest {
  csv_data: string
  mapping?: Record<string, string>
}

export interface CsvPreviewResponse {
  preview: {
    headers: string[]
    data: Record<string, any>[]
    totalRows: number
    showingRows: number
  }
  validation: {
    isValid: boolean
    hasLinkedInColumn: boolean
    linkedInColumnName?: string
    emailColumns: string[]
    phoneColumns: string[]
    errors: string[]
    warnings: string[]
  }
  mapping: Record<string, string>
}

export interface PublishLeadListRequest {
  name: string
  description?: string
  connected_account_id: string
  csv_data: string
  mapping?: Record<string, string>
}

export interface PublishLeadListResponse {
  leadList: LeadList
  importResult: {
    totalRows: number
    importedLeads: number
    skippedRows: number
    errors: string[]
  }
}

// Lead Lists API functions
export const leadListsApi = {
  // Get all lead lists
  async getLeadLists(query?: LeadListQuery) {
    const params = new URLSearchParams()

    if (query?.page) params.append('page', query.page.toString())
    if (query?.limit) params.append('limit', query.limit.toString())
    if (query?.search) params.append('search', query.search)
    if (query?.source) params.append('source', query.source)
    if (query?.tags) params.append('tags', query.tags)
    if (query?.creator_id) params.append('creator_id', query.creator_id)
    if (query?.with_stats) params.append('with_stats', query.with_stats.toString())

    const response = await api.get<{
        data: LeadList[]
        pagination: {
          page: number
          limit: number
          total: number
          totalPages: number
        }
      message: string
    }>(`/lead-lists?${params.toString()}`)
    console.log("this is the repsonse", response);
    return response
  },

  // Get lead list by ID
  async getLeadListById(id: string) {
    const response = await api.get<LeadListView>(`/lead-lists/${id}`)
    if (!response) {
      throw new Error('Lead list not found')
    }
    console.log("here is the result for the leadlistbyid", response);
    return response
  },

  // Create lead list
  async createLeadList(data: CreateLeadListRequest) {
    const response = await api.post<{ data: LeadList }>('/lead-lists', data)
    return response.data
  },

  // Update lead list
  async updateLeadList(id: string, data: UpdateLeadListRequest) {
    const response = await api.put<{ data: LeadList }>(`/lead-lists/${id}`, data)
    return response.data
  },

  // Delete lead list
  async deleteLeadList(id: string) {
    const response = await api.delete<{ success: boolean }>(`/lead-lists/${id}`)
    return response
  },

  // Upload CSV file
  async uploadCsv(file: File) {
    const formData = new FormData()
    formData.append('csv_file', file)

    // Use backend API endpoint - Content-Type is handled automatically for FormData
    const response = await api.post<CsvPreviewResponse>('/lead-lists/upload-csv', formData)
    return response
  },

  // Preview CSV data
  async previewCsv(data: CsvPreviewRequest) {
    const response = await api.post<CsvPreviewResponse>('/lead-lists/preview-csv', data)
    return response
  },

  // Publish lead list from CSV
  async publishLeadList(data: PublishLeadListRequest) {
    const response = await api.post<PublishLeadListResponse>('/lead-lists/publish', data)
    return response
  },

  // Archive lead list
  async archiveLeadList(id: string) {
    const response = await api.post<{ data: LeadList }>(`/lead-lists/${id}/archive`)
    return response.data
  },

  // Activate lead list
  async activateLeadList(id: string) {
    const response = await api.post<{ data: LeadList }>(`/lead-lists/${id}/activate`)
    return response.data
  },

  // Duplicate lead list
  async duplicateLeadList(id: string, name: string) {
    const response = await api.post<{ data: LeadList }>(`/lead-lists/${id}/duplicate`, { name })
    return response.data
  },

  // Get lead list statistics
  async getLeadListStatistics(id: string) {
    const response = await api.get<{ data: any }>(`/lead-lists/${id}/statistics`)
    return response.data
  },
}
