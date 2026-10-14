import React from 'react'
import { Container } from '@/components/Container'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/20/solid'

export function AdminLayout({
  title,
  intro,
  backButton,
  badge,
  actions,
  children,
}: {
  title: string
  intro?: string
  backButton?: {
    href: string
    label?: string
  }
  badge?: React.ReactNode
  actions?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <Container className="mt-6 sm:mt-10">
      <div className="xl:relative">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3.5">
              {backButton && (
                <Link
                  href={backButton.href}
                  className="group mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-xs ring-1 ring-zinc-900/10 transition hover:bg-zinc-50 hover:ring-zinc-900/20 dark:border dark:border-zinc-700/60 dark:bg-zinc-800 dark:ring-0 dark:hover:border-zinc-600"
                  aria-label={backButton.label || 'Tilbake'}
                >
                  <ArrowLeftIcon className="h-4 w-4 stroke-zinc-500 transition group-hover:stroke-zinc-700 dark:stroke-zinc-400 dark:group-hover:stroke-zinc-200" />
                </Link>
              )}
              <header className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
                    {title}
                  </h1>
                  {badge}
                </div>
                {intro && (
                  <p className="mt-1.5 text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
                    {intro}
                  </p>
                )}
              </header>
            </div>
            {actions && (
              <div className="flex shrink-0 items-center gap-2">{actions}</div>
            )}
          </div>
        </div>
        {children && <div className="mt-6 sm:mt-8">{children}</div>}
      </div>
    </Container>
  )
}
