import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { EllipsisVerticalIcon, TrashIcon } from '@heroicons/react/20/solid'
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  UserIcon,
  UserMinusIcon,
} from '@heroicons/react/24/outline'
import type { RegistrationStatus } from '@/domains/event-registration/types'

interface ActionsMenuProps {
  currentStatus: RegistrationStatus
  onStatusChange: (status: RegistrationStatus) => void
  onDelete: () => void
  disabled?: boolean
  isDeleting?: boolean
  isUpdating?: boolean
}

const statusOptions: {
  value: RegistrationStatus
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}[] = [
  {
    value: 'confirmed',
    label: 'Bekreft påmelding',
    icon: CheckCircleIcon,
    color: 'text-green-600 dark:text-green-400',
  },
  {
    value: 'waitlist',
    label: 'Sett på venteliste',
    icon: ClockIcon,
    color: 'text-yellow-600 dark:text-yellow-400',
  },
  {
    value: 'attended',
    label: 'Merk som deltok',
    icon: UserIcon,
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    value: 'no-show',
    label: 'Merk som ikke møtt',
    icon: UserMinusIcon,
    color: 'text-gray-600 dark:text-gray-400',
  },
  {
    value: 'cancelled',
    label: 'Avbryt påmelding',
    icon: XCircleIcon,
    color: 'text-red-600 dark:text-red-400',
  },
]

export function ActionsMenu({
  currentStatus,
  onStatusChange,
  onDelete,
  disabled = false,
  isDeleting = false,
  isUpdating = false,
}: ActionsMenuProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton
        disabled={disabled || isDeleting || isUpdating}
        className="inline-flex items-center rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700 dark:hover:text-gray-300"
      >
        <span className="sr-only">Åpne handlingsmeny</span>
        {isDeleting || isUpdating ? (
          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-600 dark:border-gray-400"></div>
        ) : (
          <EllipsisVerticalIcon className="h-4 w-4" aria-hidden="true" />
        )}
      </MenuButton>

      <MenuItems
        transition
        className="ring-opacity-5 absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black transition focus:outline-none data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:bg-gray-700"
      >
        <div className="py-1">
          {/* Status change options */}
          <div className="border-b border-gray-200 px-3 py-2 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:border-gray-600 dark:text-gray-400">
            Endre status
          </div>
          {statusOptions.map(option => (
            <MenuItem key={option.value}>
              <button
                type="button"
                onClick={() => onStatusChange(option.value)}
                disabled={currentStatus === option.value || isUpdating}
                className={`group flex w-full items-center px-4 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 data-focus:bg-gray-100 data-focus:text-gray-900 dark:text-gray-200 dark:data-focus:bg-gray-600 dark:data-focus:text-white ${
                  currentStatus === option.value
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : ''
                }`}
              >
                <option.icon
                  className={`mr-3 h-4 w-4 ${option.color}`}
                  aria-hidden="true"
                />
                {option.label}
                {currentStatus === option.value && (
                  <CheckCircleIcon
                    className="ml-auto h-4 w-4 text-blue-600 dark:text-blue-400"
                    aria-hidden="true"
                  />
                )}
              </button>
            </MenuItem>
          ))}

          {/* Separator */}
          <div className="my-1 border-t border-gray-200 dark:border-gray-600" />

          {/* Destructive actions */}
          <MenuItem>
            <button
              type="button"
              onClick={onDelete}
              className="group flex w-full items-center px-4 py-2 text-sm text-red-600 data-focus:bg-red-50 data-focus:text-red-900 dark:text-red-400 dark:data-focus:bg-red-900/20 dark:data-focus:text-red-300"
            >
              <TrashIcon className="mr-3 h-4 w-4" aria-hidden="true" />
              Slett påmelding
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  )
}
