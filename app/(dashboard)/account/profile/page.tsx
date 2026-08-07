import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/components/account/profile-form"
import { RiskProfileCard } from "@/components/account/risk-profile-card"
import { Card } from "@/components/ui/card"

export const metadata = {
  title: "Profile | TradeFlow",
  description: "Manage your profile",
}

export default async function ProfilePage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal information and preferences
        </p>
      </div>

      <Suspense fallback={<CardSkeleton />}>
        <ProfileForm userId={userId} />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <RiskProfileCard userId={userId} />
      </Suspense>
    </div>
  )
}

function CardSkeleton() {
  return <Card className="p-6 h-64 bg-muted animate-pulse" />
}
