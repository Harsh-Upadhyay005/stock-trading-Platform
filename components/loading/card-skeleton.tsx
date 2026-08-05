export function CardSkeleton() {
  return (
    <div className="p-6 bg-white rounded-lg border border-neutral-200">
      <div className="h-4 bg-neutral-200 rounded w-1/4 mb-4 animate-pulse" />
      <div className="h-8 bg-neutral-200 rounded w-1/2 animate-pulse" />
    </div>
  )
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
