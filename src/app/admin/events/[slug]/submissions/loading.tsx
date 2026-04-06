const shimmer = 'animate-pulse rounded bg-gray-200 dark:bg-gray-700' as const

function SubmissionSkeleton() {
  return (
    <div className="border-b border-gray-100 p-4 dark:border-gray-700/50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className={`h-5 w-16 rounded-full ${shimmer}`} />
            <div className={`h-5 w-48 ${shimmer}`} />
          </div>
          <div className={`h-4 w-32 ${shimmer}`} />
          <div className={`h-3 w-full max-w-md ${shimmer}`} />
        </div>
        <div className={`h-6 w-20 rounded-full ${shimmer}`} />
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`h-8 w-20 rounded-full ${shimmer}`} />
        ))}
      </div>

      {/* Submissions list */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {[...Array(5)].map((_, i) => (
          <SubmissionSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
