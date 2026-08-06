import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ErrorMessageProps {
  error: Error | string
  retry?: () => void
}

export function ErrorMessage({ error, retry }: ErrorMessageProps) {
  const message = typeof error === 'string' ? error : error.message

  return (
    <Card className="p-6 bg-red-50 border-red-200">
      <div className="flex items-start gap-3">
        <div className="text-2xl">⚠️</div>
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 mb-2">Error Loading Data</h3>
          <p className="text-sm text-red-700 mb-4">{message}</p>
          {retry && (
            <Button onClick={retry} variant="outline" size="sm">
              Try Again
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

export function ErrorPage({ error, reset }: { error: Error; reset?: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <ErrorMessage error={error} retry={reset} />
      </div>
    </div>
  )
}
