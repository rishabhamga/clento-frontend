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
    headers: string[]
    data: Record<string, any>[]
    totalRows: number
    validRows: number
    errors: string[]
  }
  leadList: {
    id: string
    organization_id: string | null
    creator_id: string | null
    name: string
    description: string | null
    source: string // max(50) is runtime validation only
    status: "draft" | "processing" | "completed" | "failed" | "archived"
    total_leads: number | null
    processed_leads: number | null
    failed_leads: number | null
    original_filename: string | null
    csv_file_url: string | null
    sample_csv_url: string | null
    file_size: bigint | null
    processing_started_at: string | null // ISO datetime string
    processing_completed_at: string | null // ISO datetime string
    error_message: string | null
    connected_account_id: string | null
    tags: string[] | null
    filters: Record<string, any> | null
    metadata: Record<string, any> | null
    stats: Record<string, any> | null
    created_at: string | null // ISO datetime string
    updated_at: string | null // ISO datetime string
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
