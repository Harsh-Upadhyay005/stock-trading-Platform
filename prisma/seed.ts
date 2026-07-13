// ============================================================
// prisma/seed.ts — Database seeding script
// Run with: npx prisma db seed
// ============================================================
import { PrismaClient } from "../generated/prisma"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // ── Exchanges ─────────────────────────────────────────────
  console.log("Creating exchanges...")
  
  const nse = await prisma.exchange.upsert({
    where: { code: "NSE" },
    update: {},
    create: {
      code: "NSE",
      name: "National Stock Exchange of India",
      country: "IN",
      currency: "INR",
      timezone: "Asia/Kolkata",
      openTime: "09:15",
      closeTime: "15:30",
      website: "https://www.nseindia.com",
      isActive: true,
    },
  })

  const bse = await prisma.exchange.upsert({
    where: { code: "BSE" },
    update: {},
    create: {
      code: "BSE",
      name: "Bombay Stock Exchange",
      country: "IN",
      currency: "INR",
      timezone: "Asia/Kolkata",
      openTime: "09:15",
      closeTime: "15:30",
      website: "https://www.bseindia.com",
      isActive: true,
    },
  })

  const nyse = await prisma.exchange.upsert({
    where: { code: "NYSE" },
    update: {},
    create: {
      code: "NYSE",
      name: "New York Stock Exchange",
      country: "US",
      currency: "USD",
      timezone: "America/New_York",
      openTime: "09:30",
      closeTime: "16:00",
      website: "https://www.nyse.com",
      isActive: true,
    },
  })

  const nasdaq = await prisma.exchange.upsert({
    where: { code: "NASDAQ" },
    update: {},
    create: {
      code: "NASDAQ",
      name: "NASDAQ Stock Market",
      country: "US",
      currency: "USD",
      timezone: "America/New_York",
      openTime: "09:30",
      closeTime: "16:00",
      website: "https://www.nasdaq.com",
      isActive: true,
    },
  })

  console.log(`✅ Created ${[nse, bse, nyse, nasdaq].length} exchanges`)

  // ── Market Hours ──────────────────────────────────────────
  console.log("Creating market hours...")

  // NSE/BSE market hours (Monday-Friday)
  for (let day = 1; day <= 5; day++) {
    await prisma.marketHour.upsert({
      where: {
        exchangeId_dayOfWeek_holidayDate: {
          exchangeId: nse.id,
          dayOfWeek: day,
          holidayDate: null,
        },
      },
      update: {},
      create: {
        exchangeId: nse.id,
        dayOfWeek: day,
        openTime: "09:15",
        closeTime: "15:30",
        isHoliday: false,
      },
    })

    await prisma.marketHour.upsert({
      where: {
        exchangeId_dayOfWeek_holidayDate: {
          exchangeId: bse.id,
          dayOfWeek: day,
          holidayDate: null,
        },
      },
      update: {},
      create: {
        exchangeId: bse.id,
        dayOfWeek: day,
        openTime: "09:15",
        closeTime: "15:30",
        isHoliday: false,
      },
    })
  }

  console.log("✅ Created market hours")

  // ── Sample Symbols ────────────────────────────────────────
  console.log("Creating sample symbols...")

  const symbols = [
    {
      ticker: "RELIANCE",
      exchangeId: nse.id,
      name: "Reliance Industries Ltd",
      fullName: "Reliance Industries Limited",
      assetClass: "EQUITY" as const,
      sector: "Energy",
      industry: "Oil & Gas Refining",
      isin: "INE002A01018",
      lotSize: 1,
      tickSize: 0.05,
      isTradable: true,
      isShortable: true,
      marginable: true,
    },
    {
      ticker: "TCS",
      exchangeId: nse.id,
      name: "Tata Consultancy Services Ltd",
      fullName: "Tata Consultancy Services Limited",
      assetClass: "EQUITY" as const,
      sector: "Technology",
      industry: "IT Services",
      isin: "INE467B01029",
      lotSize: 1,
      tickSize: 0.05,
      isTradable: true,
      isShortable: true,
      marginable: true,
    },
    {
      ticker: "INFY",
      exchangeId: nse.id,
      name: "Infosys Ltd",
      fullName: "Infosys Limited",
      assetClass: "EQUITY" as const,
      sector: "Technology",
      industry: "IT Services",
      isin: "INE009A01021",
      lotSize: 1,
      tickSize: 0.05,
      isTradable: true,
      isShortable: true,
      marginable: true,
    },
    {
      ticker: "HDFCBANK",
      exchangeId: nse.id,
      name: "HDFC Bank Ltd",
      fullName: "HDFC Bank Limited",
      assetClass: "EQUITY" as const,
      sector: "Financial Services",
      industry: "Banking",
      isin: "INE040A01034",
      lotSize: 1,
      tickSize: 0.05,
      isTradable: true,
      isShortable: true,
      marginable: true,
    },
    {
      ticker: "ICICIBANK",
      exchangeId: nse.id,
      name: "ICICI Bank Ltd",
      fullName: "ICICI Bank Limited",
      assetClass: "EQUITY" as const,
      sector: "Financial Services",
      industry: "Banking",
      isin: "INE090A01021",
      lotSize: 1,
      tickSize: 0.05,
      isTradable: true,
      isShortable: true,
      marginable: true,
    },
    {
      ticker: "AAPL",
      exchangeId: nasdaq.id,
      name: "Apple Inc.",
      fullName: "Apple Inc.",
      assetClass: "EQUITY" as const,
      sector: "Technology",
      industry: "Consumer Electronics",
      isin: "US0378331005",
      currency: "USD",
      lotSize: 1,
      tickSize: 0.01,
      isTradable: true,
      isShortable: true,
      marginable: true,
    },
    {
      ticker: "MSFT",
      exchangeId: nasdaq.id,
      name: "Microsoft Corporation",
      fullName: "Microsoft Corporation",
      assetClass: "EQUITY" as const,
      sector: "Technology",
      industry: "Software",
      isin: "US5949181045",
      currency: "USD",
      lotSize: 1,
      tickSize: 0.01,
      isTradable: true,
      isShortable: true,
      marginable: true,
    },
    {
      ticker: "GOOGL",
      exchangeId: nasdaq.id,
      name: "Alphabet Inc. Class A",
      fullName: "Alphabet Inc. Class A",
      assetClass: "EQUITY" as const,
      sector: "Technology",
      industry: "Internet",
      isin: "US02079K3059",
      currency: "USD",
      lotSize: 1,
      tickSize: 0.01,
      isTradable: true,
      isShortable: true,
      marginable: true,
    },
    {
      ticker: "NIFTYBEES",
      exchangeId: nse.id,
      name: "Nippon India ETF Nifty BeES",
      fullName: "Nippon India ETF Nifty BeES",
      assetClass: "ETF" as const,
      sector: "Financial Services",
      industry: "ETF",
      isin: "INF204KB17I5",
      lotSize: 1,
      tickSize: 0.05,
      isTradable: true,
      isShortable: false,
      marginable: true,
    },
    {
      ticker: "GOLDBEES",
      exchangeId: nse.id,
      name: "Nippon India ETF Gold BeES",
      fullName: "Nippon India ETF Gold BeES",
      assetClass: "ETF" as const,
      sector: "Commodities",
      industry: "ETF",
      isin: "INF204KB14I2",
      lotSize: 1,
      tickSize: 0.05,
      isTradable: true,
      isShortable: false,
      marginable: false,
    },
  ]

  const createdSymbols = []
  for (const symbolData of symbols) {
    const symbol = await prisma.symbol.upsert({
      where: {
        ticker_exchangeId: {
          ticker: symbolData.ticker,
          exchangeId: symbolData.exchangeId,
        },
      },
      update: {},
      create: symbolData,
    })
    createdSymbols.push(symbol)
  }

  console.log(`✅ Created ${createdSymbols.length} symbols`)

  // ── Sample Quotes ─────────────────────────────────────────
  console.log("Creating sample quotes...")

  const samplePrices: Record<string, number> = {
    RELIANCE: 2450.75,
    TCS: 3650.20,
    INFY: 1580.50,
    HDFCBANK: 1650.30,
    ICICIBANK: 1025.80,
    AAPL: 178.25,
    MSFT: 415.50,
    GOOGL: 142.80,
    NIFTYBEES: 245.60,
    GOLDBEES: 58.75,
  }

  for (const symbol of createdSymbols) {
    const lastPrice = samplePrices[symbol.ticker] || 100
    const previousClose = lastPrice * (1 - (Math.random() * 0.04 - 0.02))
    const change = lastPrice - previousClose
    const changePct = (change / previousClose) * 100

    await prisma.quote.upsert({
      where: { symbolId: symbol.id },
      update: {},
      create: {
        symbolId: symbol.id,
        open: previousClose,
        high: lastPrice * 1.02,
        low: lastPrice * 0.98,
        close: lastPrice,
        previousClose,
        lastPrice,
        bidPrice: lastPrice - 0.05,
        askPrice: lastPrice + 0.05,
        bidSize: Math.floor(Math.random() * 1000) + 100,
        askSize: Math.floor(Math.random() * 1000) + 100,
        volume: BigInt(Math.floor(Math.random() * 10000000) + 1000000),
        avgVolume: BigInt(Math.floor(Math.random() * 5000000) + 500000),
        change,
        changePct,
        weekHigh52: lastPrice * 1.3,
        weekLow52: lastPrice * 0.7,
        marketStatus: "CLOSED",
        tradedAt: new Date(),
      },
    })
  }

  console.log(`✅ Created ${createdSymbols.length} quotes`)

  console.log("🎉 Database seeding completed!")
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
