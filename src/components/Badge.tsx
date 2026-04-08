const COLOR_CLASSES: Record<string, string> = {
  green:
    'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-500/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-500/20',
  yellow:
    'bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-900/30 dark:text-yellow-400 dark:ring-yellow-500/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-500/20',
  zinc: 'bg-zinc-100 text-zinc-600 ring-zinc-500/10 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-500/20',
  teal: 'bg-teal-50 text-teal-700 ring-teal-600/20 dark:bg-teal-900/30 dark:text-teal-400 dark:ring-teal-500/20',
  purple:
    'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-900/30 dark:text-purple-400 dark:ring-purple-500/20',
  orange:
    'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-900/30 dark:text-orange-400 dark:ring-orange-500/20',
}

export type BadgeColor = keyof typeof COLOR_CLASSES

interface BadgeProps {
  children: React.ReactNode
  color?: BadgeColor
  className?: string
}

export function Badge({
  children,
  color = 'zinc',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${COLOR_CLASSES[color]} ${className}`}
    >
      {children}
    </span>
  )
}
