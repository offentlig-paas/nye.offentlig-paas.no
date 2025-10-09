import type { RegistrationStatus } from '@/domains/event-registration/types'

interface StatusBadgeProps {
  status: RegistrationStatus
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusConfig = (status: RegistrationStatus) => {
    switch (status) {
      case 'confirmed':
        return {
          label: 'Bekreftet',
          classes:
            'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        }
      case 'waitlist':
        return {
          label: 'Venteliste',
          classes:
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        }
      case 'cancelled':
        return {
          label: 'Avmeldt',
          classes:
            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        }
      case 'attended':
        return {
          label: 'Deltok',
          classes:
            'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        }
      case 'no-show':
        return {
          label: 'Ikke møtt',
          classes:
            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        }
      default:
        return {
          label: status,
          classes:
            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-gray-500/10 ring-inset ${config.classes} ${className}`}
    >
      {config.label}
    </span>
  )
}
