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

export function AdminEventStatCard({
  label,
  value,
  icon: Icon,
  color = 'gray',
  className = '',
}: AdminEventStatCardProps) {
  const colorClass = COLOR_CLASSES[color]

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {label}
          </p>
          <p className={`mt-1 text-2xl font-bold ${colorClass}`}>{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${colorClass}`} />
      </div>
    </div>
  )
}
