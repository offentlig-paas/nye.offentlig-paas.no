import { createCaller } from '@/server/root'

const nb = (d: number) =>
  new Intl.NumberFormat('nb-NO', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  })
const pct = (v: number) => `${Math.round(v * 100)} %`
const formatP = (p: number) =>
  p < 0.001 ? 'p < 0,001' : `p = ${nb(3).format(p)}`

export const RAW_GONE =
  'Krever rådata, som er slettet etter at undersøkelsen ble avsluttet.'

const h2 = 'text-base font-semibold text-gray-900 dark:text-white'
const explain = 'text-sm text-gray-600 dark:text-gray-400'
const th = 'px-3 py-2 text-left font-medium'
const td = 'px-3 py-2 tabular-nums'
const table = 'min-w-full text-sm text-gray-700 dark:text-gray-300'

export async function Analyses({ slug }: { slug: string }) {
  const caller = await createCaller()
  const data = await caller.admin.surveys.getAnalyses({ slug })

  if (!data.live)
    return (
      <section className="mt-12 space-y-2 print:hidden">
        <h2 className={h2}>Analyser</h2>
        <p className={explain}>{RAW_GONE}</p>
      </section>
    )

  return (
    <div className="mt-12 space-y-12">
      <section className="space-y-3">
        <h2 className={h2}>Samsvar innad i organisasjoner</h2>
        <p className={explain}>
          Svarer kolleger i samme organisasjon likt? Vi teller hvor mange
          organisasjoner med minst to svar som har ulike svar, og sammenligner
          med hva vi ville sett om svarene var fordelt tilfeldig (10 000
          stokkinger). En lav p-verdi betyr at kolleger er mer enige enn
          tilfeldighetene tilsier.
        </p>
        {data.agreement.length === 0 ? (
          <p className={explain}>
            For få organisasjoner med flere svar (minst 5 trengs).
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className={table}>
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className={th}>Spørsmål</th>
                  <th className={th}>Organisasjoner</th>
                  <th className={th}>Uenige</th>
                  <th className={th}>Ventet ved tilfeldighet (95 %)</th>
                  <th className={th}>p</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.agreement.map(r => (
                  <tr key={r.id}>
                    <td className="px-3 py-2">{r.title}</td>
                    <td className={td}>{r.orgs}</td>
                    <td className={td}>{pct(r.observed)}</td>
                    <td className={td}>
                      {pct(r.nullMean)} ({pct(r.nullInterval[0])}–
                      {pct(r.nullInterval[1])})
                    </td>
                    <td className={td}>{formatP(r.p)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {data.segments.map(seg => (
        <section key={seg.id} className="space-y-3">
          <h2 className={h2}>Fordelt på: {seg.title}</h2>
          <p className={explain}>
            Kjikvadrattesten (Fishers eksakte test for to grupper og to svar)
            sier om svarene henger sammen med gruppen. Cramérs V viser hvor
            sterk sammenhengen er, fra 0 (ingen) til 1 (full). Med {seg.tests}{' '}
            tester regnes p under {nb(4).format(0.05 / Math.max(1, seg.tests))}{' '}
            som signifikant (Bonferroni-korreksjon). Grupper under 10 svar vises
            ikke, og svar med færre enn 3 er slått sammen.
          </p>
          {seg.questions.map(q => {
            const values = q.segments[0]!.options.map(o => o.value)
            const significant =
              q.test && q.test.p * Math.max(1, seg.tests) < 0.05
            return (
              <details key={q.id} className="text-sm">
                <summary className="cursor-pointer text-gray-800 dark:text-gray-200">
                  {q.title}{' '}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {q.test
                      ? `${formatP(q.test.p)}, V = ${nb(2).format(q.test.cramersV)}${significant ? ' *' : ''}`
                      : 'flervalg, ikke testet'}
                  </span>
                </summary>
                <div className="mt-2 overflow-x-auto">
                  <table className={table}>
                    <thead className="border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className={th}>Svar</th>
                        {q.segments.map(s => (
                          <th key={s.label} className={th}>
                            {s.label} (n {s.n})
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {values.map(v => (
                        <tr key={v}>
                          <td className="px-3 py-2">
                            {q.segments[0]!.options.find(o => o.value === v)
                              ?.label ?? v}
                          </td>
                          {q.segments.map(s => {
                            const o = s.options.find(x => x.value === v)
                            return (
                              <td key={s.label} className={td}>
                                {!o || o.suppressed
                                  ? '–'
                                  : `${o.percentage} % (${o.count})`}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                      {q.segments.some(s =>
                        s.options.some(o => o.value === '_suppressed')
                      ) && (
                        <tr>
                          <td className="px-3 py-2">Andre (for få svar)</td>
                          {q.segments.map(s => {
                            const o = s.options.find(
                              x => x.value === '_suppressed'
                            )
                            return (
                              <td key={s.label} className={td}>
                                {o ? `${o.percentage} % (${o.count})` : '–'}
                              </td>
                            )
                          })}
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </details>
            )
          })}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            * p &lt; 0,05 etter Bonferroni-korreksjon
          </p>
        </section>
      ))}

      {data.hasPreviousWave && (
        <section className="space-y-3">
          <h2 className={h2}>Samme organisasjoner i begge bølgene</h2>
          {!data.panel ? (
            <p className={explain}>{data.panelNote}</p>
          ) : (
            <>
              <p className={explain}>
                {data.panel.returning} organisasjoner har svart i begge bølgene,{' '}
                {data.panel.newOrgs} er nye. Hver organisasjon teller én gang
                (flertallssvar). McNemars test sier om endringen blant de samme
                organisasjonene er større enn tilfeldig variasjon.
              </p>
              {data.panel.questions.map(q => (
                <details key={q.id} className="text-sm">
                  <summary className="cursor-pointer text-gray-800 dark:text-gray-200">
                    {q.title}{' '}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {q.pairs} organisasjoner
                    </span>
                  </summary>
                  <div className="mt-2 overflow-x-auto">
                    {q.scale ? (
                      <p className={explain}>
                        Opp på skalaen: {q.scale.up}. Uendret: {q.scale.same}.
                        Ned på skalaen: {q.scale.down}. {formatP(q.scale.p)}
                      </p>
                    ) : (
                      <table className={table}>
                        <thead className="border-b border-gray-200 dark:border-gray-700">
                          <tr>
                            <th className={th}>Svar</th>
                            <th className={th}>Før</th>
                            <th className={th}>Nå</th>
                            <th className={th}>Nye</th>
                            <th className={th}>Falt bort</th>
                            <th className={th}>p</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {q.options!.map(o => (
                            <tr key={o.label}>
                              <td className="px-3 py-2">{o.label}</td>
                              <td className={td}>{o.before}</td>
                              <td className={td}>{o.after}</td>
                              <td className={td}>{o.gained}</td>
                              <td className={td}>{o.lost}</td>
                              <td className={td}>
                                {formatP(o.p)}
                                {o.significant && ' *'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </details>
              ))}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                * p &lt; 0,05 etter Bonferroni-korreksjon
              </p>
            </>
          )}
        </section>
      )}
    </div>
  )
}
