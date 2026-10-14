import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import clsx from 'clsx'
import {
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  DocumentTextIcon,
  CircleStackIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  UserIcon,
  ShieldCheckIcon,
  CogIcon,
  ChartBarIcon,
} from '@heroicons/react/20/solid'
import { Container } from '@/components/Container'
import {
  ResearchFigures,
  PaperCitationButton,
} from '@/components/ResearchFigures'
import {
  getProject,
  getAllProjects,
  statusColors,
  getWaveResponseRate,
  findWaveForSurvey,
  surveyStatusLabel,
  hasPublishedSurveyResults,
  getSurveyTitle,
  getSurveyStatus,
  getSurveyDescription,
} from '@/lib/research/helpers'
import { getArticlesByTag } from '@/lib/articles'
import { formatDate } from '@/lib/formatDate'
import { members } from '@/data/members'
import { surveyResponseService } from '@/domains/survey-response/service'
import {
  PaperStatus,
  SurveyStatus,
  type ResearchProject,
  type ResearchEthics,
} from '@/lib/research/types'
import { auth } from '@/auth'
import { canUserAccessSurvey, getSurvey } from '@/lib/surveys/helpers'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  return getAllProjects().map(p => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) return {}

  return {
    title: project.title,
    description: project.description,
  }
}

const paperStatusLabel: Record<PaperStatus, string> = {
  [PaperStatus.Draft]: 'Utkast',
  [PaperStatus.UnderReview]: 'Under fagfellevurdering',
  [PaperStatus.Accepted]: 'Akseptert',
  [PaperStatus.Presented]: 'Presentert',
  [PaperStatus.Published]: 'Publisert',
}

const paperStatusColors: Record<PaperStatus, string> = {
  [PaperStatus.Draft]:
    'bg-zinc-100 text-zinc-700 ring-zinc-500/20 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-400/20',
  [PaperStatus.UnderReview]:
    'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:ring-amber-400/20',
  [PaperStatus.Accepted]:
    'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-400/10 dark:text-sky-400 dark:ring-sky-400/20',
  [PaperStatus.Presented]:
    'bg-teal-50 text-teal-700 ring-teal-600/20 dark:bg-teal-400/10 dark:text-teal-400 dark:ring-teal-400/20',
  [PaperStatus.Published]:
    'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:ring-green-400/20',
}

export default async function ResearchProjectPage({
  params,
}: {
  params: Params
}) {
  const { slug } = await params
  const project = getProject(slug)

  if (!project) {
    notFound()
  }

  const articles = (
    await Promise.all(project.tags.map(tag => getArticlesByTag(tag)))
  ).flat()

  const openSurveys = (project.surveys ?? []).filter(
    s => getSurveyStatus(s) === SurveyStatus.Open
  )
  const hasPublishedResults = (project.surveys ?? []).some(s =>
    hasPublishedSurveyResults(s)
  )
  const primaryPaper = project.papers?.[0]
  const latestDataset = project.datasets?.[project.datasets.length - 1]

  const session = await auth()
  const adminSurveySlug = session?.user
    ? (project.surveys ?? [])
        .filter(
          (s): s is import('@/lib/research/types').InternalSurvey =>
            'surveySlug' in s
        )
        .find(s => {
          const survey = getSurvey(s.surveySlug)
          return survey && canUserAccessSurvey(survey, session.user!)
        })?.surveySlug
    : undefined

  return (
    <Container className="mt-16 lg:mt-28">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/forskning"
          className="group mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
        >
          <ArrowLeftIcon className="h-4 w-4 transition group-hover:-translate-x-0.5" />
          Forskning
        </Link>

        {/* Project header */}
        <header className="border-b border-zinc-200 pb-8 dark:border-zinc-800">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
              {project.title}
            </h1>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={clsx(
                  'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset',
                  statusColors[project.status]
                )}
              >
                {project.status}
              </span>
              {adminSurveySlug && (
                <Link
                  href={`/admin/forskning/${adminSurveySlug}`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  <CogIcon className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
              <UserIcon className="h-4 w-4 text-zinc-400" />
              {project.team ? project.team.join(', ') : project.lead}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDaysIcon className="h-4 w-4 text-zinc-400" />
              Startet {formatDate(project.startDate)}
            </span>
            <span>Oppdatert {formatDate(project.lastUpdated)}</span>
          </div>

          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
            {project.description}
          </p>

          {(primaryPaper?.url || hasPublishedResults || latestDataset) && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {primaryPaper?.url && (
                <a
                  href={primaryPaper.url}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400"
                >
                  <DocumentTextIcon className="h-4 w-4" />
                  {primaryPaper.label ?? 'Les rapporten (PDF)'}
                </a>
              )}

              {hasPublishedResults && (
                <Link
                  href={`/forskning/${slug}/resultater`}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  <ChartBarIcon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  Se alle svarfordelinger
                </Link>
              )}

              {latestDataset && (
                <a
                  href={latestDataset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <CircleStackIcon className="h-4 w-4 text-zinc-400" />
                  Åpne data ({latestDataset.format})
                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-zinc-400" />
                </a>
              )}
            </div>
          )}

          {project.stats && project.stats.length > 0 && (
            <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {project.stats.map(stat => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
                >
                  <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 font-mono text-2xl font-bold tracking-tight text-zinc-900 tabular-nums dark:text-zinc-100">
                    {stat.value}
                  </dd>
                  {stat.subtext && (
                    <dd className="mt-1.5 text-xs leading-snug text-zinc-500 dark:text-zinc-400">
                      {stat.subtext}
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          )}
        </header>

        {/* Main body */}
        <div className="mt-12 space-y-14">
          {project.longDescription && (
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Om studien
              </h2>
              <p className="mt-3 max-w-3xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                {project.longDescription}
              </p>
            </section>
          )}

          {/* Open survey CTA */}
          {openSurveys.length > 0 && (
            <div className="space-y-4">
              {openSurveys.map(survey => {
                const description = getSurveyDescription(survey)
                return (
                  <div
                    key={getSurveyTitle(survey)}
                    className="rounded-xl border border-teal-200 bg-teal-50 p-5 dark:border-teal-800 dark:bg-teal-950/20"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-teal-900 dark:text-teal-100">
                          {getSurveyTitle(survey)}
                        </p>
                        {description && (
                          <p className="mt-1 text-sm text-teal-700 dark:text-teal-300">
                            {description}
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/forskning/${slug}/undersokelse`}
                        className="shrink-0 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
                      >
                        Delta
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Key findings */}
          {project.keyFindings && project.keyFindings.length > 0 && (
            <section className="border-t border-zinc-100 pt-10 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Hovedfunn
              </h2>
              <ol className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {project.keyFindings.map((finding, idx) => (
                  <li
                    key={finding}
                    className="flex gap-3.5 rounded-xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500/10 font-mono text-xs font-semibold text-teal-700 ring-1 ring-teal-500/20 dark:text-teal-300 dark:ring-teal-400/20">
                      {idx + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {finding}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Interactive figures */}
          <ResearchFigures projectSlug={project.slug} />

          {/* Research questions */}
          {project.researchQuestions &&
            project.researchQuestions.length > 0 && (
              <section className="border-t border-zinc-100 pt-10 dark:border-zinc-800">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Forskningsspørsmål
                </h2>
                <ol className="mt-4 space-y-3">
                  {project.researchQuestions.map((q, idx) => (
                    <li
                      key={q}
                      className="flex items-baseline gap-3 text-sm text-zinc-700 dark:text-zinc-300"
                    >
                      <span className="shrink-0 rounded bg-zinc-100 px-2 py-0.5 font-mono text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        RQ{idx + 1}
                      </span>
                      <span className="leading-relaxed">{q}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

          {/* Methodology & unit-of-analysis funnel */}
          {project.methodology && (
            <section className="border-t border-zinc-100 pt-10 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Metode og utvalg
              </h2>

              {project.sampleFlow && project.sampleFlow.length > 0 && (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {project.sampleFlow.map((step, idx) => (
                    <div
                      key={step.label}
                      className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
                    >
                      <span className="font-mono text-xs font-medium text-zinc-400 dark:text-zinc-500">
                        Steg {idx + 1}
                      </span>
                      <p className="mt-1 font-mono text-xl font-bold text-zinc-900 tabular-nums dark:text-zinc-100">
                        {step.value}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        {step.label}
                      </p>
                      {step.detail && (
                        <p className="mt-1.5 text-xs leading-snug text-zinc-500 dark:text-zinc-400">
                          {step.detail}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-5 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {project.methodology}
              </p>
            </section>
          )}

          {/* Papers */}
          <PapersSection papers={project.papers} projectSlug={project.slug} />

          {/* Supporting metadata cards in a balanced 2-column grid */}
          <div className="grid grid-cols-1 gap-6 border-t border-zinc-200 pt-10 md:grid-cols-2 dark:border-zinc-800">
            <WaveTimeline project={project} />
            <SurveysSection
              surveys={project.surveys}
              waves={project.waves}
              projectSlug={project.slug}
            />
            <DatasetsSection datasets={project.datasets} />
            <EthicsSection ethics={project.ethics} />
            {articles.length > 0 && (
              <section className="rounded-2xl border border-zinc-200 bg-white p-5 md:col-span-2 dark:border-zinc-800 dark:bg-zinc-900/40">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Relaterte artikler
                </h2>
                <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {articles.map(article => (
                    <li key={article.slug}>
                      <Link
                        href={`/artikkel/${article.slug}`}
                        className="group block text-xs"
                      >
                        <time
                          dateTime={article.date}
                          className="block text-[11px] text-zinc-400 dark:text-zinc-500"
                        >
                          {formatDate(article.date)}
                        </time>
                        <span className="font-medium text-teal-600 group-hover:text-teal-700 dark:text-teal-400 dark:group-hover:text-teal-300">
                          {article.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </Container>
  )
}

function WaveTimeline({ project }: { project: ResearchProject }) {
  if (!project.waves?.length) return null
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Datainnsamling
      </h2>
      <ol className="mt-4 space-y-4">
        {project.waves.map(wave => {
          const rate = getWaveResponseRate(wave)
          return (
            <li key={wave.name} className="flex items-start gap-3.5">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500/10 font-mono text-xs font-semibold text-teal-600 ring-1 ring-teal-500/20 dark:text-teal-400 dark:ring-teal-400/20">
                {wave.year.toString().slice(-2)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {wave.name} ({wave.year})
                </p>
                {wave.organizations && (
                  <p className="mt-0.5 font-mono text-xs text-zinc-500 tabular-nums dark:text-zinc-400">
                    {rate != null
                      ? `${wave.organizations} av ${wave.invited} virksomheter (${rate} %)`
                      : `${wave.organizations} virksomheter`}
                  </p>
                )}
                {rate != null && (
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-teal-500 dark:bg-teal-400"
                      style={{ width: `${Math.min(rate, 100)}%` }}
                    />
                  </div>
                )}
                {wave.description && (
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {wave.description}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function DatasetsSection({
  datasets,
}: {
  datasets: ResearchProject['datasets']
}) {
  if (!datasets?.length) return null
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <CircleStackIcon className="h-4 w-4 text-zinc-400" />
        Åpne datasett
      </h2>
      <ul className="mt-3 space-y-3">
        {datasets.map(dataset => (
          <li key={dataset.title} className="text-xs">
            <div className="flex items-baseline justify-between gap-2">
              <a
                href={dataset.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
              >
                {dataset.title}
                <ArrowTopRightOnSquareIcon className="ml-1 inline h-3 w-3" />
              </a>
              <span className="shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {dataset.format}
              </span>
            </div>
            {dataset.description && (
              <p className="mt-1 leading-relaxed text-zinc-500 dark:text-zinc-400">
                {dataset.description}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

function PapersSection({
  papers,
  projectSlug,
}: {
  papers: ResearchProject['papers']
  projectSlug: string
}) {
  if (!papers?.length) return null
  return (
    <section className="border-t border-zinc-100 pt-10 dark:border-zinc-800">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        <DocumentTextIcon className="h-5 w-5 text-zinc-400" />
        Publikasjoner
      </h2>
      <div className="mt-5 space-y-6">
        {papers.map(paper => (
          <div
            key={paper.title}
            className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/40"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-2xl">
                {paper.url ? (
                  <a
                    href={paper.url}
                    className="text-base font-semibold text-zinc-900 hover:text-teal-600 dark:text-zinc-100 dark:hover:text-teal-400"
                  >
                    {paper.title}
                  </a>
                ) : (
                  <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {paper.title}
                  </p>
                )}
              </div>
              <span
                className={clsx(
                  'inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                  paperStatusColors[paper.status]
                )}
              >
                {paperStatusLabel[paper.status]}
              </span>
            </div>

            {paper.authors && paper.authors.length > 0 && (
              <p className="mt-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                {paper.authors
                  .map(
                    a =>
                      `${a.name}${a.affiliation ? ` (${a.affiliation})` : ''}`
                  )
                  .join(', ')}
              </p>
            )}

            {paper.venue && (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {paper.venue}
                {paper.venueDate && ` · ${paper.venueDate}`}
              </p>
            )}

            {paper.abstract && (
              <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {paper.abstract}
              </p>
            )}

            <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <PaperCitationButton
                paper={paper}
                projectSlug={projectSlug}
                pdfAction={
                  paper.url ? (
                    <a
                      href={paper.url}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400"
                    >
                      <DocumentTextIcon className="h-4 w-4" />
                      {paper.label ?? 'Last ned PDF'}
                    </a>
                  ) : undefined
                }
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

async function SurveysSection({
  surveys,
  waves,
  projectSlug,
}: {
  surveys: ResearchProject['surveys']
  waves: ResearchProject['waves']
  projectSlug: string
}) {
  if (!surveys?.length) return null

  const orgCounts = new Map<string, number>()
  for (const survey of surveys) {
    if (
      'surveySlug' in survey &&
      getSurveyStatus(survey) === SurveyStatus.Open
    ) {
      orgCounts.set(
        survey.surveySlug,
        await surveyResponseService.getUniqueOrganizationCount(
          survey.surveySlug
        )
      )
    }
  }
  const total = members.length

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <ClipboardDocumentListIcon className="h-4 w-4 text-zinc-400" />
        Spørreundersøkelser
      </h2>
      <ul className="mt-3 space-y-3">
        {surveys.map(survey => {
          const wave = findWaveForSurvey(survey, waves)
          const title = getSurveyTitle(survey)
          const status = getSurveyStatus(survey)
          const description = getSurveyDescription(survey)
          const isOpen = status === SurveyStatus.Open
          const hasResults = hasPublishedSurveyResults(survey)
          const waveRate = wave ? getWaveResponseRate(wave) : null
          const responses =
            'surveySlug' in survey ? (orgCounts.get(survey.surveySlug) ?? 0) : 0
          const rate = total > 0 ? Math.round((responses / total) * 100) : 0
          return (
            <li
              key={title}
              className="text-xs text-zinc-600 dark:text-zinc-400"
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={clsx(
                    'mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full',
                    isOpen ? 'bg-green-500' : 'bg-zinc-400 dark:bg-zinc-500'
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    {isOpen ? (
                      <Link
                        href={`/forskning/${projectSlug}/undersokelse`}
                        className="font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                      >
                        {title}
                      </Link>
                    ) : hasResults ? (
                      <Link
                        href={`/forskning/${projectSlug}/resultater`}
                        className="font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                      >
                        {title}
                      </Link>
                    ) : (
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {title}
                      </span>
                    )}
                    <span className="text-[11px] text-zinc-400">
                      ({surveyStatusLabel[status]})
                    </span>
                    {!isOpen && waveRate != null && (
                      <span className="font-mono text-[11px] text-zinc-400 tabular-nums">
                        · {waveRate} % svar
                      </span>
                    )}
                  </div>
                  {description && (
                    <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                      {description}
                    </p>
                  )}
                  {!isOpen && hasResults && (
                    <Link
                      href={`/forskning/${projectSlug}/resultater`}
                      className="mt-1 inline-block text-[11px] font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
                    >
                      Se alle svarfordelinger →
                    </Link>
                  )}
                </div>
              </div>
              {isOpen && responses > 0 && (
                <div className="mt-2 ml-4">
                  <div className="flex items-baseline justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span>
                      {responses} av {total} virksomheter har svart ({rate} %)
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-teal-100 dark:bg-teal-900/30">
                    <div
                      className="h-full rounded-full bg-teal-500 transition-all dark:bg-teal-400"
                      style={{ width: `${Math.min(rate, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

const ethicsLabels: Record<
  keyof Omit<ResearchEthics, 'dataController' | 'contactEmail'>,
  string
> = {
  legalBasis: 'Behandlingsgrunnlag',
  siktAssessment: 'SIKT-vurdering',
  consentStatus: 'Samtykke',
  anonymization: 'Anonymisering',
  retentionPeriod: 'Slettefrist',
}

function EthicsSection({ ethics }: { ethics: ResearchProject['ethics'] }) {
  if (!ethics) return null
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 md:col-span-2 dark:border-zinc-800 dark:bg-zinc-900/40">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <ShieldCheckIcon className="h-4 w-4 text-zinc-400" />
        Personvern og forskningsetikk
      </h2>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Behandlingsansvarlig: {ethics.dataController} (
        <a
          href={`mailto:${ethics.contactEmail}`}
          className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
        >
          {ethics.contactEmail}
        </a>
        )
      </p>
      <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(
          Object.entries(ethicsLabels) as [keyof typeof ethicsLabels, string][]
        ).map(([key, label]) => {
          const value = ethics[key]
          if (!value) return null
          return (
            <div key={key}>
              <dt className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                {label}
              </dt>
              <dd className="mt-0.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                {value}
              </dd>
            </div>
          )
        })}
      </dl>
      <p className="mt-4 border-t border-zinc-100 pt-3 text-[11px] leading-relaxed text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        Arbeidet følger{' '}
        <a
          href="https://github.com/offentlig-paas/forskning/blob/main/ETHICS.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
        >
          forskningsetiske retningslinjer for Offentlig PaaS
          <ArrowTopRightOnSquareIcon className="ml-0.5 inline h-3 w-3" />
        </a>
        , som bygger på NESHs retningslinjer, GDPR og forskningsetikkloven.
      </p>
    </section>
  )
}
