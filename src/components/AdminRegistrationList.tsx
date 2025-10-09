import { Avatar } from '@/components/Avatar'
import { StatusBadge } from '@/components/StatusBadge'
import { ActionsMenu } from '@/components/ActionsMenu'
import { UsersIcon, UserGroupIcon } from '@heroicons/react/20/solid'
import type { RegistrationStatus } from '@/domains/event-registration/types'

interface EventRegistration {
  _id: string
  name: string
  email: string
  organisation: string
  slackUserId?: string
  dietary?: string
  comments?: string
  attendanceType?: string
  attendingSocialEvent?: boolean
  registeredAt: string
  status: RegistrationStatus
}

interface RegistrationListProps {
  registrations: EventRegistration[]
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
      <div className="py-12 text-center">
        <UsersIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
          {searchTerm ? 'Ingen påmeldinger funnet' : 'Ingen påmeldinger'}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {searchTerm
            ? 'Prøv å justere søkekriteriene.'
            : 'Det er ingen påmeldinger til denne fagdagen ennå.'}
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="w-12 px-3 py-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={e => onSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-300">
                Navn
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-300">
                Organisasjon
              </th>
              <th className="w-20 px-3 py-2 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-300">
                Sosialt
              </th>
              <th className="w-32 px-3 py-2 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-300">
                Status
              </th>
              <th className="w-12 px-3 py-2">
                <span className="sr-only">Handlinger</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {registrations.map(registration => (
              <tr
                key={registration._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedRegistrations.includes(registration._id)}
                    onChange={e =>
                      onSelectOne(registration._id, e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                </td>
                <td className="px-3 py-2">
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
                        <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                          {registration.name}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                  {registration.organisation}
                </td>
                <td className="px-3 py-2 text-center whitespace-nowrap">
                  {registration.attendingSocialEvent ? (
                    <UserGroupIcon className="mx-auto h-4 w-4 text-orange-600 dark:text-orange-400" />
                  ) : (
                    <span className="text-xs text-gray-300 dark:text-gray-600">
                      -
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={registration.status} />
                </td>
                <td className="px-3 py-2 text-right">
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
