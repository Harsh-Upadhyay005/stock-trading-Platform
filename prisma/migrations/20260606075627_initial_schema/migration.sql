-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('INVESTOR', 'TRADER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ONBOARDING', 'ACTIVE', 'SUSPENDED', 'BANNED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "KYCStatus" AS ENUM ('NOT_SUBMITTED', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('CASH', 'MARGIN', 'RETIREMENT', 'DEMO');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'RESTRICTED', 'FROZEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "OrderSide" AS ENUM ('BUY', 'SELL', 'SELL_SHORT', 'BUY_TO_COVER');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT', 'TRAILING_STOP', 'OCO', 'BRACKET');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'OPEN', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "OrderDuration" AS ENUM ('DAY', 'GTC', 'IOC', 'FOK', 'GTD', 'EXT');

-- CreateEnum
CREATE TYPE "PositionSide" AS ENUM ('LONG', 'SHORT');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'TRADE_BUY', 'TRADE_SELL', 'DIVIDEND', 'INTEREST', 'FEE', 'TAX', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REVERSED');

-- CreateEnum
CREATE TYPE "AssetClass" AS ENUM ('EQUITY', 'ETF', 'OPTION', 'FUTURE', 'FOREX', 'CRYPTO', 'BOND', 'MUTUAL_FUND', 'INDEX');

-- CreateEnum
CREATE TYPE "MarketStatus" AS ENUM ('PRE_MARKET', 'OPEN', 'POST_MARKET', 'CLOSED', 'HALTED');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('PRICE_ABOVE', 'PRICE_BELOW', 'PERCENT_CHANGE', 'VOLUME_SPIKE', 'NEWS', 'EARNINGS', 'DIVIDEND');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'TRIGGERED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER_FILLED', 'ORDER_REJECTED', 'PRICE_ALERT', 'DEPOSIT_CONFIRMED', 'WITHDRAWAL_PROCESSED', 'KYC_STATUS_CHANGE', 'SYSTEM_ANNOUNCEMENT', 'MARGIN_CALL', 'ACCOUNT_ACTIVITY');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'PUSH');

-- CreateEnum
CREATE TYPE "WatchlistVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "OptionType" AS ENUM ('CALL', 'PUT');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'WIRE', 'ACH', 'CARD', 'UPI', 'CRYPTO');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE', 'SPECULATIVE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'INVESTOR',
    "status" "UserStatus" NOT NULL DEFAULT 'ONBOARDING',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "locale" TEXT NOT NULL DEFAULT 'en-IN',
    "referralCode" TEXT NOT NULL,
    "referredById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "bio" TEXT,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "address" TEXT,
    "postalCode" TEXT,
    "nationality" TEXT,
    "taxId" TEXT,
    "occupation" TEXT,
    "annualIncome" DECIMAL(18,2),
    "netWorth" DECIMAL(18,2),
    "investmentGoals" TEXT[],
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "onboardingDoneAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "permissions" TEXT[],
    "ipWhitelist" TEXT[],
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "KYCStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "level" INTEGER NOT NULL DEFAULT 1,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "reviewedBy" TEXT,
    "providerRef" TEXT,
    "riskScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kyc_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_documents" (
    "id" TEXT NOT NULL,
    "kycRecordId" TEXT NOT NULL,
    "docType" TEXT NOT NULL,
    "docNumber" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileHash" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kyc_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'MODERATE',
    "score" INTEGER NOT NULL DEFAULT 50,
    "maxPositionSize" DECIMAL(5,2) NOT NULL,
    "maxDailyLoss" DECIMAL(5,2) NOT NULL,
    "allowedAssets" "AssetClass"[],
    "marginEnabled" BOOLEAN NOT NULL DEFAULT false,
    "shortSellingAllowed" BOOLEAN NOT NULL DEFAULT false,
    "optionsLevel" INTEGER NOT NULL DEFAULT 0,
    "assessedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "risk_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trading_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "type" "AccountType" NOT NULL DEFAULT 'CASH',
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "cashBalance" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "buyingPower" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "marginBalance" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "marginUsed" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "maintenanceMargin" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "totalPortfolioValue" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "dayPnl" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "totalPnl" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "trading_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "symbolId" TEXT NOT NULL,
    "side" "PositionSide" NOT NULL DEFAULT 'LONG',
    "quantity" DECIMAL(18,6) NOT NULL,
    "avgCostBasis" DECIMAL(18,6) NOT NULL,
    "currentPrice" DECIMAL(18,6) NOT NULL,
    "marketValue" DECIMAL(20,4) NOT NULL,
    "unrealizedPnl" DECIMAL(20,4) NOT NULL,
    "unrealizedPnlPct" DECIMAL(8,4) NOT NULL,
    "realizedPnl" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "dayPnl" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_snapshots" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "totalValue" DECIMAL(20,4) NOT NULL,
    "cashBalance" DECIMAL(20,4) NOT NULL,
    "investedValue" DECIMAL(20,4) NOT NULL,
    "dayReturn" DECIMAL(20,4) NOT NULL,
    "totalReturn" DECIMAL(20,4) NOT NULL,
    "snapshotAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchanges" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "website" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exchanges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_hours" (
    "id" TEXT NOT NULL,
    "exchangeId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "isHoliday" BOOLEAN NOT NULL DEFAULT false,
    "holidayDate" TIMESTAMP(3),
    "note" TEXT,

    CONSTRAINT "market_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "symbols" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "exchangeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT,
    "assetClass" "AssetClass" NOT NULL DEFAULT 'EQUITY',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "isin" TEXT,
    "cusip" TEXT,
    "faceValue" DECIMAL(18,4),
    "lotSize" INTEGER NOT NULL DEFAULT 1,
    "tickSize" DECIMAL(18,6) NOT NULL DEFAULT 0.05,
    "sector" TEXT,
    "industry" TEXT,
    "marketCap" DECIMAL(24,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isTradable" BOOLEAN NOT NULL DEFAULT true,
    "isShortable" BOOLEAN NOT NULL DEFAULT false,
    "marginable" BOOLEAN NOT NULL DEFAULT false,
    "underlyingId" TEXT,
    "logoUrl" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "symbols_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "symbolId" TEXT NOT NULL,
    "open" DECIMAL(18,6) NOT NULL,
    "high" DECIMAL(18,6) NOT NULL,
    "low" DECIMAL(18,6) NOT NULL,
    "close" DECIMAL(18,6) NOT NULL,
    "previousClose" DECIMAL(18,6) NOT NULL,
    "lastPrice" DECIMAL(18,6) NOT NULL,
    "bidPrice" DECIMAL(18,6),
    "askPrice" DECIMAL(18,6),
    "bidSize" INTEGER,
    "askSize" INTEGER,
    "volume" BIGINT NOT NULL,
    "avgVolume" BIGINT,
    "change" DECIMAL(18,6) NOT NULL,
    "changePct" DECIMAL(8,4) NOT NULL,
    "weekHigh52" DECIMAL(18,6),
    "weekLow52" DECIMAL(18,6),
    "marketStatus" "MarketStatus" NOT NULL DEFAULT 'CLOSED',
    "tradedAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ohlcv" (
    "id" TEXT NOT NULL,
    "symbolId" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "open" DECIMAL(18,6) NOT NULL,
    "high" DECIMAL(18,6) NOT NULL,
    "low" DECIMAL(18,6) NOT NULL,
    "close" DECIMAL(18,6) NOT NULL,
    "volume" BIGINT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ohlcv_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fundamentals" (
    "id" TEXT NOT NULL,
    "symbolId" TEXT NOT NULL,
    "peRatio" DECIMAL(10,4),
    "pbRatio" DECIMAL(10,4),
    "psRatio" DECIMAL(10,4),
    "evEbitda" DECIMAL(10,4),
    "eps" DECIMAL(18,4),
    "epsGrowthYoy" DECIMAL(8,4),
    "revenue" DECIMAL(24,2),
    "revenueGrowthYoy" DECIMAL(8,4),
    "netIncome" DECIMAL(24,2),
    "grossMargin" DECIMAL(8,4),
    "netMargin" DECIMAL(8,4),
    "roe" DECIMAL(8,4),
    "roa" DECIMAL(8,4),
    "debtToEquity" DECIMAL(10,4),
    "currentRatio" DECIMAL(10,4),
    "dividendYield" DECIMAL(8,4),
    "beta" DECIMAL(8,4),
    "reportedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fundamentals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dividends" (
    "id" TEXT NOT NULL,
    "symbolId" TEXT NOT NULL,
    "amount" DECIMAL(18,6) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "exDividendDate" TIMESTAMP(3) NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "recordDate" TIMESTAMP(3),
    "frequency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dividends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_splits" (
    "id" TEXT NOT NULL,
    "symbolId" TEXT NOT NULL,
    "ratio" DECIMAL(10,4) NOT NULL,
    "splitDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_splits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "option_contracts" (
    "id" TEXT NOT NULL,
    "symbolId" TEXT NOT NULL,
    "contractSymbol" TEXT NOT NULL,
    "optionType" "OptionType" NOT NULL,
    "strikePrice" DECIMAL(18,4) NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "lotSize" INTEGER NOT NULL DEFAULT 100,
    "openInterest" BIGINT,
    "impliedVol" DECIMAL(8,4),
    "delta" DECIMAL(8,6),
    "gamma" DECIMAL(8,6),
    "theta" DECIMAL(8,6),
    "vega" DECIMAL(8,6),
    "rho" DECIMAL(8,6),
    "lastPrice" DECIMAL(18,4),
    "bid" DECIMAL(18,4),
    "ask" DECIMAL(18,4),
    "volume" BIGINT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "option_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "symbolId" TEXT NOT NULL,
    "clientOrderId" TEXT,
    "side" "OrderSide" NOT NULL,
    "type" "OrderType" NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "duration" "OrderDuration" NOT NULL DEFAULT 'DAY',
    "quantity" DECIMAL(18,6) NOT NULL,
    "filledQuantity" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "remainingQuantity" DECIMAL(18,6) NOT NULL,
    "limitPrice" DECIMAL(18,6),
    "stopPrice" DECIMAL(18,6),
    "trailAmount" DECIMAL(18,6),
    "trailPercent" DECIMAL(8,4),
    "avgFillPrice" DECIMAL(18,6),
    "estimatedAmount" DECIMAL(20,4),
    "filledAmount" DECIMAL(20,4),
    "commission" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "tax" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "otherCharges" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(20,4),
    "extendedHours" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "rejectionReason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filledAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "linkedOrderId" TEXT,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_fills" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "quantity" DECIMAL(18,6) NOT NULL,
    "price" DECIMAL(18,6) NOT NULL,
    "commission" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "tax" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "executionId" TEXT,
    "filledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_fills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "amount" DECIMAL(20,4) NOT NULL,
    "fee" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "tax" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(20,4) NOT NULL,
    "balanceBefore" DECIMAL(20,4) NOT NULL,
    "balanceAfter" DECIMAL(20,4) NOT NULL,
    "description" TEXT,
    "referenceId" TEXT,
    "externalRef" TEXT,
    "paymentMethod" "PaymentMethod",
    "metadata" JSONB,
    "processedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "ifscCode" TEXT,
    "routingNumber" TEXT,
    "accountType" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watchlists" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "visibility" "WatchlistVisibility" NOT NULL DEFAULT 'PRIVATE',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "watchlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watchlist_items" (
    "id" TEXT NOT NULL,
    "watchlistId" TEXT NOT NULL,
    "symbolId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watchlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_alerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbolId" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "targetValue" DECIMAL(18,6) NOT NULL,
    "message" TEXT,
    "triggeredAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "clerkSessionId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "oldData" JSONB,
    "newData" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_referralCode_key" ON "users"("referralCode");

-- CreateIndex
CREATE INDEX "users_clerkId_idx" ON "users"("clerkId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_referredById_idx" ON "users"("referredById");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_keyHash_key" ON "api_keys"("keyHash");

-- CreateIndex
CREATE INDEX "api_keys_userId_idx" ON "api_keys"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "kyc_records_userId_key" ON "kyc_records"("userId");

-- CreateIndex
CREATE INDEX "kyc_documents_kycRecordId_idx" ON "kyc_documents"("kycRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "risk_profiles_userId_key" ON "risk_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "trading_accounts_accountNumber_key" ON "trading_accounts"("accountNumber");

-- CreateIndex
CREATE INDEX "trading_accounts_userId_idx" ON "trading_accounts"("userId");

-- CreateIndex
CREATE INDEX "trading_accounts_accountNumber_idx" ON "trading_accounts"("accountNumber");

-- CreateIndex
CREATE INDEX "positions_accountId_idx" ON "positions"("accountId");

-- CreateIndex
CREATE INDEX "positions_symbolId_idx" ON "positions"("symbolId");

-- CreateIndex
CREATE UNIQUE INDEX "positions_accountId_symbolId_side_key" ON "positions"("accountId", "symbolId", "side");

-- CreateIndex
CREATE INDEX "portfolio_snapshots_accountId_idx" ON "portfolio_snapshots"("accountId");

-- CreateIndex
CREATE INDEX "portfolio_snapshots_snapshotAt_idx" ON "portfolio_snapshots"("snapshotAt");

-- CreateIndex
CREATE UNIQUE INDEX "exchanges_code_key" ON "exchanges"("code");

-- CreateIndex
CREATE INDEX "market_hours_exchangeId_idx" ON "market_hours"("exchangeId");

-- CreateIndex
CREATE UNIQUE INDEX "symbols_isin_key" ON "symbols"("isin");

-- CreateIndex
CREATE INDEX "symbols_ticker_idx" ON "symbols"("ticker");

-- CreateIndex
CREATE INDEX "symbols_assetClass_idx" ON "symbols"("assetClass");

-- CreateIndex
CREATE INDEX "symbols_sector_idx" ON "symbols"("sector");

-- CreateIndex
CREATE UNIQUE INDEX "symbols_ticker_exchangeId_key" ON "symbols"("ticker", "exchangeId");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_symbolId_key" ON "quotes"("symbolId");

-- CreateIndex
CREATE INDEX "ohlcv_symbolId_interval_idx" ON "ohlcv"("symbolId", "interval");

-- CreateIndex
CREATE INDEX "ohlcv_timestamp_idx" ON "ohlcv"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "ohlcv_symbolId_interval_timestamp_key" ON "ohlcv"("symbolId", "interval", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "fundamentals_symbolId_key" ON "fundamentals"("symbolId");

-- CreateIndex
CREATE INDEX "dividends_symbolId_idx" ON "dividends"("symbolId");

-- CreateIndex
CREATE INDEX "stock_splits_symbolId_idx" ON "stock_splits"("symbolId");

-- CreateIndex
CREATE UNIQUE INDEX "option_contracts_contractSymbol_key" ON "option_contracts"("contractSymbol");

-- CreateIndex
CREATE INDEX "option_contracts_symbolId_optionType_expirationDate_idx" ON "option_contracts"("symbolId", "optionType", "expirationDate");

-- CreateIndex
CREATE UNIQUE INDEX "orders_clientOrderId_key" ON "orders"("clientOrderId");

-- CreateIndex
CREATE INDEX "orders_accountId_idx" ON "orders"("accountId");

-- CreateIndex
CREATE INDEX "orders_symbolId_idx" ON "orders"("symbolId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_submittedAt_idx" ON "orders"("submittedAt");

-- CreateIndex
CREATE INDEX "order_fills_orderId_idx" ON "order_fills"("orderId");

-- CreateIndex
CREATE INDEX "transactions_accountId_idx" ON "transactions"("accountId");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_createdAt_idx" ON "transactions"("createdAt");

-- CreateIndex
CREATE INDEX "bank_accounts_userId_idx" ON "bank_accounts"("userId");

-- CreateIndex
CREATE INDEX "watchlists_userId_idx" ON "watchlists"("userId");

-- CreateIndex
CREATE INDEX "watchlist_items_watchlistId_idx" ON "watchlist_items"("watchlistId");

-- CreateIndex
CREATE UNIQUE INDEX "watchlist_items_watchlistId_symbolId_key" ON "watchlist_items"("watchlistId", "symbolId");

-- CreateIndex
CREATE INDEX "price_alerts_userId_idx" ON "price_alerts"("userId");

-- CreateIndex
CREATE INDEX "price_alerts_symbolId_status_idx" ON "price_alerts"("symbolId", "status");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_type_channel_key" ON "notification_preferences"("userId", "type", "channel");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_clerkSessionId_idx" ON "audit_logs"("clerkSessionId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_records" ADD CONSTRAINT "kyc_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_kycRecordId_fkey" FOREIGN KEY ("kycRecordId") REFERENCES "kyc_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_profiles" ADD CONSTRAINT "risk_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trading_accounts" ADD CONSTRAINT "trading_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "trading_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_symbolId_fkey" FOREIGN KEY ("symbolId") REFERENCES "symbols"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_snapshots" ADD CONSTRAINT "portfolio_snapshots_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "trading_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_hours" ADD CONSTRAINT "market_hours_exchangeId_fkey" FOREIGN KEY ("exchangeId") REFERENCES "exchanges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "symbols" ADD CONSTRAINT "symbols_exchangeId_fkey" FOREIGN KEY ("exchangeId") REFERENCES "exchanges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "symbols" ADD CONSTRAINT "symbols_underlyingId_fkey" FOREIGN KEY ("underlyingId") REFERENCES "symbols"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_symbolId_fkey" FOREIGN KEY ("symbolId") REFERENCES "symbols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ohlcv" ADD CONSTRAINT "ohlcv_symbolId_fkey" FOREIGN KEY ("symbolId") REFERENCES "symbols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fundamentals" ADD CONSTRAINT "fundamentals_symbolId_fkey" FOREIGN KEY ("symbolId") REFERENCES "symbols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dividends" ADD CONSTRAINT "dividends_symbolId_fkey" FOREIGN KEY ("symbolId") REFERENCES "symbols"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_splits" ADD CONSTRAINT "stock_splits_symbolId_fkey" FOREIGN KEY ("symbolId") REFERENCES "symbols"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "option_contracts" ADD CONSTRAINT "option_contracts_symbolId_fkey" FOREIGN KEY ("symbolId") REFERENCES "symbols"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_linkedOrderId_fkey" FOREIGN KEY ("linkedOrderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "trading_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_symbolId_fkey" FOREIGN KEY ("symbolId") REFERENCES "symbols"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_fills" ADD CONSTRAINT "order_fills_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "trading_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist_items" ADD CONSTRAINT "watchlist_items_watchlistId_fkey" FOREIGN KEY ("watchlistId") REFERENCES "watchlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist_items" ADD CONSTRAINT "watchlist_items_symbolId_fkey" FOREIGN KEY ("symbolId") REFERENCES "symbols"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_symbolId_fkey" FOREIGN KEY ("symbolId") REFERENCES "symbols"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
