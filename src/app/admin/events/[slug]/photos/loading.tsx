const shimmer = 'animate-pulse rounded bg-gray-200 dark:bg-gray-700' as const

export default function Loading() {
  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        className={`h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 ${shimmer}`}
      />

      {/* Photo grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className={`aspect-4/3 rounded-lg ${shimmer}`} />
            <div className={`h-3 w-20 ${shimmer}`} />
          </div>
        ))}
      </div>
    </div>
  )
}
