// ============================================================
// types/api.ts — Standardized API response contracts
// ============================================================

export type ApiSuccess<T> = {
  success: true
  data: T
  meta?: PaginationMeta
}

export type ApiError = {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, string[]> // field-level validation errors
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export type PaginationQuery = {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export type RouteContext<P extends Record<string, string> = Record<string, string>> = {
  params: Promise<P>
}