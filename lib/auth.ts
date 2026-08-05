// ============================================================
// lib/auth.ts — Clerk authentication helper
// ============================================================
import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server"
import { db } from "./db"
import { NextRequest } from "next/server"

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message)
    this.name = "AuthError"
  }
}

/**
 * Require authentication and return the authenticated user's DB record
 * Throws AuthError if not authenticated
 */
export async function requireAuth() {
  const { userId: clerkId } = await clerkAuth()

  if (!clerkId) {
    throw new AuthError("Authentication required", "UNAUTHENTICATED", 401)
  }

  // Get user from database
  const user = await db.user.findUnique({
    where: { clerkId },
    select: {
      id: true,
      clerkId: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
    },
  })

  if (!user) {
    throw new AuthError("User not found in database", "USER_NOT_FOUND", 404)
  }

  // Check if user is active
  if (user.status === "BANNED" || user.status === "SUSPENDED") {
    throw new AuthError(
      `Account ${user.status.toLowerCase()}`,
      `ACCOUNT_${user.status}`,
      403
    )
  }

  return user
}

/**
 * Require admin role (ADMIN or SUPER_ADMIN)
 */
export async function requireAdmin() {
  const user = await requireAuth()

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new AuthError("Admin access required", "INSUFFICIENT_PERMISSIONS", 403)
  }

  return user
}

/**
 * Require super admin role
 */
export async function requireSuperAdmin() {
  const user = await requireAuth()

  if (user.role !== "SUPER_ADMIN") {
    throw new AuthError("Super admin access required", "INSUFFICIENT_PERMISSIONS", 403)
  }

  return user
}

/**
 * Get the current Clerk user (returns null if not authenticated)
 */
export async function getClerkUser() {
  return await currentUser()
}

/**
 * Get the optional authenticated user (returns null if not authenticated)
 */
export async function getOptionalAuth() {
  try {
    return await requireAuth()
  } catch {
    return null
  }
}

/**
 * Extract session ID from the Next.js request
 * Used for rate limiting and session tracking
 * 
 * Priority:
 * 1. Clerk session ID (from authenticated user)
 * 2. Client IP address (for anonymous users)
 * 3. User-Agent hash (fallback)
 * 
 * @param req - Next.js request object
 * @returns Session identifier string
 */
export function getSessionId(req: NextRequest): string {
  // Try to get Clerk session ID from cookie
  const clerkSessionCookie = req.cookies.get('__session')?.value || 
                             req.cookies.get('__clerk_db_jwt')?.value

  if (clerkSessionCookie) {
    return `clerk:${clerkSessionCookie.substring(0, 32)}`
  }

  // Fallback to IP address
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || req.ip || 'unknown'

  if (ip && ip !== 'unknown') {
    return `ip:${ip}`
  }

  // Last resort: use User-Agent hash
  const userAgent = req.headers.get('user-agent') || 'unknown'
  const hash = simpleHash(userAgent)
  
  return `ua:${hash}`
}

/**
 * Simple hash function for generating session ID from User-Agent
 * @param str - String to hash
 * @returns Hash string
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

