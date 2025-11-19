import { NextRequest, NextResponse } from 'next/server';
import { apiConfig } from '@/config/site';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        // Forward the request to the backend
        const response = await fetch(`${apiConfig.baseUrl}/accounts/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: request.headers.get('Authorization') || '',
                'x-organization-id': request.headers.get('x-organization-id') || '',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in accounts delete API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
