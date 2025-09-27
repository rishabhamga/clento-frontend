import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'
import { apiConfig } from '@/config/site'
import { toast } from 'sonner'

// Type definitions
export type JsonType = Record<string, any> | any[] | string | number | boolean | null

// Utility function to check if value is null or undefined
export const isNullOrUndefined = (value: any): boolean => {
    return value === null || value === undefined
}

// Utility function for exhaustive checking (never type)
export const CheckNever = (value: never): never => {
    throw new Error(`Unhandled case: ${value}`)
}

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

// Main axios request utility
export const MakeAxiosRequest = async <RetType = any>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    postBodyOrQueryParams: JsonType = {},
    headers: JsonType = {},
    timeout = 60_000,
    maxRedirects: number | undefined = undefined,
    httpAgent: any = null,
    httpsAgent: any = null,
    configParams: any = {}
): Promise<AxiosResponse<RetType>> => {
    try {
        const config: AxiosRequestConfig = {
            timeout,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        }

        if (headers && Object.keys(headers).length > 0) {
            config.headers = headers as any
        }

        if (!isNullOrUndefined(maxRedirects)) {
            config.maxRedirects = maxRedirects
        }

        if (httpAgent) {
            config.httpAgent = httpAgent
        }

        if (httpsAgent) {
            config.httpsAgent = httpsAgent
        }

        // Merge additional config parameters
        Object.assign(config, configParams)

        let response: AxiosResponse<RetType>

        switch (method) {
            case 'GET':
                response = await axios.get<RetType>(url, {
                    params: postBodyOrQueryParams,
                    ...config
                })
                break
            case 'POST':
                response = await axios.post<RetType>(url, postBodyOrQueryParams, config)
                break
            case 'PUT':
                response = await axios.put<RetType>(url, postBodyOrQueryParams, config)
                break
            case 'PATCH':
                response = await axios.patch<RetType>(url, postBodyOrQueryParams, config)
                break
            case 'DELETE':
                response = await axios.delete<RetType>(url, {
                    params: postBodyOrQueryParams,
                    ...config
                })
                break
            default:
                CheckNever(method)
                response = null as any // This will never be reached due to CheckNever
        }

        return response
    } catch (e: any) {
        if (e?.response) {
            // Return the error response instead of throwing
            return e.response
        } else {
            // For network errors or other issues, return null
            return null as any
        }
    }
}

// Helper function to create authenticated headers
export const createAuthHeaders = (token: string): Record<string, string> => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
})

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string): string => {
    const baseUrl = apiConfig.baseUrl.endsWith('/')
        ? apiConfig.baseUrl.slice(0, -1)
        : apiConfig.baseUrl
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    return `${baseUrl}${cleanEndpoint}`
}

// Helper function to handle API responses with error checking
export const handleApiResponse = <T>(response: AxiosResponse<T> | null): T => {
    if (!response) {
        throw new ApiError(0, 'Network error or request failed')
    }

    if (response.status >= 400) {
        const responseData = response.data as any
        const errorMessage = responseData?.message || `HTTP ${response.status}: ${response.statusText}`
        const errorCode = responseData?.code || response.status.toString()
        const errorDetails = responseData?.details || {}

        // Handle 467 error code with toast notification
        if (response.status === 467) {
            toast.error(errorMessage, {
                description: errorDetails?.description || 'Please check your input and try again.',
                duration: 5000,
            })
        }

        throw new ApiError(response.status, errorMessage, errorCode, errorDetails)
    }

    // Handle wrapped API responses
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return (response.data as any).data as T
    }

    return response.data
}

// Convenience function for authenticated requests
export const makeAuthenticatedRequest = async <T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data: JsonType = {},
    token: string,
    additionalHeaders: JsonType = {},
    timeout = 60_000
): Promise<T> => {
    const url = buildApiUrl(endpoint)
    const headers = {
        ...createAuthHeaders(token),
        ...(additionalHeaders as Record<string, string>)
    }

    const response = await MakeAxiosRequest<T>(
        method,
        url,
        data,
        headers,
        timeout
    )

    return handleApiResponse(response)
}

// Convenience function for public requests (no auth)
export const makePublicRequest = async <T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data: JsonType = {},
    additionalHeaders: JsonType = {},
    timeout = 60_000
): Promise<T> => {
    const url = buildApiUrl(endpoint)
    const headers = {
        'Content-Type': 'application/json',
        ...(additionalHeaders as Record<string, string>)
    }

    const response = await MakeAxiosRequest<T>(
        method,
        url,
        data,
        headers,
        timeout
    )

    return handleApiResponse(response)
}

// Utility for handling FormData requests
export const makeFormDataRequest = async <T = any>(
    method: 'POST' | 'PUT' | 'PATCH',
    endpoint: string,
    formData: FormData,
    token: string,
    timeout = 60_000
): Promise<T> => {
    const url = buildApiUrl(endpoint)
    const headers = {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData - let axios set it with boundary
    }

    const response = await MakeAxiosRequest<T>(
        method,
        url,
        formData,
        headers,
        timeout
    )

    return handleApiResponse(response)
}
