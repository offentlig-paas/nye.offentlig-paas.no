import { notFound } from 'next/navigation'
import { createCaller } from '@/server/root'
import { getSurvey } from '@/lib/surveys/helpers'

interface AdminSurveyComparePageProps {
  params: Promise<{ slug: string }>
}

const nb1 = new Intl.NumberFormat('nb-NO', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const nbSigned = new Intl.NumberFormat('nb-NO', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
})
const cell = (v: number | null | undefined, f = nb1) =>
  v === null || v === undefined ? '—' : f.format(v)

const th = 'px-3 py-2 text-left font-medium'
const td = 'px-3 py-2 tabular-nums'

export default async function AdminSurveyComparePage({
  params,
}: AdminSurveyComparePageProps) {
  const { slug } = await params
  if (!getSurvey(slug)?.comparesTo) notFound()

  const caller = await createCaller()
  const data = await caller.admin.surveys.getComparison({ slug })

  return (
    <div className="space-y-8">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Bare spørsmål som finnes i begge bølgene vises. Forrige bølge:{' '}
        {data.previousTitle} ({data.previousTotal} svar). Denne bølgen:{' '}
        {data.currentTotal} svar.
      </p>
      {data.questions.map(q => (
        <section key={q.id}>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {q.title}
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm text-zinc-700 dark:text-zinc-300">
              <caption className="caption-bottom pt-2 text-left text-xs text-zinc-500 dark:text-zinc-400">
                n = {q.previousN} i forrige bølge, {q.currentN} i denne bølgen
              </caption>
              <thead className="border-b border-zinc-200 dark:border-zinc-700">
                <tr>
                  <th className={th}>Svar</th>
                  <th className={th}>Forrige bølge (%)</th>
                  <th className={th}>Denne bølgen (%)</th>
                  <th className={th}>Endring (prosentpoeng)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {q.options.map(o => (
                  <tr key={o.value}>
                    <td className="px-3 py-2">{o.label}</td>
                    <td className={td}>{cell(o.previous?.percentage)}</td>
                    <td className={td}>{cell(o.current?.percentage)}</td>
                    <td className={td}>{cell(o.delta, nbSigned)}</td>
                  </tr>
                ))}
                {q.average && (
                  <tr className="font-medium">
                    <td className="px-3 py-2">
                      Gjennomsnitt (1 = første svaralternativ)
                    </td>
                    <td className={td}>{cell(q.average.previous)}</td>
                    <td className={td}>{cell(q.average.current)}</td>
                    <td className={td}>
                      {q.average.previous !== null && q.average.current !== null
                        ? nbSigned.format(
                            q.average.current - q.average.previous
                          )
                        : '—'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}
