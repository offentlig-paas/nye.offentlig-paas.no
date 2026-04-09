import { SHIMMER_CLASS as shimmer } from '@/lib/admin-ui'

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

function RegistrationRowSkeleton() {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <div className={`h-4 w-4 rounded ${shimmer}`} />
        <div className={`h-8 w-8 rounded-full ${shimmer}`} />
        <div className="space-y-1">
          <div className={`h-4 w-36 ${shimmer}`} />
          <div className={`h-3 w-24 ${shimmer}`} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className={`h-5 w-16 rounded-full ${shimmer}`} />
        <div className={`h-5 w-14 rounded-full ${shimmer}`} />
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Actions */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <div className="flex gap-2">
          <div className={`h-9 w-36 rounded-xl ${shimmer}`} />
          <div className={`h-9 w-28 rounded-xl ${shimmer}`} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className={`h-9 w-56 rounded-xl ${shimmer}`} />
        <div className={`h-9 w-28 rounded-xl ${shimmer}`} />
        <div className={`h-9 w-28 rounded-xl ${shimmer}`} />
      </div>

      {/* Registration list */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
          {[...Array(8)].map((_, i) => (
            <RegistrationRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
