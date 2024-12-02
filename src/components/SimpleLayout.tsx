import React from 'react';
import { Container } from '@/components/Container'
import Link from 'next/link'
import { PencilIcon } from '@heroicons/react/16/solid'

export function SimpleLayout({
  title,
  intro,
  gitHubPage,
  children,
}: {
  title: string
  intro: string
  gitHubPage?: string
  children?: React.ReactNode
}) {
  return (
    <Container className="mt-16 sm:mt-32">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
          {title}
        </h1>
        <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
          {intro}
        </p>
      </header>
      {children && <div className="mt-16 sm:mt-20">{children}</div>}

      {gitHubPage && (
        <div className="mt-12 pt-6 text-sm border-t border-gray-700 flex items-center">
          <Link
            href={`https://github.com/offentlig-paas/nye.offentlig-paas.no/edit/main/${gitHubPage}`}
            className="transition hover:text-teal-500 dark:hover:text-teal-400 flex items-center"
          >
            <PencilIcon className='size-6' /> <span className="ml-1">Rediger denne siden på GitHub</span>
          </Link>
        </div>
      )}
    </Container>
  )
}
