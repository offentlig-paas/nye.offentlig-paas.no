export function EventPhotoSkeleton({
  variant = 'compact',
}: {
  variant?: 'hero' | 'compact'
}) {
  if (variant === 'hero') {
    return (
      <div className="mx-auto mt-6 max-w-7xl lg:grid lg:grid-cols-3 lg:gap-x-8">
        <div className="row-span-2 aspect-[3/4] size-full animate-pulse rounded-lg bg-gray-200 max-lg:hidden dark:bg-gray-700" />
        <div className="col-start-2 aspect-[3/2] size-full animate-pulse rounded-lg bg-gray-200 max-lg:hidden dark:bg-gray-700" />
        <div className="col-start-2 row-start-2 aspect-[3/2] size-full animate-pulse rounded-lg bg-gray-200 max-lg:hidden dark:bg-gray-700" />
        <div className="row-span-2 aspect-[4/5] size-full animate-pulse rounded-lg bg-gray-200 sm:rounded-lg lg:aspect-[3/4] dark:bg-gray-700" />
      </div>
    )
  }

  return (
    <div className="mb-12">
      <div className="mb-6 h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
    </div>
  )
}
