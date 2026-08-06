import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ProfileFormProps {
  userId: string
}

async function getUserProfile(userId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/account/profile`,
      {
        cache: 'no-store',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
      }
    )
    if (!response.ok) throw new Error('Failed to fetch profile')
    const data = await response.json()
    return data.result || {}
  } catch (error) {
    console.error('Error fetching profile:', error)
    // Fallback to mock data
    return {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+91 9876543210",
      dateOfBirth: "1990-01-15",
      country: "India",
      state: "Maharashtra",
      city: "Mumbai",
      address: "123 Main Street, Andheri West",
      postalCode: "400058",
      nationality: "Indian",
      occupation: "Software Engineer",
      annualIncome: "10-20L",
      netWorth: "50-100L",
    }
  }
}

export async function ProfileForm({ userId }: ProfileFormProps) {
  const profile = await getUserProfile(userId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                First Name
              </label>
              <input
                type="text"
                defaultValue={profile.firstName}
                className="w-full h-10 px-3 text-sm bg-input border border-border rounded-sm focus:border-foreground focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                Last Name
              </label>
              <input
                type="text"
                defaultValue={profile.lastName}
                className="w-full h-10 px-3 text-sm bg-input border border-border rounded-sm focus:border-foreground focus:outline-none"
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                Email
              </label>
              <input
                type="email"
                defaultValue={profile.email}
                disabled
                className="w-full h-10 px-3 text-sm bg-muted border border-border rounded-sm cursor-not-allowed opacity-50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email is managed by your account provider
              </p>
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                Phone
              </label>
              <input
                type="tel"
                defaultValue={profile.phone}
                className="w-full h-10 px-3 text-sm bg-input border border-border rounded-sm focus:border-foreground focus:outline-none"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                Date of Birth
              </label>
              <input
                type="date"
                defaultValue={profile.dateOfBirth}
                className="w-full h-10 px-3 text-sm bg-input border border-border rounded-sm focus:border-foreground focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                Nationality
              </label>
              <input
                type="text"
                defaultValue={profile.nationality}
                className="w-full h-10 px-3 text-sm bg-input border border-border rounded-sm focus:border-foreground focus:outline-none"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
              Address
            </label>
            <input
              type="text"
              defaultValue={profile.address}
              className="w-full h-10 px-3 text-sm bg-input border border-border rounded-sm focus:border-foreground focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                City
              </label>
              <input
                type="text"
                defaultValue={profile.city}
                className="w-full h-10 px-3 text-sm bg-input border border-border rounded-sm focus:border-foreground focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                State
              </label>
              <input
                type="text"
                defaultValue={profile.state}
                className="w-full h-10 px-3 text-sm bg-input border border-border rounded-sm focus:border-foreground focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                Postal Code
              </label>
              <input
                type="text"
                defaultValue={profile.postalCode}
                className="w-full h-10 px-3 text-sm bg-input border border-border rounded-sm focus:border-foreground focus:outline-none"
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className="pt-6 border-t border-border">
            <h3 className="text-sm font-semibold mb-4">Financial Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                  Occupation
                </label>
                <input
                  type="text"
                  defaultValue={profile.occupation}
                  className="w-full h-10 px-3 text-sm bg-input border border-border rounded-sm focus:border-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                  Annual Income
                </label>
                <select
                  defaultValue={profile.annualIncome}
                  className="w-full h-10 px-3 text-sm bg-input border border-border rounded-sm focus:border-foreground focus:outline-none"
                >
                  <option value="<5L">Less than ₹5L</option>
                  <option value="5-10L">₹5L - ₹10L</option>
                  <option value="10-20L">₹10L - ₹20L</option>
                  <option value="20-50L">₹20L - ₹50L</option>
                  <option value=">50L">More than ₹50L</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                Net Worth
              </label>
              <select
                defaultValue={profile.netWorth}
                className="w-full h-10 px-3 text-sm bg-input border border-border rounded-sm focus:border-foreground focus:outline-none"
              >
                <option value="<10L">Less than ₹10L</option>
                <option value="10-50L">₹10L - ₹50L</option>
                <option value="50-100L">₹50L - ₹1Cr</option>
                <option value="100-500L">₹1Cr - ₹5Cr</option>
                <option value=">500L">More than ₹5Cr</option>
              </select>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="ghost">Cancel</Button>
        <Button variant="primary">Save Changes</Button>
      </CardFooter>
    </Card>
  )
}
