import clsx from 'clsx'

export function InfoCard({
  title,
  number,
  label,
  className,
}: {
  title: string
  number: number
  label?: string
  className?: string
}) {
  return (
    <div
      className={clsx(
        'rounded-2xl bg-zinc-100 px-4 py-6 sm:px-6 lg:px-8 dark:bg-zinc-800',
        className,
      )}
    >
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
        {title}
      </p>
      <p className="mt-2 flex items-baseline gap-x-2">
        <span className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {number}
        </span>
        {label && (
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {label}
          </span>
        )}
      </p>
    </div>
  )
}
