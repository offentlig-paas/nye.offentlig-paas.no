import type {
  QuestionOption,
  SurveyDefinition,
  SurveyQuestion,
  SurveySection,
} from '@/lib/surveys/types'
import { SurveyStatus } from '@/lib/surveys/types'
import { members } from '@/data/members'

/**
 * State of Platforms — KI-oppfølging (Q4 2026).
 *
 * Source: forskning/projects/state-of-platforms/survey/ai-followup-draft.md.
 * Respondent-facing text is verbatim from the instrument.
 *
 * DRAFT: not open for answers. Keep `status: SurveyStatus.Draft` until the
 * real pilot (D9) is done and the TODOs below are resolved.
 *
 * Routing: the survey engine only supports forward section jumps with one
 * branching question per section. The three routes (plattformteam,
 * applikasjonsteam, ledelse) are therefore laid out as separate tracks with
 * track-prefixed question IDs (p-, a-, l-). Merge them per Q-number in
 * analysis. Q2 picks which Q2b section is shown; Q2b picks the track.
 *
 * TODO(engine): Q14c and the Q20 follow-up are conditional on combinations
 * of answers, which the engine cannot express. They are shown to everyone in
 * the route and are optional. Filter in analysis.
 */

const orgSuggestions = members.map(m => m.name).sort()

type Track = 'p' | 'a' | 'l'

const yesNo: QuestionOption[] = [
  { label: 'Ja', value: 'yes' },
  { label: 'Nei', value: 'no' },
]

const attribution = (id: string, title: string): SurveyQuestion => ({
  id,
  type: 'radio',
  title,
  required: true,
  options: [
    { label: 'Ikke i det hele tatt', value: 'not-at-all' },
    { label: 'I liten grad', value: 'small' },
    { label: 'I noen grad', value: 'some' },
    { label: 'I stor grad', value: 'large' },
    { label: 'Vet ikke', value: 'unknown' },
  ],
})

const adoptionSection = (t: Track): SurveySection => ({
  id: `${t}-adoption`,
  title: 'Adopsjon av KI-kodeverktøy',
  description:
    'I denne delen spør vi om organisasjonens bruk av KI-kodeverktøy. Svar basert på det du vet om organisasjonen som helhet. Det er helt greit å svare «vet ikke».\n\nMed «KI-kodeverktøy» mener vi verktøy som hjelper utviklere med å skrive, forstå eller endre kode ved hjelp av kunstig intelligens — for eksempel GitHub Copilot, Cursor, Claude Code, Amazon Q, eller lignende.',
  questions: [
    {
      id: `${t}-q4-adoption-level`,
      type: 'radio',
      title: 'Hva beskriver best organisasjonens bruk av KI-kodeverktøy i dag?',
      description:
        'Velg det alternativet som best beskriver situasjonen i organisasjonen i dag. De tre midterste alternativene skiller mellom uformell bruk (enkeltpersoner på eget initiativ), organisasjonen har tatt en offisiell beslutning men ikke alle bruker verktøyene ennå, og at de fleste utviklere faktisk har tilgang og bruker dem.',
      required: true,
      options: [
        { label: 'Ikke i bruk, så vidt jeg vet', value: 'not-in-use' },
        {
          label: 'Enkeltpersoner bruker KI-verktøy på eget initiativ',
          value: 'individual',
        },
        {
          label:
            'Noen team har tatt i bruk KI-verktøy, men det finnes ingen organisasjonsomfattende tilnærming',
          value: 'some-teams',
        },
        {
          label:
            'Organisasjonen har offisielt godkjent eller anskaffet KI-kodeverktøy, men ikke alle team bruker dem ennå',
          value: 'officially-approved',
        },
        {
          label: 'De fleste utviklere har tilgang til og bruker KI-kodeverktøy',
          value: 'most-developers',
        },
        { label: 'Vet ikke', value: 'unknown' },
      ],
    },
    {
      id: `${t}-q5-approved-tools`,
      type: 'checkbox',
      title:
        'Hvilke KI-kodeverktøy er offisielt godkjent eller anskaffet i organisasjonen din?',
      required: true,
      randomizeOptions: true,
      options: [
        { label: 'GitHub Copilot', value: 'copilot' },
        { label: 'Cursor', value: 'cursor' },
        { label: 'Codex', value: 'codex' },
        { label: 'Windsurf / Antigravity', value: 'windsurf' },
        { label: 'Claude Code', value: 'claude-code' },
        { label: 'Amazon Q Developer', value: 'amazon-q' },
        { label: 'Gemini Code Assist', value: 'gemini' },
        { label: 'JetBrains AI Assistant', value: 'jetbrains-ai' },
        {
          label: 'Ingen offisielt godkjente verktøy',
          value: 'none',
          pinPosition: 'last',
          exclusive: true,
        },
        {
          label: 'Vet ikke',
          value: 'unknown',
          pinPosition: 'last',
          exclusive: true,
        },
        {
          label: 'Andre',
          value: 'other',
          allowOtherText: true,
          pinPosition: 'last',
        },
      ],
    },
    {
      id: `${t}-q6-agents`,
      type: 'radio',
      title:
        'Bruker organisasjonen din KI-agenter som gjør endringer på egen hånd?',
      description:
        'Med KI-agenter mener vi verktøy som selv gjør endringer på tvers av flere filer, på utviklerens maskin eller i skyen. Eksempler: agenten lager pull requests, retter feil eller oppgraderer avhengigheter.',
      required: true,
      options: [
        { label: 'Nei', value: 'no' },
        { label: 'Enkeltpersoner prøver ut', value: 'individuals' },
        { label: 'Noen team bruker jevnlig', value: 'some-teams' },
        { label: 'De fleste team bruker jevnlig', value: 'most-teams' },
        { label: 'Vet ikke', value: 'unknown' },
      ],
    },
  ],
})

const personalSections = (t: 'p' | 'a'): SurveySection[] => [
  {
    id: `${t}-personal-screening`,
    title: 'Din egen bruk',
    description:
      'De neste spørsmålene handler om deg og din egen bruk av KI-kodeverktøy.',
    questions: [
      {
        id: `${t}-q7a-personal-use`,
        type: 'radio',
        title: 'Bruker du KI-kodeverktøy?',
        required: true,
        options: [
          { label: 'Ja', value: 'yes' },
          { label: 'Nei', value: 'no', skipToSection: `${t}-org-effect` },
        ],
      },
    ],
  },
  {
    id: `${t}-personal-usage`,
    title: 'Din egen bruk',
    questions: [
      {
        id: `${t}-q7-frequency`,
        type: 'radio',
        title: 'Hvor ofte bruker du KI-kodeverktøy i arbeidet ditt?',
        required: true,
        options: [
          { label: 'Daglig', value: 'daily' },
          { label: 'Flere ganger i uken', value: 'several-weekly' },
          { label: 'Ukentlig', value: 'weekly' },
          { label: 'Noen ganger i måneden', value: 'monthly' },
          { label: 'Sjelden eller aldri', value: 'rarely' },
        ],
      },
      {
        id: `${t}-q7b-personal-tools`,
        type: 'checkbox',
        title: 'Hvilke KI-kodeverktøy bruker du?',
        required: true,
        randomizeOptions: true,
        options: [
          { label: 'GitHub Copilot', value: 'copilot' },
          { label: 'Cursor', value: 'cursor' },
          { label: 'Codex', value: 'codex' },
          { label: 'Windsurf / Antigravity', value: 'windsurf' },
          { label: 'Claude Code', value: 'claude-code' },
          { label: 'Amazon Q Developer', value: 'amazon-q' },
          { label: 'Gemini Code Assist / Gemini CLI', value: 'gemini' },
          { label: 'JetBrains AI Assistant', value: 'jetbrains-ai' },
          {
            label:
              'ChatGPT, Claude eller lignende via nettleser/API (ikke dedikert kodeverktøy)',
            value: 'browser-llm',
          },
          {
            label: 'Aider, OpenCode eller andre open source-verktøy',
            value: 'open-source',
          },
          {
            label: 'Andre',
            value: 'other',
            allowOtherText: true,
            pinPosition: 'last',
          },
        ],
      },
      {
        id: `${t}-q8-usage-modes`,
        type: 'checkbox',
        title: 'Hvilke måter bruker du KI-kodeverktøy på?',
        required: true,
        options: [
          {
            label:
              'Autofullføring av kode (verktøyet foreslår kode mens jeg skriver)',
            value: 'autocomplete',
          },
          {
            label: 'Chat i editoren (jeg stiller spørsmål og får svar)',
            value: 'chat',
          },
          {
            label:
              'Planlegging av oppgaver (KI hjelper meg å bryte ned og planlegge arbeid)',
            value: 'planning',
          },
          {
            label:
              'Agentmodus lokalt (verktøyet gjør endringer på tvers av flere filer på min maskin)',
            value: 'local-agent',
          },
          {
            label:
              'Agentmodus i skyen (f.eks. GitHub Copilot coding agent som kjører uten at jeg er til stede)',
            value: 'cloud-agent',
          },
          {
            label: 'Kodegjennomgang med KI (f.eks. Copilot code review)',
            value: 'code-review',
          },
          { label: 'Testgenerering', value: 'test-generation' },
          { label: 'Feilsøking / debugging', value: 'debugging' },
          { label: 'Annet', value: 'other', allowOtherText: true },
        ],
      },
    ],
  },
]

const orgEffectSection = (t: Track): SurveySection => ({
  id: `${t}-org-effect`,
  title: 'Adopsjon av KI-kodeverktøy',
  // Transition text only makes sense after the personal questions.
  description:
    t === 'l'
      ? undefined
      : 'De neste to spørsmålene handler igjen om organisasjonen som helhet.',
  questions: [
    {
      id: `${t}-q9-measurement`,
      type: 'radio',
      title: 'Hvordan vurderer organisasjonen din effekten av KI-kodeverktøy?',
      description:
        'Velg det høyeste nivået som passer for organisasjonen din. Hvert nivå inkluderer de under.',
      required: true,
      options: [
        { label: 'Vi vurderer ikke effekten', value: 'none' },
        { label: 'Uformelle tilbakemeldinger og anekdoter', value: 'informal' },
        {
          label:
            'Vi følger med på bruksdata fra verktøyleverandøren (f.eks. antall brukere, akseptrate)',
          value: 'vendor-metrics',
        },
        {
          label:
            'Vi måler effekten med egne metrikker (f.eks. leveransetakt, kvalitet, utvikleropplevelse)',
          value: 'own-metrics',
        },
        { label: 'Vet ikke', value: 'unknown' },
      ],
    },
    {
      id: `${t}-q10-code-review`,
      type: 'radio',
      title:
        'Hvordan håndteres KI-generert kode i kodegjennomgang (code review)?',
      description:
        'Med «KI-generert kode» mener vi all kode som er skrevet eller vesentlig endret med hjelp av KI-verktøy — både helt generert kode og kode der KI har foreslått endringer.',
      required: true,
      options: [
        {
          label:
            'Ingen spesiell håndtering — KI-generert kode gjennomgås som all annen kode',
          value: 'no-special',
        },
        {
          label:
            'Vi har muntlige retningslinjer om å være ekstra oppmerksom på KI-generert kode',
          value: 'oral',
        },
        {
          label:
            'Vi har skriftlige retningslinjer for gjennomgang av KI-generert kode',
          value: 'written',
        },
        {
          label:
            'Vi har skriftlige retningslinjer og bruker automatiserte verktøy for å sjekke KI-generert kode (f.eks. sikkerhetsskanning)',
          value: 'written-automated',
        },
        {
          label:
            'Ikke aktuelt — vi bruker ikke KI-kodeverktøy eller har ikke kodegjennomgang',
          value: 'not-applicable',
        },
        { label: 'Vet ikke', value: 'unknown' },
      ],
    },
  ],
})

const aiServicesSections = (t: 'p' | 'l'): SurveySection[] => [
  {
    id: `${t}-ai-services`,
    title: 'Plattformen som leverandør av KI',
    questions: [
      {
        id: `${t}-q22-ai-services`,
        type: 'checkbox',
        title: 'Hvilke KI-tjenester tilbyr plattformen som selvbetjening?',
        required: true,
        options: [
          {
            label: 'Tilgang til språkmodeller via en felles gateway',
            value: 'llm-gateway',
          },
          {
            label: 'Modeller som kjører på egen infrastruktur',
            value: 'self-hosted-models',
          },
          { label: 'GPU-kapasitet', value: 'gpu' },
          { label: 'Vektordatabase', value: 'vector-db' },
          { label: 'Kjøremiljø for KI-agenter', value: 'agent-runtime' },
          {
            label: 'Evaluering og overvåking av KI-funksjonalitet',
            value: 'evaluation',
          },
          { label: 'Ingen', value: 'none', exclusive: true },
          { label: 'Vet ikke', value: 'unknown', exclusive: true },
          {
            label: 'Ikke aktuelt (vi har ingen plattform)',
            value: 'no-platform',
            exclusive: true,
          },
        ],
      },
      {
        id: `${t}-q23-model-hosting`,
        type: 'checkbox',
        title: 'Hvor kjører språkmodellene dere bruker?',
        required: true,
        options: [
          {
            label:
              'Stor skyleverandør i EØS-region (f.eks. Azure OpenAI, Vertex AI, Bedrock)',
            value: 'hyperscaler-eea',
          },
          {
            label: 'Stor skyleverandør utenfor EØS',
            value: 'hyperscaler-non-eea',
          },
          {
            label: 'Direkte hos modelleverandøren (OpenAI, Anthropic, Google)',
            value: 'model-vendor',
          },
          {
            label: 'Norsk eller europeisk skyleverandør',
            value: 'european-cloud',
          },
          { label: 'Egne servere', value: 'on-prem' },
          {
            label: 'Vi bruker ikke språkmodeller',
            value: 'none',
            exclusive: true,
          },
          { label: 'Vet ikke', value: 'unknown', exclusive: true },
        ],
      },
      {
        id: `${t}-q24-ai-apps-in-prod`,
        type: 'radio',
        title:
          'Hvor mange applikasjonsteam kjører KI-funksjonalitet (språkmodeller) i produksjon?',
        required: true,
        options: [
          { label: '0', value: '0' },
          { label: '1–5', value: '1-5' },
          { label: '6–10', value: '6-10' },
          { label: '11–50', value: '11-50' },
          { label: '51–100', value: '51-100' },
          { label: '100+', value: '100+' },
          { label: 'Vet ikke', value: 'unknown' },
        ],
      },
      {
        id: `${t}-q25-ai-platform`,
        type: 'radio',
        title:
          'Har organisasjonen din en KI-plattform (felles tjenester for å bygge og kjøre KI-funksjonalitet)?',
        required: true,
        options: [
          { label: 'Ja', value: 'yes' },
          { label: 'Nei', value: 'no', skipToSection: `${t}-governance` },
          {
            label: 'Vet ikke',
            value: 'unknown',
            skipToSection: `${t}-governance`,
          },
        ],
      },
    ],
  },
  {
    id: `${t}-ai-platform-owner`,
    title: 'Plattformen som leverandør av KI',
    questions: [
      {
        id: `${t}-q26-ai-platform-owner`,
        type: 'radio',
        title: 'Hvem eier KI-plattformen i organisasjonen?',
        required: true,
        options: [
          { label: 'Plattformteamet', value: 'platform-team' },
          { label: 'Et eget KI-team', value: 'ai-team' },
          { label: 'Sentral IT', value: 'central-it' },
          { label: 'Ingen tydelig eier', value: 'no-owner' },
          { label: 'Vet ikke', value: 'unknown' },
          { label: 'Annet', value: 'other', allowOtherText: true },
        ],
      },
    ],
  },
]

const policyQuestion = (t: Track): SurveyQuestion => ({
  id: `${t}-q27-policy`,
  type: 'radio',
  title:
    'Har organisasjonen din retningslinjer eller policy for bruk av KI-kodeverktøy?',
  required: true,
  options: [
    { label: 'Ja, spesifikt for KI-kodeverktøy', value: 'specific' },
    { label: 'Ja, som del av en generell KI-policy', value: 'general' },
    { label: 'Under arbeid', value: 'in-progress' },
    { label: 'Nei', value: 'no' },
    { label: 'Vet ikke', value: 'unknown' },
  ],
})

const barriersQuestion = (t: Track): SurveyQuestion => ({
  id: `${t}-q28-barriers`,
  type: 'checkbox',
  title: 'Hva hindrer deg mest i å bruke KI i utviklings- og plattformarbeid?',
  description: 'Velg de tre viktigste.',
  required: true,
  maxSelections: 3,
  randomizeOptions: true,
  options: [
    {
      label:
        'Personvern og datahåndtering (kildekode sendes til ekstern leverandør)',
      value: 'privacy',
    },
    { label: 'Krav til datalagring i EØS', value: 'eea-storage' },
    {
      label: 'Sikkerhetssårbarheter i KI-generert kode',
      value: 'security',
    },
    {
      label:
        'Immaterielle rettigheter og lisenser (hvem eier KI-generert kode?)',
      value: 'ip',
    },
    { label: 'EUs KI-forordning (AI Act)', value: 'ai-act' },
    {
      label: 'Regelverket for offentlige anskaffelser',
      value: 'procurement',
    },
    { label: 'Kostnad i forhold til nytte', value: 'cost' },
    { label: 'Mangel på kompetanse', value: 'competence' },
    { label: 'Manglende forankring i ledelsen', value: 'leadership' },
    {
      label:
        'Feil og hallusinasjoner (KI-verktøyet genererer kode som ser riktig ut men er feil)',
      value: 'hallucinations',
    },
    {
      label: 'Ingen vesentlige hindre',
      value: 'none',
      exclusive: true,
    },
    {
      label: 'Andre',
      value: 'other',
      allowOtherText: true,
      pinPosition: 'last',
    },
  ],
})

const controlsQuestion = (t: 'p' | 'l'): SurveyQuestion => ({
  id: `${t}-q29-controls`,
  type: 'checkbox',
  title: 'Hvilke kontrolltiltak har plattformen for bruk av KI?',
  required: true,
  options: [
    {
      label: 'Sentral tilgangsstyring til KI-tjenester',
      value: 'access-control',
    },
    { label: 'Logging av forespørsler', value: 'logging' },
    { label: 'Kostnadskontroll per team', value: 'cost-control' },
    { label: 'Filtrering av sensitive data', value: 'data-filtering' },
    {
      label: 'Bare godkjente modeller er tilgjengelige via gateway',
      value: 'approved-models',
    },
    { label: 'Sandkasse for KI-agenter', value: 'agent-sandbox' },
    { label: 'Ingen', value: 'none', exclusive: true },
    { label: 'Vet ikke', value: 'unknown', exclusive: true },
    {
      label: 'Ikke aktuelt (plattformen tilbyr ingen KI-tjenester)',
      value: 'not-applicable',
      exclusive: true,
    },
  ],
})

const governanceSection = (t: Track): SurveySection => ({
  id: `${t}-governance`,
  title: 'Styring, sikkerhet og barrierer',
  questions:
    t === 'a'
      ? [policyQuestion(t), barriersQuestion(t)]
      : [policyQuestion(t), barriersQuestion(t), controlsQuestion(t)],
})

const closingSections = (t: Track): SurveySection[] => [
  {
    id: `${t}-closing`,
    title: 'Avslutning',
    questions: [
      {
        id: `${t}-q30-main-change`,
        type: 'textarea',
        title:
          'Hva er den viktigste endringen KI har ført til hos dere så langt?',
        description:
          'Valgfritt. Skriv kort. Ta gjerne med hvilken ny kompetanse dere trenger på grunn av KI.',
        required: false,
      },
    ],
  },
  {
    id: `${t}-followup`,
    title: 'Oppfølging',
    description:
      'Til slutt — vi planlegger oppfølgingsintervjuer med et lite utvalg deltakere for å utdype funnene. Deltakelse er frivillig og separat fra denne undersøkelsen.',
    questions: [
      {
        id: `${t}-q30b-interview`,
        type: 'radio',
        title:
          'Kan vi kontakte deg for et kort oppfølgingsintervju (ca. 30 min, digitalt)?',
        required: true,
        options: [
          { label: 'Ja', value: 'yes', skipToSection: 'contact' },
          { label: 'Nei', value: 'no', skipToSection: 'end' },
        ],
      },
    ],
  },
]

const platformUseDescription =
  'Med «plattformen» mener vi organisasjonens interne applikasjonsplattform, for eksempel en Kubernetes-plattform eller en intern utviklerportal.'

const platformTrack: SurveySection[] = [
  adoptionSection('p'),
  ...personalSections('p'),
  orgEffectSection('p'),
  {
    id: 'p-team',
    title: 'Effekt på plattformteamet',
    description:
      'Spørsmålene i denne delen handler om plattformteamet ditt. Svar ut fra det du selv ser i teamet.',
    questions: [
      {
        id: 'p-q11-ai-share',
        type: 'radio',
        title:
          'Hvor stor del av plattformteamets arbeid gjør dere med hjelp av KI i dag?',
        description:
          'Anslå grovt. Tenk på hvor stor del av oppgavene teamet løser med hjelp av KI-verktøy.',
        required: true,
        options: [
          { label: 'Ingenting', value: 'none' },
          { label: 'Under 25 %', value: 'under-25' },
          { label: '25–50 %', value: '25-50' },
          { label: 'Over 50 %', value: 'over-50' },
          { label: 'Vet ikke', value: 'unknown' },
        ],
      },
      {
        id: 'p-q12-platform-tasks',
        type: 'checkbox',
        title:
          'Hvilke plattformoppgaver gjør teamet ditt med hjelp av KI i dag?',
        required: true,
        options: [
          { label: 'Kubernetes-manifester og Helm-charts', value: 'k8s' },
          {
            label: 'Terraform og annen infrastruktur som kode',
            value: 'iac',
          },
          { label: 'CI/CD-pipelines', value: 'cicd' },
          {
            label: 'Oppgradering av plattformkomponenter',
            value: 'upgrades',
          },
          { label: 'Brukerstøtte til applikasjonsteam', value: 'support' },
          { label: 'Policyer (f.eks. OPA, Kyverno)', value: 'policies' },
          {
            label: 'Hendelseshåndtering (incident response)',
            value: 'incidents',
          },
          { label: 'Dokumentasjon', value: 'docs' },
          { label: 'Overvåking og varsling', value: 'observability' },
          { label: 'Ingen', value: 'none', exclusive: true },
          { label: 'Annet', value: 'other', allowOtherText: true },
        ],
      },
      {
        id: 'p-q13a-demand-change',
        type: 'radio',
        title:
          'Hvordan har etterspørselen fra applikasjonsteamene etter plattformtjenester endret seg de siste 12 månedene?',
        required: true,
        options: [
          { label: 'Mye lavere', value: 'much-lower' },
          { label: 'Noe lavere', value: 'lower' },
          {
            label: 'Uendret',
            value: 'unchanged',
            skipToSection: 'p-team-changes',
          },
          { label: 'Noe høyere', value: 'higher' },
          { label: 'Mye høyere', value: 'much-higher' },
          {
            label: 'Vet ikke',
            value: 'unknown',
            skipToSection: 'p-team-changes',
          },
        ],
      },
    ],
  },
  {
    id: 'p-demand-cause',
    title: 'Effekt på plattformteamet',
    questions: [
      attribution(
        'p-q13b-demand-cause',
        'I hvilken grad skyldes endringen KI?'
      ),
    ],
  },
  {
    id: 'p-team-changes',
    title: 'Effekt på plattformteamet',
    questions: [
      {
        id: 'p-q14a-team-size',
        type: 'radio',
        title:
          'Har plattformteamet blitt større eller mindre de siste 12 månedene?',
        required: true,
        options: [
          { label: 'Mindre', value: 'smaller' },
          { label: 'Uendret', value: 'unchanged' },
          { label: 'Større', value: 'larger' },
          { label: 'Vet ikke', value: 'unknown' },
        ],
      },
      {
        id: 'p-q14b-new-roles',
        type: 'radio',
        title:
          'Har teamet fått nye roller eller stillinger knyttet til KI (f.eks. KI-ingeniør, MLOps)?',
        required: true,
        options: [
          { label: 'Ja', value: 'yes', allowOtherText: true },
          { label: 'Nei', value: 'no' },
          { label: 'Vet ikke', value: 'unknown' },
        ],
      },
      // TODO(engine): instrument shows Q14c only if Q14a = Mindre/Større or Q14b = Ja.
      {
        ...attribution(
          'p-q14c-team-change-cause',
          'I hvilken grad skyldes disse endringene KI?'
        ),
        required: false,
      },
    ],
  },
  {
    id: 'p-platform-use',
    title: 'Effekt på applikasjonsteam og plattformbruk',
    description: platformUseDescription,
    questions: [
      {
        id: 'p-q16-support-volume',
        type: 'radio',
        title:
          'Hvordan har antallet henvendelser til plattformteamet om brukerstøtte endret seg de siste 12 månedene?',
        required: true,
        options: [
          { label: 'Mye færre', value: 'much-fewer' },
          { label: 'Noe færre', value: 'fewer' },
          { label: 'Uendret', value: 'unchanged' },
          { label: 'Noe flere', value: 'more' },
          { label: 'Mye flere', value: 'much-more' },
          { label: 'Vet ikke', value: 'unknown' },
        ],
      },
      {
        id: 'p-q17-support-type',
        type: 'checkbox',
        title: 'Har KI endret hva slags henvendelser plattformteamet får?',
        required: true,
        options: [
          {
            label: 'Flere feil i KI-generert konfigurasjon eller kode',
            value: 'more-ai-errors',
          },
          {
            label: 'Færre spørsmål om dokumentasjon',
            value: 'fewer-docs-questions',
          },
          { label: 'Mer komplekse spørsmål', value: 'more-complex' },
          {
            label: 'Flere henvendelser om KI-verktøy og KI-tjenester',
            value: 'more-ai-requests',
          },
          {
            label: 'Ingen merkbar endring',
            value: 'no-change',
            exclusive: true,
          },
          { label: 'Vet ikke', value: 'unknown', exclusive: true },
          { label: 'Annet', value: 'other', allowOtherText: true },
        ],
      },
      {
        id: 'p-q18-app-teams-ai',
        type: 'radio',
        title:
          'Hvor mange av applikasjonsteamene bruker KI-verktøy når de jobber med plattformen (f.eks. for å generere konfigurasjon eller forstå dokumentasjonen)?',
        required: true,
        options: [
          { label: 'Ingen', value: 'none' },
          { label: 'Noen', value: 'some' },
          { label: 'De fleste', value: 'most' },
          { label: 'Alle', value: 'all' },
          { label: 'Vet ikke', value: 'unknown' },
        ],
      },
      {
        id: 'p-q19-agent-readiness',
        type: 'checkbox',
        title:
          'Hva har dere gjort for at KI-agenter skal kunne bruke plattformen?',
        required: true,
        options: [
          { label: 'MCP-server for plattformen', value: 'mcp-server' },
          {
            label: 'Maskinlesbar dokumentasjon (f.eks. llms.txt)',
            value: 'llms-txt',
          },
          {
            label: 'Agentinstruksjoner i maler (AGENTS.md o.l.)',
            value: 'agents-md',
          },
          { label: 'API-er dokumentert for agentbruk', value: 'api-docs' },
          {
            label:
              'Egne KI-verktøy eller skills for utviklerne (Copilot extensions, Claude skills o.l.)',
            value: 'skills',
          },
          { label: 'Flere tiltak er planlagt', value: 'more-planned' },
          {
            label: 'Ingenting ennå, men det er planlagt',
            value: 'planned',
            exclusive: true,
          },
          { label: 'Ingenting', value: 'nothing', exclusive: true },
          { label: 'Vet ikke', value: 'unknown', exclusive: true },
          { label: 'Annet', value: 'other', allowOtherText: true },
        ],
      },
    ],
  },
  ...aiServicesSections('p'),
  governanceSection('p'),
  ...closingSections('p'),
]

const deployFrequencyOptions: QuestionOption[] = [
  { label: 'Flere ganger om dagen', value: 'multiple-daily' },
  { label: 'Daglig', value: 'daily' },
  { label: 'Ukentlig', value: 'weekly' },
  { label: 'Månedlig', value: 'monthly' },
  { label: 'Sjeldnere enn månedlig', value: 'less-than-monthly' },
  { label: 'Vet ikke', value: 'unknown' },
]

const appTrack: SurveySection[] = [
  adoptionSection('a'),
  ...personalSections('a'),
  orgEffectSection('a'),
  {
    id: 'a-platform-use',
    title: 'Effekt på applikasjonsteam og plattformbruk',
    description: platformUseDescription,
    questions: [
      {
        id: 'a-q18a-platform-ai',
        type: 'radio',
        title:
          'Bruker du KI-verktøy når du jobber med plattformen, for eksempel for å sette opp, konfigurere eller feilsøke?',
        required: true,
        options: [
          { label: 'Ja', value: 'yes' },
          { label: 'Nei', value: 'no', skipToSection: 'a-delivery' },
          {
            label: 'Vi har ingen plattform',
            value: 'no-platform',
            skipToSection: 'a-delivery',
          },
        ],
      },
    ],
  },
  {
    id: 'a-platform-use-how',
    title: 'Effekt på applikasjonsteam og plattformbruk',
    questions: [
      {
        id: 'a-q18b-platform-ai-how',
        type: 'checkbox',
        title: 'Hvordan?',
        required: true,
        options: [
          { label: 'Generere konfigurasjon', value: 'config' },
          {
            label: 'Forstå plattformdokumentasjonen',
            value: 'docs',
          },
          { label: 'Feilsøke bygg og utrulling', value: 'debug-deploy' },
          {
            label: 'La en KI-agent bruke plattformens API eller MCP-server',
            value: 'agent-api',
          },
          { label: 'Annet', value: 'other', allowOtherText: true },
        ],
      },
    ],
  },
  {
    id: 'a-delivery',
    title: 'Effekt på applikasjonsteam og plattformbruk',
    questions: [
      {
        id: 'a-q20-deploy-now',
        type: 'radio',
        title: 'Hvor ofte setter teamet ditt kode i produksjon i dag?',
        required: true,
        options: deployFrequencyOptions,
      },
      {
        id: 'a-q20-deploy-12m',
        type: 'radio',
        title:
          'Hvor ofte satte teamet ditt kode i produksjon for 12 måneder siden?',
        description:
          'Svar «Vet ikke» for 12 måneder siden hvis du ikke var i teamet da.',
        required: true,
        options: deployFrequencyOptions,
      },
      // TODO(engine): instrument shows this only if the two answers differ and neither is Vet ikke.
      {
        ...attribution(
          'a-q20-deploy-change-cause',
          'I hvilken grad skyldes endringen KI?'
        ),
        required: false,
      },
      {
        id: 'a-q21-effects',
        type: 'checkbox',
        title: 'Hvilke effekter av KI-generert kode har teamet ditt merket?',
        required: true,
        randomizeOptions: true,
        options: [
          { label: 'Raskere levering', value: 'faster-delivery' },
          { label: 'Bedre testdekning', value: 'better-tests' },
          { label: 'Bedre dokumentasjon', value: 'better-docs' },
          { label: 'Flere feil i produksjon', value: 'more-prod-bugs' },
          {
            label: 'Mer arbeid med kodegjennomgang',
            value: 'more-review',
          },
          {
            label: 'Flere sikkerhetssårbarheter',
            value: 'more-vulns',
          },
          {
            label:
              'Kode som avviker fra plattformens anbefalte standardløsninger (golden paths)',
            value: 'golden-path-drift',
          },
          { label: 'Mer teknisk gjeld', value: 'tech-debt' },
          {
            label: 'Dårligere forståelse av egen kode',
            value: 'less-understanding',
          },
          {
            label: 'Ingen merkbare effekter',
            value: 'none',
            exclusive: true,
          },
          {
            label: 'Vet ikke / vi måler ikke dette',
            value: 'unknown',
            exclusive: true,
          },
          {
            label: 'Annet',
            value: 'other',
            allowOtherText: true,
            pinPosition: 'last',
          },
        ],
      },
    ],
  },
  governanceSection('a'),
  ...closingSections('a'),
]

const leadTrack: SurveySection[] = [
  adoptionSection('l'),
  orgEffectSection('l'),
  ...aiServicesSections('l'),
  governanceSection('l'),
  ...closingSections('l'),
]

const routeQuestion = (id: string, noTarget: string): SurveyQuestion => ({
  id,
  type: 'radio',
  title: 'Jobber du i et plattformteam?',
  required: true,
  options: [
    { ...yesNo[0]!, skipToSection: 'p-adoption' },
    { ...yesNo[1]!, skipToSection: noTarget },
  ],
})

export const platformsAi2026: SurveyDefinition = {
  slug: 'platforms-ai-2026',
  version: 1,
  title: 'State of Platforms — KI-oppfølging',
  owners: [
    {
      name: 'Hans Kristian Flaatten',
      org: 'Nav',
      url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY',
    },
  ],
  organizationQuestionId: 'q1-org',
  sensitiveQuestionIds: ['q31-email'],
  description:
    'Vi kartlegger hvordan KI påvirker plattformteam og applikasjonsteam i norsk offentlig sektor.',
  consent: {
    aboutText:
      'Vi kartlegger hvordan KI påvirker plattformteam og applikasjonsteam i norsk offentlig sektor: hvilke KI-verktøy som brukes, hvordan arbeidet endrer seg, og hva plattformene tilbyr. Undersøkelsen er en oppfølging av State of Platforms 2025–2026 og tar 10 til 13 minutter.',
    dataCollectionText:
      'Vi samler inn svar om organisasjonens og din egen bruk av KI-verktøy, hvordan plattformen støtter KI, og hva som hindrer bruk. Vi spør om organisasjonsnavn av to grunner: for å slå sammen flere svar fra samme organisasjon, og for å koble svarene dine til organisasjonens svar i State of Platforms 2025–2026 (runde 2). Organisasjonen din vil ikke bli navngitt i publikasjoner. Hvis du vil delta i et oppfølgingsintervju, ber vi om e-postadresse. Den lagres separat fra svarene dine.',
    // TODO: instrument says «Svarene lagres i Google Forms», but this survey
    // stores answers on offentlig-paas.no. Fix in the instrument and here
    // before opening.
    privacyText:
      'Behandlingsgrunnlaget er samtykke (GDPR art. 6 nr. 1 bokstav a). Ingen enkeltpersoner eller organisasjoner vil bli identifisert i publikasjoner. Svarene lagres i Google Forms. Vi beholder svar koblet til organisasjonsnavn til runde 3 av State of Platforms er analysert, men ikke lenger enn til 31.12.2027. Deretter erstatter vi organisasjonsnavnet med et pseudonym. Det pseudonymiserte datasettet slettes senest to år etter at studien er avsluttet. E-postadresser til intervju slettes når intervjuene er gjennomført, og senest 31.12.2027. Resultater publiseres bare i sammenstilt form, på offentlig-paas.no og i akademiske tidsskrifter eller på konferanser.',
  },
  status: SurveyStatus.Draft,
  sections: [
    {
      id: 'background',
      title: 'Bakgrunn',
      questions: [
        {
          id: 'q1-org',
          type: 'typeahead',
          title: 'Hvilken organisasjon tilhører du?',
          required: true,
          placeholder: 'Begynn å skrive for å se forslag...',
          suggestions: orgSuggestions,
          visualization: 'hidden',
        },
        {
          id: 'q2-role',
          type: 'radio',
          title: 'Hva er din primærrolle?',
          required: true,
          options: [
            { label: 'Utvikler / ingeniør', value: 'developer' },
            { label: 'Tech lead / arkitekt', value: 'tech-lead' },
            { label: 'Teamleder', value: 'team-lead' },
            {
              label: 'Plattformteamleder / plattformutvikler',
              value: 'platform',
            },
            {
              label: 'Applikasjonsutvikler / applikasjonsteam',
              value: 'app-team',
            },
            {
              label: 'IT-leder / CTO / IT-direktør',
              value: 'cto',
              skipToSection: 'route-lead',
            },
            {
              label: 'Leder (ikke-teknisk)',
              value: 'non-tech-leader',
              skipToSection: 'route-lead',
            },
            {
              label: 'Annet',
              value: 'other',
              allowOtherText: true,
              skipToSection: 'route-lead',
            },
          ],
        },
        {
          id: 'q3-sop-respondent',
          type: 'radio',
          title: 'Svarte du på State of Platforms 2025–2026?',
          description:
            'Undersøkelsen om applikasjonsplattformer i offentlig sektor som Offentlig PAAS gjennomførte vinteren 2025–2026. Svar for deg selv, ikke for organisasjonen.',
          required: true,
          options: [...yesNo, { label: 'Vet ikke', value: 'unknown' }],
        },
      ],
    },
    {
      id: 'route-team',
      title: 'Bakgrunn',
      questions: [routeQuestion('q2b-platform-team', 'a-adoption')],
    },
    {
      id: 'route-lead',
      title: 'Bakgrunn',
      questions: [routeQuestion('q2b-platform-team-lead', 'l-adoption')],
    },
    ...platformTrack,
    ...appTrack,
    ...leadTrack,
    {
      id: 'contact',
      title: 'Kontaktinformasjon for intervju',
      questions: [
        {
          id: 'q31-email',
          type: 'text',
          title: 'Oppgi e-postadresse for oppfølging',
          description:
            'E-postadressen kobles ikke til dine svar i undersøkelsen. Den brukes kun til å ta kontakt om intervju.',
          required: false,
          format: 'email',
        },
      ],
    },
  ],
}
