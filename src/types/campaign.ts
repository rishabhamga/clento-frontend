import { WorkflowNodeType } from '@/config/workflow-nodes'

export enum CampaignStatus {
    DRAFT = 'DRAFT',
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    PAUSED = 'PAUSED',
}

export interface Campaign {
    id: string;
    organization_id: string;
    name: string;
    description: string;
    sender_account: string;
    prospect_list: string;
    start_date: string;
    leadsPerDay: number;
    start_time: string;
    end_time: string;
    timezone: string;
    file_name: string;
    bucket: string;
    status: CampaignStatus;
    created_at: string;
    updated_at: string;
}

export interface WorkflowDefinition {
    steps: WorkflowStep[]
}

export interface WorkflowStep {
    id: string
    type: WorkflowNodeType
    delay?: number // in hours
    config: WorkflowStepConfig
    errorHandling?: 'skip' | 'retry' | 'fail'
}

export interface WorkflowStepConfig {
    message?: string
    template?: string
    variables?: Record<string, string>
    conditions?: WorkflowCondition[]
}

export interface WorkflowCondition {
    field: string
    operator: 'equals' | 'contains' | 'not_equals' | 'greater_than' | 'less_than'
    value: string | number
}

export interface CampaignSchedule {
    timezone: string
    workingHours: {
        start: string // HH:mm format
        end: string   // HH:mm format
    }
    workingDays: number[] // 0-6, where 0 is Sunday
    dailyLimit?: number
    hourlyLimit?: number
}

export interface CampaignStats {
    totalLeads: number
    processed: number
    pending: number
    successful: number
    failed: number
    replies: number
    connections: number
    emailsSent: number
    messagesSet: number
    profileVisits: number
}

export interface CampaignExecution {
    id: string
    campaignId: string
    leadId: string
    workflowExecutionId?: string
    status: 'pending' | 'in_progress' | 'completed' | 'failed'
    currentStep: number
    totalSteps: number
    executionData: Record<string, unknown>
    createdAt: string
    updatedAt: string
    startedAt?: string
    completedAt?: string
}

// Request/Response types
export interface CreateCampaignRequest {
    name: string
    description?: string
    leadListId: string
    accountId: string
    workflowDefinition: WorkflowDefinition
    schedule: CampaignSchedule
}

export interface CampaignAnalyticsData {
    date: string
    sent: number
    delivered: number
    opened: number
    clicked: number
    replied: number
    connected: number
    bounced: number
}
