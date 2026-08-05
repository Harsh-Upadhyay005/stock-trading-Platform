// ============================================================
// lib/auth-usage-examples.ts
// Examples of how to use the auth helper functions
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { 
  requireAuth, 
  requireAdmin, 
  getOptionalAuth, 
  getSessionId,
  AuthError 
} from './auth'

// ============================================================
// Example 1: Protected API Route (Requires Authentication)
// ============================================================

export async function GET_ProtectedRoute(req: NextRequest) {
  try {
    // Get authenticated user (throws error if not authenticated)
    const user = await requireAuth()
    
    // Get session ID for rate limiting
    const sessionId = getSessionId(req)
    
    console.log(`User ${user.email} (${sessionId}) accessed protected route`)
    
    return NextResponse.json({
      message: 'Protected data',
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      }
    })
    
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================
// Example 2: Admin-Only API Route
// ============================================================

export async function DELETE_AdminRoute(req: NextRequest) {
  try {
    // Require admin role
    const admin = await requireAdmin()
    
    console.log(`Admin ${admin.email} performing deletion`)
    
    // Perform admin operation...
    
    return NextResponse.json({ 
      message: 'Resource deleted',
      deletedBy: admin.email 
    })
    
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================
// Example 3: Optional Authentication (Public + Private Data)
// ============================================================

export async function GET_MixedRoute(req: NextRequest) {
  try {
    // Get user if authenticated, null otherwise
    const user = await getOptionalAuth()
    
    // Get session ID (works for both authenticated and anonymous)
    const sessionId = getSessionId(req)
    
    if (user) {
      // Return personalized data for authenticated users
      return NextResponse.json({
        message: 'Personalized content',
        user: {
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        },
        sessionId,
      })
    } else {
      // Return public data for anonymous users
      return NextResponse.json({
        message: 'Public content',
        sessionId,
      })
    }
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================
// Example 4: Using getSessionId for Rate Limiting
// ============================================================

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export async function POST_RateLimitedRoute(req: NextRequest) {
  try {
    // Get session ID for rate limiting
    const sessionId = getSessionId(req)
    
    // Check rate limit (10 requests per minute)
    const now = Date.now()
    const limit = rateLimitStore.get(sessionId)
    
    if (limit) {
      if (now < limit.resetAt) {
        if (limit.count >= 10) {
          return NextResponse.json(
            { error: 'Rate limit exceeded', retryAfter: Math.ceil((limit.resetAt - now) / 1000) },
            { status: 429 }
          )
        }
        limit.count++
      } else {
        // Reset limit
        rateLimitStore.set(sessionId, { count: 1, resetAt: now + 60000 })
      }
    } else {
      // First request
      rateLimitStore.set(sessionId, { count: 1, resetAt: now + 60000 })
    }
    
    // Process request
    const user = await getOptionalAuth()
    
    return NextResponse.json({
      message: 'Request processed',
      sessionId,
      authenticated: !!user,
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================
// Example 5: Complete API Route with All Features
// ============================================================

export async function POST_CompleteExample(req: NextRequest) {
  try {
    // 1. Get session ID for rate limiting
    const sessionId = getSessionId(req)
    console.log(`Request from session: ${sessionId}`)
    
    // 2. Require authentication
    const user = await requireAuth()
    
    // 3. Parse and validate request body
    const body = await req.json()
    
    // 4. Check user permissions
    if (body.requiresAdmin && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    // 5. Process business logic
    const result = {
      success: true,
      userId: user.id,
      userEmail: user.email,
      sessionId,
      data: body,
    }
    
    return NextResponse.json(result)
    
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================
// Example 6: Session ID Logging Middleware
// ============================================================

export function logSessionMiddleware(req: NextRequest) {
  const sessionId = getSessionId(req)
  const path = req.nextUrl.pathname
  const method = req.method
  
  console.log(`[${new Date().toISOString()}] ${method} ${path} - Session: ${sessionId}`)
  
  // You can also track this in your database or analytics
}

// ============================================================
// Example 7: Using in Different Scenarios
// ============================================================

/**
 * Scenario: Trading API - Place Order
 * - Requires authentication
 * - Rate limited per session
 * - Logs user actions
 */
export async function POST_PlaceOrder(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await requireAuth()
    
    // Get session for rate limiting
    const sessionId = getSessionId(req)
    
    // Check if user can place order (rate limit: 10 orders/minute)
    // ... rate limiting logic ...
    
    // Parse order data
    const orderData = await req.json()
    
    // Log action
    console.log(`Order placed by ${user.email} (${sessionId}):`, orderData)
    
    // Process order...
    
    return NextResponse.json({
      orderId: 'ORD123456',
      status: 'PENDING',
      message: 'Order placed successfully'
    })
    
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    return NextResponse.json(
      { error: 'Failed to place order' },
      { status: 500 }
    )
  }
}

/**
 * Scenario: Public API - Market Data
 * - No authentication required
 * - Rate limited per IP/session
 * - Accessible to everyone
 */
export async function GET_MarketData(req: NextRequest) {
  try {
    // Get session for rate limiting (no auth required)
    const sessionId = getSessionId(req)
    
    // Check rate limit for public API
    // ... rate limiting logic ...
    
    // Get optional user for personalized data
    const user = await getOptionalAuth()
    
    const marketData = {
      indices: [
        { symbol: 'NIFTY50', value: 22000, change: 150 },
        { symbol: 'SENSEX', value: 73000, change: 500 },
      ],
      // Add personalized watchlist if user is authenticated
      watchlist: user ? await getUserWatchlist(user.id) : null,
    }
    
    return NextResponse.json(marketData)
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    )
  }
}

// Dummy function for example
async function getUserWatchlist(userId: string) {
  return ['RELIANCE', 'TCS', 'INFY']
}
