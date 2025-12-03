'use client';

import { Card, CardContent } from '@/components/ui/card';
import { makeAuthenticatedRequest } from '@/lib/axios-utils';
import { useAuth } from '@clerk/nextjs';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type PaymentStatus = 'checking' | 'success' | 'failed';

export enum OrderStatus {
    INITIATED = 'INITIATED',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
}

export default function PaymentCallbackPage() {
    const searchParams = useSearchParams();
    const { getToken } = useAuth();
    const [status, setStatus] = useState<PaymentStatus>('checking');
    const [message, setMessage] = useState<string>('Checking status of payment...');
    const statusRef = useRef<PaymentStatus>('checking');

    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    useEffect(() => {
        const checkPaymentStatus = async () => {
            if (statusRef.current !== 'checking') {
                return;
            }

            try {
                const token = await getToken();
                if (!token) {
                    setStatus('failed');
                    setMessage('Authentication required');
                    return;
                }

                // Extract payment ID from query params (adjust param name based on your backend)
                const intentId = searchParams.get('xpay_intent_id');
                const secret = searchParams.get('secret');

                if (!intentId || !secret) {
                    setStatus('failed');
                    setMessage('No secret or intent id found');
                    return;
                }

                // Hit the backend endpoint to check payment status
                const response = await makeAuthenticatedRequest('POST', `/payments/callback`, { xpay_intent_id: intentId, secret }, token);

                if (response.success === 'SUCCESS') {
                    setStatus('success');
                    setMessage('Payment successful');
                }
                if (response.status === 'FAILED') {
                    setStatus('failed');
                    setMessage('Payment failed');
                } else {
                    // Still pending, will check again in 10 seconds
                    setMessage('Checking status of payment...');
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
                // Don't set failed immediately, keep checking
            }
        };

        // Check immediately
        checkPaymentStatus();

        // Set up interval to check every 10 seconds
        const interval = setInterval(() => {
            if (statusRef.current === 'checking') {
                checkPaymentStatus();
            }
        }, 10000);

        // Cleanup interval when component unmounts
        return () => clearInterval(interval);
    }, [searchParams, getToken]);

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-md bg-card border-border/50">
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center space-y-4 py-8">
                        {status === 'checking' && (
                            <>
                                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                                <p className="text-lg font-medium text-foreground">{message}</p>
                            </>
                        )}
                        {status === 'success' && (
                            <>
                                <CheckCircle className="w-12 h-12 text-success" />
                                <p className="text-lg font-medium text-success">{message}</p>
                            </>
                        )}
                        {status === 'failed' && (
                            <>
                                <XCircle className="w-12 h-12 text-destructive" />
                                <p className="text-lg font-medium text-destructive">{message}</p>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
