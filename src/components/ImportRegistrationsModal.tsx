'use client'

import { useState } from 'react'
import {
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { AdminModal } from '@/components/AdminModal'
import { trpc } from '@/lib/trpc/client'
import { Badge } from '@/components/Badge'

interface ImportRegistrationsModalProps {
  isOpen: boolean
  onClose: () => void
  targetSlug: string
  onSuccess: (message: string) => void
  onError: (message: string) => void
  onImported: () => void
}

export function ImportRegistrationsModal({
  isOpen,
  onClose,
  targetSlug,
  onSuccess,
  onError,
  onImported,
}: ImportRegistrationsModalProps) {
  const [importingSlug, setImportingSlug] = useState<string | null>(null)

  const {
    data: orphanedGroups,
    isLoading,
    refetch,
  } = trpc.admin.orphanedRegistrations.list.useQuery(undefined, {
    enabled: isOpen,
  })

  const importMutation = trpc.admin.orphanedRegistrations.import.useMutation({
    onSuccess: result => {
      onSuccess(result.message)
      setImportingSlug(null)
      refetch()
      onImported()
    },
    onError: err => {
      onError(err.message)
      setImportingSlug(null)
    },
  })

  const handleImport = (fromSlug: string) => {
    setImportingSlug(fromSlug)
    importMutation.mutate({ slug: targetSlug, fromSlug })
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Importer påmeldinger"
      description="Importer foreldreløse påmeldinger fra tidligere arrangementer som ikke lenger finnes."
      icon={ArrowDownTrayIcon}
      maxWidth="xl"
    >
      {isLoading && (
        <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Laster…
        </p>
      )}

      {!isLoading && (!orphanedGroups || orphanedGroups.length === 0) && (
        <div className="flex flex-col items-center py-8 text-center">
          <ExclamationTriangleIcon className="mb-2 h-8 w-8 text-zinc-400 dark:text-zinc-500" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Ingen foreldreløse påmeldinger funnet
          </p>
        </div>
      )}

      {orphanedGroups && orphanedGroups.length > 0 && (
        <div className="space-y-3">
          {orphanedGroups.map(group => (
            <div
              key={group.eventSlug}
              className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {group.eventSlug}
                    </code>
                    <Badge color="yellow">{group.count} påmeldinger</Badge>
                  </div>
                  <div className="mt-2 space-y-1">
                    {group.registrations.slice(0, 5).map(reg => (
                      <p
                        key={reg._id}
                        className="truncate text-sm text-zinc-600 dark:text-zinc-400"
                      >
                        {reg.name}{' '}
                        <span className="text-zinc-400 dark:text-zinc-500">
                          ({reg.organisation})
                        </span>
                      </p>
                    ))}
                    {group.registrations.length > 5 && (
                      <p className="text-sm text-zinc-400 dark:text-zinc-500">
                        + {group.registrations.length - 5} til
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleImport(group.eventSlug)}
                  disabled={importingSlug !== null}
                  className="inline-flex shrink-0 items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  {importingSlug === group.eventSlug ? (
                    'Importerer…'
                  ) : (
                    <>
                      <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                      Importer hit
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
        >
          Lukk
        </button>
      </div>
    </AdminModal>
  )
}
