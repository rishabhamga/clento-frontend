import { apiConfig } from '@/config/site'
import type { ApiResponse } from '@/types/api'

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Get auth token for API requests (disabled for development)
async function getAuthToken(): Promise<string | null> {
  // TODO: Implement proper auth token retrieval when Clerk is configured
  return null
}

// Base fetch wrapper with error handling and retries
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit & {
    retries?: number
    timeout?: number
  } = {}
): Promise<T> {
  const {
    retries = apiConfig.retries,
    timeout = apiConfig.timeout,
    ...fetchOptions
  } = options

  const url = `${apiConfig.baseUrl}${endpoint}`
  const token = await getAuthToken()

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  }

  // Don't set Content-Type for FormData - let the browser set it with boundary
  if (fetchOptions.body instanceof FormData) {
    delete defaultHeaders['Content-Type']
  }

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`
  }

  const config: RequestInit = {
    ...fetchOptions,
    headers: {
      ...defaultHeaders,
      ...fetchOptions.headers,
    },
  }

  // Add timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  config.signal = controller.signal

  let lastError: Error

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, config)
      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        let errorCode = response.status.toString()
        let errorDetails: Record<string, unknown> = {}

        try {
          const errorBody = await response.json()
          if (errorBody.message) errorMessage = errorBody.message
          if (errorBody.code) errorCode = errorBody.code
          if (errorBody.details) errorDetails = errorBody.details
        } catch {
          // If we can't parse the error body, use the default message
        }

        throw new ApiError(response.status, errorMessage, errorCode, errorDetails)
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T
      }

      const data = await response.json()
      
      // Handle wrapped API responses
      if (data && typeof data === 'object' && 'data' in data) {
        return data.data as T
      }
      
      return data as T
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error instanceof ApiError && error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error
      }

      // Don't retry on the last attempt
      if (attempt === retries) {
        throw error
      }

      // Wait before retrying with exponential backoff
      const delay = apiConfig.retryDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

// Convenience methods for different HTTP verbs
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
}

// Type-safe API response wrapper
export function createApiResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    data,
    message,
    success: true,
  }
}

// Error handler for API responses
export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (error instanceof Error) {
    return new ApiError(500, error.message)
  }

  return new ApiError(500, 'An unexpected error occurred')
}
