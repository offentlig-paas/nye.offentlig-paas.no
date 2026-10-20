import type {
  QuestionCondition,
  QuestionOption,
  SurveyDefinition,
} from '@/lib/surveys/types'
import { SurveyStatus } from '@/lib/surveys/types'
import { members } from '@/data/members'

/**
 * State of AI Agents, Wave 2. Source of truth:
 * offentlig-paas/forskning projects/state-of-ai-agents/survey/instrument-wave2.md
 *
 * Question IDs follow the Wave 2 numbering in the instrument. Option values
 * are the instrument codes.
 */

const orgSuggestions = members.map(m => m.name).sort()

const confidence: QuestionOption[] = [
  {
    label: 'Jeg vet dette sikkert (f.eks. er involvert i beslutningen)',
    value: 'certain',
  },
  {
    label: 'Ganske sikker basert på det jeg har sett',
    value: 'fairly-sure',
  },
  { label: 'Dette er mitt beste estimat', value: 'estimate' },
]

/** Shared tool list for Q6 and Q9. */
const tools: QuestionOption[] = [
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
    label: 'Intern KI-plattform eller egendriftet språkmodell',
    value: 'internal-platform',
  },
  {
    label: 'KI-verktøy for kodegjennomgang (f.eks. CodeRabbit)',
    value: 'code-review-ai',
  },
]

const otherTool: QuestionOption = {
  label: 'Andre (spesifiser)',
  value: 'other',
  allowOtherText: true,
  pinPosition: 'last',
}

const usesTools: QuestionCondition[] = [
  { questionId: 'q8-personal-use', anyOf: ['yes'] },
]
const usesAgents: QuestionCondition[] = [
  ...usesTools,
  { questionId: 'q10b-agent-production', noneOf: ['no-agents'] },
]

export const aiAgents2027: SurveyDefinition = {
  slug: 'ai-agents-2027',
  version: 4,
  title: 'KI-kodeverktøy og kodeagenter i norsk offentlig sektor, runde 2',
  estimatedMinutes: '10',
  comparesTo: {
    slug: 'ai-agents-2026',
    // Same wording and option values in both waves. Checkbox questions that
    // gained options in wave 2 (q6, q9, q11, q20) are left out: new choices
    // shift the shares, so the change would not be comparable. Role is left
    // out too: the wave 1 open dataset, which the frozen results come from,
    // only publishes three role groups.
    questionMap: {
      'q4-dev-count': 'q3-dev-count',
      'q5-adoption-level': 'q5-adoption-level',
      'q8-personal-use': 'q8-personal-use',
      'q10-usage-modes': 'q9-usage-modes',
      'q12-frequency': 'q11-frequency',
      'q14-policy': 'q12-policy',
      'q15-support': 'q13-support',
      'q16-decision-authority': 'q14-decision-authority',
      'q17-data-sovereignty': 'q15-data-sovereignty',
      'q18-measurement': 'q16-measurement',
      'q19-code-review': 'q17-code-review',
      'q22-trust': 'q20-trust',
      'q23-perception-gap': 'q21-perception-gap',
    },
  },
  owners: [
    {
      name: 'Hans Kristian Flaatten',
      org: 'Nav',
      url: 'https://offentlig-paas-no.slack.com/team/U7DQV0KUY',
    },
  ],
  researchers: [
    {
      name: 'Anders Olsen Sandvik',
      url: 'https://offentlig-paas-no.slack.com/team/U071L6QLNAZ',
    },
  ],
  organizationQuestionId: 'q1-org',
  sensitiveQuestionIds: ['q24-email', 'q24-later-rounds'],
  description:
    'Offentlig PAAS gjennomfører denne undersøkelsen for å kartlegge hvordan KI-kodeverktøy og kodeagenter brukes, styres og oppleves i norsk offentlig sektor. Dette er runde 2.',
  consent: {
    dataCollectionText:
      'Vi samler inn svar om din og virksomhetens bruk av KI-kodeverktøy, styring og bekymringer.',
    checkboxLabel:
      'Jeg har lest informasjonen over og samtykker til at svarene mine brukes som beskrevet.',
    fullText: [
      '**Om undersøkelsen**\nOffentlig PAAS gjennomfører denne undersøkelsen for å kartlegge hvordan KI-kodeverktøy og kodeagenter brukes, styres og oppleves i norsk offentlig sektor. Dette er runde 2. Første runde ble gjennomført våren 2026 med 115 deltakere fra 57 virksomheter. Undersøkelsen tar rundt 10 minutter.',
      'Du kan delta enten du deltok i første runde eller ikke, og enten du bruker KI-kodeverktøy eller ikke. Svar fra deg som ikke bruker slike verktøy er like viktige.',
      '**Begreper**\n- **KI-kodeverktøy:** Verktøy som bruker språkmodeller til å hjelpe med programmering, feilsøking, testing eller dokumentasjon (f.eks. GitHub Copilot, Claude Code, Cursor, ChatGPT eller Claude i nettleseren, interne KI-assistenter).\n- **Kodeagent:** Verktøy som planlegger og utfører oppgaver i flere steg selv, for eksempel leser og endrer flere filer, kjører kommandoer og tester, og retter egne feil (f.eks. Claude Code, Copilot Agent Mode, Cursor Agent, Codex, OpenCode).',
      '**Hvem er ansvarlig?**\nBehandlingsansvarlig er foreningen Offentlig PAAS. Kontaktperson er styreleder, kontakt@offentlig-paas.no.',
      '**Hva samler vi inn, og hvorfor?**\nVi samler inn svar om din og virksomhetens bruk av KI-kodeverktøy, styring og bekymringer. Vi spør hvilken virksomhet du jobber i, for å kunne slå sammen svar fra samme virksomhet og sammenligne med første runde. Hvis du vil delta i et oppfølgingsintervju, ber vi om e-postadressen din. Da kan du også be om å bli kontaktet om senere runder av undersøkelsen.',
      '**Behandlingsgrunnlag**\nVi behandler opplysningene på grunnlag av ditt samtykke (GDPR art. 6 nr. 1 bokstav a).',
      '**Hva publiserer vi?**\nVi publiserer sammenstilte resultater (andeler, antall og statistiske tester). Vi kan også publisere et anonymisert datasett med ett svar per rad i et åpent repositorium. Datasettet har ikke virksomhetsnavn eller e-postadresser. Virksomhetskode er bare med for virksomheter med minst fem svar; de andre får felleskoden «Org-annen». Rollen oppgis som «annen» der færre enn fem personer fra samme virksomhet har den rollen. Størrelsen på utviklingsmiljøet oppgis i grupper: 1–50, 51–200, over 200, «ingen utviklere» og «vet ikke». Hver virksomhet får én størrelsesgruppe: den størrelsesgruppen som over halvparten av svarene fra virksomheten oppgir, ellers «vet ikke». Fritekst er gjennomgått og renset for opplysninger som kan identifisere noen. Virksomhetsnavn og de opprinnelige svarene publiseres ikke. Ingen personer eller virksomheter blir navngitt.',
      '**Risiko for gjenkjenning**\nI små virksomheter, eller der få personer har en bestemt rolle, kan kombinasjonen av virksomhet, rolle og svar i teorien peke ut en person. Derfor fjerner vi virksomhetsnavn, gir virksomheter med færre enn fem svar felleskoden «Org-annen», oppgir rollen som «annen» der færre enn fem fra samme virksomhet har den, og oppgir størrelsen på utviklingsmiljøet bare i grove grupper før svar på radnivå publiseres, og vi rapporterer ikke tall for grupper med færre enn fem svar.',
      '**Lagring**\nSvarene samles inn i et eget skjema på offentlig-paas.no. Vercel (drift av nettstedet) og Sanity (lagring av svarene) er databehandlere, og svarene lagres i EU/EØS. Leverandørene kan være underlagt amerikansk lov. Eventuelle overføringer sikres etter GDPR kapittel V, gjennom EU–US Data Privacy Framework eller EUs standard personvernbestemmelser. Med studien menes det langsiktige forskningsprogrammet, der undersøkelsen gjentas i flere bølger (runder). De opprinnelige svarene slettes senest to år etter siste bølge i studien. Virksomhetsnavn erstattes med koder (Org-A, Org-B osv.) før analyse. Koblingstabellen mellom navn og kode lagres adskilt fra svarene, bare forskerne har tilgang, og den slettes sammen med svarene. E-postadresser lagres adskilt fra svarene. Adresser som bare er gitt for intervju, slettes når intervjuene er gjennomført, senest etter 24 måneder. Adresser som også er gitt for kontakt om senere runder, slettes senest to år etter siste bølge i studien, eller tidligere hvis du trekker samtykket.',
      '**Dine rettigheter**\nDu kan be om innsyn i, retting og sletting av opplysningene dine, be om begrenset behandling og be om å få utlevert dem i et maskinlesbart format (dataportabilitet). Du kan trekke samtykket når som helst ved å kontakte oss. Fordi svarene ikke er knyttet til navn eller e-post, må du oppgi virksomhet, tidspunkt og gjerne noen av svarene dine for at vi skal finne dem. Svar som allerede inngår i publiserte resultater eller i det publiserte anonymiserte datasettet, kan ikke trekkes ut av disse. Offentlig PAAS har ikke personvernombud. Spørsmål om personvern rettes til kontaktpersonen over. Du kan klage til Datatilsynet.',
      '**Frivillig deltakelse**\nDet er frivillig å delta, og du kan avslutte når som helst uten å oppgi grunn.',
    ].join('\n\n'),
  },
  thankYouMessage:
    'Takk for at du tok deg tid til å svare! Resultatene publiseres av Offentlig PAAS. Har du spørsmål, kontakt oss på kontakt@offentlig-paas.no.',
  status: SurveyStatus.Open,
  resultsConfig: {
    published: false,
    heroText:
      'Resultater fra andre runde av kartleggingen av KI-kodeverktøy og kodeagenter i norsk offentlig sektor.',
    methodologyNote:
      'Undersøkelsen er distribuert gjennom Offentlig PAAS Slack, LinkedIn og arrangementer. Utvalget er selvselektert og ikke representativt for hele offentlig sektor. Organisasjoner med flere respondenter teller én gang i organisasjonsstatistikken.',
  },
  sections: [
    {
      id: 'context',
      title: 'Kontekst og bakgrunn',
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
          id: 'q1b-wave1',
          type: 'radio',
          title: 'Svarte du på første runde av denne undersøkelsen våren 2026?',
          required: true,
          options: [
            { label: 'Ja', value: 'yes' },
            { label: 'Nei', value: 'no' },
            { label: 'Husker ikke / usikker', value: 'unsure' },
          ],
        },
        {
          id: 'q2-source',
          type: 'radio',
          title: 'Hvor hørte du om denne undersøkelsen?',
          required: false,
          options: [
            { label: 'Offentlig PAAS Slack', value: 'slack' },
            {
              label: 'Kollega eller intern kanal i egen virksomhet',
              value: 'colleague',
            },
            {
              label: 'Fagdag eller arrangement i Offentlig PAAS',
              value: 'fagdag',
            },
            { label: 'LinkedIn eller andre sosiale medier', value: 'social' },
            { label: 'Direkte invitasjon på e-post', value: 'direct' },
            { label: 'Annet', value: 'other' },
          ],
        },
        {
          id: 'q3-role',
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
            { label: 'IT-leder / CTO / IT-direktør', value: 'cto' },
            { label: 'Leder (ikke-teknisk)', value: 'non-tech-leader' },
            {
              label: 'Annet (spesifiser)',
              value: 'other',
              allowOtherText: true,
            },
          ],
        },
        {
          id: 'q4-dev-count',
          type: 'radio',
          title:
            'Omtrent hvor mange utviklere og teknisk personell har organisasjonen din?',
          description:
            'Inkluder både fast ansatte og innleide konsulenter som skriver eller vedlikeholder kode for organisasjonen. Totalantall ansatte i organisasjonen hentes fra offentlige registre.',
          required: true,
          options: [
            {
              label: 'Ingen — vi har ikke utviklere',
              value: 'none',
              skipToSection: 'end',
            },
            { label: '1–10', value: '1-10' },
            { label: '11–50', value: '11-50' },
            { label: '51–200', value: '51-200' },
            { label: 'Flere enn 200', value: '200+' },
            { label: 'Vet ikke', value: 'unknown' },
          ],
        },
      ],
    },
    {
      id: 'adoption-org',
      title: 'Adopsjon på organisasjonsnivå',
      description:
        'I denne delen spør vi om organisasjonens bruk av KI-kodeverktøy. Svar basert på det du vet om organisasjonen som helhet. Det er helt greit å svare «vet ikke».\n\nMed «KI-kodeverktøy» mener vi verktøy som hjelper utviklere med å skrive, forstå eller endre kode ved hjelp av kunstig intelligens — for eksempel GitHub Copilot, Cursor, Claude Code, Amazon Q, eller lignende.',
      questions: [
        {
          id: 'q5-adoption-level',
          type: 'radio',
          title:
            'Hva beskriver best organisasjonens bruk av KI-kodeverktøy i dag?',
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
              label:
                'De fleste utviklere har tilgang til og bruker KI-kodeverktøy',
              value: 'most-developers',
            },
            { label: 'Vet ikke', value: 'unknown' },
          ],
        },
        {
          id: 'q5b-confidence',
          type: 'radio',
          title: 'Hvor sikker er du på svaret over?',
          required: true,
          layout: 'inline',
          options: confidence,
        },
        {
          id: 'q6-approved-tools',
          type: 'checkbox',
          title:
            'Hvilke KI-kodeverktøy er offisielt godkjent eller anskaffet i organisasjonen din?',
          required: true,
          randomizeOptions: true,
          options: [
            ...tools,
            {
              label: 'Ingen offisielt godkjente verktøy',
              value: 'none',
              exclusive: true,
              pinPosition: 'last',
            },
            {
              label: 'Vet ikke',
              value: 'unknown',
              exclusive: true,
              pinPosition: 'last',
            },
            otherTool,
          ],
        },
        {
          id: 'q6b-confidence',
          type: 'radio',
          title: 'Hvor sikker er du på svaret over?',
          required: true,
          layout: 'inline',
          options: confidence,
        },
      ],
    },
    {
      id: 'personal-usage',
      title: 'Personlig bruk og agentiske arbeidsflyter',
      description:
        'Nå spør vi om din egen bruk av KI-kodeverktøy — uavhengig av hva organisasjonen offisielt tilbyr.',
      questions: [
        {
          id: 'q8-personal-use',
          type: 'radio',
          title: 'Bruker du KI-kodeverktøy?',
          required: true,
          options: [
            { label: 'Ja', value: 'yes' },
            { label: 'Nei', value: 'no' },
          ],
        },
        {
          id: 'q8-why-not',
          type: 'checkbox',
          title:
            'Hvorfor bruker du ikke KI-kodeverktøy i arbeidet ditt? (Velg alle som passer)',
          required: false,
          showIf: [{ questionId: 'q8-personal-use', anyOf: ['no'] }],
          options: [
            {
              label: 'Jeg koder lite eller ikke i rollen min',
              value: 'role-no-code',
            },
            {
              label: 'Det er ikke tillatt eller ikke avklart i organisasjonen',
              value: 'not-allowed',
            },
            {
              label: 'Jeg har ikke fått tilgang eller lisens',
              value: 'no-access',
            },
            {
              label:
                'Bekymring for personvern, sikkerhet eller at kildekode kommer på avveie',
              value: 'privacy-security',
            },
            {
              label:
                'Koden er for dårlig, eller det tar lengre tid å kontrollere enn å skrive selv',
              value: 'quality-trust',
            },
            {
              label:
                'Jeg vil skrive koden selv for å beholde oversikt og ferdigheter',
              value: 'skill-preference',
            },
            {
              label: 'Annet (spesifiser)',
              value: 'other',
              allowOtherText: true,
            },
          ],
        },
        {
          id: 'q9-personal-tools',
          type: 'checkbox',
          title: 'Hvilke KI-kodeverktøy bruker du?',
          required: true,
          showIf: usesTools,
          randomizeOptions: true,
          options: [...tools, otherTool],
        },
        {
          id: 'q10-usage-modes',
          type: 'checkbox',
          title: 'Hvilke måter bruker du KI-kodeverktøy på?',
          required: true,
          showIf: usesTools,
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
          ],
        },
        {
          id: 'q10b-agent-production',
          type: 'radio',
          title:
            'Hvor ofte bruker du kodeagenter (lokalt eller i skyen) i arbeid med produksjonskode?',
          description:
            'Velg «Jeg jobber ikke med produksjonskode» hvis det gjelder deg, uansett agentbruk.',
          required: true,
          showIf: usesTools,
          options: [
            {
              label: 'Jeg jobber ikke med produksjonskode',
              value: 'no-prod-code',
            },
            { label: 'Jeg bruker ikke kodeagenter', value: 'no-agents' },
            {
              label:
                'Bare til utprøving, prototyper, skript eller læring, ikke i produksjonskode',
              value: 'experimental-only',
            },
            {
              label: 'Av og til i produksjonskode, til avgrensede oppgaver',
              value: 'occasional-prod',
            },
            {
              label: 'Fast, som en vanlig del av arbeidet med produksjonskode',
              value: 'regular-prod',
            },
          ],
        },
        {
          id: 'q11-integrations',
          type: 'checkbox',
          title: 'Har du koblet KI-kodeverktøyet ditt til andre systemer?',
          description:
            'Noen KI-verktøy kan kobles til eksterne systemer via integrasjoner (f.eks. MCP-servere eller innebygde integrasjoner). Velg alle som gjelder.',
          required: true,
          showIf: usesTools,
          options: [
            {
              label: 'Nei, jeg bruker bare kodegenerering og chat',
              value: 'none',
              exclusive: true,
            },
            {
              label: 'Kodeadministrasjon (f.eks. GitHub, GitLab)',
              value: 'scm',
            },
            {
              label: 'Oppgavehåndtering (f.eks. Jira, Linear, Azure Boards)',
              value: 'project-mgmt',
            },
            { label: 'CI/CD (f.eks. GitHub Actions, Jenkins)', value: 'cicd' },
            {
              label: 'Infrastruktur og drift (f.eks. Kubernetes, Terraform)',
              value: 'infra',
            },
            {
              label: 'Overvåking og logger (f.eks. Grafana, Datadog)',
              value: 'monitoring',
            },
            {
              label: 'Kommunikasjon (f.eks. Slack, Teams)',
              value: 'communication',
            },
            {
              label: 'Vet ikke hva dette betyr',
              value: 'dont-understand',
              exclusive: true,
            },
            {
              label: 'Andre (spesifiser)',
              value: 'other',
              allowOtherText: true,
            },
          ],
        },
        {
          id: 'q12-frequency',
          type: 'radio',
          title: 'Hvor ofte bruker du KI-kodeverktøy i arbeidet ditt?',
          required: true,
          showIf: usesTools,
          options: [
            { label: 'Daglig', value: 'daily' },
            { label: 'Flere ganger i uken', value: 'several-weekly' },
            { label: 'Ukentlig', value: 'weekly' },
            { label: 'Noen ganger i måneden', value: 'monthly' },
            { label: 'Sjelden eller aldri', value: 'rarely' },
          ],
        },
      ],
    },
    {
      id: 'governance',
      title: 'Styring og organisatorisk støtte',
      description:
        'I denne delen spør vi om hvordan organisasjonen din styrer og støtter bruken av KI-kodeverktøy. Svar basert på det du vet — det er helt greit å svare «vet ikke».',
      questions: [
        {
          id: 'q14-policy',
          type: 'radio',
          title:
            'Har organisasjonen din retningslinjer eller policy for bruk av KI-kodeverktøy?',
          required: true,
          options: [
            { label: 'Ja, spesifikt for KI-kodeverktøy', value: 'specific' },
            { label: 'Ja, som del av en generell KI-policy', value: 'general' },
            { label: 'Nei', value: 'no' },
            { label: 'Vet ikke', value: 'unknown' },
          ],
        },
        {
          id: 'q14b-confidence',
          type: 'radio',
          title: 'Hvor sikker er du på svaret over?',
          required: true,
          layout: 'inline',
          options: confidence,
        },
        {
          id: 'q15-support',
          type: 'radio',
          title:
            'Hvordan støtter organisasjonen din utviklere i bruk av KI-kodeverktøy?',
          required: true,
          options: [
            { label: 'Ingen støtte eller opplæring', value: 'none' },
            {
              label: 'Uformell kunnskapsdeling mellom utviklere',
              value: 'informal',
            },
            {
              label:
                'Delte ressurser eller retningslinjer er tilgjengelige (f.eks. wiki, beste praksis)',
              value: 'shared-resources',
            },
            { label: 'Organisert opplæring eller kurs', value: 'training' },
            {
              label:
                'Strukturert program (f.eks. champions-nettverk, dedikerte ressurspersoner, tilbakemeldingsrutiner)',
              value: 'structured',
            },
            { label: 'Vet ikke', value: 'unknown' },
          ],
        },
        {
          id: 'q16-decision-authority',
          type: 'radio',
          title:
            'Hvordan avgjøres det hvilke KI-kodeverktøy utviklere kan bruke?',
          required: true,
          options: [
            {
              label:
                'Sentralt besluttet (f.eks. IT-avdelingen eller ledelsen velger for hele organisasjonen)',
              value: 'central',
            },
            {
              label:
                'Via en godkjenningsprosess (f.eks. risikovurdering/ROS, så kan team eller utviklere foreslå verktøy)',
              value: 'approval-process',
            },
            { label: 'Teamet eller tech lead bestemmer', value: 'team' },
            {
              label: 'Hver enkelt utvikler bestemmer selv',
              value: 'individual',
            },
            {
              label: 'Ingen har eksplisitt bestemt dette',
              value: 'undecided',
            },
            { label: 'Vet ikke', value: 'unknown' },
          ],
        },
        {
          id: 'q17-data-sovereignty',
          type: 'radio',
          title:
            'Har organisasjonen din avklart hvilke KI-leverandører som behandler kildekoden deres?',
          description:
            'Når du bruker KI-kodeverktøy, sendes kildekode til en ekstern modell-leverandør (f.eks. OpenAI, Anthropic, Google) for behandling. Noen organisasjoner har avklart dette gjennom databehandleravtaler eller risikovurderinger.',
          required: true,
          options: [
            { label: 'Ja, det er tydelig avklart', value: 'clarified' },
            {
              label: 'Delvis — noe er avklart, men ikke for alle verktøy',
              value: 'partial',
            },
            { label: 'Nei', value: 'no' },
            { label: 'Vet ikke', value: 'unknown' },
          ],
        },
        {
          id: 'q18-measurement',
          type: 'radio',
          title:
            'Hvordan vurderer organisasjonen din effekten av KI-kodeverktøy?',
          description:
            'Velg det høyeste nivået som passer for organisasjonen din. Hvert nivå inkluderer de under.',
          required: true,
          options: [
            { label: 'Vi vurderer ikke effekten', value: 'none' },
            {
              label: 'Uformelle tilbakemeldinger og anekdoter',
              value: 'informal',
            },
            {
              label:
                'Vi følger med på bruksdata fra verktøyleverandøren (f.eks. antall brukere, akseptrate)',
              value: 'vendor-data',
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
          id: 'q19-code-review',
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
              value: 'verbal',
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
    },
    {
      id: 'concerns',
      title: 'Bekymringer og barrierer',
      description:
        'Nå spør vi om dine personlige oppfatninger og bekymringer rundt KI-kodeverktøy.',
      questions: [
        {
          id: 'q20-concerns',
          type: 'checkbox',
          title:
            'Hva er dine viktigste bekymringer knyttet til bruk av KI-kodeverktøy?',
          description: 'Velg de tre viktigste.',
          required: true,
          maxSelections: 3,
          options: [
            {
              label: 'Sikkerhetssårbarheter i KI-generert kode',
              value: 'security',
            },
            { label: 'Kodekvalitet og teknisk gjeld', value: 'code-quality' },
            {
              label:
                'Personvern og datahåndtering (kildekode sendes til ekstern leverandør)',
              value: 'privacy',
            },
            {
              label:
                'Immaterielle rettigheter og lisenser (hvem eier KI-generert kode?)',
              value: 'ip',
            },
            {
              label: 'Tap av kompetanse eller ferdigheter over tid',
              value: 'skill-loss',
            },
            { label: 'Kostnad i forhold til nytte', value: 'cost' },
            {
              label:
                'Feil og hallusinasjoner (KI-verktøyet genererer kode som ser riktig ut men er feil)',
              value: 'hallucinations',
            },
            {
              label: 'Arbeidsflyt (verktøyet forstyrrer mer enn det hjelper)',
              value: 'workflow',
            },
            {
              label:
                'Leverandørbinding og avhengighet av utenlandske leverandører',
              value: 'vendor-lock-in',
            },
            { label: 'Energibruk og klimaavtrykk', value: 'energy' },
            {
              label: 'Jeg har ingen vesentlige bekymringer',
              value: 'no-concerns',
              exclusive: true,
            },
            {
              label: 'Andre (spesifiser)',
              value: 'other',
              allowOtherText: true,
            },
          ],
        },
      ],
    },
    {
      id: 'skill-loss',
      title: 'Tap av ferdigheter',
      questions: [
        {
          id: 'q20b-skill-loss',
          type: 'checkbox',
          title:
            'Du valgte tap av kompetanse eller ferdigheter som en bekymring. Hva bekymrer deg mest? (Velg opptil 2)',
          required: true,
          maxSelections: 2,
          description:
            '*Tap av oversikt:* vi tar i bruk kode som virker, men som ingen i teamet forstår godt. *Juniorer lærer ikke håndverket:* nyutdannede og juniorutviklere får for lite trening i programmering og problemløsning. *Svekket feilsøkingsevne:* det blir vanskeligere å feilsøke selv når komplekse feil oppstår, eller når KI-verktøyet ikke hjelper. *Overfladisk kodegjennomgang:* store mengder KI-generert kode gjør at kode godkjennes uten at detaljene er forstått. *Arkitekturglidning:* KI-agenter løser enkeltoppgaver uten å ta hensyn til helhetlig arkitektur og gjenbruk.',
          showIf: [{ questionId: 'q20-concerns', anyOf: ['skill-loss'] }],
          options: [
            {
              label:
                '**Tap av oversikt:** Ingen i teamet forstår koden vi tar i bruk godt nok',
              value: 'comprehension-debt',
            },
            {
              label:
                '**Juniorer lærer ikke håndverket:** De får for lite trening i å programmere selv',
              value: 'junior-learning',
            },
            {
              label:
                '**Svekket feilsøkingsevne:** Det blir vanskeligere å feilsøke på egen hånd',
              value: 'debugging-atrophy',
            },
            {
              label:
                '**Overfladisk kodegjennomgang:** Kode godkjennes uten at detaljene er forstått',
              value: 'review-fatigue',
            },
            {
              label:
                '**Arkitekturglidning:** Agentene løser oppgaver isolert, uten blikk for helheten',
              value: 'architecture-drift',
            },
            {
              label: 'Ingen av disse bekymrer meg spesielt',
              value: 'not-concerned',
              exclusive: true,
            },
            { label: 'Vet ikke', value: 'unknown', exclusive: true },
          ],
        },
        {
          id: 'q22-trust',
          type: 'radio',
          title: 'Hvordan forholder du deg til KI-generert kode?',
          required: true,
          visualization: 'diverging',
          options: [
            {
              label:
                'Jeg godtar aldri KI-forslag uten å gjennomgå og forstå koden',
              value: 'always-review',
            },
            {
              label:
                'Jeg gjennomgår det meste, men godtar enkle forslag uten grundig sjekk',
              value: 'mostly-review',
            },
            {
              label: 'Jeg godtar ofte KI-forslag etter en rask sjekk',
              value: 'quick-check',
            },
            {
              label: 'Jeg godtar som regel KI-forslag som ser riktige ut',
              value: 'usually-accept',
            },
            {
              label: 'Ikke aktuelt — jeg bruker ikke KI-kodeverktøy',
              value: 'not-applicable',
              scale: false,
            },
          ],
        },
        {
          id: 'q23-perception-gap',
          type: 'radio',
          title:
            'Er det et gap mellom hva organisasjonen din tillater og hva du mener er forsvarlig?',
          required: true,
          visualization: 'diverging',
          options: [
            {
              label:
                'Organisasjonen er for restriktiv — vi burde bruke KI-verktøy mer',
              value: 'too-restrictive',
            },
            {
              label:
                'Organisasjonens tilnærming samsvarer med det jeg mener er forsvarlig',
              value: 'aligned',
            },
            {
              label:
                'Organisasjonen er for liberal — vi burde ha strengere retningslinjer',
              value: 'too-liberal',
            },
            {
              label:
                'Organisasjonen har ingen tydelig tilnærming, så det er vanskelig å si',
              value: 'no-approach',
              scale: false,
            },
            {
              label: 'Vet ikke / har ingen mening',
              value: 'unknown',
              scale: false,
            },
          ],
        },
      ],
    },
    {
      id: 'platform-autonomy',
      title: 'Plattformstøtte og agentautonomi',
      questions: [
        {
          id: 'q25-platform-role',
          type: 'checkbox',
          title:
            'Hva gjør plattformteamet (eller tilsvarende sentralt teknisk miljø) i organisasjonen din for KI-kodeverktøy og KI-agenter som du som utvikler kan bruke?',
          description:
            'Velg alle som passer. Eksempler: *Ingen rolle:* IT-avdeling, sikkerhet, anskaffelse eller det enkelte team håndterer dette. *Tilgang:* anskaffelse, lisenser eller SSO/IAM. *Felles oppsett for agenter:* `AGENTS.md`, Copilot-instrukser eller ferdige oppsett tilpasset plattformen. *Kontekst fra plattformen:* MCP-servere, CLI-verktøy eller API-er. *Sjekker i CI/CD:* sikkerhetsskanning eller policysjekker.',
          required: false,
          requiredIf: usesTools,
          options: [
            {
              label:
                'Vi har ikke plattformteam eller tilsvarende sentralt teknisk miljø',
              value: 'no-platform-team',
              exclusive: true,
            },
            {
              label:
                '**Ingen rolle:** Andre enn plattformteamet håndterer dette',
              value: 'no-role',
              exclusive: true,
            },
            {
              label:
                '**Tilgang:** Skaffer lisenser og styrer tilgang til KI-kodeverktøyene jeg bruker',
              value: 'provisioning',
            },
            {
              label:
                '**Intern KI-gateway:** Drifter en gateway eller egne modeller som jeg kan koble verktøyet mitt til',
              value: 'llm-gateway-dev',
            },
            {
              label:
                '**Felles oppsett for agenter:** Lager regler, instrukser eller maler for KI-agenter',
              value: 'golden-paths',
            },
            {
              label:
                '**Kontekst fra plattformen:** Tilbyr verktøy som lar agenten min hente informasjon fra plattformen',
              value: 'mcp-context',
            },
            {
              label:
                '**Sjekker i CI/CD:** Automatiske sjekker som også gjelder kode skrevet med KI',
              value: 'ci-guardrails',
            },
            { label: 'Vet ikke', value: 'unknown', exclusive: true },
          ],
        },
        {
          id: 'q26-autonomy',
          type: 'radio',
          title:
            'Hva er det meste kodeagenten du bruker får gjøre i praksis i dag, uten at et menneske godkjenner hvert steg?',
          description:
            'Svar ut fra hva som faktisk skjer, ikke hva retningslinjene sier. Velg det høyeste nivået.',
          required: true,
          showIf: usesAgents,
          options: [
            {
              label: 'Bare foreslå endringer som jeg selv tar inn',
              value: 'suggest-only',
            },
            {
              label: 'Endre filer i mitt lokale utviklingsmiljø',
              value: 'edit-local',
            },
            {
              label: 'I tillegg kjøre bygg, tester og andre kommandoer lokalt',
              value: 'run-local',
            },
            {
              label: 'I tillegg opprette brancher, commits og pull requests',
              value: 'create-pr',
            },
            {
              label: 'I tillegg rulle ut til test- eller sandkassemiljø',
              value: 'deploy-test',
            },
            {
              label:
                'I tillegg merge eller rulle ut til produksjon uten at et menneske har godkjent koden',
              value: 'merge-deploy-prod',
            },
            { label: 'Vet ikke', value: 'unknown' },
          ],
        },
        {
          id: 'q26b-system-access',
          type: 'matrix',
          title:
            'Hva får kodeagenten du bruker gjøre i systemene du har koblet den til?',
          description:
            'Svar ut fra hva agenten faktisk kan gjøre i dag, ikke hva retningslinjene sier. «Lese og endre» betyr at agenten kan gjøre endringer selv, for eksempel pushe kode, starte bygg eller sende meldinger. Velg «Ingen tilgang» hvis agenten ikke får bruke systemet. Velg ett svar per rad.',
          required: true,
          showIf: usesAgents,
          rowsFrom: {
            questionId: 'q11-integrations',
            map: {
              scm: ['scm'],
              'project-mgmt': ['project-mgmt'],
              cicd: ['cicd'],
              infra: ['infra'],
              monitoring: ['logs-test', 'logs-prod'],
              communication: ['chat'],
            },
          },
          rows: [
            { value: 'scm', label: 'Kode (f.eks. GitHub, GitLab)' },
            { value: 'project-mgmt', label: 'Oppgaver (f.eks. Jira)' },
            { value: 'cicd', label: 'CI/CD' },
            { value: 'infra', label: 'Kubernetes og sky' },
            {
              value: 'logs-test',
              label: 'Logger og metrikker fra testmiljøer',
            },
            {
              value: 'logs-prod',
              label: 'Logger og metrikker fra produksjon',
            },
            { value: 'chat', label: 'Chat (f.eks. Slack, Teams)' },
          ],
          options: [
            { label: 'Ingen tilgang', value: 'none' },
            { label: 'Lese', value: 'read' },
            { label: 'Lese og endre', value: 'read-write' },
            { label: 'Vet ikke', value: 'unknown' },
          ],
        },
        {
          id: 'q27-change',
          type: 'checkbox',
          title:
            'Hvordan har din egen bruk av KI-kodeverktøy endret seg de siste 12 månedene? (Velg alle som passer)',
          description:
            '*Mer strukturert* kan for eksempel være faste instruksfiler, tydeligere grenser eller grundigere gjennomgang. *Trappet ned* gjelder for eksempel etter problemer med kvalitet, sikkerhet eller vedlikehold.',
          required: true,
          showIf: usesTools,
          options: [
            {
              label:
                '**Over til agenter:** Jeg bruker kodeagenter på større oppgaver i stedet for chat og autofullføring',
              value: 'shifted-to-agents',
            },
            {
              label:
                '**Mer strukturert:** Jeg bruker verktøyene på en mer planlagt og kontrollert måte',
              value: 'more-structured',
            },
            {
              label:
                '**Trappet ned:** Jeg bruker verktøyene mindre eller mer forsiktig etter problemer',
              value: 'scaled-back',
            },
            {
              label: '**Uendret:** Bruken min er stort sett som før',
              value: 'unchanged',
              exclusive: true,
            },
            {
              label:
                '**Ny bruker:** Jeg begynte å bruke KI-kodeverktøy i løpet av de siste 12 månedene',
              value: 'just-started',
            },
            { label: 'Vet ikke', value: 'unknown', exclusive: true },
          ],
        },
      ],
    },
    {
      id: 'followup',
      title: 'Oppfølging',
      questions: [
        {
          id: 'q24-interview',
          type: 'radio',
          title:
            'Kan vi kontakte deg for et kort oppfølgingsintervju (ca. 30 min, digitalt)?',
          required: true,
          options: [
            { label: 'Ja', value: 'yes' },
            { label: 'Nei', value: 'no', skipToSection: 'end' },
          ],
        },
      ],
    },
    {
      id: 'contact',
      title: 'Kontaktinformasjon',
      questions: [
        {
          id: 'q24-email',
          type: 'text',
          title: 'Oppgi e-postadresse for oppfølging',
          description:
            '*E-postadressen kobles ikke til dine svar i undersøkelsen. Den brukes kun til å ta kontakt om intervju.*',
          required: false,
          format: 'email',
        },
        {
          id: 'q24-later-rounds',
          type: 'checkbox',
          title: 'Kontakt om senere runder',
          required: false,
          options: [
            {
              label:
                'Jeg samtykker også til at Offentlig PAAS kan kontakte meg på denne e-postadressen om senere runder av undersøkelsen.',
              value: 'yes',
            },
          ],
        },
      ],
    },
  ],
}
