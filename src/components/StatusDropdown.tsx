import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid'
import type { RegistrationStatus } from '@/domains/event-registration/types'
import { StatusBadge } from './StatusBadge'

interface StatusDropdownProps {
  currentStatus: RegistrationStatus
  onStatusChange: (status: RegistrationStatus) => void
  disabled?: boolean
  className?: string
}

const statusOptions: { value: RegistrationStatus; label: string }[] = [
  { value: 'confirmed', label: 'Bekreftet' },
  { value: 'waitlist', label: 'Venteliste' },
  { value: 'attended', label: 'Deltok' },
  { value: 'no-show', label: 'Ikke møtt' },
  { value: 'cancelled', label: 'Avbrutt' },
]

export function StatusDropdown({
  currentStatus,
  onStatusChange,
  disabled = false,
  className = '',
}: StatusDropdownProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)

  const handleStatusChange = (status: RegistrationStatus) => {
    setSelectedStatus(status)
    onStatusChange(status)
  }

  return (
    <Listbox
      value={selectedStatus}
      onChange={handleStatusChange}
      disabled={disabled}
    >
      <div className={`relative ${className}`}>
        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pr-10 pl-3 text-left shadow-sm ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm dark:bg-gray-700 dark:ring-gray-600">
          <span className="block truncate">
            <StatusBadge status={selectedStatus} />
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="ring-opacity-5 absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black focus:outline-none sm:text-sm dark:bg-gray-700">
            {statusOptions.map(option => (
              <Listbox.Option
                key={option.value}
                className={({ active }) =>
                  `relative cursor-default py-2 pr-4 pl-10 select-none ${
                    active
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-100'
                      : 'text-gray-900 dark:text-gray-100'
                  }`
                }
                value={option.value}
              >
                {({ selected }) => (
                  <>
                    <span className="block truncate">
                      <StatusBadge status={option.value} />
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}
