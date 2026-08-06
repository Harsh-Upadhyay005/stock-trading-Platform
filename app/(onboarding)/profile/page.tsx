"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

export default function ProfileSetupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    occupation: "",
    annualIncome: "",
    tradingExperience: "BEGINNER",
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update profile')
      return response.json()
    },
    onSuccess: () => {
      toast.success('Profile updated successfully!')
      router.push('/risk-assessment')
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error.message}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate(formData)
  }

  const handleSkip = () => {
    router.push('/risk-assessment')
  }

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
              1
            </div>
            <div className="w-16 h-1 bg-neutral-200"></div>
            <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div className="w-16 h-1 bg-neutral-200"></div>
            <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
          </div>
          <p className="text-center text-sm text-neutral-600">
            Step 1 of 3: Complete Your Profile
          </p>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Tell Us About Yourself</h1>
          <p className="text-neutral-600">
            This helps us personalize your trading experience
          </p>
        </div>

        {/* Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Phone & DOB */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 border rounded-lg"
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Occupation & Income */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  Occupation
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="Software Engineer"
                  value={formData.occupation}
                  onChange={(e) =>
                    setFormData({ ...formData, occupation: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">
                  Annual Income
                </label>
                <select
                  className="w-full px-4 py-3 border rounded-lg"
                  value={formData.annualIncome}
                  onChange={(e) =>
                    setFormData({ ...formData, annualIncome: e.target.value })
                  }
                >
                  <option value="">Select range</option>
                  <option value="<5L">Less than ₹5 Lakhs</option>
                  <option value="5-10L">₹5 - ₹10 Lakhs</option>
                  <option value="10-20L">₹10 - ₹20 Lakhs</option>
                  <option value="20-50L">₹20 - ₹50 Lakhs</option>
                  <option value=">50L">More than ₹50 Lakhs</option>
                </select>
              </div>
            </div>

            {/* Trading Experience */}
            <div>
              <label className="text-sm font-medium block mb-3">
                Trading Experience *
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'BEGINNER', label: 'Beginner', desc: '< 1 year' },
                  { value: 'INTERMEDIATE', label: 'Intermediate', desc: '1-3 years' },
                  { value: 'ADVANCED', label: 'Advanced', desc: '3+ years' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, tradingExperience: option.value })
                    }
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      formData.tradingExperience === option.value
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="font-semibold mb-1">{option.label}</div>
                    <div className="text-xs opacity-75">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Terms */}
            <div className="p-4 bg-neutral-50 rounded-lg">
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" required className="mt-1" />
                <span>
                  I confirm that the information provided is accurate and I agree to the{" "}
                  <a href="#" className="underline">Terms of Service</a> and{" "}
                  <a href="#" className="underline">Privacy Policy</a>.
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleSkip}
              >
                Skip for Now
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Continue →'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Help Text */}
        <p className="text-center text-sm text-neutral-500 mt-6">
          🔒 Your information is encrypted and secure. We never share your data.
        </p>
      </div>
    </div>
  )
}
