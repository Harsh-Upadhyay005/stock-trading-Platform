// ============================================================
// lib/auth.ts — Clerk authentication helper
// ============================================================
import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server"
import { db } from "./db"

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
