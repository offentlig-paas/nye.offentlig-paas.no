import { Badge } from '@/components/Badge'
import type { BadgeColor } from '@/components/Badge'
import type { RegistrationStatus } from '@/domains/event-registration/types'

const STATUS_CONFIG: Record<string, { label: string; color: BadgeColor }> = {
  confirmed: { label: 'Bekreftet', color: 'green' },
  waitlist: { label: 'Venteliste', color: 'yellow' },
  cancelled: { label: 'Avmeldt', color: 'red' },
  attended: { label: 'Deltok', color: 'blue' },
  'no-show': { label: 'Ikke møtt', color: 'zinc' },
}

interface StatusBadgeProps {
  status: RegistrationStatus
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    color: 'zinc' as BadgeColor,
  }

  return (
    <Badge color={config.color} className={className}>
      {config.label}
    </Badge>
  )
}
