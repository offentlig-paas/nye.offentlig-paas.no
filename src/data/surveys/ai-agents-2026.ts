import type { SurveyDefinition } from '@/lib/surveys/types'
import { SurveyStatus } from '@/lib/surveys/types'
import { members } from '@/data/members'

const orgSuggestions = members.map(m => m.name).sort()

export const aiAgents2026: SurveyDefinition = {
  slug: 'ai-agents-2026',
  version: 1,
  title: 'KI-kodeverktøy i norsk offentlig sektor',
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
  sensitiveQuestionIds: ['q24-email'],
  resultsConfig: {
    published: true,
    heroText:
      'Foreløpige resultater fra kartleggingen av KI-kodeverktøy i norsk offentlig sektor. Undersøkelsen er fortsatt åpen — tallene oppdateres fortløpende.',
    methodologyNote:
      'Undersøkelsen er distribuert gjennom Offentlig PaaS Slack, LinkedIn og arrangementer. Utvalget er selvselektert og ikke representativt for hele offentlig sektor. Organisasjoner med flere respondenter teller én gang i organisasjonsstatistikken.',
  },
  description:
    'Vi kartlegger hvordan norske offentlige virksomheter tar i bruk og styrer KI-kodeverktøy (som GitHub Copilot, Cursor, Claude Code og lignende).\n\nUndersøkelsen dekker både din egen bruk av KI-kodeverktøy og hvordan organisasjonen din styrer og legger til rette for slik bruk.',
  consent: {
    dataCollectionText:
      'Vi samler inn svar om organisasjonens og din bruk av KI-kodeverktøy, styring og bekymringer. Vi spør om organisasjonsnavn for å kunne oppdage og slå sammen duplikater — organisasjonen din vil ikke bli navngitt i publikasjoner. Dersom du ønsker å delta i oppfølgingsintervju, ber vi om e-postadresse — denne lagres separat fra svarene dine.',
  },
  status: SurveyStatus.Open,
  sections: [
    {
      id: 'demographics',
      title: 'Om deg og din organisasjon',
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
            { label: 'IT-leder / CTO / IT-direktør', value: 'cto' },
            { label: 'Leder (ikke-teknisk)', value: 'non-tech-leader' },
            {
              label: 'Annet',
              value: 'other',
              allowOtherText: true,
            },
          ],
        },
        {
          id: 'q3-dev-count',
          type: 'radio',
          title:
            'Omtrent hvor mange utviklere og teknisk personell har organisasjonen din?',
          description:
            'Inkluder både fast ansatte og innleide konsulenter som skriver eller vedlikeholder kode for organisasjonen.',
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
      title: 'Adopsjon av KI-kodeverktøy',
      description:
        'I denne delen spør vi om organisasjonens bruk av KI-kodeverktøy. Svar basert på det du vet om organisasjonen som helhet. Det er helt greit å svare «vet ikke».\n\nMed «KI-kodeverktøy» mener vi verktøy som hjelper utviklere med å skrive, forstå eller endre kode ved hjelp av kunstig intelligens — for eksempel GitHub Copilot, Cursor, Claude Code, Amazon Q, eller lignende.',
      questions: [
        {
          id: 'q5-adoption-level',
          type: 'radio',
          title:
            'Hva beskriver best organisasjonens bruk av KI-kodeverktøy i dag?',
          description:
            'Velg det alternativet som best beskriver situasjonen i organisasjonen i dag.',
          required: true,
          options: [
            {
              label: 'Ikke i bruk, så vidt jeg vet',
              value: 'not-in-use',
            },
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
          visualization: 'hidden',
          options: [
            {
              label:
                'Jeg vet dette sikkert (f.eks. er involvert i beslutningen)',
              value: 'certain',
            },
            {
              label: 'Ganske sikker basert på det jeg har sett',
              value: 'fairly-sure',
            },
            { label: 'Dette er mitt beste estimat', value: 'estimate' },
          ],
        },
        {
          id: 'q6-approved-tools',
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
            },
            { label: 'Vet ikke', value: 'unknown', pinPosition: 'last' },
            {
              label: 'Andre',
              value: 'other',
              allowOtherText: true,
              pinPosition: 'last',
            },
          ],
        },
        {
          id: 'q6b-confidence',
          type: 'radio',
          title: 'Hvor sikker er du på svaret over?',
          required: true,
          visualization: 'hidden',
          options: [
            {
              label:
                'Jeg vet dette sikkert (f.eks. er involvert i beslutningen)',
              value: 'certain',
            },
            {
              label: 'Ganske sikker basert på det jeg har sett',
              value: 'fairly-sure',
            },
            { label: 'Dette er mitt beste estimat', value: 'estimate' },
          ],
        },
        {
          id: 'q7-introduction-path',
          type: 'radio',
          title:
            'Hva var den viktigste måten KI-kodeverktøy ble innført i organisasjonen din?',
          required: true,
          options: [
            {
              label: 'Sentral anskaffelse eller IT-avdeling bestemte',
              value: 'central',
            },
            {
              label: 'Team eller avdeling valgte selv',
              value: 'team',
            },
            {
              label:
                'Enkeltpersoner begynte å bruke verktøy, og det ble etter hvert akseptert',
              value: 'bottom-up',
            },
            {
              label:
                'Verktøyet fulgte med en eksisterende avtale (f.eks. Microsoft/GitHub-avtale)',
              value: 'bundled',
            },
            {
              label: 'Ikke aktuelt — vi bruker ikke KI-kodeverktøy',
              value: 'not-applicable',
            },
            { label: 'Vet ikke', value: 'unknown' },
            {
              label: 'Annet',
              value: 'other',
              allowOtherText: true,
            },
          ],
        },
      ],
    },
    {
      id: 'personal-screening',
      title: 'Din personlige bruk',
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
            {
              label: 'Nei',
              value: 'no',
              skipToSection: 'governance',
            },
          ],
        },
      ],
    },
    {
      id: 'personal-usage',
      title: 'Bruksmønster og fordeler',
      questions: [
        {
          id: 'q8b-personal-tools',
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
            {
              label: 'Gemini Code Assist / Gemini CLI',
              value: 'gemini',
            },
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
          id: 'q9-usage-modes',
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
          ],
        },
        {
          id: 'q10-integrations',
          type: 'checkbox',
          title: 'Har du koblet KI-kodeverktøyet ditt til andre systemer?',
          description:
            'Noen KI-verktøy kan kobles til eksterne systemer via integrasjoner (f.eks. MCP-servere eller innebygde integrasjoner). Velg alle som gjelder.',
          required: true,
          options: [
            {
              label: 'Nei, jeg bruker bare kodegenerering og chat',
              value: 'none',
            },
            {
              label: 'Kodeadministrasjon (f.eks. GitHub, GitLab)',
              value: 'scm',
            },
            {
              label: 'Oppgavehåndtering (f.eks. Jira, Linear, Azure Boards)',
              value: 'project-mgmt',
            },
            {
              label: 'CI/CD (f.eks. GitHub Actions, Jenkins)',
              value: 'cicd',
            },
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
              value: 'unknown',
            },
            {
              label: 'Andre',
              value: 'other',
              allowOtherText: true,
            },
          ],
        },
        {
          id: 'q11-frequency',
          type: 'radio',
          title: 'Hvor ofte bruker du KI-kodeverktøy i arbeidet ditt?',
          required: true,
          options: [
            { label: 'Daglig', value: 'daily' },
            { label: 'Flere ganger i uken', value: 'several-weekly' },
            { label: 'Ukentlig', value: 'weekly' },
            {
              label: 'Noen ganger i måneden',
              value: 'monthly',
            },
            { label: 'Sjelden eller aldri', value: 'rarely' },
          ],
        },
        {
          id: 'q11b-benefit',
          type: 'radio',
          title:
            'Hva er den viktigste fordelen du opplever med KI-kodeverktøy?',
          required: true,
          options: [
            {
              label: 'Økt hastighet — jeg skriver kode raskere',
              value: 'speed',
            },
            {
              label: 'Bedre kvalitet — KI hjelper meg å skrive bedre kode',
              value: 'quality',
            },
            {
              label: 'Læring — jeg lærer nye teknikker og mønstre',
              value: 'learning',
            },
            {
              label:
                'Redusert kjedelig arbeid — KI tar seg av repetitive oppgaver',
              value: 'reduced-toil',
            },
            {
              label: 'Jeg opplever ikke vesentlige fordeler',
              value: 'no-benefit',
            },
            {
              label: 'Annet',
              value: 'other',
              allowOtherText: true,
            },
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
          id: 'q12-policy',
          type: 'radio',
          title:
            'Har organisasjonen din retningslinjer eller policy for bruk av KI-kodeverktøy?',
          required: true,
          options: [
            {
              label: 'Ja, spesifikt for KI-kodeverktøy',
              value: 'specific',
            },
            {
              label: 'Ja, som del av en generell KI-policy',
              value: 'general',
            },
            { label: 'Nei', value: 'no' },
            { label: 'Vet ikke', value: 'unknown' },
          ],
        },
        {
          id: 'q12b-confidence',
          type: 'radio',
          title: 'Hvor sikker er du på svaret over?',
          required: true,
          visualization: 'hidden',
          options: [
            {
              label:
                'Jeg vet dette sikkert (f.eks. er involvert i beslutningen)',
              value: 'certain',
            },
            {
              label: 'Ganske sikker basert på det jeg har sett',
              value: 'fairly-sure',
            },
            { label: 'Dette er mitt beste estimat', value: 'estimate' },
          ],
        },
        {
          id: 'q13-support',
          type: 'radio',
          title:
            'Hvordan støtter organisasjonen din utviklere i bruk av KI-kodeverktøy?',
          required: true,
          options: [
            {
              label: 'Ingen støtte eller opplæring',
              value: 'none',
            },
            {
              label: 'Uformell kunnskapsdeling mellom utviklere',
              value: 'informal',
            },
            {
              label:
                'Delte ressurser eller retningslinjer er tilgjengelige (f.eks. wiki, beste praksis)',
              value: 'shared-resources',
            },
            {
              label: 'Organisert opplæring eller kurs',
              value: 'training',
            },
            {
              label:
                'Strukturert program (f.eks. champions-nettverk, dedikerte ressurspersoner, tilbakemeldingsrutiner)',
              value: 'structured',
            },
            { label: 'Vet ikke', value: 'unknown' },
          ],
        },
        {
          id: 'q14-decision-authority',
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
            {
              label: 'Teamet eller tech lead bestemmer',
              value: 'team',
            },
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
          id: 'q15-data-sovereignty',
          type: 'radio',
          title:
            'Har organisasjonen din avklart hvilke KI-leverandører som behandler kildekoden deres?',
          description:
            'Når du bruker KI-kodeverktøy, sendes kildekode til en ekstern modell-leverandør (f.eks. OpenAI, Anthropic, Google) for behandling. Noen organisasjoner har avklart dette gjennom databehandleravtaler eller risikovurderinger.',
          required: true,
          options: [
            {
              label: 'Ja, det er tydelig avklart',
              value: 'clarified',
            },
            {
              label: 'Delvis — noe er avklart, men ikke for alle verktøy',
              value: 'partial',
            },
            { label: 'Nei', value: 'no' },
            { label: 'Vet ikke', value: 'unknown' },
          ],
        },
        {
          id: 'q16-measurement',
          type: 'radio',
          title:
            'Hvordan vurderer organisasjonen din effekten av KI-kodeverktøy?',
          description:
            'Velg det høyeste nivået som passer for organisasjonen din. Hvert nivå inkluderer de under.',
          required: true,
          options: [
            {
              label: 'Vi vurderer ikke effekten',
              value: 'none',
            },
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
          id: 'q17-code-review',
          type: 'radio',
          title:
            'Hvordan håndteres KI-generert kode i kodegjennomgang (code review)?',
          description:
            'Med «KI-generert kode» mener vi all kode som er skrevet eller vesentlig endret med hjelp av KI-verktøy.',
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
                'Vi har skriftlige retningslinjer og bruker automatiserte verktøy for å sjekke KI-generert kode',
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
      id: 'barriers',
      title: 'Bekymringer og barrierer',
      description:
        'Nå spør vi om dine personlige oppfatninger og bekymringer rundt KI-kodeverktøy.',
      questions: [
        {
          id: 'q18-concerns',
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
            {
              label: 'Kodekvalitet og teknisk gjeld',
              value: 'code-quality',
            },
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
            {
              label: 'Kostnad i forhold til nytte',
              value: 'cost',
            },
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
              label: 'Jeg har ingen vesentlige bekymringer',
              value: 'no-concerns',
            },
            {
              label: 'Andre',
              value: 'other',
              allowOtherText: true,
            },
          ],
        },
        {
          id: 'q19-public-sector-concerns',
          type: 'textarea',
          title: 'Har du spesifikke bekymringer knyttet til offentlig sektor?',
          description:
            'For eksempel knyttet til regelverk, innsynskrav, anskaffelsesregler, eller andre forhold som er spesielle for offentlig sektor.',
          required: false,
        },
        {
          id: 'q20-trust',
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
            },
          ],
        },
        {
          id: 'q21-perception-gap',
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
            },
            {
              label: 'Vet ikke / har ingen mening',
              value: 'unknown',
            },
          ],
        },
      ],
    },
    {
      id: 'followup',
      title: 'Oppfølging',
      description:
        'Til slutt — vi planlegger oppfølgingsintervjuer med et lite utvalg deltakere for å utdype funnene. Deltakelse er frivillig og separat fra denne undersøkelsen.',
      questions: [
        {
          id: 'q23-interview',
          type: 'radio',
          title:
            'Kan vi kontakte deg for et kort oppfølgingsintervju (ca. 30 min, digitalt)?',
          required: true,
          options: [
            {
              label: 'Ja',
              value: 'yes',
              skipToSection: 'contact',
            },
            {
              label: 'Nei',
              value: 'no',
              skipToSection: 'end',
            },
          ],
        },
      ],
    },
    {
      id: 'contact',
      title: 'Kontaktinformasjon for intervju',
      questions: [
        {
          id: 'q24-email',
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
