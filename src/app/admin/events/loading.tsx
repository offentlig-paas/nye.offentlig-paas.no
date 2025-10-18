import { AdminLayout } from '@/components/AdminLayout'

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
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="mb-2">
                      <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    </dt>
                    <dd>
                      <div className="h-5 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Events List Skeleton */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {[...Array(5)].map((_, i) => (
            <li key={i}>
              <div className="px-4 py-3 sm:px-6">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="mb-2 flex items-center space-x-2">
                      <div className="h-3 w-3 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-3 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-3 w-2 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="flex items-center space-x-1">
                          <div className="h-3 w-3 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                          <div className="h-3 w-14 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col items-end space-y-1">
                    <div className="text-right">
                      <div className="mb-1 h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <div className="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
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
