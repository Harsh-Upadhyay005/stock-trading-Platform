"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { SignedIn, SignedOut } from "@clerk/nextjs"
import { 
  Search, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  TrendingUp, 
  Shield, 
  Activity, 
  Check, 
  Moon, 
  Sun, 
  Bell, 
  X, 
  Menu, 
  Star, 
  Coins, 
  Zap, 
  Layers, 
  Cpu, 
  ArrowRightLeft
} from "lucide-react"

// Types
interface LiveAsset {
  name: string
  symbol: string
  price: number
  change: number
  cap: string
  history: number[]
}

interface Testimonial {
  name: string
  role: string
  text: string
  avatar: string
  rating: number
}

export default function LandingPage() {
  // Mobile Nav Toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 1. Navbar Theme Icon (decorative for mockup header)
  const [siteTheme, setSiteTheme] = useState<'light' | 'dark'>('light')

  // 2. Interactive Mock Dashboard States (Tradeflow Tablet Mockup)
  const [dbSearch, setDbSearch] = useState("")
  const [dbBalancesVisible, setDbBalancesVisible] = useState(true)
  const [dbIsRefreshing, setDbIsRefreshing] = useState(false)
  const [dbTheme, setDbTheme] = useState<'light' | 'dark'>('light')
  const [dbActiveTab, setDbActiveTab] = useState<'dashboard' | 'assets'>('dashboard')
  
  const [dbAssets, setDbAssets] = useState([
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC', price: 96240, change: 2.45, balance: 0.12, initialPrice: 93892 },
    { id: 'eth', name: 'Ethereum', symbol: 'ETH', price: 3420, change: -0.82, balance: 1.50, initialPrice: 3448 },
    { id: 'sol', name: 'Solana', symbol: 'SOL', price: 185.60, change: 5.12, balance: 8.20, initialPrice: 176.56 },
    { id: 'dot', name: 'Polkadot', symbol: 'DOT', price: 6.45, change: -1.25, balance: 45.0, initialPrice: 6.53 },
  ])

  // Total calculated portfolio value
  const dbTotalPortfolioValue = useMemo(() => {
    return dbAssets.reduce((sum, asset) => sum + (asset.price * asset.balance), 0)
  }, [dbAssets])

  // Filtered assets inside the dashboard mockup
  const filteredDbAssets = useMemo(() => {
    return dbAssets.filter(asset => 
      asset.name.toLowerCase().includes(dbSearch.toLowerCase()) || 
      asset.symbol.toLowerCase().includes(dbSearch.toLowerCase())
    )
  }, [dbAssets, dbSearch])

  // Trigger simulated reload inside dashboard mockup
  const handleDbRefresh = () => {
    if (dbIsRefreshing) return
    setIsLiveTickerPaused(true) // Briefly pause main ticker during manual reload
    setDbIsRefreshing(true)
    setTimeout(() => {
      setDbAssets(prev => 
        prev.map(asset => {
          const delta = (Math.random() - 0.45) * 2 // random swing
          const newPrice = asset.price * (1 + delta / 100)
          const newChange = ((newPrice - asset.initialPrice) / asset.initialPrice) * 100
          return {
            ...asset,
            price: Number(newPrice.toFixed(2)),
            change: Number(newChange.toFixed(2))
          }
        })
      )
      setDbIsRefreshing(false)
      setIsLiveTickerPaused(false)
    }, 1000)
  }

  // 3. Live Markets Section States
  const [marketSearch, setMarketSearch] = useState("")
  const [priceFlash, setPriceFlash] = useState<Record<string, 'up' | 'down' | null>>({})
  const [isLiveTickerPaused, setIsLiveTickerPaused] = useState(false)
  const [liveAssets, setLiveAssets] = useState<LiveAsset[]>([
    { name: 'Bitcoin', symbol: 'BTC', price: 96240, change: 2.45, cap: '1.89T', history: [95200, 95500, 95100, 95800, 96000, 95900, 96100, 96240] },
    { name: 'Ethereum', symbol: 'ETH', price: 3420, change: -0.82, cap: '410.2B', history: [3480, 3460, 3470, 3440, 3430, 3450, 3410, 3420] },
    { name: 'Solana', symbol: 'SOL', price: 185.60, change: 5.12, cap: '85.4B', history: [175.2, 177.0, 176.4, 180.1, 182.5, 181.9, 183.0, 185.6] },
    { name: 'Cardano', symbol: 'ADA', price: 0.524, change: 1.18, cap: '18.6B', history: [0.512, 0.515, 0.510, 0.518, 0.520, 0.519, 0.521, 0.524] },
    { name: 'Polkadot', symbol: 'DOT', price: 6.45, change: -1.25, cap: '9.2B', history: [6.55, 6.52, 6.58, 6.50, 6.48, 6.49, 6.46, 6.45] },
    { name: 'Avalanche', symbol: 'AVAX', price: 32.40, change: 3.84, cap: '12.8B', history: [31.10, 31.40, 31.25, 31.80, 32.00, 31.95, 32.10, 32.40] },
    { name: 'Chainlink', symbol: 'LINK', price: 18.25, change: 0.42, cap: '10.7B', history: [18.10, 18.35, 18.05, 18.20, 18.15, 18.30, 18.22, 18.25] },
    { name: 'Ripple', symbol: 'XRP', price: 0.598, change: -2.15, cap: '33.4B', history: [0.612, 0.608, 0.615, 0.602, 0.595, 0.601, 0.592, 0.598] }
  ])

  // Main ticker live update hook
  useEffect(() => {
    if (isLiveTickerPaused) return

    const interval = setInterval(() => {
      setLiveAssets(prev => 
        prev.map(asset => {
          // Adjust random walker size
          const changePercent = (Math.random() - 0.48) * 0.7 // slightly positive drift
          const oldPrice = asset.price
          const newPrice = oldPrice * (1 + changePercent / 100)
          
          // Flash indicator
          setPriceFlash(f => ({
            ...f,
            [asset.symbol]: newPrice > oldPrice ? 'up' : 'down'
          }))
          
          // Remove flash after 800ms
          setTimeout(() => {
            setPriceFlash(f => ({
              ...f,
              [asset.symbol]: null
            }))
          }, 800)

          const newHistory = [...asset.history.slice(1), newPrice]
          const initialPrice = asset.history[0]
          const newTotalChange = ((newPrice - initialPrice) / initialPrice) * 100

          return {
            ...asset,
            price: newPrice,
            change: newTotalChange,
            history: newHistory
          }
        })
      )
    }, 4000)

    return () => clearInterval(interval)
  }, [isLiveTickerPaused])

  // Filtered live assets
  const filteredLiveAssets = useMemo(() => {
    return liveAssets.filter(asset => 
      asset.name.toLowerCase().includes(marketSearch.toLowerCase()) || 
      asset.symbol.toLowerCase().includes(marketSearch.toLowerCase())
    )
  }, [liveAssets, marketSearch])

  // Buy/Sell Interaction Toast Mock
  const [tradeModalAsset, setTradeModalAsset] = useState<LiveAsset | null>(null)
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY')
  const [tradeSuccessMsg, setTradeSuccessMsg] = useState("")

  const triggerTrade = (asset: LiveAsset, type: 'BUY' | 'SELL') => {
    setTradeType(type)
    setTradeModalAsset(asset)
    setTradeSuccessMsg("")
  }

  const confirmTrade = (amount: string) => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return
    setTradeSuccessMsg(`Successfully executed order to ${tradeType} ${amount} unit(s) of ${tradeModalAsset?.symbol}!`)
    setTimeout(() => {
      setTradeModalAsset(null)
      setTradeSuccessMsg("")
    }, 2000)
  }

  // 4. Portfolio growth calculator values
  const [monthlyDeposit, setMonthlyDeposit] = useState(250)
  const [selectedCrypto, setSelectedCrypto] = useState<'BTC' | 'ETH' | 'SOL'>('BTC')
  const [yearsRange, setYearsRange] = useState(5)

  // Returns and estimates
  const cryptoReturnRates = {
    BTC: 0.18, // 18% APY
    ETH: 0.14, // 14% APY
    SOL: 0.24  // 24% APY
  }

  const growthCalculations = useMemo(() => {
    const rate = cryptoReturnRates[selectedCrypto]
    const monthlyRate = rate / 12
    const totalMonths = yearsRange * 12
    
    const monthlyPlot: { year: number; balance: number; deposits: number }[] = []
    let balance = 0
    let totalDeposits = 0

    // Month 0
    monthlyPlot.push({ year: 0, balance: 0, deposits: 0 })

    for (let month = 1; month <= totalMonths; month++) {
      totalDeposits += monthlyDeposit
      balance = (balance + monthlyDeposit) * (1 + monthlyRate)
      
      // Collect annual increments
      if (month % 12 === 0) {
        monthlyPlot.push({
          year: month / 12,
          balance: Math.round(balance),
          deposits: totalDeposits
        })
      }
    }

    return monthlyPlot
  }, [monthlyDeposit, selectedCrypto, yearsRange])

  const maxValForChart = useMemo(() => {
    const finalVal = growthCalculations[growthCalculations.length - 1]?.balance || 1
    return finalVal * 1.1 // Add padding
  }, [growthCalculations])

  // 5. Testimonial Index
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const testimonials: Testimonial[] = [
    {
      name: "Rick Martinez",
      role: "Professional Trader",
      text: "Tradeflow has transformed my workflow. Advanced charts and fast order routing let me act on opportunities with confidence.",
      avatar: "👨‍💻",
      rating: 5
    },
    {
      name: "Sarah Jenkins",
      role: "Quant Developer",
      text: "The low-latency execution and reliable APIs make building automated strategies straightforward. Execution quality has been excellent.",
      avatar: "👩‍💻",
      rating: 5
    },
    {
      name: "Devon Chen",
      role: "Long-Term Investor",
      text: "Fractional shares and intuitive portfolio tools make long-term investing approachable and affordable.",
      avatar: "👨‍💼",
      rating: 5
    }
  ]

  // Auto scroll testimonials
  useEffect(() => {
    const sliderTimer = setInterval(() => {
      setActiveTestimonial(t => (t + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(sliderTimer)
  }, [testimonials.length])

  // 6. Pricing Toggle
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly')

  return (
    <div className="min-h-screen bg-[#FCFCFD] text-slate-800 selection:bg-emerald-500/30 selection:text-emerald-900 overflow-x-hidden font-sans relative dot-grid">
      
      {/* Absolute Ambient Background Lights (Subtle Minimalist Light Mode Glows) */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] glow-orb-green rounded-full blur-[90px] -z-10 animate-pulse-slow"></div>
      <div className="absolute top-[40%] right-1/4 w-[600px] h-[600px] glow-orb-white rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-20 left-10 w-[450px] h-[450px] glow-orb-green rounded-full blur-[100px] -z-10 animate-pulse-slow"></div>

      {/* ────────────────────────────────────────────────────────
         STICKY GLASSMORPHIC NAVBAR
         ──────────────────────────────────────────────────────── */}
      <nav className="border-b border-slate-200/80 sticky top-0 bg-white/70 backdrop-blur-md z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/10">
              <span className="font-extrabold text-white text-lg">V</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center">
              Tradeflow
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1"></span>
            </span>
          </Link>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#markets" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Markets</a>
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Features</a>
            <a href="#calculator" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Estimator</a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Testimonials</a>
          </div>

          {/* Action Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => setSiteTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
              title="Toggle Light/Dark Theme Mock"
            >
              {siteTheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <SignedOut>
              <Link href="/sign-in">
                <button className="text-sm font-medium px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors">
                  Log In
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-full font-semibold shadow-sm transition-all duration-300 hover:scale-[1.03]">
                  Sign Up
                </button>
              </Link>
            </SignedOut>
            
            <SignedIn>
              <Link href="/dashboard">
                <button className="text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full font-semibold shadow-md shadow-emerald-600/10 transition-all duration-300 hover:scale-[1.03]">
                  Go to Dashboard
                </button>
              </Link>
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-500 hover:text-slate-900 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-[65px] left-0 w-full bg-white border-b border-slate-200/80 px-6 py-8 flex flex-col gap-6 shadow-xl z-45 animate-slide-down">
            <a 
              href="#markets" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-700 hover:text-emerald-600 transition-colors"
            >
              Markets
            </a>
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-700 hover:text-emerald-600 transition-colors"
            >
              Features
            </a>
            <a 
              href="#calculator" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-700 hover:text-emerald-600 transition-colors"
            >
              Estimator
            </a>
            <a 
              href="#pricing" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-700 hover:text-emerald-600 transition-colors"
            >
              Pricing
            </a>
            <a 
              href="#testimonials" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-700 hover:text-emerald-600 transition-colors"
            >
              Testimonials
            </a>
            <div className="border-t border-slate-100 pt-6 flex flex-col gap-4">
              <SignedOut>
                <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full text-center text-md font-medium py-3 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition-colors">
                    Log In
                  </button>
                </Link>
                <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full text-center text-md bg-slate-900 text-white py-3 rounded-xl font-bold shadow-sm hover:bg-slate-800 transition-colors">
                    Sign Up
                  </button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full text-center text-md bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-md shadow-emerald-600/10">
                    Go to Dashboard
                  </button>
                </Link>
              </SignedIn>
            </div>
          </div>
        )}
      </nav>

      {/* ────────────────────────────────────────────────────────
         HERO SECTION WITH DOTS ARCS GRAPHICS
         ──────────────────────────────────────────────────────── */}
      <section className="relative pt-20 md:pt-28 pb-12 overflow-hidden max-w-7xl mx-auto px-6">
        
        {/* Curved Dotted Crescent Graphic (Light Theme styled) */}
        <div className="absolute inset-x-0 top-1/4 bottom-0 pointer-events-none flex justify-between px-2 md:px-16 -z-10">
          {/* Left Crescent Arc */}
          <svg className="w-40 md:w-56 h-[400px] opacity-40 animate-pulse-slow" viewBox="0 0 100 200" fill="none">
            <path d="M100,0 C20,40 20,160 100,200" stroke="url(#gradient-arc-light)" strokeWidth="1" strokeDasharray="3 3" />
            <path d="M100,15 C30,50 30,150 100,185" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <path d="M100,30 C45,65 45,135 100,170" stroke="url(#glow-arc-light)" strokeWidth="3" opacity="0.3" />
          </svg>
          {/* Right Crescent Arc */}
          <svg className="w-40 md:w-56 h-[400px] opacity-40 animate-pulse-slow" viewBox="0 0 100 200" fill="none">
            <path d="M0,0 C80,40 80,160 0,200" stroke="url(#gradient-arc-light)" strokeWidth="1" strokeDasharray="3 3" />
            <path d="M0,15 C70,50 70,150 0,185" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <path d="M0,30 C55,65 55,135 0,170" stroke="url(#glow-arc-light)" strokeWidth="3" opacity="0.3" />
            <defs>
              <linearGradient id="gradient-arc-light" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#475569" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="glow-arc-light" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Content Container */}
        <div className="text-center max-w-4xl mx-auto z-10">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50 mb-6 tracking-wide animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Trade Smarter. Invest Confidently.
          </span>

          <h1 className="text-4xl md:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight text-slate-900">
            Professional Stock Trading <br className="hidden md:inline" />
            and Portfolio Management
          </h1>

          <p className="text-md md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Trade stocks, ETFs, and options with real-time market data, advanced order types, and professional portfolio tools—all from one intuitive platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="#markets">
              <button className="px-8 py-4 rounded-full text-md font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/10 transition-all duration-300 hover:scale-[1.04]">
                Get Started
              </button>
            </a>
            <a href="#features">
              <button className="px-8 py-4 rounded-full text-md font-bold border border-slate-200 hover:border-slate-350 text-slate-700 bg-slate-100/80 backdrop-blur-sm transition-all duration-300 hover:scale-[1.04]">
                Explore Platform
              </button>
            </a>
          </div>

          <p className="text-xs text-slate-400 mt-6 tracking-wider">
            Join today • Commission-free trades & $0 account minimum
          </p>
        </div>

          {/* ────────────────────────────────────────────────────────
            INTERACTIVE TABLET SHOWCASE (Tradeflow Dashboard Mockup)
            ──────────────────────────────────────────────────────── */}
        <div className="mt-20 max-w-5xl mx-auto relative group">
          
          {/* Subtle Glow behind the Tablet */}
          <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl blur-[35px] opacity-70 group-hover:opacity-100 transition-opacity duration-700 -z-10"></div>
          
          {/* Tablet Bezel Frame (Clean White Minimalist Device) */}
          <div className="border-[12px] border-slate-200 rounded-3xl overflow-hidden shadow-[0_15px_40px_rgba(15,23,42,0.08)] bg-slate-100 p-1 md:p-1.5">
            
            {/* Tablet Inner Top Details */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-400 rounded-t-xl font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                <span className="ml-2 text-[10px] md:text-xs text-slate-400">tradeflow.io/user/rick_martinez</span>
              </div>
              <div className="bg-slate-200/50 border border-slate-300/40 px-3 py-1 rounded text-[10px] md:text-xs tracking-wider font-semibold text-slate-500">
                TABLET SHOWCASE - INTERACTIVE
              </div>
            </div>

            {/* Dashboard Mockup Main Container */}
            <div className={`p-4 md:p-6 transition-colors duration-500 rounded-b-xl ${
              dbTheme === 'light' ? 'bg-[#FCFCFD] text-slate-800' : 'bg-slate-900 text-slate-100'
            }`}>
              
              {/* Header Widget */}
              <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 mb-5 ${
                dbTheme === 'light' ? 'border-slate-200' : 'border-slate-700'
              }`}>
                {/* Brand */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-white font-extrabold text-base">H</span>
                  </div>
                  <div>
                    <h3 className={`text-md font-bold tracking-wide ${dbTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>Tradeflow</h3>
                    <p className={`text-[10px] ${dbTheme === 'light' ? 'text-slate-500' : 'text-slate-450'}`}>Modern Brokerage Platform</p>
                  </div>
                </div>

                {/* Dashboard Tab Toggles */}
                <div className={`flex items-center border rounded-xl p-1 max-w-fit ${
                  dbTheme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'
                }`}>
                  <button 
                    onClick={() => setDbActiveTab('dashboard')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      dbActiveTab === 'dashboard' 
                        ? 'bg-white text-slate-950 shadow-sm border border-slate-200/40' 
                        : dbTheme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-350 hover:text-white'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => setDbActiveTab('assets')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      dbActiveTab === 'assets' 
                        ? 'bg-white text-slate-955 shadow-sm border border-slate-200/40' 
                        : dbTheme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-350 hover:text-white'
                    }`}
                  >
                    All Assets
                  </button>
                </div>

                {/* User Settings Widget */}
                <div className="flex items-center gap-3 self-end md:self-auto">
                  
                  {/* Theme Switcher inside widget */}
                  <button 
                    onClick={() => setDbTheme(prev => prev === 'light' ? 'dark' : 'light')}
                    className={`p-2 border rounded-xl transition-all ${
                      dbTheme === 'light' ? 'bg-slate-100 hover:bg-slate-200 border-slate-200' : 'bg-slate-800 hover:bg-slate-750 border-slate-700'
                    }`}
                    title="Toggle Dashboard Theme mockup"
                  >
                    {dbTheme === 'light' ? <Moon size={15} className="text-slate-600" /> : <Sun size={15} className="text-yellow-400" />}
                  </button>

                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center relative ${
                    dbTheme === 'light' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-emerald-950/20 border-emerald-800 text-emerald-400'
                  }`}>
                    <Bell size={14} />
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  </div>

                  {/* Profile card */}
                  <div className={`flex items-center gap-2 pl-2 border-l ${
                    dbTheme === 'light' ? 'border-slate-200' : 'border-slate-700'
                  }`}>
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      RM
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className={`text-xs font-bold leading-none ${dbTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>Rick Martinez</div>
                      <span className="text-[9px] text-emerald-600 font-semibold tracking-wider uppercase">Pro Account</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Widget Grid */}
              {dbActiveTab === 'dashboard' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Column 1: Portfolio Summary */}
                  <div className={`p-5 rounded-2xl border ${
                    dbTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-950 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-slate-400 tracking-wider">NET PORTFOLIO VALUE</span>
                      <div className="flex gap-1.5">
                        {/* Eye Toggle */}
                        <button 
                          onClick={() => setDbBalancesVisible(!dbBalancesVisible)}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-emerald-600 transition-colors"
                          title={dbBalancesVisible ? "Hide values" : "Show values"}
                        >
                          {dbBalancesVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        {/* Refresh Live */}
                        <button 
                          onClick={handleDbRefresh}
                          className={`p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-emerald-600 transition-all duration-700 ${
                            dbIsRefreshing ? 'rotate-180 text-emerald-500' : ''
                          }`}
                          title="Simulate Real-time Sync"
                        >
                          <RefreshCw size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h2 className={`text-3xl font-extrabold tracking-tight ${dbTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                        {dbBalancesVisible ? `$${dbTotalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "••••••"}
                      </h2>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <TrendingUp size={10} /> +2.18%
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">in past 24h</span>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Margin Available:</span>
                        <span className={`font-bold ${dbTheme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                          {dbBalancesVisible ? "$4,520.12" : "••••••"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Active Limit Orders:</span>
                        <span className={`font-bold ${dbTheme === 'light' ? 'text-slate-800' : 'text-white'}`}>3 Orders</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Monthly Staking Yield:</span>
                        <span className="font-extrabold text-emerald-600">+$124.50</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2 & 3: Asset Details Table */}
                  <div className={`lg:col-span-2 p-5 rounded-2xl border ${
                    dbTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-950 border-slate-800'
                  }`}>
                    
                    {/* Filter and search bar inside mockup */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                      <h4 className={`text-xs font-extrabold tracking-wider uppercase ${dbTheme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                        Portfolio Asset Distribution
                      </h4>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                          <Search size={12} />
                        </span>
                        <input 
                          type="text" 
                          placeholder="Search asset..." 
                          value={dbSearch}
                          onChange={(e) => setDbSearch(e.target.value)}
                          className={`pl-8 pr-3 py-1.5 rounded-lg text-xs w-full sm:w-44 focus:outline-none transition-all ${
                            dbTheme === 'light' 
                              ? 'bg-slate-50 text-slate-800 border border-slate-200 placeholder-slate-400 focus:border-emerald-500' 
                              : 'bg-slate-900 text-white border border-slate-700 placeholder-slate-500 focus:border-emerald-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className={`border-b text-[10px] tracking-wider text-slate-400 uppercase ${
                            dbTheme === 'light' ? 'border-slate-100' : 'border-slate-800'
                          }`}>
                            <th className="py-2.5 px-2 text-left">Asset</th>
                            <th className="py-2.5 px-2 text-right">Price</th>
                            <th className="py-2.5 px-2 text-right">24h Change</th>
                            <th className="py-2.5 px-2 text-right">Holding Balance</th>
                            <th className="py-2.5 px-2 text-right">Value ($)</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${dbTheme === 'light' ? 'divide-slate-50' : 'divide-slate-800'}`}>
                          {filteredDbAssets.length > 0 ? (
                            filteredDbAssets.map((asset) => (
                              <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3 px-2 font-bold text-slate-800 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  <span className={dbTheme === 'light' ? 'text-slate-850' : 'text-slate-200'}>{asset.name}</span>
                                  <span className="text-[9px] text-slate-405 tracking-wider font-semibold">{asset.symbol}</span>
                                </td>
                                <td className={`py-3 px-2 text-right font-mono font-medium ${dbTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                  ${asset.price.toLocaleString()}
                                </td>
                                <td className={`py-3 px-2 text-right font-bold font-mono ${
                                  asset.change >= 0 ? 'text-emerald-600' : 'text-red-500'
                                }`}>
                                  {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                                </td>
                                <td className={`py-3 px-2 text-right font-mono ${dbTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                                  {asset.balance} {asset.symbol}
                                </td>
                                <td className={`py-3 px-2 text-right font-bold font-mono ${dbTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                  {dbBalancesVisible ? `$${(asset.price * asset.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "••••••"}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="py-6 text-center text-slate-400 italic">No assets match search query</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                /* Interactive Protocol Showcase Mock Info */
                <div className={`p-6 rounded-2xl border text-center ${
                  dbTheme === 'light' ? 'bg-white border-slate-200 text-slate-650' : 'bg-slate-950 border-slate-800 text-slate-350'
                }`}>
                  <Coins size={36} className="mx-auto text-emerald-500 mb-3" />
                  <h4 className={`text-md font-bold mb-2 ${dbTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>Multi-Chain Yield Aggregator</h4>
                  <p className="max-w-md mx-auto text-xs leading-relaxed mb-4">
                    Instantly view and trade across 15+ high-performance blockchains. Link your cold storage or utilize our institutional non-custodial custody nodes.
                  </p>
                  <button 
                    onClick={() => setDbActiveTab('dashboard')}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-all shadow-sm"
                  >
                    Return to Main Dashboard View
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────
         LIVE INTERACTIVE MARKETS SECTION
         ──────────────────────────────────────────────────────── */}
      <section id="markets" className="py-24 border-y border-slate-200 bg-slate-50/50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-emerald-600 text-xs font-bold tracking-widest uppercase">REAL-TIME FEEDS</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-4 tracking-tight text-slate-900">Live Market Quotes</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base">
              Monitor top stocks, ETFs, and instruments updated every few seconds. Use actions to buy, sell, or filter instruments.
            </p>
          </div>

          {/* Trade Execution Alert Message */}
          {tradeSuccessMsg && (
            <div className="max-w-xl mx-auto mb-6 p-4 rounded-xl border border-emerald-250 bg-emerald-50 text-emerald-700 flex items-center gap-3 text-sm font-semibold animate-fade-in shadow-sm">
              <Check size={18} className="w-5 h-5 rounded-full bg-emerald-500 text-white flex-shrink-0" />
              <span>{tradeSuccessMsg}</span>
            </div>
          )}

          {/* Asset detail and interactive trading overlay */}
          {tradeModalAsset && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-scale-up text-left">
                <button 
                  onClick={() => setTradeModalAsset(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"
                >
                  <X size={18} />
                </button>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Place {tradeType} Order
                </h3>
                <p className="text-xs text-slate-500 mb-5">
                  Confirm transaction details for {tradeModalAsset.name} ({tradeModalAsset.symbol}) at live market price of <span className="font-mono text-emerald-600 font-bold">${tradeModalAsset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Order Size ({tradeModalAsset.symbol})</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        id="trade-amount-input"
                        placeholder="0.00" 
                        step="0.01"
                        min="0.001"
                        defaultValue="1.0"
                        className="w-full bg-slate-50 border border-slate-250 rounded-xl px-4 py-3 text-slate-900 text-md focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      const val = (document.getElementById('trade-amount-input') as HTMLInputElement)?.value || "0"
                      confirmTrade(val)
                    }}
                    className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 shadow transition-colors"
                  >
                    Confirm {tradeType} Order
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm relative overflow-hidden backdrop-blur-md">
            
            {/* Control Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Search size={14} />
                </span>
                <input 
                  type="text" 
                  placeholder="Filter market list..." 
                  value={marketSearch}
                  onChange={(e) => setMarketSearch(e.target.value)}
                  className="pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-450 focus:outline-none focus:border-emerald-500 w-full md:w-64 text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsLiveTickerPaused(!isLiveTickerPaused)}
                  className={`text-xs px-4 py-2 rounded-xl border transition-colors font-semibold ${
                    isLiveTickerPaused ? 'bg-red-50 text-white border-red-500' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {isLiveTickerPaused ? 'PAUSED' : 'LIVE FEED SYNC'}
                </button>
                <div className="text-[10px] text-slate-400 font-semibold">Updates prices organically</div>
              </div>
            </div>

            {/* Live Ticker Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="pb-4 pt-2">Instrument</th>
                    <th className="pb-4 pt-2 text-right">Current Price</th>
                    <th className="pb-4 pt-2 text-right">Change</th>
                    <th className="pb-4 pt-2 text-right hidden sm:table-cell">Market Cap / Volume</th>
                    <th className="pb-4 pt-2 text-center hidden md:table-cell">Trend (Live Sparkline)</th>
                    <th className="pb-4 pt-2 text-right">Quick Execution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLiveAssets.length > 0 ? (
                    filteredLiveAssets.map((asset) => {
                      const flash = priceFlash[asset.symbol]
                      return (
                        <tr 
                          key={asset.symbol} 
                          className="hover:bg-slate-50/50 transition-colors duration-200"
                        >
                          {/* Name / Icon */}
                          <td className="py-4 font-bold text-slate-800 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 font-extrabold text-sm shadow-sm">
                              {asset.symbol.slice(0, 2)}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{asset.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono tracking-wider">{asset.symbol}</div>
                            </div>
                          </td>

                          {/* Price with flash updates */}
                          <td className="py-4 text-right">
                            <span className={`font-mono text-sm font-bold transition-all px-2 py-1 rounded duration-700 ${
                              flash === 'up' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' :
                              flash === 'down' ? 'bg-red-50 text-red-700 border border-red-200/50' :
                              'text-slate-900'
                            }`}>
                              ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </td>

                          {/* Percent change */}
                          <td className="py-4 text-right">
                            <span className={`inline-flex items-center gap-0.5 text-xs font-extrabold ${
                              asset.change >= 0 ? 'text-emerald-600' : 'text-red-500'
                            }`}>
                              {asset.change >= 0 ? '▲' : '▼'} {Math.abs(asset.change).toFixed(2)}%
                            </span>
                          </td>

                          {/* Market Cap */}
                          <td className="py-4 text-right hidden sm:table-cell font-mono text-slate-455 text-xs">
                            ${asset.cap}
                          </td>

                          {/* Sparkline svg chart */}
                          <td className="py-4 hidden md:table-cell text-center align-middle">
                            <div className="w-28 h-8 mx-auto flex items-center justify-center">
                              {(() => {
                                const min = Math.min(...asset.history)
                                const max = Math.max(...asset.history)
                                const range = max - min || 1
                                const points = asset.history.map((val, idx) => {
                                  const x = (idx / 7) * 110 // viewBox width 110
                                  const y = 30 - ((val - min) / range) * 26 // viewBox height 30, leave padding
                                  return `${x},${y}`
                                }).join(' ')
                                return (
                                  <svg className="w-28 h-8" viewBox="0 0 110 32">
                                    <polyline 
                                      fill="none" 
                                      stroke={asset.change >= 0 ? "#059669" : "#dc2626"} 
                                      strokeWidth="1.5" 
                                      strokeLinecap="round" 
                                      strokeLinejoin="round" 
                                      points={points} 
                                    />
                                  </svg>
                                )
                              })()}
                            </div>
                          </td>

                          {/* Execution actions */}
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => triggerTrade(asset, 'BUY')}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm"
                              >
                                BUY
                              </button>
                              <button 
                                onClick={() => triggerTrade(asset, 'SELL')}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
                              >
                                SELL
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 italic">No markets match criteria</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────
         GLOWING GLASSMORPHIC FEATURES GRID
         ──────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-20">
          <span className="text-emerald-600 text-xs font-bold tracking-widest uppercase">PROTOCOL CAPABILITIES</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-4 tracking-tight text-slate-900">Feature Highlights</h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base">
            Tradeflow integrates features that support professional trading, risk controls, and advanced portfolio strategies.
          </p>
        </div>

        {/* Features Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Zap className="text-emerald-600" size={24} />,
              title: "Lightning Execution Engine",
              desc: "Deploy transactions under 8 milliseconds. Direct routing ensures low-latency execution and minimal slippage values."
            },
            {
              icon: <Shield className="text-emerald-600" size={24} />,
              title: "Bank-Grade Custody Systems",
              desc: "Secured assets using multi-sig cold wallets, hardware keys, and bank alliances for deposit insurance options."
            },
            {
              icon: <Activity className="text-emerald-600" size={24} />,
              title: "Real-time Multi-Chain Analytics",
              desc: "Deep charts, order books, technical tools, and transaction flows updating without browser refreshes."
            },
            {
              icon: <Cpu className="text-emerald-600" size={24} />,
              title: "Automated Algorithmic Flows",
              desc: "Configure rebalancing rules, target triggers, or replicate portfolios from expert traders seamlessly."
            },
            {
              icon: <ArrowRightLeft className="text-emerald-600" size={24} />,
              title: "Low-Cost Liquidity Access",
              desc: "Zero transaction charges on spot delivery markets. Flat fees of 0.05% on derivatives trading orders."
            },
            {
              icon: <Layers className="text-emerald-600" size={24} />,
              title: "Developer Low-Latency APIs",
              desc: "Leverage standard high-performance REST execution and WebSocket endpoints for custom bots."
            }
          ].map((feat) => (
            <div 
              key={feat.title} 
              className="p-6 md:p-8 rounded-2xl glass-panel group transition-all duration-300 relative overflow-hidden"
            >
              {/* Radial gradient orb inside card */}
              <div className="absolute -top-12 -left-12 w-28 h-28 bg-emerald-500/5 rounded-full blur-[20px] transition-all group-hover:bg-emerald-500/10"></div>
              
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6 shadow-sm">
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3 tracking-wide">{feat.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────
         INTERACTIVE PORTFOLIO ESTIMATOR CALCULATOR
         ──────────────────────────────────────────────────────── */}
      <section id="calculator" className="py-24 border-y border-slate-200 bg-slate-50/50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-emerald-600 text-xs font-bold tracking-widest uppercase">PROJECTION LAB</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-4 tracking-tight text-slate-900">Holdings Growth Estimator</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base">
              Simulate investment growth patterns based on historical market annualized returns.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-center">
            
            {/* Calculator Inputs Card */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200 shadow-md space-y-6">
              
              {/* Select Asset */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Target Asset Model</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['BTC', 'ETH', 'SOL'] as const).map(asset => (
                    <button 
                      key={asset}
                      onClick={() => setSelectedCrypto(asset)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                        selectedCrypto === asset 
                          ? 'bg-slate-900 text-white border-slate-900 font-extrabold shadow-sm' 
                          : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {asset} ({Math.round(cryptoReturnRates[asset]*100)}% est)
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly Contribution Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5">
                  <span>Monthly Contribution</span>
                  <span className="text-emerald-600 font-mono font-bold">${monthlyDeposit}</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="2000" 
                  step="50"
                  value={monthlyDeposit}
                  onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1 font-mono">
                  <span>$50</span>
                  <span>$1,000</span>
                  <span>$2,000</span>
                </div>
              </div>

              {/* Years Range Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5">
                  <span>Duration Timeline</span>
                  <span className="text-emerald-600 font-mono font-bold">{yearsRange} Years</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  step="1"
                  value={yearsRange}
                  onChange={(e) => setYearsRange(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1 font-mono">
                  <span>1 Year</span>
                  <span>5 Years</span>
                  <span>10 Years</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Projected Net Yield Rate:</span>
                <span className="text-emerald-600 font-mono font-bold">~{Math.round(cryptoReturnRates[selectedCrypto] * 100)}% APY</span>
              </div>
            </div>

            {/* Display SVG Chart Card */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-md flex flex-col justify-between h-full min-h-[360px]">
              
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Projected Value Accumulation</h4>
                  <h3 className="text-3xl font-extrabold tracking-tight text-slate-900">
                    ${(growthCalculations[growthCalculations.length - 1]?.balance || 0).toLocaleString()}
                  </h3>
                </div>
                <div className="text-right text-xs">
                  <span className="text-slate-400 block font-medium">Deposited Funds</span>
                  <span className="text-slate-700 font-mono font-bold">
                    ${(growthCalculations[growthCalculations.length - 1]?.deposits || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Dynamic SVG Line Graph */}
              <div className="my-6 w-full h-44 flex items-end relative">
                
                {/* SVG Graph path drawing */}
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200">
                  {/* Grid Lines */}
                  <line x1="0" y1="180" x2="500" y2="180" stroke="rgba(15,23,42,0.04)" strokeWidth="1" />
                  <line x1="0" y1="110" x2="500" y2="110" stroke="rgba(15,23,42,0.04)" strokeWidth="1" />
                  <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(15,23,42,0.04)" strokeWidth="1" />

                  {/* SVG Paths */}
                  {(() => {
                    const steps = growthCalculations.length
                    if (steps < 2) return null

                    // Generate coordinates
                    const coords = growthCalculations.map((pt, index) => {
                      const x = (index / (steps - 1)) * 500
                      const y = 180 - (pt.balance / maxValForChart) * 150
                      return { x, y }
                    })

                    const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ')
                    const areaPath = `${linePath} L 500 180 L 0 180 Z`

                    return (
                      <>
                        {/* Area Fill Gradient */}
                        <defs>
                          <linearGradient id="chart-glow-gradient-light" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d={areaPath} fill="url(#chart-glow-gradient-light)" />
                        
                        {/* Line Path */}
                        <path 
                          d={linePath} 
                          fill="none" 
                          stroke="#059669" 
                          strokeWidth="2.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                        />

                        {/* Interactive Dot on end */}
                        <circle 
                          cx={coords[coords.length - 1].x} 
                          cy={coords[coords.length - 1].y} 
                          r="5.5" 
                          fill="#059669" 
                          stroke="#ffffff" 
                          strokeWidth="2" 
                          className="animate-ping"
                        />
                        <circle 
                          cx={coords[coords.length - 1].x} 
                          cy={coords[coords.length - 1].y} 
                          r="4" 
                          fill="#059669" 
                          stroke="#ffffff" 
                          strokeWidth="1.5" 
                        />
                      </>
                    )
                  })()}
                </svg>

                {/* X Axis Labels */}
                <div className="absolute bottom-[-18px] left-0 w-full flex justify-between text-[9px] text-slate-450 font-bold font-mono tracking-widest uppercase">
                  <span>Year 0</span>
                  <span>Mid Point</span>
                  <span>Year {yearsRange}</span>
                </div>
              </div>

              {/* Simulated Stats details */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs">
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200/50">
                  <span className="text-slate-550">Yield Earnings:</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    ${Math.max(0, (growthCalculations[growthCalculations.length - 1]?.balance || 0) - (growthCalculations[growthCalculations.length - 1]?.deposits || 0)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200/50">
                  <span className="text-slate-550">Annual Return:</span>
                  <span className="font-bold text-slate-800 font-mono">
                    +{Math.round(cryptoReturnRates[selectedCrypto] * 120)}% avg
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────
         PRICING PLANS SECTION WITH PERIOD TOGGLE
         ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-16">
          <span className="text-emerald-600 text-xs font-bold tracking-widest uppercase">TRANSPARENT SUBSCRIPTION MODEL</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-4 tracking-tight text-slate-900">Trading Service Plans</h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base">
            No hidden commissions or fees. Choose the level that matches your trading frequency.
          </p>

          {/* Pricing Period Toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-xs font-bold tracking-wider ${billingPeriod === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>Monthly Billing</span>
            <button 
              onClick={() => setBillingPeriod(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
              className="w-12 h-6 rounded-full bg-slate-100 p-0.5 relative transition-colors border border-slate-200"
            >
              <div className={`w-5 h-5 rounded-full bg-emerald-500 transition-all shadow-sm ${
                billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-0'
              }`}></div>
            </button>
            <span className={`text-xs font-bold tracking-wider flex items-center gap-1.5 ${billingPeriod === 'yearly' ? 'text-slate-900 font-extrabold' : 'text-slate-400'}`}>
              Yearly Billing
              <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200/50 text-emerald-700 text-[9px] font-extrabold uppercase tracking-wide">Save 30%</span>
            </span>
          </div>
        </div>

        {/* Pricing Layout */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              name: "Tradeflow Lite",
              price: 0,
              desc: "Ideal for beginner investors and casual traders.",
              features: [
                "Commission-free stock & ETF trades",
                "Fractional shares support",
                "Easy-to-use web interface",
                "Up to $10,000 monthly trading volume"
              ]
            },
            {
              name: "Tradeflow Pro",
              price: billingPeriod === 'monthly' ? 29 : 19,
              desc: "Designed for active traders and algorithmic strategies.",
              features: [
                "Advanced order types (stop, trailing, OCO)",
                "Priority market data feeds",
                "Custom indicators & charting",
                "No monthly volume caps",
                "Priority WebSocket streaming API"
              ],
              popular: true
            },
            {
              name: "Tradeflow Institutional",
              price: billingPeriod === 'monthly' ? 99 : 69,
              desc: "Enterprise-grade access for funds and brokers.",
              features: [
                "Low-latency execution and co-location",
                "Dedicated API endpoints",
                "Advanced custody and compliance",
                "Custom SLAs and 24/7 support",
                "Onboarding & integration assistance"
              ]
            }
          ].map(plan => (
            <div 
              key={plan.name}
              className={`p-6 md:p-8 rounded-2xl flex flex-col justify-between relative transition-all duration-300 ${
                plan.popular 
                  ? 'bg-white border-2 border-emerald-600 shadow-xl shadow-emerald-600/5' 
                  : 'bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-650 text-white text-[10px] font-extrabold uppercase tracking-widest rounded-full shadow-md">
                  RECOMMENDED MODEL
                </span>
              )}
              
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-xs text-slate-500 mb-6">{plan.desc}</p>
                
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-slate-900 font-mono">${plan.price}</span>
                  <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">/ Month</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map(feat => (
                    <li key={feat} className="flex items-start gap-2.5 text-xs text-slate-650">
                      <Check size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <SignedOut>
                <Link href="/sign-up">
                  <button className={`w-full py-3 rounded-xl text-xs font-bold tracking-wider transition-colors ${
                    plan.popular 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' 
                      : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
                  }`}>
                    OPEN FREE ACCOUNT
                  </button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <button className={`w-full py-3 rounded-xl text-xs font-bold tracking-wider transition-colors ${
                    plan.popular 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' 
                      : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
                  }`}>
                    GO TO DASHBOARD
                  </button>
                </Link>
              </SignedIn>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────
         INTERACTIVE TESTIMONIALS SLIDER SECTION
         ──────────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-24 border-t border-slate-200 bg-slate-50/50 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          
          <span className="text-emerald-600 text-xs font-bold tracking-widest uppercase">TRADER COMMUNITY VERDICT</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-10 tracking-tight text-slate-900">Verified Broker Feedback</h2>
          
          {/* Active Testimonial Card */}
          <div className="relative min-h-[220px] flex flex-col justify-center items-center">
            
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl text-slate-900/[0.015] font-serif select-none pointer-events-none">
              “
            </div>

            {/* Glowing active card */}
            <div className="p-8 md:p-10 rounded-2xl bg-white border border-slate-200 shadow-lg relative max-w-2xl mx-auto animate-fade-in backdrop-blur-md">
              <p className="text-md md:text-lg text-slate-700 italic leading-relaxed mb-6 font-medium">
                "{testimonials[activeTestimonial].text}"
              </p>
              
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 text-lg flex items-center justify-center shadow-sm">
                  {testimonials[activeTestimonial].avatar}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">{testimonials[activeTestimonial].name}</div>
                  <span className="text-[10px] text-slate-400 font-bold tracking-wider">{testimonials[activeTestimonial].role}</span>
                </div>
              </div>

              {/* Star rating indicator */}
              <div className="flex justify-center gap-1 mt-4 text-emerald-600">
                {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, i) => (
                  <Star key={i} size={11} fill="#059669" stroke="#059669" />
                ))}
              </div>
            </div>
          </div>

          {/* Slide Indicator dots */}
          <div className="flex justify-center gap-2.5 mt-8">
            {testimonials.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setActiveTestimonial(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeTestimonial === i ? 'bg-emerald-600 w-5 shadow-sm' : 'bg-slate-200'
                }`}
                title={`Go to slide ${i+1}`}
              ></button>
            ))}
          </div>

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────
         CTA AND FOOTER SECTIONS
         ──────────────────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-6 text-center">
        <div className="bg-gradient-to-r from-emerald-50 to-slate-50 border border-emerald-200/50 rounded-3xl p-8 md:p-16 relative overflow-hidden shadow-xl">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[70px] -z-10"></div>
          
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-slate-900 tracking-tight">
            Ready to Accelerate Your Trading Operations?
          </h2>
          <p className="text-sm md:text-md text-slate-500 mb-8 max-w-lg mx-auto leading-relaxed">
            Register your custodial account under 5 minutes and deploy customized rebalancing protocols instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 justify-center max-w-md mx-auto">
            <SignedOut>
              <Link href="/sign-up" className="w-full">
                <button className="w-full px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-md transition-all hover:scale-[1.03]">
                  OPEN ACCOUNT FOR FREE
                </button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="w-full">
                <button className="w-full px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-md transition-all hover:scale-[1.03]">
                  GO TO DASHBOARD
                </button>
              </Link>
            </SignedIn>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 tracking-wider uppercase font-bold font-mono">
            No payments required to start • Free paper balance accounts loaded
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 text-slate-500">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12 text-left font-semibold">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center">
                  <span className="font-extrabold text-white text-sm">T</span>
                </div>
                <span className="text-md font-bold text-slate-900 tracking-wider">Tradeflow</span>
              </div>
              <p className="text-xs text-slate-500 mb-4 max-w-xs leading-relaxed font-normal">
                Advanced brokerage infrastructure and low-latency trade systems built for global markets.
              </p>
              <div className="text-[10px] text-slate-450 font-normal">
                Registered Protocol Node Infrastructure • Sandbox Compliance sandbox
              </div>
            </div>
            
            <div>
              <div className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Tradeflow Engine</div>
              <ul className="space-y-3 text-xs text-slate-500 font-normal">
                <li><a href="#markets" className="hover:text-emerald-600 transition-colors">Markets Monitor</a></li>
                <li><a href="#features" className="hover:text-emerald-600 transition-colors">Platform Utilities</a></li>
                <li><a href="#pricing" className="hover:text-emerald-600 transition-colors">Pricing Rates</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">API Execution Core</a></li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Institution</div>
              <ul className="space-y-3 text-xs text-slate-500 font-normal">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Security Audit Node</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Careers Sandbox</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Research Blog</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Institutional Contacts</a></li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Support Lab</div>
              <ul className="space-y-3 text-xs text-slate-500 font-normal">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Developer Help Center</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Whitepaper docs</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Privacy Agreement</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Terms of Operations</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200/60 text-center text-xs text-slate-400 space-y-3 font-normal">
            <p>© 2026 Tradeflow. All rights reserved.</p>
            <p className="text-[10px] text-slate-450 leading-relaxed max-w-3xl mx-auto">
              Trading digital assets involves substantial risk of loss. Simulated historical projection maps are not guarantees of future yields. Always review contract terms carefully prior to allocating capital.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
