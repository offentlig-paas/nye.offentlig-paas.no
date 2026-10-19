import type { BadgeColor } from '@/components/Badge'

export const surveyStatusLabels: Record<
  string,
  { label: string; color: BadgeColor }
> = {
  draft: { label: 'Utkast', color: 'zinc' },
  pilot: { label: 'Pilot', color: 'yellow' },
  open: { label: 'Åpen', color: 'green' },
  closed: { label: 'Stengt', color: 'red' },
}
