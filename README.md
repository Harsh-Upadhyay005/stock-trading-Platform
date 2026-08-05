# TradeFlow - Full-Stack Trading Platform

TradeFlow is a production-ready trading platform built with Next.js 16, Prisma, PostgreSQL, and Clerk authentication. It provides a complete solution for equity and derivatives trading with real-time market data, portfolio management, and comprehensive admin tools.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Clerk account for authentication

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd tradeflow

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
tradeflow/
├── app/                          # Next.js 14 App Router
│   ├── (dashboard)/             # Main dashboard pages (auth required)
│   │   ├── dashboard/           # Portfolio overview
│   │   ├── trade/               # Trading interface
│   │   ├── orders/              # Order management
│   │   ├── portfolio/           # Portfolio & holdings
│   │   ├── positions/           # Open positions
│   │   ├── market/              # Market overview
│   │   ├── watchlists/          # Watchlist management
│   │   ├── search/              # Symbol search
│   │   ├── alerts/              # Price alerts
│   │   ├── notifications/       # User notifications
│   │   ├── activity/            # Activity timeline
│   │   ├── reports/             # Reports & analytics
│   │   ├── analytics/           # Performance analytics
│   │   ├── summary/             # Account summary
│   │   ├── funds/               # Fund management
│   │   ├── account/             # Profile, settings, banking, KYC
│   │   ├── admin/               # Admin dashboard, users, instruments
│   │   ├── tools/               # Trading calculators
│   │   └── help/                # Help & support
│   ├── (onboarding)/            # New user onboarding
│   │   ├── welcome/             # Welcome page
│   │   ├── profile/             # Profile setup
│   │   └── risk-assessment/     # Risk questionnaire
│   ├── api/                     # API routes (40+ endpoints)
│   │   ├── portfolio/           # Portfolio APIs
│   │   ├── orders/              # Order APIs
│   │   ├── market/              # Market data APIs
│   │   ├── instruments/         # Instrument APIs
│   │   ├── watchlists/          # Watchlist APIs
│   │   ├── alerts/              # Alert APIs
│   │   ├── notifications/       # Notification APIs
│   │   ├── activity/            # Activity APIs
│   │   ├── reports/             # Report APIs
│   │   ├── account/             # Account APIs
│   │   ├── funds/               # Fund APIs
│   │   └── admin/               # Admin APIs
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout
│   └── providers.tsx            # React Query provider
├── components/                   # Reusable components
│   ├── ui/                      # shadcn/ui components
│   ├── loading/                 # Loading skeletons
│   └── error/                   # Error states
├── lib/                         # Utilities & helpers
│   ├── api-client.ts           # Centralized API client
│   ├── types/api.ts            # TypeScript types
│   ├── hooks/use-queries.ts    # React Query hooks
│   ├── brokers/                # Broker integrations
│   └── prisma.ts               # Prisma client
├── generated/prisma/           # Prisma generated files
│   └── schema.prisma           # Database schema
├── services/                    # Business logic services
├── validators/                  # Zod validation schemas
└── docs/                       # Documentation
    ├── API_REFERENCE.md        # API documentation
    ├── ARCHITECTURE.md         # Architecture guide
    └── DEPLOYMENT.md           # Deployment guide
```

## 🎨 Features

### Core Trading
- **Real-time Market Data** - Live quotes and market depth
- **Order Management** - Place, modify, cancel orders (MKT, LMT, SL, SL-M)
- **Portfolio Tracking** - Holdings, positions, P&L tracking
- **Multi-Asset Support** - Equity, Derivatives (Options, Futures)
- **Watchlists** - Create and manage multiple watchlists
- **Price Alerts** - Set price-based alerts with notifications

### User Experience
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark/Light Theme** - Monochrome black & white design
- **Real-time Updates** - React Query with optimistic updates
- **Loading States** - Skeleton loaders for better UX
- **Error Handling** - Comprehensive error messages
- **Toast Notifications** - sonner for user feedback

### Account Management
- **Profile Management** - Personal info, trading experience
- **Bank Accounts** - Multiple bank accounts, primary selection
- **KYC Verification** - Document upload and verification
- **Fund Management** - Deposit, withdraw, transaction history
- **Settings** - Notifications, 2FA, privacy controls

### Admin Tools
- **User Management** - View, suspend, activate users
- **KYC Verification** - Approve/reject KYC applications
- **Instrument Management** - Enable/disable trading
- **Platform Statistics** - User metrics, trading volume

### Security
- **Authentication** - Clerk-based secure authentication
- **Role-Based Access** - Admin/user role separation
- **API Security** - All endpoints protected with auth checks
- **Input Validation** - Zod schemas for all inputs
- **SQL Injection Prevention** - Prisma parameterized queries

## 🛠 Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI)
- **State Management:** React Query (TanStack Query)
- **Forms:** React Hook Form + Zod
- **Notifications:** sonner
- **Charts:** Recharts

### Backend
- **Runtime:** Node.js
- **API:** Next.js API Routes
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Clerk
- **Validation:** Zod

### Infrastructure
- **Deployment:** Vercel (recommended)
- **Database Hosting:** Neon, Supabase, or Railway
- **File Storage:** Ready for S3/Cloudflare R2
- **Monitoring:** Ready for Sentry integration

## 📊 Database Schema

### Core Tables
- **User** - User accounts with Clerk integration
- **Portfolio** - User portfolio summaries
- **Holding** - Current stock holdings
- **Position** - Open trading positions
- **Order** - Order history and status
- **Instrument** - Tradable instruments (stocks, options)
- **Watchlist** - User watchlists
- **WatchlistItem** - Items in watchlists
- **Alert** - Price alerts
- **Notification** - User notifications
- **Activity** - Activity logs
- **BankAccount** - User bank accounts
- **Transaction** - Fund transactions

See `generated/prisma/schema.prisma` for complete schema.

## 🔐 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/tradeflow"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# Broker Configuration
BROKER_TYPE="mock"  # Options: mock, zerodha, upstox, angelone
BROKER_API_KEY=""
BROKER_API_SECRET=""
BROKER_REDIRECT_URL=""

# Optional: WebSocket
NEXT_PUBLIC_WS_URL="ws://localhost:3001"

# Optional: Rate Limiting
RATE_LIMIT_ENABLED="true"
RATE_LIMIT_MAX_REQUESTS="100"
RATE_LIMIT_WINDOW_MS="60000"
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   vercel
   ```

2. **Add Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all variables from `.env.example`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Docker

```bash
# Build image
docker build -t tradeflow .

# Run container
docker run -p 3000:3000 --env-file .env tradeflow
```

See `docs/DEPLOYMENT.md` for detailed deployment instructions.

## 📖 Documentation

- **[API Reference](docs/API_REFERENCE.md)** - Complete API documentation
- **[Architecture Guide](docs/ARCHITECTURE.md)** - System architecture and design decisions
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Deployment instructions and best practices

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run E2E tests
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Clerk](https://clerk.com/) - Authentication
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [TanStack Query](https://tanstack.com/query) - Data fetching

## 📞 Support

For support, email support@tradeflow.com or join our Slack channel.

## 🗺 Roadmap

- [ ] WebSocket integration for real-time updates
- [ ] Advanced charting with TradingView
- [ ] Options chain visualization
- [ ] Strategy builder and backtesting
- [ ] Mobile app (React Native)
- [ ] API rate limiting with Redis
- [ ] Email/SMS notifications
- [ ] Multi-language support
- [ ] PDF report generation
- [ ] Tax report automation

---

**Built with ❤️ by the TradeFlow Team**
