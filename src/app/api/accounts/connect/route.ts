import { NextRequest, NextResponse } from 'next/server'
import { apiConfig } from '@/config/site'
import { makeAuthenticatedRequest } from '../../../../lib/axios-utils';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Frontend API: Account Connect Request ===')
    const body = await request.json()
    const token = body['token'];
    if(!token){
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const backendUrl = `/accounts/connect`

    try {
        const res = await makeAuthenticatedRequest('POST', backendUrl, body, token);
        const response = res.data
        return NextResponse.json(response)
    } catch (error) {
        console.error('Backend returned error:', error)
        return NextResponse.json(error, { status: 500 })
    }
  } catch (error) {
    console.error('=== Frontend API: Error ===', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
