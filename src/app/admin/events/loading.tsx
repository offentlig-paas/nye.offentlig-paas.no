import { AdminLayout } from '@/components/AdminLayout'

const shimmer = 'animate-pulse rounded bg-zinc-200 dark:bg-zinc-700' as const

export default function Loading() {
  return (
    <AdminLayout
      title="Admin - Fagdager"
      intro="Laster fagdager..."
      backButton={{
        href: '/',
        label: 'Tilbake til forsiden',
      }}
    >
      {/* Overall Stats Skeleton */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            <div className="flex items-start gap-3">
              <div className={`h-10 w-10 shrink-0 rounded-lg ${shimmer}`} />
              <div className="min-w-0">
                <div className={`h-7 w-12 ${shimmer}`} />
                <div className={`mt-1 h-3 w-20 ${shimmer}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Events List Skeleton */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {[...Array(5)].map((_, i) => (
            <li key={i}>
              <div className="px-4 py-3 sm:px-6">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className={`mb-2 h-5 w-3/4 ${shimmer}`} />
                    <div className="mb-2 flex items-center space-x-2">
                      <div className={`h-3 w-3 ${shimmer}`} />
                      <div className={`h-3 w-32 ${shimmer}`} />
                      <div className={`h-3 w-2 ${shimmer}`} />
                      <div className={`h-3 w-24 ${shimmer}`} />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="flex items-center space-x-1">
                          <div className={`h-3 w-3 ${shimmer}`} />
                          <div className={`h-3 w-14 ${shimmer}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col items-end space-y-1">
                    <div className={`mb-1 h-4 w-20 ${shimmer}`} />
                    <div className={`h-3 w-16 ${shimmer}`} />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AdminLayout>
  )
}
