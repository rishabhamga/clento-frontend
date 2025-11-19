import { z } from 'zod';
import { getAllNodeTypes } from '@/config/workflow-nodes';

// Common validation schemas
export const emailSchema = z.string().email('Please enter a valid email address');
export const urlSchema = z.string().url('Please enter a valid URL');
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number');

// Campaign validation schemas
export const workflowStepSchema = z.object({
    id: z.string(),
    type: z.enum(getAllNodeTypes() as [string, ...string[]]),
    delay: z.number().min(0).max(168).optional(), // Max 1 week in hours
    config: z.object({
        message: z.string().optional(),
        template: z.string().optional(),
        variables: z.record(z.string(), z.string()).optional(),
    }),
    errorHandling: z.enum(['skip', 'retry', 'fail']).optional(),
});

export const workflowDefinitionSchema = z.object({
    steps: z.array(workflowStepSchema).min(1, 'At least one workflow step is required'),
});

export const campaignScheduleSchema = z.object({
    timezone: z.string(),
    workingHours: z.object({
        start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
        end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
    }),
    workingDays: z.array(z.number().min(0).max(6)).min(1, 'At least one working day is required'),
    dailyLimit: z.number().min(1).max(1000).optional(),
    hourlyLimit: z.number().min(1).max(100).optional(),
});

export const createCampaignSchema = z.object({
    name: z.string().min(1, 'Campaign name is required').max(100, 'Campaign name is too long'),
    description: z.string().max(500, 'Description is too long').optional(),
    leadListId: z.string().uuid('Invalid lead list ID'),
    accountId: z.string().uuid('Invalid account ID'),
    workflowDefinition: workflowDefinitionSchema,
    schedule: campaignScheduleSchema,
});

export const updateCampaignSchema = createCampaignSchema.partial().extend({
    status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']).optional(),
});

// Lead validation schemas
export const createLeadSchema = z.object({
    leadListId: z.string().uuid('Invalid lead list ID'),
    fullName: z.string().min(1, 'Full name is required').max(100, 'Full name is too long'),
    firstName: z.string().max(50, 'First name is too long').optional(),
    lastName: z.string().max(50, 'Last name is too long').optional(),
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    title: z.string().max(100, 'Title is too long').optional(),
    company: z.string().max(100, 'Company name is too long').optional(),
    industry: z.string().max(50, 'Industry is too long').optional(),
    location: z.string().max(100, 'Location is too long').optional(),
    linkedinUrl: urlSchema.optional(),
    source: z.enum(['csv_import', 'filter_search', 'api', 'manual']),
});

export const updateLeadSchema = createLeadSchema
    .partial()
    .omit({ leadListId: true, source: true })
    .extend({
        status: z.enum(['new', 'contacted', 'replied', 'connected', 'not_interested', 'bounced', 'do_not_contact']).optional(),
    });

export const createLeadListSchema = z.object({
    name: z.string().min(1, 'Lead list name is required').max(100, 'Lead list name is too long'),
    description: z.string().max(500, 'Description is too long').optional(),
    source: z.enum(['csv_import', 'filter_search', 'api']),
});

export const updateLeadListSchema = createLeadListSchema.partial().omit({ source: true });

// CSV import validation
export const csvFieldMappingSchema = z.object({
    fullName: z.string().min(1, 'Full name field mapping is required'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    title: z.string().optional(),
    company: z.string().optional(),
    industry: z.string().optional(),
    location: z.string().optional(),
    linkedinUrl: z.string().optional(),
});

export const importLeadsSchema = z.object({
    leadListId: z.string().uuid('Invalid lead list ID'),
    csvData: z.string().min(1, 'CSV data is required'),
    mapping: csvFieldMappingSchema,
});

// Account validation schemas
export const connectAccountSchema = z.object({
    provider: z.enum(['linkedin', 'email', 'gmail', 'outlook']),
    authCode: z.string().optional(),
    redirectUri: z.string().url().optional(),
    connectionData: z.record(z.string(), z.unknown()).optional(),
});

export const updateAccountSchema = z.object({
    displayName: z.string().min(1, 'Display name is required').max(100, 'Display name is too long').optional(),
    capabilities: z
        .array(
            z.object({
                type: z.enum(['send_message', 'send_connection_request', 'visit_profile', 'like_post', 'comment_post', 'send_email']),
                enabled: z.boolean(),
                dailyLimit: z.number().min(1).max(10000).optional(),
                hourlyLimit: z.number().min(1).max(1000).optional(),
            }),
        )
        .optional(),
});

// Search and filter validation schemas
export const campaignQuerySchema = z.object({
    status: z.array(z.enum(['draft', 'active', 'paused', 'completed', 'cancelled'])).optional(),
    accountId: z.string().uuid().optional(),
    leadListId: z.string().uuid().optional(),
    page: z.number().min(1).optional(),
    limit: z.number().min(1).max(100).optional(),
    search: z.string().max(100).optional(),
    sortBy: z.enum(['name', 'createdAt', 'status', 'stats.totalLeads']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const leadQuerySchema = z.object({
    leadListId: z.string().uuid().optional(),
    status: z.array(z.enum(['new', 'contacted', 'replied', 'connected', 'not_interested', 'bounced', 'do_not_contact'])).optional(),
    source: z.array(z.enum(['csv_import', 'filter_search', 'api', 'manual'])).optional(),
    company: z.string().max(100).optional(),
    industry: z.string().max(50).optional(),
    location: z.string().max(100).optional(),
    page: z.number().min(1).optional(),
    limit: z.number().min(1).max(100).optional(),
    search: z.string().max(100).optional(),
    sortBy: z.enum(['fullName', 'company', 'title', 'createdAt', 'status']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const accountQuerySchema = z.object({
    provider: z.array(z.enum(['linkedin', 'email', 'gmail', 'outlook'])).optional(),
    status: z.array(z.enum(['connected', 'disconnected', 'error', 'rate_limited', 'suspended'])).optional(),
    page: z.number().min(1).optional(),
    limit: z.number().min(1).max(100).optional(),
    search: z.string().max(100).optional(),
    sortBy: z.enum(['displayName', 'provider', 'status', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Form validation helpers
export type CreateCampaignFormData = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignFormData = z.infer<typeof updateCampaignSchema>;
export type CreateLeadFormData = z.infer<typeof createLeadSchema>;
export type UpdateLeadFormData = z.infer<typeof updateLeadSchema>;
export type CreateLeadListFormData = z.infer<typeof createLeadListSchema>;
export type UpdateLeadListFormData = z.infer<typeof updateLeadListSchema>;
export type ImportLeadsFormData = z.infer<typeof importLeadsSchema>;
export type ConnectAccountFormData = z.infer<typeof connectAccountSchema>;
export type UpdateAccountFormData = z.infer<typeof updateAccountSchema>;

// Query parameter types
export type CampaignQueryParams = z.infer<typeof campaignQuerySchema>;
export type LeadQueryParams = z.infer<typeof leadQuerySchema>;
export type AccountQueryParams = z.infer<typeof accountQuerySchema>;
