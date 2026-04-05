import {
  type ResearchProject,
  ResearchStatus,
  PaperStatus,
  SurveyStatus,
} from '@/lib/research/types'

export const researchProjects: ResearchProject[] = [
  {
    slug: 'state-of-platforms',
    title: 'State of the Platforms',
    description:
      'Undersøkelse over tid som kartlegger utbredelsen av interne utviklerplattformer i offentlig sektor \u2014 modenhet etter CNCF-modellen, motivasjon og teknologivalg.',
    status: ResearchStatus.Ongoing,
    tags: ['state-of-platforms'],
    lead: 'Hans Kristian Flaatten',
    startDate: '2023-10-01',
    lastUpdated: '2026-03-19',
    waves: [
      {
        name: 'Wave 1',
        year: 2024,
        status: ResearchStatus.Published,
        organizations: 35,
        description: 'Første kartlegging av plattformmodenhet',
      },
      {
        name: 'Wave 2',
        year: 2026,
        status: ResearchStatus.Published,
        organizations: 45,
        description:
          'Utvidet med nye spørsmål om sikkerhet, kostnader og måling',
      },
    ],
    papers: [
      {
        title:
          'Platform Engineering in the Norwegian Public Sector: A Longitudinal Study of Adoption, Maturity, and Toolchain Convergence (2024–2026)',
        url: '/papers/flaatten-platform-engineering-public-sector-2026-abstract.pdf',
        date: '2026-03-01',
        venue: 'KubeCon + CloudNativeCon Europe 2026, Amsterdam',
        venueDate: 'April 2026',
        status: PaperStatus.UnderReview,
        authors: [{ name: 'Hans Kristian Flaatten', affiliation: 'NAV' }],
        abstract:
          'We present a longitudinal survey of Internal Developer Platform adoption across 45 Norwegian public sector organizations representing approximately 240,000 employees and 2.5 trillion NOK in organizational budgets. Between 2024 and 2026, Kubernetes adoption rose from 66% to 83%, the toolchain converged around a common stack, and security motivation surged 25 percentage points to 82%. Platform operations maturity advanced to Level 3 on the CNCF model, while measurement remained at Level 1 for 49% of organizations — creating a widening gap as cost optimization pressure grows.',
      },
    ],
    surveys: [
      {
        title: 'Plattformmodenhet Wave 1 (2024)',
        status: SurveyStatus.Closed,
      },
      {
        title: 'Plattformmodenhet Wave 2 (2026)',
        status: SurveyStatus.Closed,
      },
    ],
    datasets: [
      {
        title: 'State of Platforms 2024 (anonymisert)',
        url: 'https://github.com/offentlig-paas/forskning/blob/main/projects/state-of-platforms/data/2024/state-of-platforms-2024-anonymous.csv',
        format: 'CSV',
        description: '35 organisasjoner, anonymiserte svar',
      },
      {
        title: 'State of Platforms 2026 (anonymisert)',
        url: 'https://github.com/offentlig-paas/forskning/blob/main/projects/state-of-platforms/data/2026/state-of-platforms-2026-anonymous.csv',
        format: 'CSV',
        description: '45 organisasjoner, anonymiserte svar',
      },
    ],
  },
  {
    slug: 'state-of-ai-agents',
    title: 'State of AI Agents',
    description:
      'Studie av hvordan offentlig sektor tar i bruk AI-kodeagenter som GitHub Copilot, Claude Code og Cursor. Undersøker bruk, styring og om organisasjonene har retningslinjer som holder tritt.',
    status: ResearchStatus.DataCollection,
    tags: ['state-of-ai-agents'],
    lead: 'Hans Kristian Flaatten',
    startDate: '2026-01-01',
    lastUpdated: '2026-04-05',
    callout: {
      headline: 'Kartlegging: AI-kodeagenter i offentlig sektor',
      subtitle:
        'Hvordan brukes og styres verktøy som Copilot og Cursor hos dere?',
      linkText: 'Ta undersøkelsen',
      linkHref: '/forskning/state-of-ai-agents/undersokelse',
    },
    surveys: [
      {
        title: 'AI-kodeagenter i offentlig sektor 2026',
        url: 'https://docs.google.com/forms/d/e/1FAIpQLSc-Np-V-lZwFbG8XpjJt4C8wVUGQnrR_wDuArB_ZPzbdW94GQ/viewform?usp=header',
        status: SurveyStatus.Open,
        description: 'Tar 10–12 minutter å svare',
      },
    ],
  },
]
