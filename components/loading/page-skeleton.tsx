import { CardGridSkeleton } from './card-skeleton'
import { TableSkeleton } from './table-skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="h-8 bg-neutral-200 rounded w-1/4 animate-pulse" />
      
      {/* Cards Skeleton */}
      <CardGridSkeleton count={4} />
      
      {/* Table Skeleton */}
      <div className="mt-8">
        <div className="h-6 bg-neutral-200 rounded w-1/6 mb-4 animate-pulse" />
        <TableSkeleton rows={5} />
      </div>
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="p-8 space-y-6">
      <div className="h-10 bg-neutral-200 rounded w-1/3 animate-pulse" />
      <div className="h-64 bg-neutral-100 rounded animate-pulse" />
    </div>
  )
}
