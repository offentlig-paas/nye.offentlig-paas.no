import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import type { RegistrationStatus } from '@/domains/event-registration/types'

interface AdminRegistrationFiltersProps {
  searchTerm: string
  statusFilter: RegistrationStatus | 'all'
  attendanceFilter: string
  socialEventFilter: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: RegistrationStatus | 'all') => void
  onAttendanceChange: (value: string) => void
  onSocialEventChange: (value: string) => void
}

export function AdminRegistrationFilters({
  searchTerm,
  statusFilter,
  attendanceFilter,
  socialEventFilter,
  onSearchChange,
  onStatusChange,
  onAttendanceChange,
  onSocialEventChange,
}: AdminRegistrationFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <div className="relative flex-1 sm:min-w-[240px] lg:max-w-md">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon
            className="h-5 w-5 text-gray-400 dark:text-gray-500"
            aria-hidden="true"
          />
        </div>
        <input
          type="text"
          placeholder="Søk i påmeldinger..."
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-3 pl-10 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
        />
      </div>

      <select
        value={statusFilter}
        onChange={e =>
          onStatusChange(e.target.value as RegistrationStatus | 'all')
        }
        className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
      >
        <option value="all">Alle statuser</option>
        <option value="confirmed">Bekreftet</option>
        <option value="waitlist">Venteliste</option>
        <option value="attended">Deltok</option>
        <option value="no-show">Ikke møtt</option>
        <option value="cancelled">Avmeldt</option>
      </select>

      <select
        value={attendanceFilter}
        onChange={e => onAttendanceChange(e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
      >
        <option value="all">Alle deltakelser</option>
        <option value="physical">Fysisk</option>
        <option value="digital">Digitalt</option>
      </select>

      <select
        value={socialEventFilter}
        onChange={e => onSocialEventChange(e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
      >
        <option value="all">Sosialt</option>
        <option value="yes">Ja</option>
        <option value="no">Nei</option>
      </select>
    </div>
  )
}
