// ============================================================
// utils/response.ts — Standardized API response helpers
// ============================================================
import { NextResponse } from "next/server"
import type { ApiSuccess, ApiError, PaginationMeta } from "@/types/api"

export function ok<T>(data: T, meta?: PaginationMeta): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({
    success: true,
    data,
    ...(meta && { meta }),
  })
}

export function created<T>(data: T): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status: 201 }
  )
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

export function badRequest(
  message = "Invalid request",
  details?: Record<string, string[]>
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message,
        ...(details && { details }),
      },
    },
    { status: 400 }
  )
}

export function unauthorized(
  message = "Authentication required"
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message,
      },
    },
    { status: 401 }
  )
}

export function forbidden(
  code = "FORBIDDEN",
  message = "Access denied"
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    { status: 403 }
  )
}

export function notFound(
  resource = "Resource",
  message?: string
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: message ?? `${resource} not found`,
      },
    },
    { status: 404 }
  )
}

export function conflict(message = "Resource conflict"): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "CONFLICT",
        message,
      },
    },
    { status: 409 }
  )
}

export function unprocessable(
  message = "Unprocessable entity",
  details?: Record<string, string[]>
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "UNPROCESSABLE_ENTITY",
        message,
        ...(details && { details }),
      },
    },
    { status: 422 }
  )
}

export function tooManyRequests(
  message = "Too many requests"
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message,
      },
    },
    { status: 429 }
  )
}

export function serverError(
  message = "Internal server error"
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message,
      },
    },
    { status: 500 }
  )
}

export function serviceUnavailable(
  message = "Service temporarily unavailable"
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "SERVICE_UNAVAILABLE",
        message,
      },
    },
    { status: 503 }
  )
}

// ── Pagination Helper ─────────────────────────────────────

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit)
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}
