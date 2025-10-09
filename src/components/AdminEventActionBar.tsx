import { BellIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import type { RegistrationStatus } from '@/domains/event-registration/types'

interface AdminEventActionBarProps {
  mode: 'bulk' | 'pre-event' | 'post-event'
  selectedCount?: number
  activeRegistrations?: number
  onSendReminder?: () => void
  onExport: () => void
  onBulkStatusUpdate?: (status: RegistrationStatus) => void
}

export function AdminEventActionBar({
  mode,
  selectedCount = 0,
  activeRegistrations = 0,
  onSendReminder,
  onExport,
  onBulkStatusUpdate,
}: AdminEventActionBarProps) {
  if (mode === 'bulk') {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {selectedCount} påmeldinger valgt
          </span>
          <button
            onClick={() => onBulkStatusUpdate?.('confirmed')}
            className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
          >
            Bekreft
          </button>
          <button
            onClick={() => onBulkStatusUpdate?.('attended')}
            className="inline-flex items-center rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition-colors duration-150 hover:bg-blue-50 dark:border-blue-700 dark:bg-gray-800 dark:text-blue-300 dark:hover:bg-gray-700"
          >
            Merk som deltok
          </button>
          <button
            onClick={() => onBulkStatusUpdate?.('no-show')}
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Ikke møtt
          </button>
          <button
            onClick={() => onBulkStatusUpdate?.('waitlist')}
            className="inline-flex items-center rounded-lg border border-yellow-300 bg-white px-4 py-2 text-sm font-medium text-yellow-700 transition-colors duration-150 hover:bg-yellow-50 dark:border-yellow-700 dark:bg-gray-800 dark:text-yellow-300 dark:hover:bg-gray-700"
          >
            Venteliste
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'pre-event') {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onSendReminder}
            disabled={activeRegistrations === 0}
            className="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-800"
          >
            <BellIcon className="mr-2 h-4 w-4" />
            Send påminnelse
          </button>
          <button
            onClick={onExport}
            className="inline-flex items-center rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition-colors duration-150 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-blue-700 dark:bg-gray-800 dark:text-blue-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800"
          >
            <DocumentArrowDownIcon className="mr-2 h-4 w-4" />
            Eksporter liste
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
      <h3 className="mb-3 text-sm font-semibold text-green-900 dark:text-green-100">
        Etter fagdagen
      </h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onExport}
          className="inline-flex items-center rounded-lg border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-800"
        >
          <DocumentArrowDownIcon className="mr-2 h-4 w-4" />
          Eksporter rapport
        </button>
      </div>
    </div>
  )
}
