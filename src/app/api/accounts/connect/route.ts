import { NextRequest, NextResponse } from 'next/server'
import { apiConfig } from '@/config/site'

export async function POST(request: NextRequest) {
  try {
    console.log('=== Frontend API: Account Connect Request ===')
    const body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
    
    const backendUrl = `${apiConfig.baseUrl}/accounts/connect`
    console.log('Forwarding to backend URL:', backendUrl)
    
    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
        'x-organization-id': request.headers.get('x-organization-id') || '',
      },
      body: JSON.stringify(body),
    })

    console.log('Backend response status:', response.status)
    const data = await response.json()
    console.log('Backend response data:', JSON.stringify(data, null, 2))
    
    if (!response.ok) {
      console.error('Backend returned error:', data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log('=== Frontend API: Success ===')
    return NextResponse.json(data)
  } catch (error) {
    console.error('=== Frontend API: Error ===', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
