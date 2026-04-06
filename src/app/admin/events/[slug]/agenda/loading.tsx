const shimmer = 'animate-pulse rounded bg-gray-200 dark:bg-gray-700' as const

function StatCardSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className={`mb-2 h-9 w-9 rounded-lg ${shimmer}`} />
      <div className={`h-8 w-10 ${shimmer}`} />
      <div className={`mt-1 h-3 w-16 ${shimmer}`} />
    </div>
  )
}

function TalkRowSkeleton() {
  return (
    <div className="border-b border-gray-100 p-4 dark:border-gray-700/50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className={`h-5 w-14 rounded-full ${shimmer}`} />
            <div className={`h-5 w-56 ${shimmer}`} />
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-6 w-6 rounded-full ${shimmer}`} />
            <div className={`h-4 w-32 ${shimmer}`} />
          </div>
        </div>
        <div className="flex gap-2">
          <div className={`h-8 w-8 rounded-lg ${shimmer}`} />
          <div className={`h-8 w-8 rounded-lg ${shimmer}`} />
        </div>
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className={`h-9 w-28 rounded-lg ${shimmer}`} />
        <div className={`h-9 w-28 rounded-lg ${shimmer}`} />
      </div>

      {/* Talks list */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {[...Array(6)].map((_, i) => (
          <TalkRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
