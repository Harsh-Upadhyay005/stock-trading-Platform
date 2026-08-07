"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { TableSkeleton } from "@/components/loading/table-skeleton"
import { ErrorMessage } from "@/components/error/error-message"
import { toast } from "sonner"

export default function KYCPage() {
  const [formData, setFormData] = useState({
    panNumber: "",
    aadhaarNumber: "",
    dateOfBirth: "",
    address: "",
  })

  const queryClient = useQueryClient()

  // Fetch KYC status
  const { data: kycData, isLoading, error, refetch } = useQuery({
    queryKey: ['kyc-status'],
    queryFn: async () => {
      const response = await fetch('/api/account/kyc')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      return data.result || {}
    },
  })

  // Submit KYC mutation
  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/account/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to submit')
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['kyc-status'] })
      toast.success(data.result?.message || 'KYC submitted successfully!')
    },
    onError: (error) => {
      toast.error(`KYC submission failed: ${error.message}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitMutation.mutate(formData)
  }

  if (isLoading) return <TableSkeleton />
  if (error) return <ErrorMessage error={error} retry={refetch} />

  const status = kycData?.status || 'NOT_SUBMITTED'
  const isVerified = status === 'VERIFIED'
  const isPending = status === 'PENDING'
  const isRejected = status === 'REJECTED'

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">KYC Verification</h1>
        <p className="text-sm text-neutral-600 mt-1">
          Complete your KYC to start trading
        </p>
      </div>

      {/* Status Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-2">Verification Status</h3>
            <div className="flex items-center gap-3">
              <Badge 
                variant={isVerified ? "default" : isPending ? "outline" : "destructive"}
                className={isVerified ? "bg-green-600" : ""}
              >
                {status}
              </Badge>
              {kycData?.hasDocuments && (
                <span className="text-sm text-neutral-600">
                  Documents uploaded
                </span>
              )}
            </div>
          </div>
          
          {isVerified && (
            <div className="text-6xl">✅</div>
          )}
          {isPending && (
            <div className="text-6xl">⏳</div>
          )}
          {isRejected && (
            <div className="text-6xl">❌</div>
          )}
        </div>

        {isPending && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-sm">
            <p className="text-yellow-800">
              Your KYC is under review. This typically takes 24-48 hours.
              You'll receive an email once verified.
            </p>
          </div>
        )}

        {isVerified && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg text-sm">
            <p className="text-green-800">
              ✓ Your KYC is verified. You can now start trading!
              {kycData?.verifiedAt && ` Verified on ${new Date(kycData.verifiedAt).toLocaleDateString()}`}
            </p>
          </div>
        )}

        {isRejected && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg text-sm">
            <p className="text-red-800">
              Your KYC was rejected. Please check the details and resubmit.
            </p>
          </div>
        )}
      </Card>

      {/* KYC Form */}
      {!isVerified && (
        <Card className="p-6">
          <h3 className="font-semibold mb-6">
            {isPending ? 'Update KYC Details' : 'Submit KYC Details'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PAN Card */}
            <div>
              <label className="text-sm font-medium block mb-2">
                PAN Number *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border rounded-lg font-mono uppercase"
                placeholder="ABCDE1234F"
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                maxLength={10}
                value={formData.panNumber}
                onChange={(e) =>
                  setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })
                }
              />
              <p className="text-xs text-neutral-600 mt-1">
                Enter your 10-digit PAN card number
              </p>
            </div>

            {/* Aadhaar */}
            <div>
              <label className="text-sm font-medium block mb-2">
                Aadhaar Number *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border rounded-lg font-mono"
                placeholder="1234 5678 9012"
                pattern="[0-9]{12}"
                maxLength={12}
                value={formData.aadhaarNumber}
                onChange={(e) =>
                  setFormData({ ...formData, aadhaarNumber: e.target.value.replace(/\D/g, '') })
                }
              />
              <p className="text-xs text-neutral-600 mt-1">
                Enter your 12-digit Aadhaar number
              </p>
            </div>

            {/* Date of Birth */}
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
              <p className="text-xs text-neutral-600 mt-1">
                Must be 18 years or older
              </p>
            </div>

            {/* Address */}
            <div>
              <label className="text-sm font-medium block mb-2">
                Full Address *
              </label>
              <textarea
                required
                rows={3}
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Enter your complete address as per Aadhaar"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>

            {/* Terms */}
            <div className="p-4 bg-neutral-50 rounded-lg">
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" required className="mt-1" />
                <span>
                  I hereby declare that the information provided is true and accurate.
                  I understand that providing false information may lead to account suspension.
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={submitMutation.isPending}
                className="flex-1"
              >
                {submitMutation.isPending 
                  ? 'Submitting...' 
                  : isPending 
                    ? 'Update KYC' 
                    : 'Submit KYC'}
              </Button>
              {!isPending && (
                <Button type="button" variant="outline">
                  Save as Draft
                </Button>
              )}
            </div>
          </form>
        </Card>
      )}

      {/* Required Documents */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Required Documents</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">📄</div>
            <div>
              <div className="font-medium">PAN Card</div>
              <div className="text-sm text-neutral-600">
                Permanent Account Number
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-2xl">🆔</div>
            <div>
              <div className="font-medium">Aadhaar Card</div>
              <div className="text-sm text-neutral-600">
                For identity verification
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-2xl">🏠</div>
            <div>
              <div className="font-medium">Address Proof</div>
              <div className="text-sm text-neutral-600">
                As per Aadhaar
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-2xl">🏦</div>
            <div>
              <div className="font-medium">Bank Details</div>
              <div className="text-sm text-neutral-600">
                Cancelled cheque or statement
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Info */}
      <Card className="p-6 bg-neutral-50">
        <h3 className="font-semibold mb-3">Important Information</h3>
        <ul className="space-y-2 text-sm text-neutral-600">
          <li>• KYC verification is mandatory as per SEBI regulations</li>
          <li>• Verification typically takes 24-48 hours</li>
          <li>• Ensure all details match your PAN card exactly</li>
          <li>• You'll receive email notification once verified</li>
          <li>• In paper trading mode, verification is instant</li>
        </ul>
      </Card>
    </div>
  )
}
