import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Create your account</h1>
          <p className="text-neutral-600">Start trading with TradeFlow today</p>
          <p className="text-sm text-neutral-500 mt-2">
            Use email or social login to get started
          </p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl border-2 border-neutral-200",
              headerTitle: "text-black",
              headerSubtitle: "text-neutral-600",
              socialButtonsBlockButton: "border-2 hover:border-black transition-colors",
              formButtonPrimary: "bg-black hover:bg-neutral-800",
            }
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/welcome"
        />
        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-500">
            📧 Email authentication recommended<br/>
            🚫 Phone authentication not available in free tier
          </p>
        </div>
      </div>
    </div>
  )
}
