const shimmer = 'animate-pulse rounded bg-zinc-200 dark:bg-zinc-700' as const

export default function Loading() {
  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            <div className="flex items-start gap-3">
              <div className={`h-10 w-10 shrink-0 rounded-lg ${shimmer}`} />
              <div className="min-w-0">
                <div className={`h-7 w-10 ${shimmer}`} />
                <div className={`mt-1 h-3 w-16 ${shimmer}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Feedback list */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="border-b border-zinc-100 p-4 dark:border-zinc-700/50"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className={`h-5 w-5 rounded ${shimmer}`} />
                  ))}
                </div>
                <div className={`h-4 w-3/4 ${shimmer}`} />
                <div className={`h-3 w-24 ${shimmer}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
