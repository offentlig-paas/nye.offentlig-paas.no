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
    <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1 sm:min-w-[240px] lg:max-w-md">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <MagnifyingGlassIcon
            className="h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500"
            aria-hidden="true"
          />
        </div>
        <input
          type="text"
          placeholder="Søk på navn, e-post eller organisasjon..."
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className="block w-full rounded-xl bg-white py-2 pr-3.5 pl-10 text-sm text-zinc-900 shadow-2xs ring-1 ring-zinc-200 ring-inset placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-500 focus:ring-inset dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 dark:placeholder:text-zinc-500"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={statusFilter}
          onChange={e =>
            onStatusChange(e.target.value as RegistrationStatus | 'all')
          }
          className="rounded-xl bg-white px-3 py-2 text-xs font-medium text-zinc-700 shadow-2xs ring-1 ring-zinc-200 ring-inset focus:ring-2 focus:ring-blue-500 focus:ring-inset dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700"
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
          className="rounded-xl bg-white px-3 py-2 text-xs font-medium text-zinc-700 shadow-2xs ring-1 ring-zinc-200 ring-inset focus:ring-2 focus:ring-blue-500 focus:ring-inset dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700"
        >
          <option value="all">Alle deltakelser</option>
          <option value="physical">Fysisk</option>
          <option value="digital">Digitalt</option>
        </select>

        <select
          value={socialEventFilter}
          onChange={e => onSocialEventChange(e.target.value)}
          className="rounded-xl bg-white px-3 py-2 text-xs font-medium text-zinc-700 shadow-2xs ring-1 ring-zinc-200 ring-inset focus:ring-2 focus:ring-blue-500 focus:ring-inset dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700"
        >
          <option value="all">Sosialt: Alle</option>
          <option value="yes">Sosialt: Ja</option>
          <option value="no">Sosialt: Nei</option>
        </select>
      </div>
    </div>
  )
}
