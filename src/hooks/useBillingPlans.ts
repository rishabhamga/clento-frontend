import { useMutation, useQuery } from '@tanstack/react-query';
import { makeAuthenticatedRequest } from '@/lib/axios-utils';
import { useAuth } from '@clerk/nextjs';
import { InitiatePaymentRequest, InitiatePaymentResponse, Plan } from '@/types/billing';
import { toast } from 'sonner';

// Query keys
export const billingPlanKeys = {
    all: ['billingPlans'] as const,
    lists: () => [...billingPlanKeys.all, 'list'] as const,
    list: () => [...billingPlanKeys.lists()] as const,
};

// Get billing plans
export function useBillingPlans() {
    const { getToken } = useAuth();

    return useQuery<Plan[]>({
        queryKey: billingPlanKeys.list(),
        queryFn: async () => {
            const token = await getToken();
            if (!token) throw new Error('Authentication required');

            const response = await makeAuthenticatedRequest<{ plans: Plan[] }>('GET', '/billing', {}, token);
            return response.plans;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
        refetchOnWindowFocus: false,
    });
}

// Initiate payment
export function useInitiatePayment() {
    const { getToken } = useAuth();

    return useMutation<InitiatePaymentResponse, Error, InitiatePaymentRequest>({
        mutationFn: async (data: InitiatePaymentRequest) => {
            const token = await getToken();
            if (!token) throw new Error('Authentication required');

            return makeAuthenticatedRequest<InitiatePaymentResponse>(
                'POST',
                '/payments/initiate',
                { planId: data.planId, seats: data.seats },
                token
            );
        },
        onSuccess: () => {
            toast.success('Payment initiated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to initiate payment');
        },
    });
}
