export default function Loading() {
  return (
    <div className="space-y-4">
      {/* Navigation tabs skeleton */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-2 border-b-2 border-transparent px-1 py-4"
            >
              <div className="h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          ))}
        </nav>
      </div>

      {/* Content skeleton */}
      <div className="space-y-4">
        {/* Stats/Checklist row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
          </div>
          <div className="h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="h-96 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-96 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-96 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    </div>
  )
}
