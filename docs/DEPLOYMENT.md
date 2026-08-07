# TradeFlow Deployment Guide

Complete guide for deploying TradeFlow to production.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Vercel Deployment](#vercel-deployment)
- [Docker Deployment](#docker-deployment)
- [AWS Deployment](#aws-deployment)
- [Production Checklist](#production-checklist)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- [Vercel](https://vercel.com) - Hosting platform
- [Neon](https://neon.tech) or [Supabase](https://supabase.com) - PostgreSQL database
- [Clerk](https://clerk.com) - Authentication
- [GitHub](https://github.com) - Source control

### Local Requirements
- Node.js 18+ and npm
- Git
- PostgreSQL (for local testing)

---

## Environment Setup

### 1. Environment Variables

Create `.env.production` file:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/tradeflow?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/welcome"

# API Configuration
NEXT_PUBLIC_API_URL="https://your-domain.com/api"

# Broker Configuration (Production)
BROKER_TYPE="zerodha"  # or "upstox", "angelone"
BROKER_API_KEY="your_production_api_key"
BROKER_API_SECRET="your_production_api_secret"
BROKER_REDIRECT_URL="https://your-domain.com/broker/callback"

# Optional: WebSocket
NEXT_PUBLIC_WS_URL="wss://your-domain.com"

# Optional: Rate Limiting
RATE_LIMIT_ENABLED="true"
RATE_LIMIT_MAX_REQUESTS="100"
RATE_LIMIT_WINDOW_MS="60000"

# Optional: Monitoring
SENTRY_DSN="https://..."
SENTRY_AUTH_TOKEN="..."

# Optional: Email/SMS
RESEND_API_KEY="..."
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
```

### 2. Security Considerations

**Never commit sensitive data:**
```bash
# Add to .gitignore
.env
.env.local
.env.production
.env.*.local
```

**Use environment-specific configs:**
- `.env.development` - Local development
- `.env.production` - Production deployment
- `.env.test` - Testing environment

---

## Database Setup

### Option 1: Neon (Recommended)

**Advantages:** Free tier, serverless, auto-scaling, branching

1. **Create Neon Account**
   - Visit [neon.tech](https://neon.tech)
   - Sign up with GitHub

2. **Create Project**
   ```
   Project Name: tradeflow-prod
   Region: US East (Ohio) or closest to your users
   ```

3. **Get Connection String**
   ```
   Connection String (from Neon dashboard):
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/tradeflow?sslmode=require
   ```

4. **Add to Environment Variables**
   ```env
   DATABASE_URL="postgresql://..."
   ```

### Option 2: Supabase

**Advantages:** Free tier, built-in features, PostgreSQL 15

1. **Create Supabase Project**
   - Visit [supabase.com](https://supabase.com)
   - Create new project

2. **Get Connection String**
   ```
   Database Settings → Connection String → Connection pooling
   ```

3. **Configure Prisma**
   ```env
   DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
   ```

### Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Optional: Seed database
npx prisma db seed
```

### Database Backup

**Automated Backups:**
- Neon: Automatic point-in-time recovery
- Supabase: Daily backups included

**Manual Backup:**
```bash
# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

---

## Vercel Deployment

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Project**
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.production`
   - Set for: Production, Preview, Development

5. **Deploy**
   ```
   Click "Deploy"
   Wait for build to complete
   Visit your-project.vercel.app
   ```

6. **Custom Domain**
   ```
   Settings → Domains → Add Domain
   Enter: your-domain.com
   Update DNS records at your registrar
   ```

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Set environment variables
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
# ... add all other variables
```

### Deployment Configuration

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

---

## Docker Deployment

### Dockerfile

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=tradeflow
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Deploy with Docker

```bash
# Build image
docker build -t tradeflow .

# Run container
docker run -p 3000:3000 --env-file .env.production tradeflow

# Or use Docker Compose
docker-compose up -d
```

---

## AWS Deployment

### Option 1: AWS Amplify

1. **Connect Repository**
   - AWS Console → AWS Amplify
   - Connect to GitHub repository

2. **Configure Build**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
           - npx prisma generate
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Add Environment Variables**
   - App Settings → Environment Variables

4. **Deploy**
   - Automatic deployment on git push

### Option 2: AWS ECS (Fargate)

1. **Create ECR Repository**
   ```bash
   aws ecr create-repository --repository-name tradeflow
   ```

2. **Build and Push Image**
   ```bash
   docker build -t tradeflow .
   docker tag tradeflow:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/tradeflow:latest
   docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/tradeflow:latest
   ```

3. **Create ECS Task Definition**
   ```json
   {
     "family": "tradeflow",
     "containerDefinitions": [
       {
         "name": "tradeflow",
         "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/tradeflow:latest",
         "portMappings": [
           {
             "containerPort": 3000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "DATABASE_URL",
             "value": "postgresql://..."
           }
         ]
       }
     ]
   }
   ```

4. **Create ECS Service**
   ```bash
   aws ecs create-service \
     --cluster tradeflow-cluster \
     --service-name tradeflow-service \
     --task-definition tradeflow \
     --desired-count 2 \
     --launch-type FARGATE
   ```

---

## Production Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] TypeScript errors resolved
- [ ] Linting errors resolved
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Clerk webhook configured
- [ ] Broker API keys (production)
- [ ] Analytics setup (Google Analytics, Vercel Analytics)
- [ ] Error tracking setup (Sentry)

### Security

- [ ] HTTPS enabled (Vercel automatic)
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (Prisma)
- [ ] XSS protection (React + DOMPurify)
- [ ] CSRF protection (Next.js automatic)
- [ ] Secrets in environment variables (not code)
- [ ] API keys rotated from development

### Performance

- [ ] Database indexes created
- [ ] Image optimization enabled
- [ ] Code splitting configured
- [ ] React Query caching configured
- [ ] Server Components used where possible
- [ ] Static pages generated
- [ ] CDN configured (Vercel automatic)

### Monitoring

- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Database monitoring (Prisma Pulse)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Log aggregation (Logtail, Papertrail)

### Post-Deployment

- [ ] Health check endpoint working
- [ ] Database connection working
- [ ] Authentication working
- [ ] All pages loading correctly
- [ ] API endpoints responding
- [ ] Email notifications working (if configured)
- [ ] Broker API integration working
- [ ] Custom domain configured
- [ ] SSL certificate valid

---

## Monitoring

### Vercel Analytics

**Built-in metrics:**
- Real User Monitoring (RUM)
- Web Vitals (LCP, FID, CLS)
- Page load times
- API response times

**Setup:**
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Sentry Error Tracking

**Installation:**
```bash
npm install @sentry/nextjs
```

**Configuration:**
```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV
})
```

### Health Check Endpoint

Create `app/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        api: 'up'
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message
    }, { status: 503 })
  }
}
```

### Uptime Monitoring

**UptimeRobot Setup:**
1. Create account at [uptimerobot.com](https://uptimerobot.com)
2. Add monitor: `https://your-domain.com/api/health`
3. Set interval: 5 minutes
4. Configure alerts: Email, SMS, Slack

---

## Troubleshooting

### Build Failures

**Error: Module not found**
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

**Error: Prisma client not generated**
```bash
# Solution: Generate Prisma client
npx prisma generate
npm run build
```

### Database Issues

**Error: Connection timeout**
```bash
# Check DATABASE_URL format
# Ensure SSL mode is correct
# Check firewall rules
# Verify IP whitelist
```

**Error: Migration failed**
```bash
# Reset database (development only)
npx prisma migrate reset

# Or apply migrations manually
npx prisma migrate deploy
```

### Authentication Issues

**Error: Clerk middleware not working**
```typescript
// Ensure middleware.ts is at root level
// Check Clerk keys are correct
// Verify Clerk webhook is configured
```

### Performance Issues

**Slow page loads**
- Check React Query caching
- Verify database indexes
- Enable Server Components
- Optimize images with next/image

**High memory usage**
- Check for memory leaks in useEffect
- Optimize database queries
- Reduce bundle size
- Use dynamic imports

### API Issues

**Error: 500 Internal Server Error**
- Check server logs in Vercel dashboard
- Verify environment variables
- Check database connection
- Review Sentry error reports

**Error: 429 Too Many Requests**
- Adjust rate limiting settings
- Implement request queuing
- Use Redis for rate limiting

---

## Rollback Procedures

### Vercel Rollback

```bash
# Via Vercel Dashboard
Deployments → Select previous deployment → Promote to Production

# Via CLI
vercel rollback [deployment-url]
```

### Database Rollback

```bash
# Revert last migration
npx prisma migrate resolve --rolled-back [migration-name]

# Restore from backup
psql $DATABASE_URL < backup.sql
```

---

## Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Support

For deployment issues:
- Check Vercel documentation: https://vercel.com/docs
- Check Prisma documentation: https://www.prisma.io/docs
- Check Clerk documentation: https://clerk.com/docs
- Open GitHub issue: [repository-url]/issues

---

**Deployment Complete! 🚀**
