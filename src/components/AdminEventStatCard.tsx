import type { ComponentType } from 'react'

interface AdminEventStatCardProps {
  label: string
  value: string | number
  icon: ComponentType<{ className?: string }>
  color?: 'blue' | 'green' | 'orange' | 'yellow' | 'purple' | 'red' | 'gray'
  className?: string
}

const COLOR_CLASSES = {
  blue: 'text-blue-600 dark:text-blue-400',
  green: 'text-green-600 dark:text-green-400',
  orange: 'text-orange-600 dark:text-orange-400',
  yellow: 'text-yellow-600 dark:text-yellow-400',
  purple: 'text-purple-600 dark:text-purple-400',
  red: 'text-red-600 dark:text-red-400',
  gray: 'text-gray-600 dark:text-gray-400',
}

const ICON_BG_CLASSES = {
  blue: 'bg-blue-100 dark:bg-blue-900/30',
  green: 'bg-green-100 dark:bg-green-900/30',
  orange: 'bg-orange-100 dark:bg-orange-900/30',
  yellow: 'bg-yellow-100 dark:bg-yellow-900/30',
  purple: 'bg-purple-100 dark:bg-purple-900/30',
  red: 'bg-red-100 dark:bg-red-900/30',
  gray: 'bg-gray-100 dark:bg-gray-900/30',
}

export function AdminEventStatCard({
  label,
  value,
  icon: Icon,
  color = 'gray',
  className = '',
}: AdminEventStatCardProps) {
  const colorClass = COLOR_CLASSES[color]
  const iconBgClass = ICON_BG_CLASSES[color]

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      <div className={`mb-2 rounded-lg p-2 ${iconBgClass}`}>
        <Icon className={`h-5 w-5 ${colorClass}`} />
      </div>
      <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
      <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </p>
    </div>
  )
}
