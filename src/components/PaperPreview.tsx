import Link from 'next/link'
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { researchProjects } from '@/data/research'

export function PaperPreview({
  projectSlug,
  paperIndex = 0,
}: {
  projectSlug: string
  paperIndex?: number
}) {
  const project = researchProjects.find(p => p.slug === projectSlug)
  const paper = project?.papers?.[paperIndex]
  if (!paper) return null

  const authors = paper.authors ?? []
  const label = paper.label ?? 'Les sammendraget (PDF)'

  return (
    <div className="not-prose my-10 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/60">
      <div className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-700 dark:bg-zinc-800">
        <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          Forskningsartikkel
        </p>
        <h3 className="mt-1 text-lg leading-snug font-semibold text-zinc-900 dark:text-zinc-100">
          {paper.title}
        </h3>
        {authors.length > 0 && (
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
        )}
        {paper.venue && (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {paper.venue}
            {paper.venueDate && (
              <>
                {' · '}
                {paper.venueDate}
              </>
            )}
          </p>
        )}
      </div>

      {paper.abstract && (
        <div className="px-6 py-4">
          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {paper.abstract}
          </p>
        </div>
      )}

      {paper.url && (
        <div className="border-t border-zinc-200 px-6 py-3 dark:border-zinc-700">
          <Link
            href={paper.url}
            target={paper.url.startsWith('http') ? '_blank' : undefined}
            rel={
              paper.url.startsWith('http') ? 'noopener noreferrer' : undefined
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 transition hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
          >
            <DocumentArrowDownIcon className="size-5" />
            {label}
          </Link>
        </div>
      )}
    </div>
  )
}
