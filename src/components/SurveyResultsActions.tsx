import Link from 'next/link'
import { PrintButton } from '@/components/PrintButton'

const linkClass =
  'rounded-md bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-700'

export function SurveyResultsActions({
  freeTextHref,
  csvLinks,
}: {
  freeTextHref?: string
  csvLinks: { href: string; label: string }[]
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-2 print:hidden">
      {freeTextHref && (
        <Link href={freeTextHref} className={linkClass}>
          Se fritekstsvarene
        </Link>
      )}
      {csvLinks.map(l => (
        <a key={l.href} href={l.href} download className={linkClass}>
          {l.label}
        </a>
      ))}
      <PrintButton className={linkClass} />
    </div>
  )
}
