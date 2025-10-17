import { SimpleLayout } from '@/components/SimpleLayout'

export default function Loading() {
  return (
    <SimpleLayout
      title="Laster fagdag..."
      intro=""
      backButton={{
        href: '/admin/events',
        label: 'Tilbake til oversikt',
      }}
    >
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="mb-2 h-8 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="p-5">
              <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-6 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="space-y-6">
        <div className="h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-96 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </SimpleLayout>
  )
}
