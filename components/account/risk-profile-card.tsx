import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface RiskProfileCardProps {
  userId: string
}

async function getRiskProfile(userId: string) {
  // Mock data
  return {
    score: 68,
    level: "MODERATE",
    lastAssessed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    breakdown: {
      experience: 7,
      timeHorizon: 8,
      riskTolerance: 6,
      liquidityNeeds: 7,
      investmentGoals: 8,
    },
  }
}

export async function RiskProfileCard({ userId }: RiskProfileCardProps) {
  const profile = await getRiskProfile(userId)

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      CONSERVATIVE: "success",
      MODERATE: "warning",
      AGGRESSIVE: "error",
      SPECULATIVE: "error",
    }
    return colors[level] || "default"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Score and Level */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold numeric">{profile.score}</div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                Risk Score
              </p>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-muted-foreground">Risk Level:</span>
                <Badge variant={getLevelColor(profile.level) as any}>
                  {profile.level}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Last assessed: {profile.lastAssessed.toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Score Breakdown
            </p>
            {Object.entries(profile.breakdown).map(([key, value]) => (
              <div key={key}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                  <span className="numeric">{value}/10</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-foreground transition-all"
                    style={{ width: `${value * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="p-4 bg-muted rounded-md">
            <p className="text-sm">
              <strong>Moderate Risk Profile:</strong> You have a balanced approach to
              investing, with a moderate tolerance for risk. You're comfortable with some
              market volatility in exchange for potential growth opportunities.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href="/onboarding/risk-assessment" className="w-full">
          <Button variant="ghost" className="w-full">
            Retake Risk Assessment
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
