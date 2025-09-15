import { NextRequest, NextResponse } from 'next/server'
import { apiConfig } from '@/config/site'

export async function GET(request: NextRequest) {
  try {
    console.log('=== Frontend API: Getting connected accounts ===')
    
    // Extract query parameters
    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')
    
    console.log('Query params:', { provider })
    
    // Build backend URL
    const backendUrl = `${apiConfig.baseUrl}/accounts${provider ? `?provider=${provider}` : ''}`
    console.log('Backend URL:', backendUrl)
    
    // Forward request to backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward any relevant headers
        'User-Agent': request.headers.get('User-Agent') || '',
        'X-Forwarded-For': request.headers.get('X-Forwarded-For') || '',
      },
    })

    console.log('Backend response status:', response.status)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error from backend:', errorData)
      return NextResponse.json({ success: false, error: errorData.message || 'Failed to fetch accounts' }, { status: response.status })
    }

    const data = await response.json()
    console.log('Backend response data:', data)
    console.log('Accounts count:', data.data?.length || 0)

    return NextResponse.json(data)
  } catch (error: unknown) {
    console.error('Error in frontend accounts API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
