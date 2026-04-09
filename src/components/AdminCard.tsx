const PADDING_CLASSES = {
  none: '',
  '4': 'p-4',
  '5': 'p-5',
  '6': 'p-6',
} as const

interface AdminCardProps {
  children: React.ReactNode
  padding?: keyof typeof PADDING_CLASSES
  className?: string
}

export function AdminCard({
  children,
  padding = '4',
  className = '',
}: AdminCardProps) {
  return (
    <div
      className={`rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800 ${PADDING_CLASSES[padding]} ${className}`}
    >
      {children}
    </div>
  )
}
