import React from 'react'
import { Container } from '@/components/Container'
import Link from 'next/link'
import { PencilIcon } from '@heroicons/react/16/solid'
import { ArrowLeftIcon } from '@heroicons/react/20/solid'
import { formatDate } from '@/lib/formatDate'

export function SimpleLayout({
  title,
  intro,
  lastUpdated,
  gitHubPage,
  backButton,
  children,
}: {
  title: string
  intro: string
  lastUpdated?: string
  gitHubPage?: string
  backButton?: {
    href: string
    label?: string
  }
  children?: React.ReactNode
}) {
  return (
    <Container className="mt-16 sm:mt-32">
      <div className="xl:relative">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-4">
            {backButton && (
              <Link
                href={backButton.href}
                className="group flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-md ring-1 shadow-zinc-800/5 ring-zinc-900/5 transition dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20"
                aria-label={backButton.label || 'Tilbake'}
              >
                <ArrowLeftIcon className="h-4 w-4 stroke-zinc-500 transition group-hover:stroke-zinc-700 dark:stroke-zinc-500 dark:group-hover:stroke-zinc-400" />
              </Link>
            )}
            <header className="w-full">
              {lastUpdated && (
                <time
                  dateTime={lastUpdated}
                  className="flex items-center text-base text-zinc-400 dark:text-zinc-500"
                >
                  <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
                  <span className="ml-3">
                    Sist oppdatert {formatDate(lastUpdated)}
                  </span>
                </time>
              )}
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
                {intro}
              </p>
            </header>
          </div>
        </div>
        {children && <div className="mt-12 sm:mt-16">{children}</div>}

        {gitHubPage && (
          <div className="mt-12 flex items-center border-t border-gray-700 pt-6 text-sm">
            <Link
              href={`https://github.com/offentlig-paas/nye.offentlig-paas.no/edit/main/${gitHubPage}`}
              className="flex items-center transition hover:text-teal-500 dark:hover:text-teal-400"
            >
              <PencilIcon className="size-6" />{' '}
              <span className="ml-1">Rediger denne siden på GitHub</span>
            </Link>
          </div>
        )}
      </div>
    </Container>
  )
}
