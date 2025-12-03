'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { makeAuthenticatedRequest } from '../../../../lib/axios-utils';
import { useAuth } from '@clerk/nextjs';

export default function PaymentCancelPage() {
    const p = useSearchParams();
    const xpay_intent_id = p.get('xpay_intent_id');
    const { getToken } = useAuth();
    const hasCalledCancel = useRef(false);

    useEffect(() => {
        const cancelPayment = async () => {
            if (!xpay_intent_id || hasCalledCancel.current) {
                return;
            }

            hasCalledCancel.current = true;
            const token = await getToken();
            if (!token) {
                return;
            }

            try {
                await makeAuthenticatedRequest<{ success: boolean }>(
                    'POST',
                    '/payments/cancel',
                    { xIntentId: xpay_intent_id },
                    token
                );
            } catch (error) {
                console.error('Error canceling payment:', error);
            }
        };

        cancelPayment();
    }, [xpay_intent_id, getToken]);
    return (
        <div className="flex items-start justify-center min-h-screen p-4 pt-20">
            <Card className="w-full max-w-md bg-card border-border/50">
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center space-y-4 py-4">
                        <XCircle className="w-12 h-12 text-destructive" />
                        <p className="text-lg font-medium text-destructive">Oops payment failed</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
