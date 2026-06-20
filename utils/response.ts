// ============================================================
// utils/response.ts — Standardized Next.js API response helpers
// ============================================================
import { NextResponse } from "next/server"
import type { ApiError, ApiSuccess, PaginationMeta } from "@/types/api"

export function ok<T>(
  data: T,
  meta?: PaginationMeta,
  status = 200
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data, ...(meta && { meta }) }, { status })
}

export function created<T>(data: T): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data }, { status: 201 })
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

export function badRequest(
  message: string,
  details?: Record<string, string[]>,
  code = "BAD_REQUEST"
): NextResponse<ApiError> {
  return NextResponse.json(
    { success: false, error: { code, message, details } },
    { status: 400 }
  )
}

export function unauthorized(message = "Unauthorized"): NextResponse<ApiError> {
  return NextResponse.json(
    { success: false, error: { code: "UNAUTHORIZED", message } },
    { status: 401 }
  )
}

export function forbidden(message = "Forbidden"): NextResponse<ApiError> {
  return NextResponse.json(
    { success: false, error: { code: "FORBIDDEN", message } },
    { status: 403 }
  )
}

export function notFound(resource = "Resource"): NextResponse<ApiError> {
  return NextResponse.json(
    { success: false, error: { code: "NOT_FOUND", message: `${resource} not found` } },
    { status: 404 }
  )
}

export function conflict(message: string): NextResponse<ApiError> {
  return NextResponse.json(
    { success: false, error: { code: "CONFLICT", message } },
    { status: 409 }
  )
}

export function unprocessable(message: string, details?: Record<string, string[]>): NextResponse<ApiError> {
  return NextResponse.json(
    { success: false, error: { code: "UNPROCESSABLE_ENTITY", message, details } },
    { status: 422 }
  )
}

export function tooManyRequests(message = "Too many requests"): NextResponse<ApiError> {
  return NextResponse.json(
    { success: false, error: { code: "RATE_LIMITED", message } },
    { status: 429 }
  )
}

export function serverError(message = "Internal server error"): NextResponse<ApiError> {
  return NextResponse.json(
    { success: false, error: { code: "INTERNAL_ERROR", message } },
    { status: 500 }
  )
}

// Pagination helper
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit)
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

// Parse pagination from searchParams
export function parsePagination(searchParams: URLSearchParams): {
  page: number
  limit: number
  skip: number
} {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")))
  return { page, limit, skip: (page - 1) * limit }
}