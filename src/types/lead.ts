export type LeadStatus = 'new' | 'contacted' | 'replied' | 'connected' | 'not_interested' | 'bounced' | 'do_not_contact'

export interface Lead {
  id: string
  leadListId: string
  fullName: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  title?: string
  company?: string
  industry?: string
  location?: string
  linkedinUrl?: string
  linkedinId?: string
  status: LeadStatus
  source: 'csv_import' | 'filter_search' | 'api' | 'manual'
  enrichmentData: LeadEnrichmentData
  createdAt: string
  updatedAt: string
}

export interface LeadEnrichmentData {
  companySize?: string
  companyRevenue?: string
  companyFunding?: string
  yearsOfExperience?: number
  skills?: string[]
  education?: Education[]
  socialProfiles?: SocialProfile[]
  contactInfo?: ContactInfo
}

export interface Education {
  school: string
  degree?: string
  field?: string
  startYear?: number
  endYear?: number
}

export interface SocialProfile {
  platform: 'linkedin' | 'twitter' | 'github' | 'website'
  url: string
  username?: string
}

export interface ContactInfo {
  emails?: string[]
  phones?: string[]
  websites?: string[]
}

export interface LeadList {
  id: string
  organizationId: string
  creatorId: string
  name: string
  description?: string
  source: 'csv_import' | 'filter_search' | 'api'
  totalLeads: number
  createdAt: string
  updatedAt: string
}

export interface LeadActivity {
  id: string
  leadId: string
  campaignId?: string
  activityType: 'profile_visit' | 'connection_request' | 'message_sent' | 'email_sent' | 'reply_received' | 'connection_accepted'
  status: 'completed' | 'failed' | 'pending'
  metadata: Record<string, unknown>
  createdAt: string
}

// Request/Response types
export interface CreateLeadRequest {
  leadListId: string
  fullName: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  title?: string
  company?: string
  industry?: string
  location?: string
  linkedinUrl?: string
  source: Lead['source']
}

export interface UpdateLeadRequest {
  fullName?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  title?: string
  company?: string
  industry?: string
  location?: string
  linkedinUrl?: string
  status?: LeadStatus
}

export interface CreateLeadListRequest {
  name: string
  description?: string
  source: LeadList['source']
}

export interface UpdateLeadListRequest {
  name?: string
  description?: string
}

export interface LeadQueryParams {
  leadListId?: string
  status?: LeadStatus[]
  source?: Lead['source'][]
  company?: string
  industry?: string
  location?: string
  page?: number
  limit?: number
  search?: string
  sortBy?: 'fullName' | 'company' | 'title' | 'createdAt' | 'status'
  sortOrder?: 'asc' | 'desc'
}

export interface LeadListQueryParams {
  source?: LeadList['source'][]
  page?: number
  limit?: number
  search?: string
  sortBy?: 'name' | 'totalLeads' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface ImportLeadsRequest {
  leadListId: string
  csvData: string
  mapping: CsvFieldMapping
}

export interface CsvFieldMapping {
  fullName: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  title?: string
  company?: string
  industry?: string
  location?: string
  linkedinUrl?: string
}

export interface ImportLeadsResponse {
  success: boolean
  imported: number
  failed: number
  errors?: ImportError[]
}

export interface ImportError {
  row: number
  field: string
  message: string
  value: string
}
