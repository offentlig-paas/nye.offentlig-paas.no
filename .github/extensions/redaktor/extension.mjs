import { joinSession } from "@github/copilot-sdk/extension";

// ─── Redaktør — Editor-in-Chief Orchestrator ────────────────────────────────
//
// The editorial brain for the Offentlig PaaS website. Triages content requests,
// injects domain knowledge, and guides the user to the right specialist tools.
//
// Inspired by:
//   - agency-agents product-manager (holistic coordination, lifecycle awareness)
//   - wshobson/agents conductor plugin (context → spec → implement workflow)

const session = await joinSession({
  tools: [
    {
      name: "content_plan",
      description:
        "Creates an editorial plan for new content on the Offentlig PaaS website. " +
        "Analyzes the request and recommends which tools and workflow to follow. " +
        "Use this when you need to plan articles, event write-ups, member updates, " +
        "or any content work on the site.",
      parameters: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description: "What the content is about (e.g. 'fagdag summary', 'new member announcement', 'platform comparison')",
          },
          content_type: {
            type: "string",
            enum: ["article", "event", "event-summary", "member-update", "landing-page", "component"],
            description: "Type of content to create",
          },
          language: {
            type: "string",
            enum: ["no", "en"],
            description: "Content language. Default: 'no' (Norwegian bokmål)",
          },
        },
        required: ["topic", "content_type"],
      },
      handler: async (args) => {
        const lang = args.language || "no";
        const plans = {
          article: [
            `# Redaksjonell plan: Artikkel`,
            `**Tema:** ${args.topic}`,
            `**Språk:** ${lang === "no" ? "Norsk bokmål" : "English"}`,
            ``,
            `## Arbeidsflyt`,
            ``,
            `### 1. Scaffold`,
            `Bruk \`scaffold_article\` for å opprette MDX-boilerplate med riktige metadata-eksporter.`,
            ``,
            `### 2. Skriv innhold`,
            `- Start med kontekst — hvorfor finnes denne artikkelen?`,
            `- Bruk H2 (##) for hovedseksjoner, H3 (###) for underseksjoner`,
            `- Hold avsnitt korte (3-5 setninger)`,
            `- Legg til bilder for visuell variasjon — importer fra samme mappe`,
            `- Avslutt med konklusjon eller handlingsoppfordring`,
            ``,
            `### 3. Språkvask`,
            `Bruk en av språkvask-agentene:`,
            `- \`plain-language-no\` — Klarspråksjekk for norsk tekst (klarspråk, AI-markører, anglismer, lesbarhet)`,
            `- \`plain-language-en\` — Plain-language cleanup for English text (simplifies, strips AI patterns)`,
            ``,
            `Disse sjekker:`,
            `- Klarspråk (det viktigste først, aktiv form)`,
            `- AI-markører (fjern "banebrytende", "revolusjonerende", etc.)`,
            `- Anglismer (bruk norske alternativ der det passer)`,
            `- Fagtermer (behold engelske tekniske termer som er etablert)`,
            ``,
            `### 4. Design-sjekk`,
            `Bruk \`article_guidelines\` for å verifisere mot designsystemet:`,
            `- Riktig MDX-struktur (tre exports før innhold)`,
            `- Bilder importert og brukt med <Image>-komponent`,
            `- Tailwind-klasser (ikke inline-stiler) for tilpasset layout`,
            `- "not-prose" class for custom component-blokker`,
            ``,
            `### 5. Validering`,
            `Kjør \`yarn run check\` for å verifisere at alt kompilerer.`,
          ].join("\n"),

          event: [
            `# Redaksjonell plan: Nytt arrangement`,
            `**Tema:** ${args.topic}`,
            ``,
            `## Arbeidsflyt`,
            ``,
            `### 1. Scaffold`,
            `Bruk \`scaffold_event\` for å generere event-skjelettet i riktig TypeScript-format.`,
            ``,
            `### 2. Fyll ut detaljer`,
            `- Tittel, beskrivelse, dato, sted`,
            `- Agenda med tidspunkter, foredragsholdere, og type (Talk/Panel/Break)`,
            `- Registreringsinnstillinger (fysisk/digital, kapasitet)`,
            `- Arrangører (SlackUser-format med navn, org, Slack-URL)`,
            `- Eventuelt sosialt arrangement`,
            ``,
            `### 3. Admin-sjekkliste`,
            `Bruk \`event_checklist\` for full sjekkliste (Slack-kanal, registrering, påminnelser).`,
            ``,
            `### 4. Validering`,
            `Kjør \`yarn run check\` for type-sjekk.`,
          ].join("\n"),

          "event-summary": [
            `# Redaksjonell plan: Oppsummering av arrangement`,
            `**Tema:** ${args.topic}`,
            `**Språk:** ${lang === "no" ? "Norsk bokmål" : "English"}`,
            ``,
            `## Arbeidsflyt`,
            ``,
            `### 1. Scaffold artikkel`,
            `Bruk \`scaffold_article\` — slug bør matche event-slug (f.eks. "fagdag-tema-dato").`,
            ``,
            `### 2. Innholdsstruktur`,
            `Typisk oppsummering:`,
            `- Kort intro (hvem, hva, når, hvor, antall deltakere)`,
            `- Høydepunkter og nøkkelfunn`,
            `- Bilder fra arrangementet (importert fra ./bilder)`,
            `- Agenda med lenker til YouTube-opptak`,
            `- Takk til arrangører og foredragsholdere`,
            ``,
            `### 3. Bilder`,
            `- Bruk mingling/presentasjon/gruppe-bilder`,
            `- Nummerer: 1-mingling.jpg, 2-presentasjon.jpg, 3-komite.jpg`,
            `- Legg dem i artikkelens mappe`,
            ``,
            `### 4. Språkvask + publisering`,
            `Samme som for vanlig artikkel (plain-language-no / plain-language-en → yarn run check).`,
          ].join("\n"),

          "member-update": [
            `# Redaksjonell plan: Medlemsoppdatering`,
            `**Tema:** ${args.topic}`,
            ``,
            `## Arbeidsflyt`,
            ``,
            `### 1. Rediger src/data/members.ts`,
            `Legg til/oppdater Member-objekt med:`,
            `- name, type (MemberType), homepage`,
            `- Valgfritt: github, linkedinUrl, logo, logoBackgroundColor`,
            ``,
            `### 2. Logo`,
            `- Legg logo-fil i prosjektet`,
            `- Importer som statisk bilde`,
            ``,
            `### 3. Validering`,
            `Kjør \`yarn run check\`.`,
          ].join("\n"),

          "landing-page": [
            `# Redaksjonell plan: Landingsside / ny side`,
            `**Tema:** ${args.topic}`,
            ``,
            `## Arbeidsflyt`,
            ``,
            `### 1. Planlegg struktur`,
            `Bruk \`design_system_reference\` for å forstå tilgjengelige komponenter og designtokens.`,
            ``,
            `### 2. Opprett side`,
            `- Ny route i src/app/[segment]/page.tsx`,
            `- Bruk Container + SimpleLayout for standard sider`,
            `- Bruk eksisterende komponenter (Card, Section, Badge, etc.)`,
            ``,
            `### 3. Design-gjennomgang`,
            `Verifiser:`,
            `- Mørk modus fungerer (zinc/teal-palett)`,
            `- Responsivt design (mobil → desktop)`,
            `- Tilgjengelighet (kontrast, fokustilstander)`,
            `- Heroicons for ikoner (ikke emoji)`,
            ``,
            `### 4. Validering`,
            `Kjør \`yarn run check\`.`,
          ].join("\n"),

          component: [
            `# Redaksjonell plan: Ny komponent`,
            `**Tema:** ${args.topic}`,
            ``,
            `## Arbeidsflyt`,
            ``,
            `### 1. Sjekk eksisterende`,
            `Bruk \`design_system_reference\` — sjekk om komponenten allerede finnes blant 60+ eksisterende.`,
            ``,
            `### 2. Opprett komponent`,
            `- Plasser i src/components/`,
            `- Bruk TypeScript med eksplisitte props-interface`,
            `- Støtt mørk modus via dark:-varianter`,
            `- Bruk Tailwind-klasser (ikke inline-stiler)`,
            `- Heroicons for ikoner`,
            ``,
            `### 3. Design-token-referanse`,
            `- Farger: zinc (nøytral), teal (aksent)`,
            `- Fontstørrelser: xs (0.8125rem) → 9xl (8rem)`,
            `- Prose-innhold håndteres av @tailwindcss/typography`,
            ``,
            `### 4. Validering`,
            `Kjør \`yarn run check\`.`,
          ].join("\n"),
        };

        return plans[args.content_type] || `Ukjent innholdstype: ${args.content_type}`;
      },
    },

    {
      name: "site_overview",
      description:
        "Returns a map of the Offentlig PaaS website's content domains, available tools, " +
        "and specialist agents. Use this to understand what the site contains and which " +
        "tools to use for different tasks.",
      parameters: { type: "object", properties: {} },
      handler: async () => {
        return [
          "# Offentlig PaaS — Nettstedsoversikt",
          "",
          "## Innholdsdomener",
          "",
          "| Domene | Plassering | Verktøy |",
          "|--------|-----------|---------|",
          "| Artikler (MDX) | src/app/artikkel/[slug]/page.mdx | scaffold_article, article_guidelines |",
          "| Arrangementer | src/data/events.ts | scaffold_event, event_checklist |",
          "| Medlemmer | src/data/members.ts | (rediger direkte) |",
          "| Komponenter | src/components/ | design_system_reference |",
          "| Admin | src/app/admin/ | (tRPC-basert) |",
          "",
          "## Tilgjengelige verktøy",
          "",
          "### Artikkelverktøy (article-writer)",
          "- `scaffold_article` — Opprett ny MDX-artikkel med riktig boilerplate",
          "- `article_guidelines` — Retningslinjer for skriving, design, struktur, bilder, komponenter",
          "",
          "### Arrangementsverktøy (event-manager)",
          "- `scaffold_event` — Opprett nytt arrangement med riktige TypeScript-typer",
          "- `event_checklist` — Sjekkliste for arrangering (før/under/etter)",
          "",
          "### Designverktøy (designer)",
          "- `design_system_reference` — Designtokens, fargeparett, typografi, komponentoversikt",
          "",
          "### Redaksjonelle verktøy (redaktør)",
          "- `content_plan` — Lag redaksjonell plan for innhold",
          "- `site_overview` — Denne oversikten",
          "",
          "## Spesialistagenter",
          "",
          "| Agent | Rolle |",
          "|-------|-------|",
          "| plain-language-no | Klarspråksjekk for norsk tekst — klarspråk, AI-markører, anglismer, lesbarhet |",
          "| plain-language-en | Plain-language cleanup for English text — simplifies, strips AI patterns |",
          "",
          "## Publiseringsflyt",
          "",
          "```",
          "Planlegg (content_plan) → Scaffold (article/event) → Skriv",
          "→ Språkvask (plain-language-no / plain-language-en)",
          "→ Design-sjekk (article_guidelines) → Valider (yarn run check)",
          "```",
          "",
          "## Teknisk stack",
          "- Next.js 16, React 19, TypeScript, Tailwind CSS 4",
          "- MDX-artikler med @tailwindcss/typography (prose)",
          "- Sanity CMS for registreringer, tilbakemeldinger, bilder",
          "- Slack OAuth + Bot API for autentisering og kommunikasjon",
          "- tRPC v11 for type-safe API",
        ].join("\n");
      },
    },
  ],

  hooks: {
    onUserPromptSubmitted: async (input) => {
      const prompt = input.prompt.toLowerCase();

      const contentKeywords = [
        "innhold", "content", "publiser", "publish",
        "redaksjon", "editorial", "plan",
        "skriv", "write", "tekst", "text",
        "ny side", "new page", "landingsside",
        "oppdater", "update",
      ];

      const isContentRelated = contentKeywords.some((kw) => prompt.includes(kw));
      if (!isContentRelated) return;

      return {
        additionalContext: `
[Redaktør — Editor-in-Chief Context]

Du jobber med innhold for Offentlig PaaS-nettsiden, et fellesskap for 2000+ plattformingeniører i norsk offentlig sektor.

Tilgjengelige verktøy:
- content_plan — Lag redaksjonell plan med anbefalt arbeidsflyt
- site_overview — Se alle innholdsdomener og verktøy
- scaffold_article — Opprett ny MDX-artikkel
- scaffold_event — Opprett nytt arrangement
- article_guidelines — Designsystem og skriveretningslinjer
- event_checklist — Sjekkliste for arrangementer
- design_system_reference — Komponent- og designtoken-referanse

Publiseringsflyt: Planlegg → Scaffold → Skriv → Språkvask (plain-language-no / plain-language-en) → Valider (yarn run check)

Språkvask-agenter:
- plain-language-no — Klarspråksjekk for norsk tekst (klarspråk, AI-markører, anglismer, lesbarhet)
- plain-language-en — Plain-language cleanup for English text (simplifies, strips AI patterns)

Språk: Norsk bokmål som standard. Engelske fagtermer beholdes (deploy, pipeline, cluster).
Tone: Profesjonell men tilgjengelig — skriv som til en kollega, ikke en pressemelding.
`,
      };
    },
  },
});

await session.log("Redaktør ready — content_plan & site_overview available");
