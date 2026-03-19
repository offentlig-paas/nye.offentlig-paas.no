import { joinSession } from '@github/copilot-sdk/extension'

// ─── Designer — Web Design Specialist ───────────────────────────────────────
//
// Tailwind CSS + Next.js design specialist who knows the zinc/teal design system,
// the custom typography config, and all 60+ components in this codebase.
//
// Inspired by:
//   - agency-agents design-ux-architect (CSS systems, layout frameworks)
//   - agency-agents design-brand-guardian (color systems, consistency)
//   - NAV web-design-reviewer skill (visual inspection, fix in source)

const session = await joinSession({
  tools: [
    {
      name: 'design_system_reference',
      description:
        'Returns the design system reference for the Offentlig PaaS website. ' +
        'Covers the color palette, typography scale, component inventory, ' +
        'layout patterns, dark mode, and Tailwind configuration. ' +
        'Use this before creating or modifying any UI component or page.',
      parameters: {
        type: 'object',
        properties: {
          section: {
            type: 'string',
            enum: [
              'all',
              'colors',
              'typography',
              'components',
              'layout',
              'dark-mode',
              'icons',
            ],
            description: "Which section to return. Defaults to 'all'.",
          },
        },
      },
      handler: async args => {
        const section = args.section || 'all'
        const sections = {}

        sections.colors = `
## Fargepalett

Nettsiden bruker **zinc** (nøytral) og **teal** (aksent) fra Tailwind.

### Lys modus
| Rolle | Farge | Tailwind |
|-------|-------|----------|
| Brødtekst | zinc.600 | text-zinc-600 |
| Overskrifter | zinc.900 | text-zinc-900 |
| Lenker | teal.500 → teal.600 (hover) | text-teal-500 hover:text-teal-600 |
| Fet tekst | zinc.900 | text-zinc-900 |
| Kulepunkter/nummerering | zinc.900 | - |
| Skillelinjer (hr) | zinc.100 | border-zinc-100 |
| Bildetekst | zinc.400 | text-zinc-400 |
| Kode (inline) | zinc.700 på zinc.300/0.2 bg | - |
| Kodeblokk | zinc.100 på zinc.900 bg | - |
| Sitatramme | zinc.200 (2px venstre) | - |
| Tabellhoder | zinc.200 border | - |

### Mørk modus
| Rolle | Farge | Tailwind |
|-------|-------|----------|
| Brødtekst | zinc.400 | dark:text-zinc-400 |
| Overskrifter | zinc.200 | dark:text-zinc-200 |
| Lenker | teal.400 | dark:text-teal-400 |
| Kode (inline) | zinc.300 på zinc.200/0.05 bg | - |
| Kodeblokk | zinc.100 på black/0.4 bg | - |
| Sitatramme | zinc.500 | - |

### Semantiske farger i bruk
- Bakgrunn: bg-white / dark:bg-zinc-900
- Kort/paneler: bg-zinc-50 / dark:bg-zinc-800
- Skygger: shadow-zinc-800/5
- Ringer/borders: ring-zinc-900/5 / dark:ring-zinc-700/50
`

        sections.typography = `
## Typografi

### Skala (tilpasset i tailwind.config.ts)
| Token | Størrelse | Linjehøyde | Bruk |
|-------|----------|-----------|------|
| text-xs | 0.8125rem (13px) | 1.5rem | Metadata, badges |
| text-sm | 0.875rem (14px) | 1.5rem | Kode, tabeller, hjelpetekst |
| text-base | 1rem (16px) | 1.75rem | Brødtekst |
| text-lg | 1.125rem (18px) | 1.75rem | Ingress |
| text-xl | 1.25rem (20px) | 2rem | H2 i artikler |
| text-2xl | 1.5rem (24px) | 2rem | Undertitler |
| text-3xl | 1.875rem (30px) | 2.25rem | Seksjonsoverskrifter |
| text-4xl | 2rem (32px) | 2.5rem | Sideoverskrifter |
| text-5xl | 3rem (48px) | 3.5rem | Herotitler |

### Prose (artikler via @tailwindcss/typography)
- H2: text-xl, semibold, 5rem toppmarg — hoved seksjoner
- H3: text-base, semibold, 4rem toppmarg — underseksjoner
- Avsnitt: 1.75rem vertikal avstand
- Bilder: 3xl border-radius automatisk
- Kode inline: sm, semibold, inline-block med rounded-lg bg
- Kodeblokk: sm, medium, 3xl border-radius, 2rem padding
- Lister: disc/decimal, 1.5rem mellom punkter
- Sitater: kursiv, 2px venstre border i teal

### Fontvekt
- normal (400): Brødtekst
- medium (500): Kodeblokker
- semibold (600): Overskrifter, lenker, inline-kode, listepunkter
- bold (700): Kode i overskrifter
`

        sections.components = `
## Komponentbibliotek (65+ komponenter)

### Layout
- Container — Innholdsbeholder med max-bredde
- SimpleLayout — Standard sidemal med tittel og intro
- ArticleLayout — Artikkelmal med tilbake-knapp og Prose-wrapper
- AdminLayout — Admin-sidemal
- Layout — Hovedlayout med Header + Footer
- Section — Seksjonswrapper

### Navigasjon
- Header — Hovednavigasjon
- Footer — Bunntekst med lenker
- AdminEventNav — Admin-faner

### Innhold
- Prose — Tailwind typography-wrapper for MDX-innhold
- Card — Kortbeholder
- Stats / InfoCard — Statistikkvisning
- StatusBadge — Statusmerkelapp
- Rating / StarRating — Stjernerangering

### Brukergrensesnitt
- Button — Stilisert knapp
- AuthButton — Innlogging/utlogging
- ActionsMenu — Kontekstmeny
- ConfirmationModal — Bekreftelsesdialog
- Toast / ToastProvider — Varselmeldinger
- SuccessMessage — Suksessmelding
- DeleteAccountButton — Kontosletting

### Bruker
- Avatar — Brukeravatar med initialer
- BatchedServerAvatar — Optimalisert avatarhenting
- OverlappingAvatars — Avatargruppe

### Arrangement
- EventAgenda — Programvisning med foredragsholdere
- EventRegistrationPanel / EventRegistrationForm — Påmeldingsskjema
- EventFeedbackForm / EventFeedbackPrompt — Tilbakemeldingsskjema
- EventFeedbackSummary — Aggregerte tilbakemeldinger
- EventReviews — Offentlige tilbakemeldinger
- EventCalendarDownload — iCal-nedlasting
- EventHeroGallery / EventPhotoCarousel / EventThumbnailGallery / EventAdditionalPhotosGallery — Bildegallerier
- EventSummary — Arrangementskort
- EventParticipantInfo — Deltakerinfo

### Admin
- AdminRegistrationList / AdminRegistrationFilters — Påmeldingstabell
- AdminEventStats / AdminEventStatCard — Statistikk
- AdminEventChecklist — Sjekkliste for arrangering
- AdminEventActions — Massehandlinger
- AdminEventPhotos — Bildeopplasting
- AdminEventFeedback — Tilbakemeldingsvisning
- AdminSlackChannelManager — Slack-kanaladministrasjon
- AddToSlackChannelButton — Kanalinvitasjon
- SendReminderModal / SendFeedbackRequestModal — Meldingsutsending
- TalkAttachmentUpload / TalkAttachmentManager — Presentasjonsfiler
- SpeakerMatcher — Koble bilder til foredragsholdere
- ParticipantInfoEditor — Rediger deltakerinfo

### Sosiale medier
- SocialIcons — GitHub, Slack, YouTube, LinkedIn, X, Bluesky-ikoner
`

        sections.layout = `
## Layout-mønstre

### Containersystem
- Container: max-w-7xl mx-auto (standard sidemarger)
- Artikler: max-w-2xl mx-auto (smal lesebredde, ~672px)
- Admin: Full bredde med sidepanel

### Responsive breakpoints
| Prefix | Min-bredde | Typisk bruk |
|--------|-----------|-------------|
| sm | 640px | Mobil → to-kolonne |
| md | 768px | Nettbrett |
| lg | 1024px | Desktop |
| xl | 1280px | Bred desktop |
| 2xl | 1536px | Stor skjerm |

### Vanlige mønstre
\`\`\`tsx
// To-kolonne grid
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

// Tre-kolonne med responsivt
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

// Flex med wrap
<div className="flex flex-col gap-6 sm:flex-row">

// Sentrert innhold med maks bredde
<Container className="mt-16 lg:mt-32">
  <div className="mx-auto max-w-2xl">

// "not-prose" for egendefinerte blokker i artikler
<div className="not-prose mt-6 flex flex-col justify-center gap-6 sm:flex-row">
  <InfoCard title="Tittel" number="123" />
</div>
\`\`\`
`

        sections['dark-mode'] = `
## Mørk modus

### Konfigurasjon
- darkMode: 'selector' i tailwind.config.ts
- Klassen .dark på <html>-elementet styrer mørk modus

### Regler
- ALDRI hardkod farger — bruk alltid light/dark-varianter
- Prose-innhold håndteres automatisk av typography-pluginet
- Egendefinerte komponenter MÅ ha dark:-varianter

### Vanlige mønstre
\`\`\`tsx
// Bakgrunn
className="bg-white dark:bg-zinc-900"
className="bg-zinc-50 dark:bg-zinc-800/50"

// Tekst
className="text-zinc-900 dark:text-zinc-100"
className="text-zinc-600 dark:text-zinc-400"

// Borders
className="border-zinc-200 dark:border-zinc-700"
className="ring-zinc-900/5 dark:ring-zinc-700/50"

// Skygger
className="shadow-zinc-800/5 dark:shadow-none"

// Hover
className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
\`\`\`
`

        sections.icons = `
## Ikoner

### Heroicons (obligatorisk)
Bruk Heroicons — ALDRI emoji i grensesnittet.

\`\`\`tsx
import { CalendarIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
\`\`\`

### Sosiale ikoner
Egendefinerte SVG-ikoner i src/components/SocialIcons.tsx:
- GitHubIcon, SlackIcon, YouTubeIcon, LinkedInIcon, XIcon, BlueskyIcon
- Brukes med SocialLink-komponenten

### Bruk
- 24px outline-varianter for generelle ikoner
- 24px solid-varianter for fylt tilstand (f.eks. aktiv stjerne)
- 20px mini-varianter for trange steder
`

        if (section === 'all') {
          return Object.values(sections).join('\n---\n')
        }
        if (sections[section]) {
          return sections[section]
        }
        return {
          textResultForLlm: `Ukjent seksjon '${section}'. Gyldige: all, colors, typography, components, layout, dark-mode, icons`,
          resultType: 'failure',
        }
      },
    },
  ],

  hooks: {
    onUserPromptSubmitted: async input => {
      const prompt = input.prompt.toLowerCase()

      const designKeywords = [
        'design',
        'komponent',
        'component',
        'layout',
        'styling',
        'tailwind',
        'css',
        'responsiv',
        'responsive',
        'dark mode',
        'mørk modus',
        'farge',
        'color',
        'typografi',
        'typography',
        'ikon',
        'icon',
        'ui',
        'grensesnitt',
      ]

      const isDesignRelated = designKeywords.some(kw => prompt.includes(kw))
      if (!isDesignRelated) return

      return {
        additionalContext: `
[Designer — Web Design Specialist Context]

Du jobber med designsystemet for Offentlig PaaS-nettsiden.

Fargepalett: zinc (nøytral) + teal (aksent). Full mørk modus-støtte.
Typografi: Egendefinert skala i tailwind.config.ts + @tailwindcss/typography for prose.
Ikoner: Heroicons (ALDRI emoji). Sosiale: egendefinerte SVG-er i SocialIcons.tsx.
Komponenter: 65+ eksisterende — sjekk med design_system_reference FØR du lager nye.

Regler:
- Bruk Tailwind-klasser, aldri inline-stiler
- Alle komponenter MÅ støtte mørk modus (dark:-varianter)
- Sjekk om eksisterende komponent kan utvides før du lager ny
- Hold komponenthierarkiet flatt — unngå unødvendige wrappere
- Kjør 'yarn run check' etter endringer
`,
      }
    },
  },
})

await session.log('Designer ready — design_system_reference available')
