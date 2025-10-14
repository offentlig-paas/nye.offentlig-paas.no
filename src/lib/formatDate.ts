export const NORWEGIAN_MONTHS: Record<number, string> = {
  1: 'januar',
  2: 'februar',
  3: 'mars',
  4: 'april',
  5: 'mai',
  6: 'juni',
  7: 'juli',
  8: 'august',
  9: 'september',
  10: 'oktober',
  11: 'november',
  12: 'desember',
}

export function formatDateTime(d: string | Date) {
  if (typeof d === 'string') d = new Date(d)
  return d.toLocaleString('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZone: 'Europe/Oslo',
  })
}

export function formatDate(d: string | Date) {
  if (typeof d === 'string') d = new Date(d)
  return d.toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function formatDateLong(d: string | Date) {
  if (typeof d === 'string') d = new Date(d)
  return d.toLocaleDateString('nb-NO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Oslo',
  })
}

export function formatDateShort(d: string | Date) {
  if (typeof d === 'string') d = new Date(d)
  return d.toLocaleDateString('nb-NO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Oslo',
  })
}

export function formatTime(d: string | Date) {
  if (typeof d === 'string') d = new Date(d)
  return d.toLocaleTimeString('nb-NO', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Oslo',
  })
}

export function formatTimeRange(start: string | Date, end: string | Date) {
  return `${formatTime(start)} - ${formatTime(end)}`
}
