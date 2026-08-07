# TradeFlow Architecture Guide

This document describes the architecture, design decisions, and technical implementation of TradeFlow.

## Table of Contents
- [System Overview](#system-overview)
- [Technology Stack](#technology-stack)
- [Architecture Patterns](#architecture-patterns)
- [Data Flow](#data-flow)
- [Database Design](#database-design)
- [API Design](#api-design)
- [Frontend Architecture](#frontend-architecture)
- [Security](#security)
- [Performance Optimization](#performance-optimization)
- [Scalability](#scalability)

---

## System Overview

TradeFlow is a full-stack trading platform built on modern web technologies. The system follows a monolithic architecture with the potential to scale into microservices.

### High-Level Architecture

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       │ HTTPS
       ▼
┌─────────────────────────────────────┐
│         Next.js Application         │
│  ┌───────────────────────────────┐  │
│  │      React Components         │  │
│  │  (Server + Client Components) │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │        API Routes             │  │
│  │  (REST + Potential WebSocket) │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │     Business Logic Layer      │  │
│  │    (Services + Validators)    │  │
│  └───────────────────────────────┘  │
└────────────┬────────────────────────┘
             │
             ▼
    ┌────────────────┐
    │  Prisma ORM    │
    └────────┬───────┘
             │
             ▼
    ┌────────────────┐
    │   PostgreSQL   │
    │    Database    │
    └────────────────┘
             │
             ▼
    ┌────────────────┐
    │  Clerk Auth    │
    │   (External)   │
    └────────────────┘
```

---

## Technology Stack

### Frontend Layer
- **Next.js 16** - React framework with App Router
- **React 19** - UI library with Server Components
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library (Radix UI primitives)
- **TanStack Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Recharts** - Data visualization

### Backend Layer
- **Next.js API Routes** - RESTful API endpoints
- **Prisma** - Database ORM and query builder
- **Zod** - Input validation
- **Clerk** - Authentication and user management

### Database Layer
- **PostgreSQL** - Primary database
- **Prisma Migrations** - Schema versioning

### Infrastructure
- **Vercel** - Hosting and deployment
- **Neon/Supabase** - PostgreSQL hosting
- **Clerk** - Auth infrastructure

---

## Architecture Patterns

### 1. Layered Architecture

```
┌─────────────────────────────────────┐
│      Presentation Layer             │  ← React Components
├─────────────────────────────────────┤
│      API Layer                      │  ← Next.js API Routes
├─────────────────────────────────────┤
│      Business Logic Layer           │  ← Services & Validators
├─────────────────────────────────────┤
│      Data Access Layer              │  ← Prisma ORM
├─────────────────────────────────────┤
│      Database Layer                 │  ← PostgreSQL
└─────────────────────────────────────┘
```

### 2. Component Architecture

**Server Components (Default)**
- Used for static content and data fetching
- Better performance and SEO
- Examples: Portfolio summary, reports, analytics

**Client Components ("use client")**
- Used for interactivity and real-time updates
- React Query for data fetching
- Examples: Trading interface, order management, watchlists

### 3. API Design Pattern

```typescript
// Standard API Route Structure
// app/api/[resource]/route.ts

export async function GET(request: Request) {
  // 1. Authentication check
  const { userId } = await auth()
  if (!userId) return unauthorized()
  
  // 2. Input validation
  const params = validateParams(request.url)
  
  // 3. Business logic
  const data = await fetchData(userId, params)
  
  // 4. Response
  return NextResponse.json({ data })
}
```

### 4. Data Fetching Patterns

**Server-Side Fetching (Server Components)**
```typescript
// Direct database queries in Server Components
export default async function Page() {
  const data = await prisma.portfolio.findUnique({ ... })
  return <Component data={data} />
}
```

**Client-Side Fetching (Client Components)**
```typescript
// React Query hooks for client components
export default function Page() {
  const { data, isLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => apiClient.portfolio.getSummary()
  })
  return <Component data={data} />
}
```

---

## Data Flow

### 1. User Authentication Flow

```
User Login → Clerk Auth → JWT Token → Next.js API
                                    ↓
                              Verify Token
                                    ↓
                              Get User ID
                                    ↓
                            Query User Data
```

### 2. Order Placement Flow

```
User Form Input → Validation → React Query Mutation
                                       ↓
                                 POST /api/orders
                                       ↓
                              Validate Order Data
                                       ↓
                            Check User Balance
                                       ↓
                           Create Order in DB
                                       ↓
                          Send to Broker API
                                       ↓
                        Update Order Status
                                       ↓
                      Create Notification
                                       ↓
                        Return Response
```

### 3. Portfolio Update Flow

```
Market Data Change → WebSocket (Future)
                           ↓
                    Update Positions
                           ↓
                 Recalculate Portfolio
                           ↓
                  Trigger UI Update
                           ↓
                 Invalidate Query Cache
```

---

## Database Design

### Core Entities

```prisma
User (Clerk integration)
  ↓
  ├── Portfolio (one-to-one)
  ├── Holdings (one-to-many)
  ├── Positions (one-to-many)
  ├── Orders (one-to-many)
  ├── Watchlists (one-to-many)
  │     └── WatchlistItems (one-to-many)
  ├── Alerts (one-to-many)
  ├── Notifications (one-to-many)
  ├── BankAccounts (one-to-many)
  └── Transactions (one-to-many)

Instrument (independent)
  └── Used in: Orders, Holdings, Positions, Watchlists
```

### Key Relationships

**One-to-One:**
- User ↔ Portfolio

**One-to-Many:**
- User → Holdings
- User → Orders
- User → Watchlists
- Watchlist → WatchlistItems

**Many-to-One:**
- Orders → Instrument
- Holdings → Instrument

### Indexes

Critical indexes for performance:
```sql
-- User queries
CREATE INDEX idx_user_clerk_id ON "User"(clerk_id);

-- Order queries
CREATE INDEX idx_orders_user_id ON "Order"(user_id);
CREATE INDEX idx_orders_status ON "Order"(status);
CREATE INDEX idx_orders_created_at ON "Order"(created_at);

-- Instrument queries
CREATE INDEX idx_instruments_symbol ON "Instrument"(symbol);
CREATE INDEX idx_instruments_exchange ON "Instrument"(exchange);
```

---

## API Design

### RESTful Principles

**Resource-Based URLs:**
```
/api/orders          - Order collection
/api/orders/[id]     - Single order
/api/orders/[id]/modify - Order action
```

**HTTP Methods:**
- `GET` - Read operations
- `POST` - Create operations
- `PATCH` - Update operations
- `DELETE` - Delete operations

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

### API Versioning

Currently using implicit v1. Future versions:
```
/api/v1/orders
/api/v2/orders
```

### Response Format

```typescript
// Success response
{
  data: T,
  message?: string
}

// Error response
{
  error: string,
  code: string,
  details?: any
}
```

---

## Frontend Architecture

### Directory Structure

```
app/
├── (dashboard)/          # Protected routes
│   ├── layout.tsx       # Dashboard layout with sidebar
│   └── [pages]/         # Dashboard pages
├── (onboarding)/         # Onboarding flow
│   ├── layout.tsx       # Minimal layout
│   └── [pages]/         # Onboarding steps
├── api/                  # API routes
│   └── [resources]/     # Resource endpoints
├── layout.tsx            # Root layout
└── page.tsx              # Landing page

components/
├── ui/                   # Base UI components
├── loading/              # Loading states
└── error/                # Error states

lib/
├── api-client.ts        # Centralized API client
├── types/api.ts         # TypeScript types
├── hooks/               # Custom hooks
└── utils/               # Utility functions
```

### State Management

**Server State (React Query):**
- API data fetching and caching
- Automatic refetching and invalidation
- Optimistic updates
- Prefetching

**Client State (React useState/useReducer):**
- Form inputs
- UI state (modals, dropdowns)
- Temporary state

**URL State (Next.js Router):**
- Filters and pagination
- Search queries
- Tab selection

### Component Patterns

**Container/Presentational Pattern:**
```typescript
// Container (logic)
export default function OrdersPage() {
  const { data, isLoading } = useOrders()
  return <OrdersTable data={data} loading={isLoading} />
}

// Presentational (UI)
export function OrdersTable({ data, loading }) {
  if (loading) return <Skeleton />
  return <table>...</table>
}
```

**Compound Component Pattern:**
```typescript
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Content>Content</Card.Content>
  <Card.Footer>Footer</Card.Footer>
</Card>
```

---

## Security

### Authentication

**Clerk Integration:**
- JWT-based authentication
- Automatic token refresh
- Session management
- Social login support

**Protected Routes:**
```typescript
// middleware.ts
export default clerkMiddleware()

// API route protection
const { userId } = await auth()
if (!userId) return unauthorized()
```

### Authorization

**Role-Based Access Control (RBAC):**
```typescript
enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN"
}

// Admin check
if (user.role !== 'ADMIN') {
  return forbidden()
}
```

### Data Protection

**SQL Injection Prevention:**
- Prisma parameterized queries
- No raw SQL queries

**XSS Prevention:**
- React auto-escaping
- DOMPurify for user HTML

**CSRF Protection:**
- Next.js built-in protection
- SameSite cookies

### API Security

**Rate Limiting:**
```typescript
// 100 requests per minute per user
const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100
})
```

**Input Validation:**
```typescript
// Zod schemas for all inputs
const orderSchema = z.object({
  symbol: z.string().min(1),
  quantity: z.number().positive(),
  price: z.number().positive()
})
```

---

## Performance Optimization

### 1. Server Components

**Benefits:**
- Zero JavaScript sent to client
- Direct database access
- Better SEO and initial load

**Usage:**
```typescript
// Server Component (default)
export default async function Page() {
  const data = await fetchData()
  return <Component data={data} />
}
```

### 2. React Query Caching

**Configuration:**
```typescript
{
  staleTime: 30000,      // 30 seconds
  cacheTime: 300000,     // 5 minutes
  refetchOnWindowFocus: true,
  retry: 1
}
```

### 3. Code Splitting

**Automatic:**
- Next.js route-based splitting
- Dynamic imports for heavy components

**Manual:**
```typescript
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />
})
```

### 4. Database Optimization

**Query Optimization:**
```typescript
// Include only needed fields
prisma.user.findMany({
  select: {
    id: true,
    email: true,
    firstName: true
  }
})

// Batch queries
const [users, orders] = await prisma.$transaction([
  prisma.user.findMany(),
  prisma.order.findMany()
])
```

### 5. Image Optimization

**Next.js Image Component:**
```typescript
<Image
  src="/image.jpg"
  width={800}
  height={600}
  alt="Image"
  loading="lazy"
/>
```

---

## Scalability

### Horizontal Scaling

**Vercel Deployment:**
- Automatic scaling based on traffic
- Edge network distribution
- Serverless functions

### Database Scaling

**Current: Single PostgreSQL Instance**
- Connection pooling via Prisma
- Indexed queries for performance

**Future: Read Replicas**
```
Write → Primary DB
Read  → Read Replica 1, 2, 3
```

### Caching Strategy

**Current:**
- React Query client-side cache
- Next.js static page cache

**Future:**
- Redis for API response caching
- CDN for static assets

### Microservices Migration Path

**Phase 1: Monolith (Current)**
```
Next.js App → PostgreSQL
```

**Phase 2: Modular Monolith**
```
Next.js App
  ├── Portfolio Service
  ├── Order Service
  └── Market Service
```

**Phase 3: Microservices**
```
API Gateway
  ├── Portfolio Service → DB1
  ├── Order Service → DB2
  └── Market Service → DB3
```

### Load Balancing

**Vercel Built-in:**
- Automatic load balancing
- Health checks
- Failover

### Monitoring & Observability

**Recommended Tools:**
- **Sentry** - Error tracking
- **Vercel Analytics** - Performance monitoring
- **Prisma Pulse** - Database monitoring
- **LogRocket** - Session replay

---

## Design Decisions

### Why Next.js 14?

✅ Server Components for better performance  
✅ Built-in API routes  
✅ File-based routing  
✅ Automatic code splitting  
✅ Edge deployment support  

### Why Prisma?

✅ Type-safe database queries  
✅ Auto-generated TypeScript types  
✅ Migration management  
✅ Multi-database support  
✅ Connection pooling  

### Why React Query?

✅ Automatic caching and refetching  
✅ Optimistic updates  
✅ DevTools for debugging  
✅ Better DX than SWR  

### Why Clerk?

✅ Plug-and-play authentication  
✅ Built-in user management  
✅ Social login support  
✅ Security best practices  
✅ Great Next.js integration  

### Why PostgreSQL?

✅ ACID compliance  
✅ Rich data types  
✅ JSON support  
✅ Full-text search  
✅ Mature ecosystem  

---

## Future Enhancements

### Phase 1: Real-time Features
- WebSocket integration for live quotes
- Server-Sent Events for notifications
- Real-time order updates

### Phase 2: Advanced Features
- Options chain visualization
- Strategy builder
- Backtesting engine
- Algorithmic trading

### Phase 3: Mobile
- React Native app
- Offline support
- Push notifications

### Phase 4: Infrastructure
- Redis caching layer
- Elasticsearch for search
- Apache Kafka for events
- Kubernetes deployment

---

For implementation details, see the source code and API documentation.
