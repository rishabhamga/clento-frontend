export type AccountProvider = 'linkedin' | 'email' | 'gmail' | 'outlook';
export type AccountStatus = 'connected' | 'disconnected' | 'error' | 'rate_limited' | 'suspended';

export interface ConnectedAccount {
    id: string;
    userId: string;
    organizationId: string;
    provider: AccountProvider;
    providerAccountId: string;
    displayName: string;
    email?: string;
    profilePictureUrl?: string;
    status: AccountStatus;
    capabilities: AccountCapability[];
    metadata: AccountMetadata;
    lastSyncedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AccountCapability {
    type: 'send_message' | 'send_connection_request' | 'visit_profile' | 'like_post' | 'comment_post' | 'send_email';
    enabled: boolean;
    dailyLimit?: number;
    hourlyLimit?: number;
    currentUsage?: number;
}

export interface AccountMetadata {
    // LinkedIn specific
    linkedinProfile?: {
        headline?: string;
        summary?: string;
        connections?: number;
        industry?: string;
        location?: string;
    };

    // Email specific
    emailProvider?: {
        smtpHost?: string;
        smtpPort?: number;
        imapHost?: string;
        imapPort?: number;
    };

    // Rate limiting info
    rateLimits?: {
        daily?: RateLimit;
        hourly?: RateLimit;
        monthly?: RateLimit;
    };

    // Additional provider-specific data
    [key: string]: unknown;
}

export interface RateLimit {
    limit: number;
    used: number;
    resetAt: string;
}

export interface AccountUsageStats {
    accountId: string;
    period: 'day' | 'week' | 'month';
    data: AccountUsageData[];
}

export interface AccountUsageData {
    date: string;
    messagesSent: number;
    connectionRequests: number;
    profileVisits: number;
    emailsSent: number;
    errors: number;
}

// Request/Response types
export interface ConnectAccountRequest {
    provider: AccountProvider;
    authCode?: string;
    redirectUri?: string;
    // Provider-specific connection data
    connectionData?: Record<string, unknown>;
}

export interface UpdateAccountRequest {
    displayName?: string;
    capabilities?: AccountCapability[];
    metadata?: Partial<AccountMetadata>;
}

export interface AccountQueryParams {
    provider?: AccountProvider[];
    status?: AccountStatus[];
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'displayName' | 'provider' | 'status' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

export interface TestAccountConnectionRequest {
    accountId: string;
    testType: 'basic' | 'send_message' | 'profile_access';
}

export interface TestAccountConnectionResponse {
    success: boolean;
    message: string;
    details?: {
        capabilities: AccountCapability[];
        rateLimits: RateLimit[];
        lastActivity?: string;
    };
}

export interface SyncAccountRequest {
    accountId: string;
    syncType: 'profile' | 'capabilities' | 'rate_limits' | 'full';
}

export interface SyncAccountResponse {
    success: boolean;
    message: string;
    updatedFields: string[];
    metadata: AccountMetadata;
}
