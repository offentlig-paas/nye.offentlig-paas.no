export function formatDateTime(d: string | Date) {
  if (typeof d === 'string') d = new Date(d)
  return d.toLocaleString('no-NB', {
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
  return d.toLocaleDateString('no-NB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
