import {
  type ResearchProject,
  ResearchStatus,
  PaperStatus,
} from '@/lib/research/types'
import { SurveyStatus } from '@/lib/surveys/types'
import { type ResearchEthics } from '@/lib/research/types'
import { aiAgents2026 } from '@/data/surveys/ai-agents-2026'

const sharedEthics = {
  dataController: 'Hans Kristian Flaatten (styreleder, Offentlig PaaS)',
  contactEmail: 'kontakt@offentlig-paas.no',
} satisfies Partial<ResearchEthics>

export const researchProjects: ResearchProject[] = [
  {
    slug: 'state-of-platforms',
    title: 'State of Platforms',
    description:
      'Undersøkelse over tid som kartlegger utbredelsen av interne utviklerplattformer i offentlig sektor \u2014 modenhet etter CNCF-modellen, motivasjon og teknologivalg.',
    longDescription:
      'State of the Platforms er en undersøkelse som følger utviklingen av interne utviklerplattformer i norsk offentlig sektor over tid. Vi bruker CNCFs modenhetsmodell til å måle modenhet på tvers av fem dimensjoner: investering, adopsjon, grensesnitt, drift og måling. Ved å gjenta undersøkelsen med jevne mellomrom kan vi se trender, hvilke teknologivalg som går igjen, og hvordan modenheten utvikler seg. Studien dekker organisasjoner som til sammen representerer omtrent 240 000 ansatte og organisasjonsbudsjetter på 2,5 billioner kroner.',
    researchQuestions: [
      'Hvordan har adopsjonen og organisatorisk omfang av interne utviklerplattformer utviklet seg over toårsperioden?',
      'Hva er de viktigste organisatoriske driverne for å bygge interne utviklerplattformer, og hvordan har disse endret seg over tid?',
      'Hvordan utvikler plattformmodenhet seg i praksis, spesielt målt etter den flerdimensjonale CNCF-modenhetsmodellen?',
      'Hvilke teknologivalg og verktøykjeder dominerer moderne plattformstakker, og hvordan konsoliderer de seg?',
    ],
    methodology:
      'Gjentatt spørreundersøkelse der mange organisasjoner deltar i flere runder. Populasjon: IT-organisasjoner i norsk offentlig sektor (statlige virksomheter, statsforetak, kommuner). Distribuert via Offentlig PaaS Slack og LinkedIn. Gjennomført i Google Forms på norsk (bokmål). 31 spørsmål fordelt på tre kategorier: plattform, Kubernetes og sky. Analyseenhet er organisasjonen (ett svar per plattforminitiativ). Modenhet selvrapportert etter CNCFs modenhetsmodell (5 aspekter × 4 nivåer). Duplikater filtrert på organisasjonsnivå.',
    keyFindings: [
      'Kubernetes-adopsjon økte fra 66 % til 83 % mellom 2024 og 2026',
      '92 % av organisasjonene har nå en intern utviklerplattform',
      'Teknologistakken konvergerte rundt AKS/GKE/OpenShift, ArgoCD, GitHub Actions og Terraform — uten sentral koordinering',
      'Sikkerhet som motivasjon økte 25 prosentpoeng til 82 %, den eneste statistisk signifikante endringen (p=0,034)',
      'Driftsmodenhet nådde nivå 3 (skalerbar) på CNCF-modellen',
      '49 % av organisasjonene er fortsatt på nivå 1 for måling — et voksende gap ettersom kostnadspress øker',
    ],
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
        invited: 65,
        description:
          'Første kartlegging av plattformmodenhet (Q4 2023). 35 organisasjoner som representerer omtrent 177 000 ansatte. 86 % hadde en intern utviklerplattform, 66 % brukte Kubernetes. Måling var den minst modne dimensjonen med ingen organisasjoner over nivå 2.',
      },
      {
        name: 'Wave 2',
        year: 2026,
        status: ResearchStatus.Published,
        organizations: 45,
        invited: 80,
        description:
          'Undersøkelsen gjentatt i Q4 2025 – Q1 2026 med 45 organisasjoner (~240 000 ansatte). 27 av dem (60 %) deltok også i bølge 1. Plattformadopsjon opp til 92 %, Kubernetes til 83 %. Sikkerhet som motivasjon økte 25 prosentpoeng til 82 %. Driftsmodenhet nådde nivå 3, men måling var fortsatt på nivå 1 for halvparten.',
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
        waveName: 'Wave 1',
      },
      {
        title: 'Plattformmodenhet Wave 2 (2026)',
        status: SurveyStatus.Closed,
        waveName: 'Wave 2',
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
    ethics: {
      ...sharedEthics,
      legalBasis: 'Samtykke (GDPR art. 6 nr. 1 bokstav a)',
      siktAssessment:
        'Gjennomført (intern) — sannsynligvis ikke meldepliktig, men grensetilfelle. Undersøkelsen samler fakta om organisasjoner, ikke om enkeltpersoner. Frivillig kontaktinfo (~20 %) kobler noen svar til enkeltpersoner og slettes etter oppfølging.',
      consentStatus:
        'Samtykketekst bølge 1–2 var mangelfull. Ny dekkende samtykketekst er utformet for bølge 3+.',
      anonymization:
        'Organisasjonsnavn fjernes. Re-identifiseringsrisiko vurderes for kombinasjoner av sektor, størrelse og teknologivalg (n=35–48 fra kjent populasjon).',
    },
  },
  {
    slug: 'state-of-ai-agents',
    title: 'State of AI Agents',
    description:
      'Studie av hvordan offentlig sektor tar i bruk AI-kodeagenter som GitHub Copilot, Claude Code og Cursor. Undersøker bruk, styring og om organisasjonene har retningslinjer som holder tritt.',
    longDescription:
      'AI-kodeagenter har gått fra nyhet til hverdag på kort tid, men det finnes lite data om hvordan offentlig sektor faktisk tar dem i bruk. Denne studien kartlegger bruken av verktøy som GitHub Copilot, Claude Code, Cursor og Amazon Q i norske offentlige virksomheter. Vi undersøker hvem som bruker hva, om organisasjonene har retningslinjer som holder tritt, og hva som hindrer videre bruk. Studien bygger på samme tilnærming som State of Platforms-undersøkelsene, og følger opp funnet derfra om at sikkerhet ble den nest viktigste motivasjonen for plattformarbeid.',
    researchQuestions: [
      'Hvilke AI-kodeagenter brukes i offentlig sektor, og er bruken formell eller uformell?',
      'Har organisasjonene retningslinjer for AI-generert kode, og hvem har ansvar for sikkerhetsvurderinger og kvalitetskontroll?',
      'Hva hindrer videre bruk — sikkerhet, personvern, kostnader eller andre barrierer?',
    ],
    methodology:
      'Anonym nettbasert spørreundersøkelse åpen for alle som jobber med utvikling eller teknisk ledelse i offentlig sektor — ikke bare de som bruker AI-verktøy i dag. Distribuert gjennom Offentlig PaaS Slack, LinkedIn og arrangementer.',
    status: ResearchStatus.DataCollection,
    tags: ['state-of-ai-agents'],
    lead: 'Hans Kristian Flaatten',
    team: ['Hans Kristian Flaatten', 'Anders Olsen Sandvik'],
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
        surveySlug: aiAgents2026.slug,
      },
    ],
    ethics: {
      ...sharedEthics,
      legalBasis: 'Samtykke (GDPR art. 6 nr. 1 bokstav a)',
      siktAssessment:
        'Gjennomført (intern) — sannsynligvis ikke meldepliktig for anonym versjon. Organisasjonsdata, ikke persondata. E-post for intervju samles i separat seksjon.',
      consentStatus: 'Dekkende samtykketekst dokumentert i instrumentet.',
      anonymization:
        'Organisasjonsnavn fjernes. E-post for intervju separeres fra surveysvar og slettes etter intervjuene.',
      retentionPeriod: 'To år etter studiens avslutning',
    },
  },
]
