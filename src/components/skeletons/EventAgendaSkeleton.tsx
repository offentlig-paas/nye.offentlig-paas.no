export function EventAgendaSkeleton() {
  return (
    <ol className="mt-6 space-y-6 text-sm leading-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <li
          key={i}
          className="relative flex space-x-6 border-t border-gray-200 py-6 first:border-t-0 dark:border-gray-700"
        >
          <div className="h-8 w-8 flex-none animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-auto space-y-3">
            <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center space-x-3">
              <div className="h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
