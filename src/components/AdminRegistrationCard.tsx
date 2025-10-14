import { Avatar } from '@/components/Avatar'
import { ActionsMenu } from '@/components/ActionsMenu'
import { StatusBadge } from '@/components/StatusBadge'
import { UserGroupIcon } from '@heroicons/react/20/solid'
import type { RegistrationStatus } from '@/domains/event-registration/types'

const AttendanceTypeDisplay = {
  physical: 'Fysisk',
  digital: 'Digitalt',
  hybrid: 'Hybrid',
}

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

interface RegistrationCardProps {
  registration: EventRegistration
  isSelected: boolean
  onSelect: (id: string, checked: boolean) => void
  onStatusChange: (id: string, newStatus: RegistrationStatus) => void
  onDelete: (id: string) => void
  isUpdating: boolean
  isDeleting: boolean
}

export function AdminRegistrationCard({
  registration,
  isSelected,
  onSelect,
  onStatusChange,
  onDelete,
  isUpdating,
  isDeleting,
}: RegistrationCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between">
        <div className="flex flex-1 items-start space-x-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={e => onSelect(registration._id, e.target.checked)}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex items-center space-x-3">
              <Avatar
                name={registration.name}
                slackUserId={registration.slackUserId}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {registration.slackUserId ? (
                    <a
                      href={`https://slack.com/app_redirect?channel=${registration.slackUserId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {registration.name}
                    </a>
                  ) : (
                    registration.name
                  )}
                </div>
                <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {registration.email}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Organisasjon:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {registration.organisation}
                </span>
              </div>

              {registration.attendanceType && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Deltakelse:
                  </span>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      registration.attendanceType === 'physical'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                    }`}
                  >
                    {AttendanceTypeDisplay[
                      registration.attendanceType as keyof typeof AttendanceTypeDisplay
                    ] || registration.attendanceType}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Sosialt:
                </span>
                <span>
                  {registration.attendingSocialEvent ? (
                    <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900/50 dark:text-orange-300">
                      <UserGroupIcon className="mr-1 h-3 w-3" />
                      Ja
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      -
                    </span>
                  )}
                </span>
              </div>

              {registration.comments && (
                <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Kommentar:
                  </span>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    {registration.comments}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <StatusBadge status={registration.status} />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(registration.registeredAt).toLocaleDateString('nb-NO')}
          </span>
        </div>
        <ActionsMenu
          currentStatus={registration.status}
          onStatusChange={(newStatus: RegistrationStatus) =>
            onStatusChange(registration._id, newStatus)
          }
          onDelete={() => onDelete(registration._id)}
          disabled={isUpdating || isDeleting}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  )
}
