"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

type Answer = {
  question: string
  answer: string
  score: number
}

export default function RiskAssessmentPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])

  const questions = [
    {
      question: "What is your primary investment goal?",
      options: [
        { text: "Capital preservation", score: 1 },
        { text: "Steady income generation", score: 2 },
        { text: "Balanced growth and income", score: 3 },
        { text: "Capital appreciation", score: 4 },
        { text: "Aggressive growth", score: 5 },
      ],
    },
    {
      question: "How would you react to a 20% drop in your portfolio value?",
      options: [
        { text: "Sell everything immediately", score: 1 },
        { text: "Reduce my position size", score: 2 },
        { text: "Hold and wait for recovery", score: 3 },
        { text: "Buy more at lower prices", score: 4 },
        { text: "Significantly increase my position", score: 5 },
      ],
    },
    {
      question: "What is your investment time horizon?",
      options: [
        { text: "Less than 1 year", score: 1 },
        { text: "1-3 years", score: 2 },
        { text: "3-5 years", score: 3 },
        { text: "5-10 years", score: 4 },
        { text: "More than 10 years", score: 5 },
      ],
    },
    {
      question: "What percentage of losses can you tolerate?",
      options: [
        { text: "I cannot afford any losses", score: 1 },
        { text: "Up to 5% loss", score: 2 },
        { text: "Up to 10% loss", score: 3 },
        { text: "Up to 20% loss", score: 4 },
        { text: "More than 20% loss", score: 5 },
      ],
    },
    {
      question: "How familiar are you with financial markets?",
      options: [
        { text: "No knowledge at all", score: 1 },
        { text: "Basic understanding", score: 2 },
        { text: "Moderate knowledge", score: 3 },
        { text: "Good understanding", score: 4 },
        { text: "Expert level", score: 5 },
      ],
    },
    {
      question: "What portion of your total savings will you invest?",
      options: [
        { text: "Less than 10%", score: 5 },
        { text: "10-25%", score: 4 },
        { text: "25-50%", score: 3 },
        { text: "50-75%", score: 2 },
        { text: "More than 75%", score: 1 },
      ],
    },
  ]

  const updateRiskProfileMutation = useMutation({
    mutationFn: async (riskProfile: string) => {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riskProfile }),
      })
      if (!response.ok) throw new Error('Failed to update risk profile')
      return response.json()
    },
    onSuccess: () => {
      toast.success('Risk assessment completed!')
      router.push('/dashboard')
    },
    onError: (error) => {
      toast.error(`Failed to save assessment: ${error.message}`)
    },
  })

  const handleAnswer = (option: { text: string; score: number }) => {
    const newAnswers = [
      ...answers,
      {
        question: questions[currentQuestion].question,
        answer: option.text,
        score: option.score,
      },
    ]
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Calculate final risk profile
      const totalScore = newAnswers.reduce((sum, a) => sum + a.score, 0)
      const avgScore = totalScore / newAnswers.length
      
      let riskProfile: string
      if (avgScore <= 2) {
        riskProfile = "CONSERVATIVE"
      } else if (avgScore <= 3.5) {
        riskProfile = "MODERATE"
      } else {
        riskProfile = "AGGRESSIVE"
      }

      updateRiskProfileMutation.mutate(riskProfile)
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setAnswers(answers.slice(0, -1))
    }
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
              ✓
            </div>
            <div className="w-16 h-1 bg-black"></div>
            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
              ✓
            </div>
            <div className="w-16 h-1 bg-black"></div>
            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div className="w-16 h-1 bg-neutral-200"></div>
            <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
          </div>
          <p className="text-center text-sm text-neutral-600">
            Step 2 of 3: Risk Assessment
          </p>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Understand Your Risk Profile</h1>
          <p className="text-neutral-600">
            Answer {questions.length} quick questions to personalize your trading experience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium">Question {currentQuestion + 1} of {questions.length}</span>
            <span className="text-neutral-600">{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <Card className="p-8 mb-6">
          <h2 className="text-xl font-semibold mb-6">
            {questions[currentQuestion].question}
          </h2>
          <div className="space-y-3">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="w-full p-4 text-left border-2 rounded-lg hover:border-black hover:bg-neutral-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span>{option.text}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4">
          {currentQuestion > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              ← Back
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleSkip}
            className="flex-1"
          >
            Skip Assessment
          </Button>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-neutral-50 rounded-lg">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span>ℹ️</span> Why do we ask this?
          </h3>
          <p className="text-sm text-neutral-600">
            Understanding your risk tolerance helps us provide personalized recommendations,
            appropriate investment options, and alerts that match your trading style.
          </p>
        </div>

        {/* Security Note */}
        <p className="text-center text-sm text-neutral-500 mt-6">
          🔒 Your responses are confidential and used only to enhance your experience
        </p>
      </div>
    </div>
  )
}
