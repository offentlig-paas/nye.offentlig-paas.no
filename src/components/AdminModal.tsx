'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

const MAX_WIDTH_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
} as const

interface AdminModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  maxWidth?: keyof typeof MAX_WIDTH_CLASSES
  closeDisabled?: boolean
}

export function AdminModal({
  isOpen,
  onClose,
  title,
  description,
  icon: Icon,
  children,
  maxWidth = 'lg',
  closeDisabled = false,
}: AdminModalProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full ${MAX_WIDTH_CLASSES[maxWidth]} transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-zinc-800`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {Icon && (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-lg leading-6 font-semibold text-zinc-900 dark:text-white"
                      >
                        {title}
                      </Dialog.Title>
                      {description && (
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-md text-zinc-400 hover:text-zinc-500 focus:outline-none dark:hover:text-zinc-300"
                    onClick={onClose}
                    disabled={closeDisabled}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-4">{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
