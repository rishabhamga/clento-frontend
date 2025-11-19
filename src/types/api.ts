// Base API types
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ApiError {
    message: string;
    code: string;
    details?: Record<string, unknown>;
}

// Common request/response patterns
export interface CreateRequest<T> {
    data: T;
}

export interface UpdateRequest<T> {
    data: Partial<T>;
}

export interface DeleteResponse {
    success: boolean;
    message: string;
}

// Query parameters
export interface BaseQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface DateRangeParams {
    startDate?: string;
    endDate?: string;
}
