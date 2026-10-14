import { AdminCard } from '@/components/AdminCard'

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
    <AdminCard padding="5">
      <div className="flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
            {value}
          </p>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {label}
          </p>
          {subtext && (
            <p className="mt-0.5 truncate text-xs text-teal-600 dark:text-teal-400">
              {subtext}
            </p>
          )}
        </div>
      </div>
    </AdminCard>
  )
}
