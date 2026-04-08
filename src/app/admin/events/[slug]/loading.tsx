const shimmer = 'animate-pulse rounded bg-zinc-200 dark:bg-zinc-700' as const

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-start gap-3">
        <div className={`h-10 w-10 shrink-0 rounded-lg ${shimmer}`} />
        <div className="min-w-0">
          <div className={`h-7 w-10 ${shimmer}`} />
          <div className={`mt-1 h-3 w-16 ${shimmer}`} />
        </div>
      </div>
    </div>
  )
}

function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="break-inside-avoid rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className={`mb-3 h-5 w-28 ${shimmer}`} />
      <div className="space-y-2">
        {[...Array(lines)].map((_, i) => (
          <div key={i} className="space-y-1">
            <div className={`h-3 w-12 ${shimmer}`} />
            <div className={`h-4 w-40 ${shimmer}`} />
          </div>
        ))}
      </div>
    </div>
  )
}

function PersonSkeleton() {
  return (
    <div className="flex items-center space-x-2">
      <div className={`h-6 w-6 rounded-full ${shimmer}`} />
      <div className={`h-4 w-32 ${shimmer}`} />
    </div>
  )
}

export default function Loading() {
  return (
    <div className="space-y-4">
      {/* Top Section: Checklist and Stats */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Checklist skeleton */}
        <div className="lg:col-span-2">
          <div className="h-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <div className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-5 w-5 ${shimmer}`} />
                  <div className={`h-5 w-28 ${shimmer}`} />
                </div>
                <div className={`h-4 w-8 ${shimmer}`} />
              </div>
              <div className={`mt-3 h-2 w-full rounded-full ${shimmer}`} />
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className={`h-5 w-5 rounded-full ${shimmer}`} />
                  <div className={`h-4 w-48 ${shimmer}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-2 content-start gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>

      {/* Actions skeleton */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <div className="flex gap-2">
          <div className={`h-9 w-36 rounded-xl ${shimmer}`} />
          <div className={`h-9 w-28 rounded-xl ${shimmer}`} />
        </div>
      </div>

      {/* Management masonry skeleton */}
      <div className="columns-1 gap-4 space-y-4 md:columns-2 lg:columns-3">
        <CardSkeleton lines={3} />
        <div className="break-inside-avoid rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <div className={`mb-3 h-5 w-24 ${shimmer}`} />
          <div className="space-y-2">
            <PersonSkeleton />
            <PersonSkeleton />
          </div>
        </div>
        <div className="break-inside-avoid rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <div className={`mb-3 h-5 w-36 ${shimmer}`} />
          <div className={`h-12 w-full rounded-xl ${shimmer}`} />
        </div>
        <CardSkeleton lines={2} />
      </div>
    </div>
  )
}
