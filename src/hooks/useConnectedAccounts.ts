import { useQuery } from '@tanstack/react-query';
import { makeAuthenticatedRequest } from '@/lib/axios-utils';
import { useAuth } from '@clerk/nextjs';

export interface ConnectedAccount {
    id: string;
    user_id: string;
    organization_id: string;
    provider: 'linkedin' | 'email';
    provider_account_id: string;
    display_name: string;
    email?: string;
    profile_picture_url?: string;
    status: 'connected' | 'disconnected' | 'error' | 'pending';
    capabilities: string[];
    metadata: Record<string, any>;
    last_synced_at?: string;
    created_at: string;
    updated_at: string;
}

// Simplified response types
export interface ConnectedAccountsResponse {
    data: ConnectedAccount[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pageCount: number;
    };
}

// Query keys
export const connectedAccountKeys = {
    all: ['connectedAccounts'] as const,
    lists: () => [...connectedAccountKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...connectedAccountKeys.lists(), { filters }] as const,
    detail: (id: string) => [...connectedAccountKeys.all, 'detail', id] as const,
};

// Get connected accounts - simplified return type
export function useConnectedAccounts(provider?: 'linkedin' | 'email') {
    const { getToken } = useAuth();

    return useQuery<ConnectedAccountsResponse>({
        queryKey: connectedAccountKeys.list({ provider }),
        queryFn: async () => {
            const token = await getToken();
            if (!token) throw new Error('Authentication required');

            const params = new URLSearchParams();
            if (provider) {
                params.append('provider', provider);
            }

            const url = params.toString() ? `/accounts?${params.toString()}` : '/accounts';

            const response = await makeAuthenticatedRequest<ConnectedAccount[]>('GET', url, {}, token);
            console.log(response);

            // Return simplified structure
            return {
                data: response || [],
                pagination: {
                    page: 1,
                    limit: 20,
                    total: response?.length || 0,
                    pageCount: Math.ceil((response?.length || 0) / 20),
                },
            };
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
        refetchOnWindowFocus: false,
    });
}

// Get connected account by ID - simplified return type
export function useConnectedAccount(id: string) {
    const { getToken } = useAuth();

    return useQuery<ConnectedAccount>({
        queryKey: connectedAccountKeys.detail(id),
        queryFn: async () => {
            const token = await getToken();
            if (!token) throw new Error('Authentication required');

            return makeAuthenticatedRequest<ConnectedAccount>('GET', `/accounts/${id}`, {}, token);
        },
        enabled: !!id,
    });
}
