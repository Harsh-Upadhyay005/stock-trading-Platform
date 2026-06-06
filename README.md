<div align="center">

<img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
<img src="https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
<img src="https://img.shields.io/badge/TimescaleDB-2.x-FDB515?style=for-the-badge&logo=timescale&logoColor=black" />

<br/><br/>

# 📈 StockFlow

### A production-grade, full-stack stock trading platform built with Next.js 15, PostgreSQL, and real-time market data infrastructure.

<br/>

[Features](#-features) · [Tech Stack](#-tech-stack) · [Architecture](#-architecture) · [Getting Started](#-getting-started) · [Project Structure](#-project-structure) · [API Reference](#-api-reference) · [Database Schema](#-database-schema) · [Deployment](#-deployment) · [Contributing](#-contributing)

<br/>

> ⚠️ **Disclaimer:** This project is for educational and demonstration purposes only. It is not a licensed financial service and should not be used for actual securities trading.

</div>

---

## ✨ Features

### Trading
- 🔄 **Real-time order placement** — Market, Limit, Stop-Loss, and Stop-Loss Market orders
- 📊 **Live candlestick charts** — TradingView Lightweight Charts with 1m / 5m / 1d intervals
- 📖 **Live order book** — Real-time bid/ask depth via Socket.io
- 🔁 **Bracket & Cover orders** — Multi-leg order support with parent-child relationships
- ⚡ **GTT (Good Till Triggered)** — Single and OCO trigger rules

### Portfolio & Analytics
- 💼 **Live portfolio tracking** — Unrealised and realised P&L updated on every fill
- 📉 **Holdings breakdown** — Avg buy price, current value, day change
- 📋 **Complete trade history** — With brokerage, STT, GST, and stamp duty breakdown
- 💰 **Margin tracking** — Intraday vs overnight margin per instrument

### Market Data
- 📡 **Tick data ingestion** — Raw price ticks stored in TimescaleDB hypertables
- 🕯️ **OHLCV candles** — 1m, 5m, 1d via TimescaleDB continuous aggregates
- 🔔 **Price & volume alerts** — Repeating and one-shot alerts via multiple channels
- 🔍 **Instrument search** — Full-text search with `pg_trgm` GIN indexes

### Platform
- 🔐 **Auth** — Email/password + Google OAuth via NextAuth.js v5, JWT with refresh rotation
- 🪪 **KYC flow** — Document upload, admin review, status tracking
- 🔑 **API keys** — Hashed API keys with scoped permissions for programmatic access
- 👨‍💼 **Admin panel** — User management, KYC review, instrument master management
- 📱 **Responsive** — Fully usable on mobile

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, React Server Components) |
| **Language** | TypeScript 5.5 |
| **Database** | PostgreSQL 16 + TimescaleDB 2.x |
| **ORM** | Prisma 5 |
| **Cache / PubSub** | Redis 7 (ioredis) |
| **Auth** | NextAuth.js v5 (JWT + OAuth2) |
| **Real-time** | Socket.io 4 on custom Next.js server |
| **Queue** | BullMQ (order processing, alerts, notifications) |
| **Validation** | Zod 3 |
| **UI** | Tailwind CSS 4 + shadcn/ui + Radix UI |
| **Charts** | TradingView Lightweight Charts 4 |
| **State** | TanStack Query v5 + Zustand |
| **Forms** | React Hook Form + Zod |
| **Testing** | Vitest + React Testing Library + Playwright |
| **Logging** | Pino (structured JSON) |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│   Next.js App Router · TanStack Query · Zustand · Socket.io │
└────────────────────────┬───────────────────────┬────────────┘
                         │ HTTPS                  │ WSS
┌────────────────────────▼───────────────────────▼────────────┐
│                   Next.js 15 Server                          │
│   API Route Handlers (app/api/)  ·  Socket.io Server        │
│   NextAuth.js  ·  Zod Validation  ·  Pino Logging          │
│   Edge Middleware: JWT Auth + Rate Limiting                  │
└────────┬──────────────┬──────────────────┬──────────────────┘
         │              │                  │
┌────────▼───┐  ┌───────▼──────┐  ┌───────▼────────────────┐
│ PostgreSQL │  │    Redis 7   │  │  BullMQ Workers         │
│    16      │  │              │  │  (Order · Alert ·       │
│ TimescaleDB│  │ Cache · RateL│  │   Notification)         │
│ Prisma ORM │  │ imiter · PubS│  └────────────────────────┘
│ RLS enabled│  │ub · Sessions │
└────────────┘  └──────────────┘
```

### Data Flow — Order Placement

```
POST /api/orders
  → Zod validation
  → Margin check (service layer)
  → DB: INSERT order (status: PENDING)
  → BullMQ: push to order queue
  → Worker: send to exchange adapter
  → Exchange callback: UPDATE order (FILLED / REJECTED)
  → DB transaction: update trade + portfolio + fund_transactions
  → Redis PubSub → Socket.io → Client (live order update)
```

### Market Data Pipeline

```
External Feed Webhook
  → POST /api/webhooks/market-feed
  → Validate + normalize
  → INSERT into tick_data (TimescaleDB hypertable)
  → TimescaleDB continuous aggregates auto-refresh ohlcv_1m / 5m / 1d
  → Redis PubSub broadcast → Socket.io → All subscribed clients
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16 with TimescaleDB extension
- Redis 7
- pnpm (recommended) or npm

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/stockflow.git
cd stockflow
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Fill in the required variables (see [Environment Variables](#-environment-variables)).

### 3. Database Setup

```bash
# Run Prisma migrations
pnpx prisma migrate deploy

# Set up TimescaleDB hypertables & continuous aggregates
psql $DATABASE_URL -f database/sql/timescale/create_hypertables.sql

# Create performance indexes + RLS policies
psql $DATABASE_URL -f database/sql/indexes/performance_indexes_and_rls.sql

# Seed development data
pnpx ts-node database/prisma/seed.ts
```

### 4. Run the App

```bash
# Development (Next.js + Socket.io server + BullMQ workers)
pnpm dev

# Workers run separately in development
pnpm dev:workers
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```
stockflow/
├── src/
│   ├── app/
│   │   ├── (auth)/                    # Login, Register pages
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/               # Main app (protected)
│   │   │   ├── layout.tsx             # Sidebar + header layout
│   │   │   ├── page.tsx               # Market overview dashboard
│   │   │   ├── trade/
│   │   │   │   ├── page.tsx           # Full trading terminal
│   │   │   │   └── [symbol]/page.tsx  # Symbol-specific terminal
│   │   │   ├── portfolio/
│   │   │   │   ├── page.tsx           # Portfolio summary + P&L
│   │   │   │   └── holdings/page.tsx  # Position breakdown
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx           # Order book + history
│   │   │   │   └── [id]/page.tsx      # Order detail + fills
│   │   │   ├── watchlist/page.tsx
│   │   │   ├── alerts/page.tsx
│   │   │   └── settings/
│   │   ├── admin/                     # Admin-only section
│   │   │   ├── users/page.tsx
│   │   │   └── instruments/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── market/
│   │   │   │   ├── quotes/route.ts
│   │   │   │   ├── ohlcv/route.ts
│   │   │   │   └── search/route.ts
│   │   │   ├── orders/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       └── cancel/route.ts
│   │   │   ├── portfolio/route.ts
│   │   │   ├── watchlist/route.ts
│   │   │   ├── alerts/route.ts
│   │   │   ├── admin/
│   │   │   └── webhooks/market-feed/route.ts
│   │   ├── layout.tsx                 # Root layout + providers
│   │   ├── providers.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                        # shadcn/ui components
│   │   ├── charts/
│   │   │   ├── CandlestickChart.tsx   # TradingView Lightweight Charts
│   │   │   ├── PortfolioPieChart.tsx
│   │   │   └── PnLLineChart.tsx
│   │   ├── trade/
│   │   │   ├── OrderForm.tsx
│   │   │   ├── OrderBook.tsx
│   │   │   └── TradeHistory.tsx
│   │   ├── portfolio/
│   │   ├── market/
│   │   ├── layout/
│   │   └── shared/
│   │       ├── DataTable.tsx          # TanStack Table v8
│   │       └── PriceChange.tsx
│   ├── hooks/
│   │   ├── useMarketSocket.ts
│   │   ├── useOrderSocket.ts
│   │   ├── useOrders.ts               # TanStack Query wrappers
│   │   └── usePortfolio.ts
│   ├── services/
│   │   ├── order.service.ts
│   │   ├── portfolio.service.ts
│   │   ├── market.service.ts
│   │   └── alert.service.ts
│   ├── workers/
│   │   ├── order.worker.ts            # BullMQ order processor
│   │   └── alert.worker.ts
│   ├── store/
│   │   ├── market.store.ts            # Zustand: live prices
│   │   └── ui.store.ts
│   ├── lib/
│   │   ├── db.ts                      # Prisma singleton
│   │   ├── redis.ts                   # ioredis singleton
│   │   ├── auth.ts                    # NextAuth config
│   │   ├── socket.ts                  # Socket.io server
│   │   └── queue.ts                   # BullMQ setup
│   ├── validators/                    # Zod schemas
│   ├── types/
│   └── middleware.ts                  # Edge auth + rate limiting
├── database/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── sql/
│       ├── timescale/
│       │   └── create_hypertables.sql
│       └── indexes/
│           └── performance_indexes_and_rls.sql
├── server.ts                          # Custom Next.js + Socket.io server
├── .env.example
└── README.md
```

---

## 🗄 Database Schema

17 models across 6 domains. All money values stored as **BigInt in paise** to avoid floating-point errors.

| Domain | Models |
|---|---|
| **Auth & Users** | `User`, `Session`, `OAuthAccount`, `KycDocument`, `UserPreference`, `UserDevice`, `ApiKey` |
| **Trading Accounts** | `Account`, `AccountMargin` |
| **Instruments** | `Instrument`, `InstrumentMargin` |
| **Orders & Trades** | `Order`, `Trade`, `FundTransaction` |
| **Market Data** | `TickData`, `Ohlcv1m`, `Ohlcv5m`, `Ohlcv1d` (TimescaleDB hypertables) |
| **Features** | `Watchlist`, `WatchlistItem`, `Alert`, `AlertTriggerLog`, `Notification`, `GttRule`, `AuditLog` |

Key design decisions:

- **All monetary values in BigInt (paise)** — ₹100.50 is stored as `10050`. No floats near financials.
- **TimescaleDB hypertables** for `tick_data` and `ohlcv_*` — automatic time partitioning, columnar compression, and continuous aggregates.
- **Optimistic locking** on `orders` and `portfolios` via a `version` column — prevents race conditions on concurrent fills.
- **Row Level Security (RLS)** at the database layer — users can only access their own data regardless of application bugs.
- **Append-only `audit_log`** — every state-mutating action is logged with before/after snapshots.

See [`database/prisma/schema.prisma`](database/prisma/schema.prisma) for the full schema.

---

## 📡 API Reference

All endpoints require `Authorization: Bearer <token>` except auth routes.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signin` | Sign in with email or OAuth |
| `POST` | `/api/auth/signout` | Invalidate session |
| `POST` | `/api/auth/refresh` | Rotate access token |
| `GET` | `/api/auth/session` | Current session |

### Market Data
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/market/quotes?symbols=RELIANCE,TCS` | Live quotes (Redis-cached, 1s TTL) |
| `GET` | `/api/market/ohlcv?symbol=RELIANCE&interval=5m` | OHLCV candles |
| `GET` | `/api/market/search?q=reli` | Instrument search |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/orders` | Paginated order history |
| `POST` | `/api/orders` | Place a new order |
| `GET` | `/api/orders/:id` | Order detail + fill history |
| `PATCH` | `/api/orders/:id` | Modify pending order |
| `POST` | `/api/orders/:id/cancel` | Cancel pending order |

### Portfolio
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/portfolio` | Summary: total value, day P&L |
| `GET` | `/api/portfolio/holdings` | Individual position breakdown |

### Watchlist & Alerts
| Method | Endpoint | Description |
|---|---|---|
| `GET / POST` | `/api/watchlist` | List or create watchlists |
| `PATCH / DELETE` | `/api/watchlist/:id` | Update or delete |
| `GET / POST` | `/api/alerts` | List or create price alerts |
| `DELETE` | `/api/alerts/:id` | Remove alert |

### Standard Response Format

```json
// Success
{
  "success": true,
  "data": { },
  "meta": { "page": 1, "total": 100, "limit": 20 }
}

// Error
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_MARGIN",
    "message": "Required margin ₹12,450. Available ₹8,200.",
    "details": {}
  }
}
```

---

## 🌍 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/stockflow"
DIRECT_DATABASE_URL="postgresql://user:password@localhost:5432/stockflow"

# Redis
REDIS_URL="redis://localhost:6379"

# Auth
NEXTAUTH_SECRET="your-32-char-random-secret"
NEXTAUTH_URL="http://localhost:3000"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Market Data Feed
MARKET_FEED_API_KEY=""
MARKET_FEED_WEBHOOK_SECRET=""

# Exchange Integration
EXCHANGE_API_KEY=""
EXCHANGE_API_SECRET=""
EXCHANGE_BASE_URL=""

# App
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
PINO_LOG_LEVEL="debug"
```

---

## 🚢 Deployment

### Docker (Self-hosted)

```bash
# Build and run all services
docker compose up -d

# Run migrations inside container
docker compose exec app pnpx prisma migrate deploy
docker compose exec app psql $DATABASE_URL -f database/sql/timescale/create_hypertables.sql
```

> Note: Socket.io requires a persistent server. Self-hosting via Docker or Railway is recommended. Vercel Serverless does not support Socket.io without additional configuration.

### Vercel (Without Socket.io)

If you don't need real-time WebSocket features, the app deploys to Vercel as-is:

```bash
vercel deploy
```

Add all environment variables in the Vercel dashboard under **Settings → Environment Variables**.

---

## 🧪 Testing

```bash
# Unit + integration tests (Vitest)
pnpm test

# Run with coverage
pnpm test:coverage

# API integration tests (Supertest against test DB)
pnpm test:api

# End-to-end tests (Playwright)
pnpm test:e2e
```

Target coverage: **80%+** on services and API route handlers.

---

## 🔐 Security

- JWT access tokens (15m expiry) + refresh token rotation
- Edge middleware validates tokens before requests reach route handlers
- Rate limiting: 100 req/min per user, 20 req/min on order placement
- All inputs validated with Zod — no raw user input reaches the database
- Prisma parameterized queries — SQL injection is not possible
- Row Level Security (RLS) at DB layer as a secondary enforcement layer
- API keys stored as SHA-256 hashes — the plaintext is shown once and never stored
- CSRF protection on all state-mutating routes
- Helmet security headers on the custom server

---

## 🗺 Roadmap

- [ ] Options chain view
- [ ] Paper trading mode (simulated fills, no real money)
- [ ] Strategy backtesting with historical OHLCV data
- [ ] Mobile app (React Native + shared API layer)
- [ ] Multi-broker support via unified adapter interface
- [ ] Webhook support for third-party alert delivery
- [ ] Tax P&L report generation (FIFO + LIFO)

---

## 🤝 Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit with conventional commits: `git commit -m "feat: add options chain view"`
4. Push and open a Pull Request

Please make sure all tests pass before submitting a PR:

```bash
pnpm test && pnpm test:e2e
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with Next.js 15, PostgreSQL, TimescaleDB, and Redis.

If you found this useful, consider giving it a ⭐

</div>
