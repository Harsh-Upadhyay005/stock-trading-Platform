"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function WelcomePage() {
  const router = useRouter()

  const features = [
    {
      icon: "📊",
      title: "Real-time Market Data",
      description: "Get live quotes, charts, and market depth",
    },
    {
      icon: "⚡",
      title: "Instant Order Execution",
      description: "Place orders in milliseconds with our fast infrastructure",
    },
    {
      icon: "🔒",
      title: "Bank-level Security",
      description: "256-bit encryption and 2FA for complete protection",
    },
    {
      icon: "📱",
      title: "Trade Anywhere",
      description: "Access from web, mobile, or API",
    },
  ]

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Logo & Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Welcome to TradeFlow</h1>
          <p className="text-xl text-neutral-600">
            Your journey to smarter trading starts here
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-neutral-600">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Steps Preview */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Complete Your Setup in 3 Easy Steps
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Complete Profile</h3>
              <p className="text-sm text-neutral-600">
                Basic information and preferences
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-neutral-200 text-black rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Risk Assessment</h3>
              <p className="text-sm text-neutral-600">
                Understand your trading style
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-neutral-200 text-black rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">KYC Verification</h3>
              <p className="text-sm text-neutral-600">
                Upload documents for compliance
              </p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-4">
          <Button
            size="lg"
            className="px-12"
            onClick={() => router.push("/profile")}
          >
            Get Started →
          </Button>
          <p className="text-sm text-neutral-600">
            Takes about 5 minutes • Your data is encrypted and secure
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-neutral-500">
          <p>
            By continuing, you agree to our{" "}
            <a href="#" className="underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
