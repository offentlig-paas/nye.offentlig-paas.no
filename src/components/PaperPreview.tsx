import Link from 'next/link'
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline'

type Author = {
  name: string
  affiliation?: string
}

export function PaperPreview({
  title,
  authors,
  venue,
  venueDate,
  abstract,
  href,
  label = 'Read the abstract (PDF)',
}: {
  title: string
  authors: Author[]
  venue: string
  venueDate?: string
  abstract: string
  href: string
  label?: string
}) {
  return (
    <div className="not-prose my-10 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/60">
      <div className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-700 dark:bg-zinc-800">
        <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          Research Paper
        </p>
        <h3 className="mt-1 text-lg leading-snug font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {authors.map((a, i) => (
            <span key={a.name}>
              {i > 0 && ', '}
              {a.name}
              {a.affiliation && (
                <span className="text-zinc-400 dark:text-zinc-500">
                  {' '}
                  ({a.affiliation})
                </span>
              )}
            </span>
          ))}
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {venue}
          {venueDate && (
            <>
              {' · '}
              {venueDate}
            </>
          )}
        </p>
      </div>

      <div className="px-6 py-4">
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {abstract}
        </p>
      </div>

      <div className="border-t border-zinc-200 px-6 py-3 dark:border-zinc-700">
        <Link
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 transition hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
        >
          <DocumentArrowDownIcon className="size-5" />
          {label}
        </Link>
      </div>
    </div>
  )
}
