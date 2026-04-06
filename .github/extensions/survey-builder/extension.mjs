import { joinSession } from '@github/copilot-sdk/extension'

// ─── Survey Builder — Survey-as-Code Scaffolding & Reference ────────────────
//
// Scaffolds new survey definitions with correct TypeScript types and provides
// the full type reference for the survey engine. Surveys are checked into the
// repo as TypeScript files in src/data/surveys/.

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const session = await joinSession({
  tools: [
    {
      name: 'scaffold_survey',
      description:
        'Generates a TypeScript survey definition skeleton with correct types ' +
        '(SurveyDefinition, SurveySection, SurveyQuestion, QuestionOption, SurveyStatus). ' +
        'Returns the complete survey file ready to save to src/data/surveys/. ' +
        'Use this when creating a new survey or research questionnaire.',
      parameters: {
        type: 'object',
        properties: {
          slug: {
            type: 'string',
            description:
              "URL-safe slug, e.g. 'developer-experience-2026'. Used as filename and URL path.",
          },
          title: {
            type: 'string',
            description:
              "Survey title in Norwegian, e.g. 'Utvikleropplevelse i norsk offentlig sektor'",
          },
          description: {
            type: 'string',
            description: 'Short description (1-2 sentences) for meta/cards',
          },
          num_sections: {
            type: 'number',
            description:
              'Number of placeholder sections to generate. Default: 3',
          },
          status: {
            type: 'string',
            enum: ['draft', 'open', 'closed'],
            description: "Initial status. Default: 'draft'",
          },
        },
        required: ['slug', 'title', 'description'],
      },
      handler: async args => {
        const numSections = args.num_sections || 3
        const status =
          (args.status || 'draft').charAt(0).toUpperCase() +
          (args.status || 'draft').slice(1)

        const sections = []
        for (let i = 0; i < numSections; i++) {
          sections.push(`    {
      id: 'section-${i + 1}',
      title: 'SECTION_TITLE_${i + 1}',
      description: 'SECTION_DESCRIPTION',
      questions: [
        {
          id: 'q${i + 1}-example-radio',
          type: 'radio',
          title: 'QUESTION_TITLE',
          required: true,
          options: [
            { label: 'Alternativ A', value: 'a' },
            { label: 'Alternativ B', value: 'b' },
            { label: 'Annet', value: 'other', allowOtherText: true },
          ],
        },
      ],
    }`)
        }

        const file = `import type { SurveyDefinition } from '@/lib/surveys/types'
import { SurveyStatus } from '@/lib/surveys/types'

export const ${toCamelCase(args.slug)}: SurveyDefinition = {
  slug: '${args.slug}',
  version: 1,
  title: '${args.title}',
  description: '${args.description}',
  consent: {
    dataCollectionText:
      'DESCRIBE_DATA_COLLECTION — what data is collected and why.',
  },
  ethics: {
    dataController: 'RESPONSIBLE_PERSON (rolle, Offentlig PaaS)',
    contactEmail: 'kontakt@offentlig-paas.no',
    legalBasis: 'samtykke (GDPR art. 6 nr. 1 bokstav a)',
    retentionPeriod: 'senest to år etter at studien er avsluttet',
  },
  status: SurveyStatus.${status},
  sections: [
${sections.join(',\n')}
  ],
}
`

        return [
          `✅ Survey scaffolded: ${args.slug}`,
          '',
          `Save to: src/data/surveys/${args.slug}.ts`,
          '',
          '```typescript',
          file,
          '```',
          '',
          'Then register it in src/data/surveys/index.ts:',
          '```typescript',
          `import { ${toCamelCase(args.slug)} } from './${args.slug}'`,
          '',
          `export const surveys: SurveyDefinition[] = [${toCamelCase(args.slug)}, ...]`,
          '```',
          '',
          'If linked to a research project, add `surveySlug` in src/data/research.ts.',
          '',
          'Replace all UPPERCASE placeholders with real content.',
          'Run `pnpm run check` to verify types.',
        ].join('\n')
      },
    },

    {
      name: 'survey_type_reference',
      description:
        'Returns the complete type reference and best practices for the survey-as-code engine. ' +
        'Covers all question types, branching, randomization, validation rules, and accessibility. ' +
        'Use this when writing or modifying survey definitions.',
      parameters: {
        type: 'object',
        properties: {
          section: {
            type: 'string',
            enum: [
              'all',
              'types',
              'questions',
              'branching',
              'validation',
              'best-practices',
            ],
            description: "Which section to return. Default: 'all'.",
          },
        },
      },
      handler: async args => {
        const section = args.section || 'all'
        const sections = {}

        sections.types = `
## Core Types

\`\`\`typescript
interface SurveyDefinition {
  slug: string              // URL-safe identifier, used as filename
  version: number           // Increment when changing structure
  title: string             // Survey title (Norwegian)
  description?: string      // Short description for cards/meta + used in consent "about" section
  consent: SurveyConsent    // Survey-specific consent data (boilerplate auto-generated)
  ethics: SurveyEthics      // GDPR/research ethics metadata
  thankYouMessage?: string  // Optional override — default auto-generated from ethics.contactEmail
  status: SurveyStatus      // 'draft' | 'open' | 'closed'
  sections: SurveySection[]
}

interface SurveyConsent {
  aboutText?: string        // Override for "about" section (defaults to description)
  dataCollectionText: string // What data is collected and why (survey-specific)
  additionalSections?: { heading: string; body: string }[] // Extra consent sections
}

interface SurveyEthics {
  dataController: string    // e.g. 'Hans Kristian Flaatten (styreleder, Offentlig PaaS)'
  contactEmail: string      // e.g. 'kontakt@offentlig-paas.no'
  legalBasis: string        // e.g. 'samtykke (GDPR art. 6 nr. 1 bokstav a)'
  retentionPeriod: string   // e.g. 'senest to år etter at studien er avsluttet'
}

interface SurveySection {
  id: string                // Unique section ID (used for branching targets)
  title: string
  description?: string      // Markdown supported
  questions: SurveyQuestion[]
}

interface QuestionOption {
  label: string             // Display text
  value: string             // Stored value (use lowercase kebab-case)
  allowOtherText?: boolean  // Shows a free-text input when selected
  skipToSection?: string    // Branch: jump to this section ID, or 'end'
  pinPosition?: 'first' | 'last'  // Exempt from randomization
  exclusive?: boolean       // Selecting this deselects all other options (checkbox only)
}

type SurveyQuestion = TextQuestion | TextareaQuestion | RadioQuestion | CheckboxQuestion
\`\`\`

### Consent Auto-Generation
The consent page is auto-generated from \`consent\` + \`ethics\` + \`description\`. You only define:
- \`consent.dataCollectionText\` — what data is collected (required, survey-specific)
- \`consent.aboutText\` — override if description isn't enough
- \`consent.additionalSections\` — any extra sections

Boilerplate sections (responsibility, GDPR rights, voluntary participation) are generated from \`ethics\`.
\`buildConsentText(survey)\` and \`buildThankYouMessage(survey)\` in helpers.ts handle the assembly.
`

        sections.questions = `
## Question Types

### text — Single-line text input
\`\`\`typescript
{
  id: 'q1-name',
  type: 'text',
  title: 'Hva heter du?',
  required: true,
  placeholder?: string,     // Placeholder text
  format?: 'email',         // Validates email format
}
\`\`\`

### textarea — Multi-line text input
\`\`\`typescript
{
  id: 'q2-comments',
  type: 'textarea',
  title: 'Andre kommentarer?',
  required: false,
  placeholder?: string,
  maxLength?: number,       // Character limit (shown as counter)
}
\`\`\`

### radio — Single-choice (one of many)
\`\`\`typescript
{
  id: 'q3-role',
  type: 'radio',
  title: 'Hva er din rolle?',
  required: true,
  randomizeOptions?: boolean,  // Shuffle option order per respondent
  options: [
    { label: 'Utvikler', value: 'developer' },
    { label: 'Leder', value: 'leader' },
    { label: 'Annet', value: 'other', allowOtherText: true },
  ],
}
\`\`\`

### checkbox — Multiple-choice (many of many)
\`\`\`typescript
{
  id: 'q4-tools',
  type: 'checkbox',
  title: 'Hvilke verktøy bruker du?',
  required: true,
  minSelections?: number,      // Minimum required choices
  maxSelections?: number,      // Maximum allowed choices
  randomizeOptions?: boolean,
  options: [
    { label: 'GitHub Copilot', value: 'copilot' },
    { label: 'Cursor', value: 'cursor' },
    { label: 'Ingen', value: 'none', pinPosition: 'last', exclusive: true },
    { label: 'Andre', value: 'other', allowOtherText: true, pinPosition: 'last' },
  ],
}
\`\`\`
`

        sections.branching = `
## Branching (Skip Logic)

Branching is set on individual options via \`skipToSection\`.
When selected, the survey jumps directly to that section (skipping in-between sections).

\`\`\`typescript
{
  id: 'q-screening',
  type: 'radio',
  title: 'Bruker du verktøyet?',
  required: true,
  options: [
    { label: 'Ja', value: 'yes' },                           // Continue normally
    { label: 'Nei', value: 'no', skipToSection: 'barriers' }, // Jump to 'barriers' section
  ],
}
\`\`\`

Special value \`skipToSection: 'end'\` — ends the survey immediately.

**Rules:**
- Max ONE branching question per section (enforced by validateSurveyDefinition)
- skipToSection must reference a valid section ID or 'end'
- Only forward jumps allowed (cannot jump backward)
- Skipped sections' questions are stripped from submitted answers
`

        sections.validation = `
## Validation

Validation runs both client-side (inline errors on "Neste") and server-side (on submit).
Shared via \`validateQuestion()\` from \`src/lib/surveys/validation.ts\`.

**Built-in rules:**
- \`required: true\` — field must have a non-empty value
- \`format: 'email'\` — validates email format on text questions
- \`maxLength\` — character limit on textarea
- \`maxSelections\` — max choices on checkbox
- \`minSelections\` — min choices on checkbox
- \`allowOtherText\` — when selected, requires non-empty otherText
- Radio/checkbox values must match defined options (prevents tampering)

**Server-side extras:**
- Answers for skipped sections are stripped
- Duplicate answers are deduplicated (last wins)
- Honeypot field rejects bot submissions
- Rate limiting (5 submissions per IP per minute)
`

        sections['best-practices'] = `
## Best Practices

### Survey Design
- Keep surveys under 25 questions (10-15 min completion time)
- Group related questions into sections with clear titles
- Use section descriptions (Markdown) to provide context
- Add confidence questions after factual questions respondents might guess at
- Put screening questions early (use branching to skip irrelevant sections)

### Question Writing
- Use clear, simple Norwegian (bokmål)
- Avoid double-barreled questions (asking two things at once)
- Include "Vet ikke" option for factual questions about organization
- Include "Ikke aktuelt" for questions that may not apply
- Use "Annet" with \`allowOtherText: true\` as escape valve

### Option Order
- Use \`randomizeOptions: true\` on checkbox/radio to reduce order bias
- Pin structural options: \`pinPosition: 'first'\` for "None", \`'last'\` for "Other"
- Use \`exclusive: true\` for "None of the above" options — selecting them deselects everything else
- For Likert scales (agreement/frequency), don't randomize — keep natural order

### IDs and Values
- Question IDs: \`q{N}-{topic}\` (e.g., 'q1-org', 'q12-policy')
- Section IDs: descriptive kebab-case (e.g., 'demographics', 'governance')
- Option values: lowercase kebab-case (e.g., 'not-in-use', 'fairly-sure')
- Keep values stable across versions (they're stored in responses)

### File Structure
\`\`\`
src/data/surveys/
  index.ts          — exports surveys array
  my-survey.ts      — survey definition
src/lib/surveys/
  types.ts          — type definitions
  helpers.ts        — getSurvey, branching, shuffle, estimation
  validation.ts     — validateQuestion, validateAnswers
src/domains/survey-response/
  types.ts          — response types
  service.ts        — submission logic
  repository.ts     — Sanity persistence
src/components/
  SurveyForm.tsx    — wizard component (consent → sections → submit)
  survey/           — question components (TextInput, RadioGroup, etc.)
\`\`\`
`

        if (section === 'all') {
          return Object.values(sections).join('\n---\n')
        }
        if (sections[section]) {
          return sections[section]
        }
        return `Unknown section '${section}'. Valid: all, types, questions, branching, validation, best-practices`
      },
    },
  ],

  hooks: {
    onUserPromptSubmitted: async input => {
      const prompt = input.prompt.toLowerCase()

      const surveyKeywords = [
        'survey',
        'undersøkelse',
        'questionnaire',
        'spørreskjema',
        'survey definition',
        'research survey',
        'forskningsundersøkelse',
        'spørreundersøkelse',
      ]

      const isSurveyRelated = surveyKeywords.some(kw => prompt.includes(kw))
      if (!isSurveyRelated) return

      return {
        additionalContext: `
[Survey Builder Context — Offentlig PaaS Survey Engine]

Du jobber med undersøkelsesmotoren for Offentlig PaaS.

Verktøy:
- scaffold_survey — Generer undersøkelses-skjelett med riktige TypeScript-typer
- survey_type_reference — Full typereferanse og beste praksis for undersøkelser

Undersøkelser defineres som TypeScript-filer i src/data/surveys/.
Svar lagres i Sanity CMS via tRPC (survey.submit).

Nøkkeltyper: SurveyDefinition, SurveySection, SurveyQuestion (text/textarea/radio/checkbox),
QuestionOption (med skipToSection for forgreining, randomizeOptions, pinPosition, allowOtherText, exclusive).

Validering: validateQuestion() i src/lib/surveys/validation.ts brukes av både klient og server.

Tilgjengelighetsfunksjoner: fieldset/legend, aria-required, aria-invalid, aria-describedby,
role="progressbar", aria-live for seksjonsskift, role="alert" på feilmeldinger.
`,
      }
    },
  },
})

function toCamelCase(slug) {
  return slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())
}

await session.log(
  'Survey Builder ready — scaffold_survey & survey_type_reference available'
)
