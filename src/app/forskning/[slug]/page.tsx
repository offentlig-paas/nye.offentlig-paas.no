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
} from '@heroicons/react/20/solid'
import { Container } from '@/components/Container'
import {
  getProject,
  getAllProjects,
  statusColors,
  getWaveResponseRate,
  findWaveForSurvey,
  surveyStatusLabel,
  isSurveyLinkable,
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
  [PaperStatus.Published]: 'Publisert',
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
    <Container className="mt-16 lg:mt-32">
      <div className="xl:relative">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/forskning"
            className="group mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          >
            <ArrowLeftIcon className="h-4 w-4 transition group-hover:-translate-x-0.5" />
            Forskning
          </Link>

          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-800 sm:text-4xl dark:text-zinc-100">
              {project.title}
            </h1>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={clsx(
                  'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
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

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <UserIcon className="h-4 w-4" />
              {project.lead}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDaysIcon className="h-4 w-4" />
              Startet {formatDate(project.startDate)}
            </span>
            <span>Oppdatert {formatDate(project.lastUpdated)}</span>
          </div>

          <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            {project.description}
          </p>

          {project.longDescription && (
            <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
              {project.longDescription}
            </p>
          )}

          {/* Open survey CTA */}
          {openSurveys.length > 0 && (
            <div className="mt-8">
              {openSurveys.map(survey => {
                const description = getSurveyDescription(survey)
                return (
                  <div
                    key={getSurveyTitle(survey)}
                    className="rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-950/20"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-teal-900 dark:text-teal-100">
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
            <section className="mt-12 border-t border-zinc-100 pt-8 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Hovedfunn
              </h2>
              <ul className="mt-4 list-outside list-disc space-y-2 pl-5 text-sm text-zinc-600 marker:text-zinc-400 dark:text-zinc-400 dark:marker:text-zinc-500">
                {project.keyFindings.map(finding => (
                  <li key={finding}>{finding}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Waves */}
          <WaveTimeline project={project} />

          {/* Research questions */}
          {project.researchQuestions &&
            project.researchQuestions.length > 0 && (
              <section className="mt-12 border-t border-zinc-100 pt-8 dark:border-zinc-800">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Forskningsspørsmål
                </h2>
                <ol className="mt-4 list-outside list-decimal space-y-2 pl-5 text-sm text-zinc-600 marker:text-zinc-400 dark:text-zinc-400 dark:marker:text-zinc-500">
                  {project.researchQuestions.map(q => (
                    <li key={q}>{q}</li>
                  ))}
                </ol>
              </section>
            )}

          {/* Methodology */}
          {project.methodology && (
            <section className="mt-12 border-t border-zinc-100 pt-8 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Metode
              </h2>
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                {project.methodology}
              </p>
            </section>
          )}

          {/* Papers */}
          <PapersSection papers={project.papers} />

          {/* Surveys */}
          <SurveysSection
            surveys={project.surveys}
            waves={project.waves}
            projectSlug={project.slug}
          />

          {/* Datasets */}
          <DatasetsSection datasets={project.datasets} />

          {/* Ethics */}
          <EthicsSection ethics={project.ethics} />

          {/* Related articles */}
          {articles.length > 0 && (
            <section className="mt-12 border-t border-zinc-100 pt-8 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Relaterte artikler
              </h2>
              <ul className="mt-4 space-y-3">
                {articles.map(article => (
                  <li key={article.slug}>
                    <Link
                      href={`/artikkel/${article.slug}`}
                      className="group flex items-baseline gap-3 text-sm"
                    >
                      <time
                        dateTime={article.date}
                        className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500"
                      >
                        {formatDate(article.date)}
                      </time>
                      <span className="text-teal-500 group-hover:text-teal-600 dark:text-teal-400 dark:group-hover:text-teal-300">
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
    </Container>
  )
}

function WaveTimeline({ project }: { project: ResearchProject }) {
  if (!project.waves?.length) return null
  return (
    <section className="mt-12 border-t border-zinc-100 pt-8 dark:border-zinc-800">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Bølger
      </h2>
      <ol className="mt-4 space-y-4">
        {project.waves.map(wave => {
          const rate = getWaveResponseRate(wave)
          return (
            <li key={wave.name} className="flex items-start gap-4">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-sm font-medium text-teal-600 ring-1 ring-teal-500/20 dark:text-teal-400 dark:ring-teal-400/20">
                {wave.year.toString().slice(-2)}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {wave.name} ({wave.year})
                </p>
                {wave.organizations && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {rate != null
                      ? `${wave.organizations} av ${wave.invited} organisasjoner (${rate} %)`
                      : `${wave.organizations} organisasjoner`}
                  </p>
                )}
                {wave.description && (
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
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

function PapersSection({ papers }: { papers: ResearchProject['papers'] }) {
  if (!papers?.length) return null
  return (
    <section className="mt-12 border-t border-zinc-100 pt-8 dark:border-zinc-800">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        <DocumentTextIcon className="h-5 w-5 text-zinc-400" />
        Publikasjoner
      </h2>
      <div className="mt-4 space-y-6">
        {papers.map(paper => (
          <div key={paper.title}>
            <div className="flex items-start justify-between gap-2">
              <div>
                {paper.url ? (
                  <a
                    href={paper.url}
                    className="text-sm font-medium text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
                  >
                    {paper.title}
                    <ArrowTopRightOnSquareIcon className="ml-1 inline h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {paper.title}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-xs text-zinc-500">
                {paperStatusLabel[paper.status]}
              </span>
            </div>
            {paper.authors && paper.authors.length > 0 && (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
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
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {paper.abstract}
              </p>
            )}
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
    <section className="mt-12 border-t border-zinc-100 pt-8 dark:border-zinc-800">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        <ClipboardDocumentListIcon className="h-5 w-5 text-zinc-400" />
        Undersøkelser
      </h2>
      <ul className="mt-4 space-y-3">
        {surveys.map(survey => {
          const wave = findWaveForSurvey(survey, waves)
          const title = getSurveyTitle(survey)
          const status = getSurveyStatus(survey)
          const description = getSurveyDescription(survey)
          const isOpen = status === SurveyStatus.Open
          const waveRate = wave ? getWaveResponseRate(wave) : null
          const responses =
            'surveySlug' in survey ? (orgCounts.get(survey.surveySlug) ?? 0) : 0
          const rate = total > 0 ? Math.round((responses / total) * 100) : 0
          return (
            <li
              key={title}
              className="text-sm text-zinc-600 dark:text-zinc-400"
            >
              <div className="flex items-center gap-3">
                <span
                  className={clsx(
                    'inline-block h-2 w-2 shrink-0 rounded-full',
                    isOpen ? 'bg-green-500' : 'bg-zinc-400 dark:bg-zinc-500'
                  )}
                />
                {isSurveyLinkable(survey) ? (
                  <Link
                    href={`/forskning/${projectSlug}/undersokelse`}
                    className="text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
                  >
                    {title}
                  </Link>
                ) : (
                  <span>{title}</span>
                )}
                <span className="text-xs text-zinc-400">
                  ({surveyStatusLabel[status]})
                </span>
                {!isOpen && waveRate != null && (
                  <span className="text-xs text-zinc-400">
                    · {waveRate} % svarprosent
                  </span>
                )}
                {description && (
                  <span className="text-xs text-zinc-400">— {description}</span>
                )}
              </div>
              {isOpen && responses > 0 && (
                <div className="mt-2 ml-5">
                  <div className="flex items-baseline justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>
                      {responses} av {total} organisasjoner har svart ({rate} %)
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-48 overflow-hidden rounded-full bg-teal-100 dark:bg-teal-900/30">
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

function DatasetsSection({
  datasets,
}: {
  datasets: ResearchProject['datasets']
}) {
  if (!datasets?.length) return null
  return (
    <section className="mt-12 border-t border-zinc-100 pt-8 dark:border-zinc-800">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        <CircleStackIcon className="h-5 w-5 text-zinc-400" />
        Åpne datasett
      </h2>
      <ul className="mt-4 space-y-3">
        {datasets.map(dataset => (
          <li key={dataset.title} className="text-sm">
            <a
              href={dataset.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
            >
              {dataset.title}
              <ArrowTopRightOnSquareIcon className="ml-1 inline h-3 w-3" />
            </a>
            <span className="ml-2 text-xs text-zinc-400">{dataset.format}</span>
            {dataset.description && (
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {dataset.description}
              </p>
            )}
          </li>
        ))}
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
    <section className="mt-12 border-t border-zinc-100 pt-8 dark:border-zinc-800">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        <ShieldCheckIcon className="h-5 w-5 text-zinc-400" />
        Forskningsetikk
      </h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Behandlingsansvarlig: {ethics.dataController} (
        <a
          href={`mailto:${ethics.contactEmail}`}
          className="text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
        >
          {ethics.contactEmail}
        </a>
        )
      </p>
      <dl className="mt-4 space-y-3">
        {(
          Object.entries(ethicsLabels) as [keyof typeof ethicsLabels, string][]
        ).map(([key, label]) => {
          const value = ethics[key]
          if (!value) return null
          return (
            <div key={key}>
              <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {label}
              </dt>
              <dd className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                {value}
              </dd>
            </div>
          )
        })}
      </dl>
      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
        Forskningen følger{' '}
        <a
          href="https://github.com/offentlig-paas/forskning/blob/main/ETHICS.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
        >
          Offentlig PaaS sine forskningsetiske retningslinjer
          <ArrowTopRightOnSquareIcon className="ml-0.5 inline h-3 w-3" />
        </a>
        , basert på NESHs retningslinjer, GDPR og Forskningsetikkloven.
      </p>
    </section>
  )
}
