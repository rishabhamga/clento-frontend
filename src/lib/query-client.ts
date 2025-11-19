import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './axios-utils';

// Create a query client with default options
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Stale time: 5 minutes
            staleTime: 5 * 60 * 1000,
            // Cache time: 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry failed requests 3 times
            retry: (failureCount, error) => {
                // Don't retry on 4xx errors (except 429)
                if (error instanceof ApiError && error.status >= 400 && error.status < 500 && error.status !== 429) {
                    return false;
                }
                return failureCount < 3;
            },
            // Retry delay with exponential backoff
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch on window focus in production
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
            // Don't refetch on reconnect by default
            refetchOnReconnect: false,
        },
        mutations: {
            // Retry mutations once
            retry: 1,
            // Retry delay for mutations
            retryDelay: 1000,
        },
    },
});

// Query keys factory for consistent key management
export const queryKeys = {
    // Campaigns
    campaigns: {
        all: ['campaigns'] as const,
        lists: () => [...queryKeys.campaigns.all, 'list'] as const,
        list: (params?: Record<string, unknown>) => [...queryKeys.campaigns.lists(), params] as const,
        details: () => [...queryKeys.campaigns.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.campaigns.details(), id] as const,
        analytics: (id: string) => [...queryKeys.campaigns.detail(id), 'analytics'] as const,
    },

    // Leads
    leads: {
        all: ['leads'] as const,
        lists: () => [...queryKeys.leads.all, 'list'] as const,
        list: (params?: Record<string, unknown>) => [...queryKeys.leads.lists(), params] as const,
        details: () => [...queryKeys.leads.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.leads.details(), id] as const,
        activities: (id: string) => [...queryKeys.leads.detail(id), 'activities'] as const,
    },

    // Lead Lists
    leadLists: {
        all: ['leadLists'] as const,
        lists: () => [...queryKeys.leadLists.all, 'list'] as const,
        list: (params?: Record<string, unknown>) => [...queryKeys.leadLists.lists(), params] as const,
        details: () => [...queryKeys.leadLists.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.leadLists.details(), id] as const,
        leads: (id: string) => [...queryKeys.leadLists.detail(id), 'leads'] as const,
    },

    // Accounts
    accounts: {
        all: ['accounts'] as const,
        lists: () => [...queryKeys.accounts.all, 'list'] as const,
        list: (params?: Record<string, unknown>) => [...queryKeys.accounts.lists(), params] as const,
        details: () => [...queryKeys.accounts.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.accounts.details(), id] as const,
        usage: (id: string) => [...queryKeys.accounts.detail(id), 'usage'] as const,
    },

    // Dashboard
    dashboard: {
        all: ['dashboard'] as const,
        stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
        analytics: () => [...queryKeys.dashboard.all, 'analytics'] as const,
        recentActivity: () => [...queryKeys.dashboard.all, 'recentActivity'] as const,
    },
} as const;

// Type-safe query key helpers
export type QueryKeys = typeof queryKeys;
