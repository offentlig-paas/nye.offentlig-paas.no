import { Avatar } from '@/components/Avatar'
import { StatusBadge } from '@/components/StatusBadge'
import { Badge } from '@/components/Badge'
import { ActionsMenu } from '@/components/ActionsMenu'
import { AdminEmptyState } from '@/components/AdminEmptyState'
import { UsersIcon, UserGroupIcon } from '@heroicons/react/20/solid'
import type {
  EventRegistration,
  RegistrationStatus,
} from '@/domains/event-registration/types'

type AdminRegistration = Omit<EventRegistration, 'registeredAt'> & {
  registeredAt: string
  _id: string
}

interface RegistrationListProps {
  registrations: AdminRegistration[]
  selectedRegistrations: string[]
  onSelectAll: (checked: boolean) => void
  onSelectOne: (id: string, checked: boolean) => void
  onStatusChange: (id: string, newStatus: RegistrationStatus) => void
  onDelete: (id: string) => void
  isUpdatingStatus: string | null
  isDeleting: string | null
  searchTerm: string
}

export function AdminRegistrationList({
  registrations,
  selectedRegistrations,
  onSelectAll,
  onSelectOne,
  onStatusChange,
  onDelete,
  isUpdatingStatus,
  isDeleting,
  searchTerm,
}: RegistrationListProps) {
  const allSelected =
    registrations.length > 0 &&
    selectedRegistrations.length === registrations.length

  if (registrations.length === 0) {
    return (
      <AdminEmptyState
        icon={UsersIcon}
        title={searchTerm ? 'Ingen påmeldinger funnet' : 'Ingen påmeldinger'}
        description={
          searchTerm
            ? 'Prøv å justere søkekriteriene.'
            : 'Det er ingen påmeldinger til denne fagdagen ennå.'
        }
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={e => onSelectAll(e.target.checked)}
                  className="size-4 rounded-sm border border-zinc-300 bg-white checked:border-blue-600 checked:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-white/10 dark:bg-white/5 dark:checked:border-blue-500 dark:checked:bg-blue-500 forced-colors:appearance-auto"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                Navn
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                Organisasjon
              </th>
              <th className="w-24 px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                Deltakelse
              </th>
              <th className="w-20 px-4 py-3 text-center text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                Sosialt
              </th>
              <th className="w-32 px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                Status
              </th>
              <th className="w-12 px-4 py-3">
                <span className="sr-only">Handlinger</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-700 dark:bg-zinc-800">
            {registrations.map(registration => (
              <tr
                key={registration._id}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedRegistrations.includes(registration._id)}
                    onChange={e =>
                      onSelectOne(registration._id, e.target.checked)
                    }
                    className="size-4 rounded-sm border border-zinc-300 bg-white checked:border-blue-600 checked:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-white/10 dark:bg-white/5 dark:checked:border-blue-500 dark:checked:bg-blue-500 forced-colors:appearance-auto"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Avatar
                      name={registration.name}
                      slackUserId={registration.slackUserId}
                      size="sm"
                      className="flex-shrink-0"
                    />
                    <div className="min-w-0">
                      {registration.slackUserId ? (
                        <a
                          href={`slack://user?team=${process.env.NEXT_PUBLIC_SLACK_TEAM_ID}&id=${registration.slackUserId}`}
                          className="truncate text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {registration.name}
                        </a>
                      ) : (
                        <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                          {registration.name}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                  {registration.organisation}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {registration.attendanceType === 'physical' ? (
                    <Badge color="green">Fysisk</Badge>
                  ) : registration.attendanceType === 'digital' ? (
                    <Badge color="blue">Digitalt</Badge>
                  ) : (
                    <span className="text-xs text-zinc-300 dark:text-zinc-600">
                      -
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  {registration.attendingSocialEvent ? (
                    <UserGroupIcon className="mx-auto h-4 w-4 text-orange-600 dark:text-orange-400" />
                  ) : (
                    <span className="text-xs text-zinc-300 dark:text-zinc-600">
                      -
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={registration.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <ActionsMenu
                    currentStatus={registration.status}
                    onStatusChange={(status: RegistrationStatus) =>
                      onStatusChange(registration._id, status)
                    }
                    onDelete={() => onDelete(registration._id)}
                    disabled={isUpdatingStatus === registration._id}
                    isDeleting={isDeleting === registration._id}
                    isUpdating={isUpdatingStatus === registration._id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
