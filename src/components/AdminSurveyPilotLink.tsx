'use client'

import { useState } from 'react'
import Link from 'next/link'

function pilotInvitation(
  title: string,
  url: string,
  estimatedMinutes?: string
): string {
  const time = estimatedMinutes
    ? `\n\nDet tar omtrent ${estimatedMinutes} minutter.`
    : ''
  return `Hei!

Vi tester spørreskjemaet «${title}» før det åpnes, og vil gjerne at du prøver det.${time}

Svarene dine brukes bare til å teste skjemaet, og de slettes før undersøkelsen åpnes.

Ikke del lenken med andre.

Noter gjerne alt som er uklart, vanskelig å svare på eller tar lang tid.

${url}

Takk for hjelpen!

Hilsen
Offentlig PAAS`
}

const buttonClass =
  'inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'

export function AdminSurveyPilotLink({
  slug,
  title,
  url,
  estimatedMinutes,
}: {
  slug: string
  title: string
  url: string | null
  estimatedMinutes?: string
}) {
  const [copied, setCopied] = useState<string | null>(null)

  async function copy(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // Fallback: the input below selects on click for manual copy.
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Pilotlenke
        </h3>
        <Link
          href={`/admin/forskning/${slug}/responses?pilot=1`}
          className="text-sm text-teal-600 hover:underline dark:text-teal-400"
        >
          Se pilotsvar
        </Link>
      </div>
      {url ? (
        <div className="mt-3 space-y-3">
          <input
            readOnly
            value={url}
            onClick={e => e.currentTarget.select()}
            aria-label="Pilotlenke"
            className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-1.5 font-mono text-xs text-zinc-700 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
          />
          <div className="flex flex-wrap gap-2">
            <button onClick={() => copy('url', url)} className={buttonClass}>
              {copied === 'url' ? 'Kopiert' : 'Kopier lenke'}
            </button>
            <button
              onClick={() =>
                copy('mail', pilotInvitation(title, url, estimatedMinutes))
              }
              className={buttonClass}
            >
              {copied === 'mail' ? 'Kopiert' : 'Kopier e-posttekst'}
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Pilotlenke er ikke satt opp. Sett SURVEY_PILOT_TOKEN i Vercel.
        </p>
      )}
    </div>
  )
}
