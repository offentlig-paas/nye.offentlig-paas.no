export function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  subtext?: string
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl leading-tight font-bold text-zinc-900 dark:text-zinc-100">
            {value}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
          {subtext && (
            <p className="text-xs text-teal-600 dark:text-teal-400">
              {subtext}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
