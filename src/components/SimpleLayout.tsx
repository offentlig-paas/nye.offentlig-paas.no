import React from 'react'
import { Container } from '@/components/Container'
import Link from 'next/link'
import { PencilIcon } from '@heroicons/react/16/solid'
import { formatDate } from '@/lib/formatDate'

export function SimpleLayout({
  title,
  intro,
  lastUpdated,
  gitHubPage,
  children,
}: {
  title: string
  intro: string
  lastUpdated?: string
  gitHubPage?: string
  children?: React.ReactNode
}) {
  return (
    <Container className="mt-16 sm:mt-32">
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
    </Container>
  )
}
