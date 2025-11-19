import { NextRequest, NextResponse } from 'next/server';
import { apiConfig } from '@/config/site';

export async function POST(request: NextRequest) {
    try {
        console.log('=== Frontend API: Unipile Webhook Received ===');
        const body = await request.json();
        console.log('Webhook payload:', JSON.stringify(body, null, 2));

        const backendUrl = `${apiConfig.baseUrl}/accounts/webhook`;
        console.log('Forwarding webhook to backend URL:', backendUrl);

        // Forward the webhook to the backend
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Forward any relevant headers from Unipile
                'User-Agent': request.headers.get('User-Agent') || '',
                'X-Forwarded-For': request.headers.get('X-Forwarded-For') || '',
            },
            body: JSON.stringify(body),
        });

        console.log('Backend webhook response status:', response.status);
        const data = await response.json();
        console.log('Backend webhook response data:', JSON.stringify(data, null, 2));

        if (!response.ok) {
            console.error('Backend webhook returned error:', data);
            return NextResponse.json(data, { status: response.status });
        }

        console.log('=== Frontend API: Webhook Success ===');
        return NextResponse.json(data);
    } catch (error) {
        console.error('=== Frontend API: Webhook Error ===', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
