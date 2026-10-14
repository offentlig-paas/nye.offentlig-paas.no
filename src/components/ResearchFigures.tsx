'use client'

import { type ReactNode, useState } from 'react'
import clsx from 'clsx'
import {
  CheckIcon,
  ClipboardDocumentIcon,
  InformationCircleIcon,
} from '@heroicons/react/20/solid'
import type { ResearchPaper } from '@/lib/research/types'

const MATURITY_LEVELS = [
  {
    key: 'l1',
    short: 'L1',
    label: 'Nivå 1: Provisorisk',
    color: 'bg-rose-500 dark:bg-rose-500/90',
    dot: 'bg-rose-500',
  },
  {
    key: 'l2',
    short: 'L2',
    label: 'Nivå 2: Operasjonalisert',
    color: 'bg-amber-500 dark:bg-amber-500/90',
    dot: 'bg-amber-500',
  },
  {
    key: 'l3',
    short: 'L3',
    label: 'Nivå 3: Skalerbar',
    color: 'bg-teal-500 dark:bg-teal-500/90',
    dot: 'bg-teal-500',
  },
  {
    key: 'l4',
    short: 'L4',
    label: 'Nivå 4: Optimaliserende',
    color: 'bg-sky-500 dark:bg-sky-500/90',
    dot: 'bg-sky-500',
  },
] as const

const CNCF_ASPECTS = [
  {
    name: 'Investering',
    base: 'n = 30 i 2024, n = 43 i 2026',
    w2024: { l1: 13, l2: 57, l3: 20, l4: 10 },
    w2026: { l1: 0, l2: 67, l3: 28, l4: 5 },
    panel: { improved: 12, stable: 75, regressed: 12, p: '1,000' },
    summary:
      'Midlertidige initiativer på nivå 1 gikk fra 13 % til 0 %. 67 % har nå faste plattformteam og budsjetter på nivå 2, og 28 % styrer plattformen som et produkt på nivå 3.',
  },
  {
    name: 'Bruk og tilslutning',
    base: 'n = 30 i 2024, n = 42 i 2026',
    w2024: { l1: 10, l2: 33, l3: 43, l4: 13 },
    w2026: { l1: 14, l2: 31, l3: 52, l4: 2 },
    panel: { improved: 21, stable: 46, regressed: 33, p: '0,581' },
    summary:
      'Frivillig bruk der team velger plattformen fordi den løser reelle behov på nivå 3 økte fra 43 % til 52 %. Andelen der brukerteam selv bygger videre på plattformen på nivå 4 gikk fra 13 % til 2 %.',
  },
  {
    name: 'Grensesnitt',
    base: 'n = 30 i 2024, n = 43 i 2026',
    w2024: { l1: 17, l2: 33, l3: 37, l4: 13 },
    w2026: { l1: 12, l2: 30, l3: 49, l4: 9 },
    panel: { improved: 38, stable: 21, regressed: 42, p: '1,000' },
    summary:
      'Selvbetjente løsninger på nivå 3 økte fra 37 % til 49 %. Her byttet flest virksomheter i panelet nivå mellom rundene, bare 21 % lå i ro.',
  },
  {
    name: 'Drift',
    base: 'n = 30 i 2024, n = 43 i 2026',
    w2024: { l1: 13, l2: 50, l3: 23, l4: 13 },
    w2026: { l1: 19, l2: 23, l3: 47, l4: 12 },
    panel: { improved: 33, stable: 33, regressed: 33, p: '1,000' },
    summary:
      'Vanligste nivå gikk fra manuell oppfølging på nivå 2 (50 % i 2024) til automatisert livssyklus på nivå 3 (47 % i 2026). Andelen på nivå 3 eller 4 økte fra 37 % til 58 %, p = 0,097.',
  },
  {
    name: 'Måling',
    base: 'n = 30 i 2024, n = 43 i 2026',
    w2024: { l1: 53, l2: 43, l3: 0, l4: 3 },
    w2026: { l1: 49, l2: 37, l3: 12, l4: 2 },
    panel: { improved: 17, stable: 67, regressed: 17, p: '1,000' },
    summary:
      'Måling henger etter teknisk drift: 49 % (21 av 43) bygger fortsatt på uformelle tilbakemeldinger på nivå 1, mens 12 % (5 av 43) bruker målinger aktivt i prioritering på nivå 3.',
  },
]

const PLATFORM_MOTIVATIONS = [
  {
    label: 'Raskere utvikling',
    y2024: 93,
    c2024: '28/30',
    y2026: 91,
    c2026: '40/44',
    delta: -2,
    p: '1,000',
    significant: false,
  },
  {
    label: 'Stabilitet og kvalitet',
    y2024: 73,
    c2024: '22/30',
    y2026: 82,
    c2026: '36/44',
    delta: 9,
    p: '0,404',
    significant: false,
  },
  {
    label: 'Sikkerhet og etterlevelse',
    y2024: 57,
    c2024: '17/30',
    y2026: 82,
    c2026: '36/44',
    delta: 25,
    p: '0,034*',
    significant: true,
    note: 'Oddsratio 3,4. I det faste panelet (n = 24) økte andelen fra 54 % til 88 %: 9 la til sikkerhet og 1 fjernet det (McNemar p = 0,021).',
  },
  {
    label: 'Bedre ressursbruk',
    y2024: 57,
    c2024: '17/30',
    y2026: 61,
    c2026: '27/44',
    delta: 4,
    p: '0,810',
    significant: false,
  },
  {
    label: 'Lavere kostnader',
    y2024: 37,
    c2024: '11/30',
    y2026: 52,
    c2026: '23/44',
    delta: 15,
    p: '0,237',
    significant: false,
  },
  {
    label: 'Rekruttering og attraktiv arbeidsplass',
    y2024: 47,
    c2024: '14/30',
    y2026: 36,
    c2026: '16/44',
    delta: -11,
    p: '0,471',
    significant: false,
  },
  {
    label: 'Støtte ulike teknologier',
    y2024: 17,
    c2024: '5/30',
    y2026: 23,
    c2026: '10/44',
    delta: 6,
    p: '0,571',
    significant: false,
  },
]

const TOOLCHAIN_CATEGORIES = {
  k8s: {
    label: 'Kubernetes',
    note: 'Flervalg blant plattformer med Kubernetes (n = 22 i 2024, n = 40 i 2026). Flere velger administrert sky-Kubernetes, mens andelen som drifter ren Kubernetes selv er halvert.',
    items: [
      {
        name: 'Azure Kubernetes Service (AKS)',
        y2024: 45,
        c2024: '10/22',
        y2026: 40,
        c2026: '16/40',
        delta: -5,
      },
      {
        name: 'Red Hat OpenShift',
        y2024: 23,
        c2024: '5/22',
        y2026: 22,
        c2026: '9/40',
        delta: -1,
      },
      {
        name: 'Google Kubernetes Engine (GKE)',
        y2024: 18,
        c2024: '4/22',
        y2026: 20,
        c2026: '8/40',
        delta: 2,
      },
      {
        name: 'Ren Kubernetes (selvdriftet)',
        y2024: 23,
        c2024: '5/22',
        y2026: 12,
        c2026: '5/40',
        delta: -11,
      },
      {
        name: 'VMware Tanzu',
        y2024: 14,
        c2024: '3/22',
        y2026: 8,
        c2026: '3/40',
        delta: -6,
      },
      {
        name: 'Amazon EKS',
        y2024: 5,
        c2024: '1/22',
        y2026: 8,
        c2026: '3/40',
        delta: 3,
      },
      {
        name: 'Talos Linux',
        y2024: 0,
        c2024: '0/22',
        y2026: 8,
        c2026: '3/40',
        delta: 8,
      },
    ],
  },
  cicd: {
    label: 'CI/CD og GitOps',
    note: 'Flervalg (n = 34 i 2024, n = 48 i 2026). Plattformteamene samler seg om GitHub Actions til bygging og ArgoCD til utrulling, mens Jenkins går tilbake.',
    items: [
      {
        name: 'GitHub Actions',
        y2024: 32,
        c2024: '11/34',
        y2026: 52,
        c2026: '25/48',
        delta: 20,
      },
      {
        name: 'ArgoCD',
        y2024: 26,
        c2024: '9/34',
        y2026: 50,
        c2026: '24/48',
        delta: 24,
      },
      {
        name: 'Azure DevOps',
        y2024: 18,
        c2024: '6/34',
        y2026: 17,
        c2026: '8/48',
        delta: -1,
      },
      {
        name: 'GitLab Pipelines',
        y2024: 15,
        c2024: '5/34',
        y2026: 15,
        c2026: '7/48',
        delta: 0,
      },
      {
        name: 'Flux',
        y2024: 24,
        c2024: '8/34',
        y2026: 15,
        c2026: '7/48',
        delta: -9,
      },
      {
        name: 'kubectl apply',
        y2024: 12,
        c2024: '4/34',
        y2026: 15,
        c2026: '7/48',
        delta: 3,
      },
      {
        name: 'Jenkins',
        y2024: 24,
        c2024: '8/34',
        y2026: 8,
        c2026: '4/48',
        delta: -16,
      },
    ],
  },
  iac: {
    label: 'Infrastruktur som kode',
    note: 'Flervalg (n = 33 i 2024, n = 45 i 2026). Terraform brukes nå av fire av fem plattformer, mens Azure Bicep tar over for eldre ARM-maler.',
    items: [
      {
        name: 'Terraform',
        y2024: 73,
        c2024: '24/33',
        y2026: 82,
        c2026: '37/45',
        delta: 9,
      },
      {
        name: 'Ansible',
        y2024: 42,
        c2024: '14/33',
        y2026: 38,
        c2026: '17/45',
        delta: -4,
      },
      {
        name: 'Azure Bicep',
        y2024: 6,
        c2024: '2/33',
        y2026: 16,
        c2026: '7/45',
        delta: 10,
      },
      {
        name: 'Pulumi',
        y2024: 6,
        c2024: '2/33',
        y2026: 9,
        c2026: '4/45',
        delta: 3,
      },
      {
        name: 'Crossplane',
        y2024: 3,
        c2024: '1/33',
        y2026: 9,
        c2026: '4/45',
        delta: 6,
      },
      {
        name: 'ARM-maler',
        y2024: 15,
        c2024: '5/33',
        y2026: 7,
        c2026: '3/45',
        delta: -8,
      },
    ],
  },
  selfservice: {
    label: 'Selvbetjening',
    note: 'Flervalg (n = 30 i 2024, n = 44 i 2026). Selvbetjening for databaser og meldingskøer økte med 39 prosentpoeng (p < 0,001). Det er den største enkeltendringen i hele studien.',
    items: [
      {
        name: 'Bygg og utrulling',
        y2024: 100,
        c2024: '30/30',
        y2026: 91,
        c2026: '40/44',
        delta: -9,
      },
      {
        name: 'Logger, metrikker og dashbord',
        y2024: 87,
        c2024: '26/30',
        y2026: 91,
        c2026: '40/44',
        delta: 4,
      },
      {
        name: 'Databaser, meldingskøer og lagring (p < 0,001*)',
        y2024: 47,
        c2024: '14/30',
        y2026: 86,
        c2026: '38/44',
        delta: 39,
      },
      {
        name: 'Sikkerhets- og sårbarhetsskanning',
        y2024: 60,
        c2024: '18/30',
        y2026: 75,
        c2026: '33/44',
        delta: 15,
      },
    ],
  },
} as const

function StateOfPlatformsFigures() {
  const [activeTab, setActiveTab] = useState<
    'maturity' | 'motivation' | 'toolchain'
  >('maturity')
  const [maturityMode, setMaturityMode] = useState<'cross' | 'panel'>('cross')
  const [toolchainTab, setToolchainTab] =
    useState<keyof typeof TOOLCHAIN_CATEGORIES>('cicd')

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs sm:p-8 dark:border-zinc-700/80 dark:bg-zinc-900/60">
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Resultater fra undersøkelsen (2024 og 2026)
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Sammenligning av 35 virksomheter i 2024 og 48 plattformer i 45
          virksomheter i 2026.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Kategorier i plattformundersøkelsen"
        className="mt-4 flex flex-wrap gap-1.5 border-b border-zinc-200 pb-4 dark:border-zinc-800"
      >
        {[
          { id: 'maturity', label: 'Modenhet (CNCF)' },
          { id: 'motivation', label: 'Motivasjon' },
          { id: 'toolchain', label: 'Teknologivalg' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={clsx(
              'cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition',
              activeTab === tab.id
                ? 'bg-teal-600 text-white shadow-xs dark:bg-teal-500'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'maturity' && (
        <div className="mt-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
              {maturityMode === 'cross' ? (
                MATURITY_LEVELS.map(level => (
                  <span
                    key={level.key}
                    className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300"
                  >
                    <span
                      className={clsx('h-2.5 w-2.5 rounded-xs', level.dot)}
                    />
                    {level.label}
                  </span>
                ))
              ) : (
                <>
                  <span className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                    <span className="h-2.5 w-2.5 rounded-xs bg-teal-500" />
                    Høyere nivå i 2026
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                    <span className="h-2.5 w-2.5 rounded-xs bg-zinc-400 dark:bg-zinc-500" />
                    Samme nivå
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                    <span className="h-2.5 w-2.5 rounded-xs bg-amber-500" />
                    Lavere nivå i 2026
                  </span>
                </>
              )}
            </div>
            <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 text-xs dark:border-zinc-700">
              <button
                type="button"
                aria-pressed={maturityMode === 'cross'}
                onClick={() => setMaturityMode('cross')}
                className={clsx(
                  'cursor-pointer rounded-md px-3 py-1.5 font-medium whitespace-nowrap transition',
                  maturityMode === 'cross'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400'
                )}
              >
                Alle plattformer (2024 mot 2026)
              </button>
              <button
                type="button"
                aria-pressed={maturityMode === 'panel'}
                onClick={() => setMaturityMode('panel')}
                className={clsx(
                  'cursor-pointer rounded-md px-3 py-1.5 font-medium whitespace-nowrap transition',
                  maturityMode === 'panel'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400'
                )}
              >
                Kun gjengangere (n = 24)
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {CNCF_ASPECTS.map(aspect => (
              <div
                key={aspect.name}
                className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-800/40"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {aspect.name}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {maturityMode === 'cross'
                      ? aspect.base
                      : `24 plattformer i begge runder · Fortegnstest p = ${aspect.panel.p}`}
                  </span>
                </div>

                {maturityMode === 'cross' ? (
                  <div className="mt-3 space-y-2.5">
                    {[
                      { year: '2024', data: aspect.w2024 },
                      { year: '2026', data: aspect.w2026 },
                    ].map(row => (
                      <div key={row.year} className="flex items-center gap-3">
                        <span className="w-12 shrink-0 font-mono text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          {row.year}
                        </span>
                        <div className="flex h-7 flex-1 overflow-hidden rounded-md bg-zinc-200/70 dark:bg-zinc-700/50">
                          {MATURITY_LEVELS.map(level => {
                            const pct = row.data[level.key]
                            if (pct <= 0) return null
                            return (
                              <div
                                key={level.key}
                                style={{ flex: `${pct} 1 0%` }}
                                title={`${level.label}: ${pct} %`}
                                className={clsx(
                                  'flex items-center justify-center text-xs font-semibold text-white transition-all',
                                  level.color
                                )}
                              >
                                {pct >= 8 ? `${pct} %` : ''}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-3">
                    <span className="w-12 shrink-0 font-mono text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Endring
                    </span>
                    <div className="flex h-7 flex-1 overflow-hidden rounded-md bg-zinc-200/70 dark:bg-zinc-700/50">
                      <div
                        style={{ flex: `${aspect.panel.improved} 1 0%` }}
                        title={`Høyere nivå i 2026: ${aspect.panel.improved} %`}
                        className="flex items-center justify-center bg-teal-500 text-xs font-semibold text-white"
                      >
                        {aspect.panel.improved} %
                      </div>
                      <div
                        style={{ flex: `${aspect.panel.stable} 1 0%` }}
                        title={`Samme nivå: ${aspect.panel.stable} %`}
                        className="flex items-center justify-center bg-zinc-400 text-xs font-semibold text-white dark:bg-zinc-600"
                      >
                        {aspect.panel.stable} %
                      </div>
                      <div
                        style={{ flex: `${aspect.panel.regressed} 1 0%` }}
                        title={`Lavere nivå i 2026: ${aspect.panel.regressed} %`}
                        className="flex items-center justify-center bg-amber-500 text-xs font-semibold text-white"
                      >
                        {aspect.panel.regressed} %
                      </div>
                    </div>
                  </div>
                )}

                <p className="mt-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {aspect.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'motivation' && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-zinc-400 dark:bg-zinc-500" />
                2024 (n = 30)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-teal-500" />
                2026 (n = 44)
              </span>
            </div>
            <span>
              Fishers eksakte test. Bonferroni-grense ved 7 tester er p = 0,007.
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            {PLATFORM_MOTIVATIONS.map(item => (
              <div
                key={item.label}
                className={clsx(
                  'rounded-xl border p-4',
                  item.significant
                    ? 'border-teal-500/40 bg-teal-50/40 md:col-span-2 dark:border-teal-400/30 dark:bg-teal-950/20'
                    : 'border-zinc-200/70 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-800/30'
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={clsx(
                        'rounded-full px-2 py-0.5 font-semibold',
                        item.delta > 0
                          ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300'
                          : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'
                      )}
                    >
                      {item.delta > 0
                        ? `+${item.delta} pp`
                        : `${item.delta} pp`}
                    </span>
                    <span className="font-mono text-zinc-500 dark:text-zinc-400">
                      p = {item.p}
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="w-10 font-mono text-zinc-500">2024</span>
                    <div className="h-3.5 flex-1 overflow-hidden rounded-sm bg-zinc-200/70 dark:bg-zinc-700/50">
                      <div
                        style={{ width: `${item.y2024}%` }}
                        className="h-full rounded-sm bg-zinc-400 dark:bg-zinc-500"
                      />
                    </div>
                    <span className="w-24 text-right font-mono text-zinc-600 dark:text-zinc-400">
                      {item.y2024} % ({item.c2024})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="w-10 font-mono font-medium text-zinc-700 dark:text-zinc-300">
                      2026
                    </span>
                    <div className="h-3.5 flex-1 overflow-hidden rounded-sm bg-zinc-200/70 dark:bg-zinc-700/50">
                      <div
                        style={{ width: `${item.y2026}%` }}
                        className="h-full rounded-sm bg-teal-500 dark:bg-teal-400"
                      />
                    </div>
                    <span className="w-24 text-right font-mono font-medium text-zinc-900 dark:text-zinc-100">
                      {item.y2026} % ({item.c2026})
                    </span>
                  </div>
                </div>

                {item.note && (
                  <p className="mt-2.5 text-xs font-medium text-teal-800 dark:text-teal-300">
                    {item.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'toolchain' && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {(
              Object.entries(TOOLCHAIN_CATEGORIES) as [
                keyof typeof TOOLCHAIN_CATEGORIES,
                (typeof TOOLCHAIN_CATEGORIES)[keyof typeof TOOLCHAIN_CATEGORIES],
              ][]
            ).map(([key, cat]) => (
              <button
                key={key}
                type="button"
                aria-pressed={toolchainTab === key}
                onClick={() => setToolchainTab(key)}
                className={clsx(
                  'cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition',
                  toolchainTab === key
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            {TOOLCHAIN_CATEGORIES[toolchainTab].note}
          </p>

          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700/70">
            <table className="min-w-full divide-y divide-zinc-200 text-xs dark:divide-zinc-700/70">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">
                    Verktøy eller tjeneste
                  </th>
                  <th className="px-3.5 py-3 text-right font-semibold text-zinc-700 dark:text-zinc-300">
                    2024
                  </th>
                  <th className="px-3.5 py-3 text-right font-semibold text-zinc-700 dark:text-zinc-300">
                    2026
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-zinc-700 dark:text-zinc-300">
                    Endring (pp)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {TOOLCHAIN_CATEGORIES[toolchainTab].items.map(row => (
                  <tr key={row.name}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {row.name}
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <div className="h-1.5 w-36 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                          <div
                            style={{ width: `${row.y2026}%` }}
                            className="h-full rounded-full bg-teal-500 dark:bg-teal-400"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-3 text-right font-mono whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                      {row.y2024} %{' '}
                      <span className="text-[11px] text-zinc-400">
                        ({row.c2024})
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-right font-mono font-semibold whitespace-nowrap text-zinc-900 dark:text-zinc-100">
                      {row.y2026} %{' '}
                      <span className="text-[11px] font-normal text-zinc-400">
                        ({row.c2026})
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono whitespace-nowrap">
                      <span
                        className={clsx(
                          'inline-block rounded-full px-2 py-0.5 font-semibold',
                          row.delta > 0
                            ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300'
                            : row.delta < 0
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                              : 'text-zinc-500'
                        )}
                      >
                        {row.delta > 0 ? `+${row.delta}` : row.delta}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

const AI_TOOLS_COMPARISON = [
  {
    name: 'GitHub Copilot',
    approved: 82,
    nApp: 94,
    used: 74,
    nUsed: 78,
    category: 'enterprise',
  },
  {
    name: 'Claude Code (CLI-agent)',
    approved: 35,
    nApp: 40,
    used: 45,
    nUsed: 48,
    category: 'cli',
    highlight:
      '48 bruker verktøyet (42 % av alle 115), 40 oppgir godkjent (35 %)',
  },
  {
    name: 'Nettbasert språkmodell (ChatGPT m.fl.)',
    approved: 0,
    nApp: 0,
    used: 42,
    nUsed: 45,
    category: 'browser',
  },
  {
    name: 'Åpen kildekode (Aider, Continue)',
    approved: 1,
    nApp: 1,
    used: 17,
    nUsed: 18,
    category: 'oss',
  },
  {
    name: 'OpenAI Codex',
    approved: 14,
    nApp: 16,
    used: 16,
    nUsed: 17,
    category: 'cli',
  },
  {
    name: 'Cursor',
    approved: 11,
    nApp: 13,
    used: 8,
    nUsed: 9,
    category: 'ide',
  },
  {
    name: 'Google Gemini',
    approved: 3,
    nApp: 3,
    used: 10,
    nUsed: 11,
    category: 'enterprise',
  },
  {
    name: 'JetBrains AI',
    approved: 8,
    nApp: 9,
    used: 3,
    nUsed: 3,
    category: 'ide',
  },
  {
    name: 'Windsurf',
    approved: 0,
    nApp: 0,
    used: 7,
    nUsed: 7,
    category: 'ide',
  },
] as const

const CONFIDENCE_FILTER_STATS = {
  all: {
    label: 'Alle svar (N = 115)',
    approvedStage: '78 %',
    policyCoverage: '83 %',
    broadShadow: '62 %',
    narrowShadow: '30 %',
    note: 'Omfatter deltakere som svarte at de er sikre (49 %), ganske sikre (41 %) eller at de gir et anslag (10 %).',
  },
  fairly: {
    label: 'Sikker og ganske sikker (90 %)',
    approvedStage: '80 %',
    policyCoverage: '93 %',
    broadShadow: '63 %',
    narrowShadow: '31 %',
    note: 'Når vi tar bort rene anslag, øker andelen som oppgir at virksomheten har KI-retningslinjer fra 83 % til 93 %.',
  },
  certain: {
    label: 'Kun helt sikker (49 %)',
    approvedStage: '82 %',
    policyCoverage: '94 %',
    broadShadow: '58 %',
    narrowShadow: '32 %',
    note: 'Blant deltakerne som er helt sikre på virksomhetens praksis, ligger smal skyggebruk fast på 32 %.',
  },
} as const

const PERMUTATION_AGREEMENT = [
  {
    indicator: 'Retningslinjer for KI (spørsmål 14)',
    observed: 52,
    nullMean: 79,
    nullLow: 63,
    nullHigh: 93,
    pLabel: 'p (enighet) = 0,001',
    verdict: 'Kolleger svarer likt',
    tone: 'agree',
  },
  {
    indicator: 'Leverandøravklaring (spørsmål 17)',
    observed: 52,
    nullMean: 77,
    nullLow: 63,
    nullHigh: 89,
    pLabel: 'p (enighet) = 0,001',
    verdict: 'Kolleger svarer likt',
    tone: 'agree',
  },
  {
    indicator: 'Opplæring og støtte (spørsmål 15)',
    observed: 67,
    nullMean: 84,
    nullLow: 70,
    nullHigh: 96,
    pLabel: 'p (enighet) = 0,014',
    verdict: 'Mer enige enn tilfeldig',
    tone: 'agree',
  },
  {
    indicator: 'Krav til kodegjennomgang (spørsmål 19)',
    observed: 70,
    nullMean: 72,
    nullLow: 59,
    nullHigh: 85,
    pLabel: 'p (enighet) = 0,516',
    verdict: 'Som tilfeldig variasjon',
    tone: 'neutral',
  },
  {
    indicator: 'Beslutningsprosess (spørsmål 16)',
    observed: 74,
    nullMean: 83,
    nullLow: 70,
    nullHigh: 96,
    pLabel: 'p (enighet) = 0,148',
    verdict: 'Som tilfeldig variasjon',
    tone: 'neutral',
  },
  {
    indicator: 'Hvor langt virksomheten har kommet (spørsmål 5)',
    observed: 85,
    nullMean: 81,
    nullLow: 67,
    nullHigh: 93,
    pLabel: 'p (enighet) = 0,809',
    verdict: 'Som tilfeldig variasjon',
    tone: 'neutral',
  },
  {
    indicator: 'Måling av effekt (spørsmål 18)',
    observed: 96,
    nullMean: 83,
    nullLow: 70,
    nullHigh: 96,
    pLabel: 'p (uenighet) = 0,033, ukorrigert',
    verdict: 'Litt mer uenige enn tilfeldig',
    tone: 'disagree',
  },
] as const

const CONCERN_BY_ROLE = [
  {
    concern: 'Tap av egen fagkompetanse',
    practitioner: 79,
    techLead: 61,
    orgLead: 73,
    total: 71,
    ci: '62 til 79 %',
  },
  {
    concern: 'Kodekvalitet og teknisk gjeld',
    practitioner: 59,
    techLead: 59,
    orgLead: 40,
    total: 57,
    ci: '47 til 65 %',
  },
  {
    concern: 'Hallusinasjoner og feil i koden',
    practitioner: 46,
    techLead: 39,
    orgLead: 20,
    total: 40,
    ci: '32 til 49 %',
  },
  {
    concern: 'Sikkerhet og sårbarheter',
    practitioner: 32,
    techLead: 32,
    orgLead: 47,
    total: 34,
    ci: '26 til 43 %',
  },
  {
    concern: 'Personvern og datalekkasje',
    practitioner: 27,
    techLead: 25,
    orgLead: 33,
    total: 27,
    ci: '20 til 36 %',
  },
  {
    concern: 'Kostnader og lisenser',
    practitioner: 11,
    techLead: 25,
    orgLead: 20,
    total: 17,
    ci: '11 til 25 %',
  },
] as const

function heatCellClass(pct: number): string {
  if (pct >= 70)
    return 'bg-teal-600 text-white font-semibold dark:bg-teal-500 dark:text-zinc-950'
  if (pct >= 50)
    return 'bg-teal-500/25 text-teal-950 font-semibold dark:bg-teal-400/25 dark:text-teal-100'
  if (pct >= 35)
    return 'bg-teal-500/15 text-zinc-900 dark:bg-teal-400/15 dark:text-zinc-200'
  return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
}

function StateOfAiAgentsFigures() {
  const [activeTab, setActiveTab] = useState<
    'shadow' | 'governance' | 'concerns'
  >('shadow')
  const [shadowDef, setShadowDef] = useState<'broad' | 'narrow'>('broad')
  const [confidenceFilter, setConfidenceFilter] =
    useState<keyof typeof CONFIDENCE_FILTER_STATS>('all')

  const conf = CONFIDENCE_FILTER_STATS[confidenceFilter]

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs sm:p-8 dark:border-zinc-700/80 dark:bg-zinc-900/60">
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Resultater fra undersøkelsen (våren 2026)
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Tall fra 115 deltakere i 57 offentlige virksomheter.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Kategorier i KI-undersøkelsen"
        className="mt-4 flex flex-wrap gap-1.5 border-b border-zinc-200 pb-4 dark:border-zinc-800"
      >
        {[
          { id: 'shadow', label: 'Verktøy og skyggebruk' },
          { id: 'governance', label: 'Styring og enighet' },
          { id: 'concerns', label: 'Bekymringer etter rolle' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={clsx(
              'cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition',
              activeTab === tab.id
                ? 'bg-teal-600 text-white shadow-xs dark:bg-teal-500'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'shadow' && (
        <div className="mt-6 space-y-6">
          {/* Legend & broad/narrow toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              <span className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                <span className="h-2.5 w-2.5 rounded-xs bg-sky-600 dark:bg-sky-500" />
                Offisielt godkjent (N = 115)
              </span>
              <span className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                <span className="h-2.5 w-2.5 rounded-xs bg-teal-500 dark:bg-teal-400" />
                Brukt selv (n = 106 brukere)
              </span>
            </div>
            <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 text-xs dark:border-zinc-700">
              <button
                type="button"
                aria-pressed={shadowDef === 'broad'}
                onClick={() => setShadowDef('broad')}
                className={clsx(
                  'cursor-pointer rounded-md px-3 py-1.5 font-medium whitespace-nowrap transition',
                  shadowDef === 'broad'
                    ? 'bg-amber-600 text-white'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400'
                )}
              >
                Bred skyggebruk: 62 % (60 av 96)
              </button>
              <button
                type="button"
                aria-pressed={shadowDef === 'narrow'}
                onClick={() => setShadowDef('narrow')}
                className={clsx(
                  'cursor-pointer rounded-md px-3 py-1.5 font-medium whitespace-nowrap transition',
                  shadowDef === 'narrow'
                    ? 'bg-rose-600 text-white'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400'
                )}
              >
                Smal definisjon: 30 % (29 av 96)
              </button>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            {shadowDef === 'broad'
              ? 'Bred skyggebruk vil si at utvikleren bruker minst ett KI-verktøy som ikke er offisielt godkjent i virksomheten (60 av 96 verktøybrukere som kjenner godkjenningsstatus).'
              : 'Smal definisjon holder nettbaserte språkmodeller og åpen kildekode utenfor, og teller kun kommersielle IDE- og CLI-verktøy som ikke er godkjent (29 av 96).'}
          </p>

          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            {AI_TOOLS_COMPARISON.map(tool => {
              const excludedInNarrow =
                shadowDef === 'narrow' &&
                (tool.category === 'browser' || tool.category === 'oss')
              return (
                <div
                  key={tool.name}
                  className={clsx(
                    'rounded-xl border p-4 transition',
                    'highlight' in tool && !excludedInNarrow
                      ? 'border-amber-300/80 bg-amber-50/30 md:col-span-2 dark:border-amber-500/30 dark:bg-amber-950/15'
                      : excludedInNarrow
                        ? 'border-zinc-100 bg-zinc-50/30 opacity-45 dark:border-zinc-800/50 dark:bg-zinc-900/20'
                        : 'border-zinc-200/70 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-800/30'
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {tool.name}
                    </span>
                    {excludedInNarrow ? (
                      <span className="text-[11px] text-zinc-400">
                        Holdes utenfor smal definisjon
                      </span>
                    ) : (
                      'highlight' in tool && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                          {tool.highlight}
                        </span>
                      )
                    )}
                  </div>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-16 shrink-0 text-zinc-500">
                        Godkjent
                      </span>
                      <div className="h-3.5 flex-1 overflow-hidden rounded-sm bg-zinc-200/70 dark:bg-zinc-700/50">
                        <div
                          style={{ width: `${tool.approved}%` }}
                          className="h-full rounded-sm bg-sky-600 dark:bg-sky-500"
                        />
                      </div>
                      <span className="w-20 shrink-0 text-right font-mono text-zinc-600 dark:text-zinc-400">
                        {tool.approved} % ({tool.nApp})
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-16 shrink-0 font-medium text-zinc-700 dark:text-zinc-300">
                        Brukt selv
                      </span>
                      <div className="h-3.5 flex-1 overflow-hidden rounded-sm bg-zinc-200/70 dark:bg-zinc-700/50">
                        <div
                          style={{ width: `${tool.used}%` }}
                          className="h-full rounded-sm bg-teal-500 dark:bg-teal-400"
                        />
                      </div>
                      <span className="w-20 shrink-0 text-right font-mono font-medium text-zinc-900 dark:text-zinc-100">
                        {tool.used} % ({tool.nUsed})
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Sensitivity filter */}
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-800/40">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Filtrer etter hvor sikre deltakerne er på virksomhetens praksis
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(
                  Object.entries(CONFIDENCE_FILTER_STATS) as [
                    keyof typeof CONFIDENCE_FILTER_STATS,
                    (typeof CONFIDENCE_FILTER_STATS)[keyof typeof CONFIDENCE_FILTER_STATS],
                  ][]
                ).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={confidenceFilter === key}
                    onClick={() => setConfidenceFilter(key)}
                    className={clsx(
                      'cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition',
                      confidenceFilter === key
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'bg-white text-zinc-600 ring-1 ring-zinc-200 hover:text-zinc-900 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-700'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg bg-white p-3 ring-1 ring-zinc-200/70 dark:bg-zinc-900/70 dark:ring-zinc-700/60">
                <div className="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {conf.approvedStage}
                </div>
                <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Har godkjent verktøy
                </div>
              </div>
              <div className="rounded-lg bg-white p-3 ring-1 ring-zinc-200/70 dark:bg-zinc-900/70 dark:ring-zinc-700/60">
                <div className="font-mono text-lg font-bold text-teal-600 dark:text-teal-400">
                  {conf.policyCoverage}
                </div>
                <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Har retningslinjer
                </div>
              </div>
              <div className="rounded-lg bg-white p-3 ring-1 ring-zinc-200/70 dark:bg-zinc-900/70 dark:ring-zinc-700/60">
                <div className="font-mono text-lg font-bold text-amber-600 dark:text-amber-400">
                  {conf.broadShadow}
                </div>
                <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Bred skyggebruk
                </div>
              </div>
              <div className="rounded-lg bg-white p-3 ring-1 ring-zinc-200/70 dark:bg-zinc-900/70 dark:ring-zinc-700/60">
                <div className="font-mono text-lg font-bold text-rose-600 dark:text-rose-400">
                  {conf.narrowShadow}
                </div>
                <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Smal skyggebruk
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              {conf.note}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'governance' && (
        <div className="mt-6 space-y-5">
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Hvor enige er kolleger i samme virksomhet? (27 virksomheter med 2
              til 7 svar)
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Det grå feltet viser variasjonen vi ville fått ved ren
              tilfeldighet (95 %-intervall fra 10 000 trekninger). Punkter til
              venstre for feltet betyr at kolleger i samme virksomhet svarer mer
              likt enn tilfeldig.
            </p>
          </div>

          <div className="space-y-3">
            {PERMUTATION_AGREEMENT.map(row => (
              <div
                key={row.indicator}
                className="rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-800/30"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {row.indicator}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        'rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                        row.tone === 'agree'
                          ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300'
                          : row.tone === 'disagree'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
                            : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'
                      )}
                    >
                      {row.verdict}
                    </span>
                    <span className="font-mono text-zinc-500 dark:text-zinc-400">
                      {row.pLabel}
                    </span>
                  </div>
                </div>

                <div className="relative mt-3 h-6 w-full rounded-full bg-zinc-200/60 dark:bg-zinc-800">
                  <div
                    style={{
                      left: `${row.nullLow}%`,
                      width: `${row.nullHigh - row.nullLow}%`,
                    }}
                    title={`95 % tilfeldig intervall: ${row.nullLow} til ${row.nullHigh} %`}
                    className="absolute top-1 bottom-1 rounded-full bg-zinc-300 dark:bg-zinc-600/80"
                  />
                  <div
                    style={{ left: `${row.nullMean}%` }}
                    title={`Tilfeldig snitt: ${row.nullMean} %`}
                    className="absolute top-0.5 bottom-0.5 w-0.5 bg-zinc-500 dark:bg-zinc-300"
                  />
                  <div
                    style={{ left: `calc(${row.observed}% - 7px)` }}
                    title={`Observert uenighet: ${row.observed} %`}
                    className={clsx(
                      'absolute top-1 h-4 w-4 rounded-full ring-2 ring-white dark:ring-zinc-900',
                      row.tone === 'agree'
                        ? 'bg-teal-500'
                        : row.tone === 'disagree'
                          ? 'bg-rose-500'
                          : 'bg-zinc-700 dark:bg-zinc-200'
                    )}
                  />
                </div>

                <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    Observert uenighet: <strong>{row.observed} %</strong>
                  </span>
                  <span>
                    Tilfeldig variasjon: {row.nullMean} % ({row.nullLow} til{' '}
                    {row.nullHigh} %)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'concerns' && (
        <div className="mt-6 space-y-4">
          <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            Andel som valgte bekymringen blant sine tre viktigste (opptil 3
            valg, snitt 2,67). Forskjellene mellom rollene er ikke statistisk
            signifikante etter Bonferroni-korreksjon (p &lt; 0,0125).
          </p>

          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700/70">
            <table className="min-w-full divide-y divide-zinc-200 text-xs dark:divide-zinc-700/70">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">
                    Bekymring (topp 3)
                  </th>
                  <th className="px-3 py-3 text-center font-semibold whitespace-nowrap text-zinc-700 dark:text-zinc-300">
                    Utviklere (n = 56)
                  </th>
                  <th className="px-3 py-3 text-center font-semibold whitespace-nowrap text-zinc-700 dark:text-zinc-300">
                    Teknisk ledelse (n = 44)
                  </th>
                  <th className="px-3 py-3 text-center font-semibold whitespace-nowrap text-zinc-700 dark:text-zinc-300">
                    Ledelse (n = 15)
                  </th>
                  <th className="px-4 py-3 text-right font-semibold whitespace-nowrap text-zinc-700 dark:text-zinc-300">
                    Alle (N = 115) · 95 % KI
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {CONCERN_BY_ROLE.map(row => (
                  <tr key={row.concern}>
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {row.concern}
                    </td>
                    {[row.practitioner, row.techLead, row.orgLead].map(
                      (val, idx) => (
                        <td key={idx} className="p-2 text-center font-mono">
                          <div
                            className={clsx(
                              'rounded-md py-1.5',
                              heatCellClass(val)
                            )}
                          >
                            {val} %
                          </div>
                        </td>
                      )
                    )}
                    <td className="px-4 py-3 text-right font-mono whitespace-nowrap text-zinc-700 dark:text-zinc-300">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {row.total} %
                      </span>{' '}
                      <span className="text-[11px] text-zinc-400">
                        ({row.ci})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export function ResearchFigures({ projectSlug }: { projectSlug: string }) {
  if (projectSlug === 'state-of-platforms') {
    return <StateOfPlatformsFigures />
  }
  if (projectSlug === 'state-of-ai-agents') {
    return <StateOfAiAgentsFigures />
  }
  return null
}

export function PaperCitationButton({
  paper,
  projectSlug,
  pdfAction,
}: {
  paper: ResearchPaper
  projectSlug: string
  pdfAction?: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState<'apa' | 'bibtex' | null>(null)

  const year = paper.date.slice(0, 4)
  const authorsApa =
    paper.authors?.map(a => a.name).join(', ') ?? 'Offentlig PaaS'
  const authorsBib =
    paper.authors?.map(a => a.name).join(' and ') ?? 'Offentlig PaaS'
  const venue = paper.venue ?? 'Offentlig PaaS Working Paper'
  const citeKey = `flaatten${year}${projectSlug.replace(/-/g, '')}`
  const paperUrl = `https://offentlig-paas.no${paper.url ?? `/forskning/${projectSlug}`}`

  const apa = `${authorsApa} (${year}). ${paper.title}. ${venue}. ${paperUrl}`
  const bibtex = paper.venue
    ? `@inproceedings{${citeKey},
  title = {${paper.title}},
  author = {${authorsBib}},
  year = {${year}},
  booktitle = {${paper.venue}},
  url = {${paperUrl}}
}`
    : `@techreport{${citeKey},
  title = {${paper.title}},
  author = {${authorsBib}},
  year = {${year}},
  institution = {Offentlig PaaS},
  type = {Working Paper},
  url = {${paperUrl}}
}`

  async function copyText(text: string, type: 'apa' | 'bibtex') {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {pdfAction}
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          <InformationCircleIcon className="h-3.5 w-3.5 text-zinc-400" />
          Siter (APA / BibTeX)
        </button>
      </div>

      {open && (
        <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 text-xs dark:border-zinc-700 dark:bg-zinc-800/80">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              APA-referanse
            </span>
            <button
              type="button"
              onClick={() => copyText(apa, 'apa')}
              className="inline-flex cursor-pointer items-center gap-1 text-teal-600 hover:text-teal-700 dark:text-teal-400"
            >
              {copied === 'apa' ? (
                <>
                  <CheckIcon className="h-3.5 w-3.5" /> Kopiert
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="h-3.5 w-3.5" /> Kopier APA
                </>
              )}
            </button>
          </div>
          <p className="mt-1 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
            {apa}
          </p>

          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              BibTeX
            </span>
            <button
              type="button"
              onClick={() => copyText(bibtex, 'bibtex')}
              className="inline-flex cursor-pointer items-center gap-1 text-teal-600 hover:text-teal-700 dark:text-teal-400"
            >
              {copied === 'bibtex' ? (
                <>
                  <CheckIcon className="h-3.5 w-3.5" /> Kopiert
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="h-3.5 w-3.5" /> Kopier
                  BibTeX
                </>
              )}
            </button>
          </div>
          <pre className="mt-1 overflow-x-auto rounded-md bg-zinc-900 p-2.5 font-mono text-[11px] text-zinc-200">
            {bibtex}
          </pre>
        </div>
      )}
    </div>
  )
}
