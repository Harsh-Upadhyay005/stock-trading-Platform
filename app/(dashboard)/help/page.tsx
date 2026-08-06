import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function HelpPage() {
  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I create an account?",
          a: "Click on 'Sign Up' and follow the registration process. You'll need to provide basic information and complete KYC verification.",
        },
        {
          q: "What documents are required for KYC?",
          a: "You need PAN card, Aadhaar card, bank account details, and a recent photograph for KYC verification.",
        },
        {
          q: "How long does KYC verification take?",
          a: "KYC verification typically takes 24-48 hours. You'll receive an email once verified.",
        },
      ],
    },
    {
      category: "Trading",
      questions: [
        {
          q: "What are the different order types?",
          a: "We support Market, Limit, Stop Loss, and Stop Loss Limit orders for flexibility in trading.",
        },
        {
          q: "What is the minimum amount to start trading?",
          a: "You can start trading with as little as ₹5,000, but we recommend starting with at least ₹25,000 for better flexibility.",
        },
        {
          q: "What are the trading hours?",
          a: "NSE/BSE trading hours: 9:15 AM to 3:30 PM IST on trading days.",
        },
      ],
    },
    {
      category: "Funds & Charges",
      questions: [
        {
          q: "How do I add funds to my account?",
          a: "Go to Funds page and choose from UPI, Net Banking, NEFT/RTGS, or Card payment options.",
        },
        {
          q: "What are the brokerage charges?",
          a: "Delivery trades: ₹0 | Intraday: Flat ₹20 or 0.05% (whichever is lower) | F&O: Flat ₹20 per order",
        },
        {
          q: "How long do withdrawals take?",
          a: "Withdrawals are processed within 1-2 business days and credited to your registered bank account.",
        },
      ],
    },
    {
      category: "Security",
      questions: [
        {
          q: "Is my money safe?",
          a: "Yes, your funds are held in segregated accounts with SEBI-registered depositories. We use bank-grade 256-bit encryption.",
        },
        {
          q: "How do I enable 2FA?",
          a: "Go to Settings > Security and enable Two-Factor Authentication for additional account protection.",
        },
        {
          q: "What if I forget my password?",
          a: "Click 'Forgot Password' on the login page. We'll send a reset link to your registered email.",
        },
      ],
    },
  ]

  const contactOptions = [
    {
      icon: "📧",
      title: "Email Support",
      description: "support@tradeflow.com",
      action: "Send Email",
    },
    {
      icon: "📞",
      title: "Phone Support",
      description: "+91 1800 123 4567",
      action: "Call Now",
    },
    {
      icon: "💬",
      title: "Live Chat",
      description: "Available 9 AM - 6 PM",
      action: "Start Chat",
    },
    {
      icon: "📱",
      title: "WhatsApp",
      description: "+91 98765 43210",
      action: "Message",
    },
  ]

  const resources = [
    {
      title: "Trading Guide",
      description: "Complete guide for beginners",
      icon: "📚",
      link: "#",
    },
    {
      title: "Video Tutorials",
      description: "Learn with step-by-step videos",
      icon: "🎥",
      link: "#",
    },
    {
      title: "Market News",
      description: "Latest market updates",
      icon: "📰",
      link: "#",
    },
    {
      title: "API Documentation",
      description: "For developers",
      icon: "👨‍💻",
      link: "#",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-12 bg-gradient-to-b from-neutral-50 to-white rounded-lg">
        <h1 className="text-4xl font-bold mb-4">How Can We Help You?</h1>
        <p className="text-neutral-600 mb-8">
          Find answers to common questions or contact our support team
        </p>
        <div className="max-w-2xl mx-auto">
          <input
            type="search"
            placeholder="Search for help articles..."
            className="w-full px-6 py-4 border-2 rounded-lg text-lg"
          />
        </div>
      </div>

      {/* Contact Options */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
        <div className="grid grid-cols-4 gap-4">
          {contactOptions.map((option) => (
            <Card key={option.title} className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-3">{option.icon}</div>
              <h3 className="font-semibold mb-2">{option.title}</h3>
              <p className="text-sm text-neutral-600 mb-4">{option.description}</p>
              <Button variant="outline" size="sm" className="w-full">
                {option.action}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqs.map((category) => (
            <Card key={category.category}>
              <div className="p-6 border-b bg-neutral-50">
                <h3 className="text-lg font-semibold">{category.category}</h3>
              </div>
              <div className="p-6 space-y-6">
                {category.questions.map((faq, index) => (
                  <div key={index}>
                    <h4 className="font-semibold mb-2">{faq.q}</h4>
                    <p className="text-neutral-600 text-sm">{faq.a}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Learning Resources</h2>
        <div className="grid grid-cols-4 gap-4">
          {resources.map((resource) => (
            <Link key={resource.title} href={resource.link}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-4xl mb-3">{resource.icon}</div>
                <h3 className="font-semibold mb-2">{resource.title}</h3>
                <p className="text-sm text-neutral-600">{resource.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <Card className="p-6 bg-neutral-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-2">Still Need Help?</h3>
            <p className="text-sm text-neutral-600">
              Our support team is available 9 AM - 6 PM on trading days
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">View All Articles</Button>
            <Button>Contact Support</Button>
          </div>
        </div>
      </Card>

      {/* Important Links */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Important Links</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Legal</h4>
            <ul className="space-y-2 text-neutral-600">
              <li><a href="#" className="hover:text-black">Terms of Service</a></li>
              <li><a href="#" className="hover:text-black">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-black">Risk Disclosure</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Account</h4>
            <ul className="space-y-2 text-neutral-600">
              <li><Link href="/account/profile" className="hover:text-black">Profile</Link></li>
              <li><Link href="/account/settings" className="hover:text-black">Settings</Link></li>
              <li><Link href="/account/kyc" className="hover:text-black">KYC Status</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Trading</h4>
            <ul className="space-y-2 text-neutral-600">
              <li><Link href="/tools" className="hover:text-black">Trading Tools</Link></li>
              <li><Link href="/market" className="hover:text-black">Market</Link></li>
              <li><Link href="/reports" className="hover:text-black">Reports</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Company</h4>
            <ul className="space-y-2 text-neutral-600">
              <li><a href="#" className="hover:text-black">About Us</a></li>
              <li><a href="#" className="hover:text-black">Careers</a></li>
              <li><a href="#" className="hover:text-black">Blog</a></li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
