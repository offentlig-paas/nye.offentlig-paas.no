import { Fragment, useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Menu, Transition } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  UserIcon,
  UserMinusIcon,
} from '@heroicons/react/24/outline'
import type { RegistrationStatus } from '@/domains/event-registration/types'
import { StatusBadge } from './StatusBadge'

interface StatusManagerProps {
  currentStatus: RegistrationStatus
  onStatusChange: (status: RegistrationStatus) => void
  disabled?: boolean
}

// Portal component for dropdown menu
function PortalMenu({
  children,
  buttonRef,
  isOpen,
}: {
  children: React.ReactNode
  buttonRef: React.RefObject<HTMLButtonElement>
  isOpen: boolean
}) {
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const dropdownWidth = 192 // w-48 = 192px
      const viewportWidth = window.innerWidth
      const scrollX = window.scrollX
      const scrollY = window.scrollY

      // Calculate preferred position (aligned to the right of button)
      let left = rect.right - dropdownWidth + scrollX

      // If dropdown would go off the right edge, align to left of button instead
      if (rect.right > viewportWidth - 16) {
        left = rect.left + scrollX
      }

      // If still off-screen, position from right edge with padding
      if (left + dropdownWidth > viewportWidth + scrollX - 16) {
        left = viewportWidth + scrollX - dropdownWidth - 16
      }

      // Ensure minimum distance from left edge
      left = Math.max(16, left)

      setPosition({
        top: rect.bottom + scrollY + 8, // 8px gap below button
        left: left,
      })
    }
  }, [isOpen, buttonRef])

  if (!mounted) return null

  return createPortal(
    <div
      className="fixed z-50"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {children}
    </div>,
    document.body
  )
}

const statusOptions: {
  value: RegistrationStatus
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}[] = [
  {
    value: 'confirmed',
    label: 'Bekreftet',
    icon: CheckCircleIcon,
    color: 'text-green-600 dark:text-green-400',
  },
  {
    value: 'waitlist',
    label: 'Venteliste',
    icon: ClockIcon,
    color: 'text-yellow-600 dark:text-yellow-400',
  },
  {
    value: 'attended',
    label: 'Deltok',
    icon: UserIcon,
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    value: 'no-show',
    label: 'Ikke møtt',
    icon: UserMinusIcon,
    color: 'text-gray-600 dark:text-gray-400',
  },
  {
    value: 'cancelled',
    label: 'Avbrutt',
    icon: XCircleIcon,
    color: 'text-red-600 dark:text-red-400',
  },
]

export function StatusManager({
  currentStatus,
  onStatusChange,
  disabled = false,
}: StatusManagerProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Status badge with hover actions
  return (
    <div className="flex items-center gap-2">
      <StatusBadge status={currentStatus} />
      <Menu as="div" className="relative inline-block text-left">
        {({ open }) => (
          <>
            <div>
              <Menu.Button
                ref={buttonRef}
                disabled={disabled}
                className="inline-flex items-center p-1 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:text-gray-300"
              >
                <span className="sr-only">Endre status</span>
                <EllipsisVerticalIcon className="h-4 w-4" aria-hidden="true" />
              </Menu.Button>
            </div>

            <PortalMenu buttonRef={buttonRef} isOpen={open}>
              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="ring-opacity-5 w-48 rounded-md bg-white shadow-lg ring-1 ring-black focus:outline-none dark:bg-gray-700">
                  <div className="py-1">
                    {statusOptions.map(option => (
                      <Menu.Item key={option.value}>
                        {({ active }) => (
                          <button
                            type="button"
                            onClick={() => onStatusChange(option.value)}
                            className={`${
                              active
                                ? 'bg-gray-100 text-gray-900 dark:bg-gray-600 dark:text-white'
                                : 'text-gray-700 dark:text-gray-200'
                            } group flex w-full items-center px-4 py-2 text-sm ${
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
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </PortalMenu>
          </>
        )}
      </Menu>
    </div>
  )
}
