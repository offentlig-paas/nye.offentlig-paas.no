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
          className="block w-full rounded-md bg-white py-2.5 pr-3 pl-10 text-base text-zinc-900 outline-1 -outline-offset-1 outline-zinc-300 placeholder:text-zinc-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-zinc-500"
        />
      </div>

      <select
        value={statusFilter}
        onChange={e =>
          onStatusChange(e.target.value as RegistrationStatus | 'all')
        }
        className="rounded-md bg-white px-3 py-2.5 text-base text-zinc-900 outline-1 -outline-offset-1 outline-zinc-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10"
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
        className="rounded-md bg-white px-3 py-2.5 text-base text-zinc-900 outline-1 -outline-offset-1 outline-zinc-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10"
      >
        <option value="all">Alle deltakelser</option>
        <option value="physical">Fysisk</option>
        <option value="digital">Digitalt</option>
      </select>

      <select
        value={socialEventFilter}
        onChange={e => onSocialEventChange(e.target.value)}
        className="rounded-md bg-white px-3 py-2.5 text-base text-zinc-900 outline-1 -outline-offset-1 outline-zinc-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10"
      >
        <option value="all">Sosialt</option>
        <option value="yes">Ja</option>
        <option value="no">Nei</option>
      </select>
    </div>
  )
}
