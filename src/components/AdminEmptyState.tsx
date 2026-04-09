interface AdminEmptyStateProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  children?: React.ReactNode
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  children,
}: AdminEmptyStateProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white py-12 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <Icon className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-500" />
      <h3 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-white">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
