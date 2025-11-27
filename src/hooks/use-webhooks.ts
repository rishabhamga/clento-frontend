import { useAuth } from '@clerk/nextjs';
import { Webhook } from '../app/(dashboard)/integrations/webhooks/page';
import { makeAuthenticatedRequest } from '../lib/axios-utils';
import { useState } from 'react';
import { useEffect } from 'react';

export const useWebhooks = () => {
    const { getToken } = useAuth();
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<null | string>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await getToken();
                if (!token) throw new Error('Authentication required');

                const res = await makeAuthenticatedRequest('GET', '/integrations/webhooks', {}, token);

                setWebhooks(res?.webhooks || []);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Failed to fetch webhooks');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [getToken]);

    return { webhooks, loading, error };
};
