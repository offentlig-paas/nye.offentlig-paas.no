import { formatDateTime } from '@/lib/formatDate'

interface RegistrationForExport {
  name: string
  email: string
  organisation: string
  attendanceType?: string
  dietary?: string
  comments?: string
  registeredAt: string
  status: string
}

export function generateRegistrationsCSV(
  registrations: RegistrationForExport[]
): string {
  const headers = [
    'Navn',
    'E-post',
    'Organisasjon',
    'Deltakelse',
    'Allergier/kostholdsbehov',
    'Kommentarer',
    'Påmeldt',
    'Status',
  ]

  const csvContent = [
    headers.join(','),
    ...registrations.map(reg =>
      [
        `"${reg.name}"`,
        `"${reg.email}"`,
        `"${reg.organisation}"`,
        `"${reg.attendanceType || ''}"`,
        `"${reg.dietary || ''}"`,
        `"${reg.comments || ''}"`,
        `"${formatDateTime(reg.registeredAt)}"`,
        `"${reg.status}"`,
      ].join(',')
    ),
  ].join('\n')

  return csvContent
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
