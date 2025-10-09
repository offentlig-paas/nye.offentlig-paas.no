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
