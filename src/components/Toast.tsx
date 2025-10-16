'use client'

import { useEffect } from 'react'
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Transition } from '@headlessui/react'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  title: string
  message?: string
  duration?: number
}

interface ToastProps {
  toast: Toast
  onDismiss: (id: string) => void
}

const icons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
}

const styles = {
  success: {
    container:
      'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700',
    icon: 'text-green-500 dark:text-green-400',
    title: 'text-green-900 dark:text-green-100',
    message: 'text-green-700 dark:text-green-200',
    closeButton:
      'text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300',
  },
  error: {
    container: 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700',
    icon: 'text-red-500 dark:text-red-400',
    title: 'text-red-900 dark:text-red-100',
    message: 'text-red-700 dark:text-red-200',
    closeButton:
      'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300',
  },
  info: {
    container:
      'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700',
    icon: 'text-blue-500 dark:text-blue-400',
    title: 'text-blue-900 dark:text-blue-100',
    message: 'text-blue-700 dark:text-blue-200',
    closeButton:
      'text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300',
  },
}

function ToastComponent({ toast, onDismiss }: ToastProps) {
  const Icon = icons[toast.type]
  const style = styles[toast.type]

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id)
    }, toast.duration || 5000)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onDismiss])

  return (
    <div
      className={`pointer-events-auto w-full max-w-96 min-w-80 rounded-lg border shadow-xl ring-1 ring-black/5 backdrop-blur-sm dark:ring-white/10 ${style.container}`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${style.icon}`} aria-hidden="true" />
          </div>
          <div className="ml-3 flex-1 pt-0.5">
            <p className={`text-sm leading-6 font-medium ${style.title}`}>
              {toast.title}
            </p>
            {toast.message && (
              <p className={`mt-1 text-sm leading-5 ${style.message}`}>
                {toast.message}
              </p>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className={`inline-flex rounded-md p-1.5 transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none ${style.closeButton}`}
              onClick={() => onDismiss(toast.id)}
            >
              <span className="sr-only">Lukk</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed right-0 bottom-0 z-50 p-6"
    >
      <div className="flex w-auto flex-col items-end space-y-4">
        {toasts.map(toast => (
          <Transition
            key={toast.id}
            show={true}
            as="div"
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 translate-x-2"
            enterTo="translate-y-0 opacity-100 translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ToastComponent toast={toast} onDismiss={onDismiss} />
          </Transition>
        ))}
      </div>
    </div>
  )
}
