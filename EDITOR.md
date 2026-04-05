# Copilot Extensions for Content & Design

> **Note:** These extensions use the Copilot CLI SDK (`@github/copilot-sdk/extension`) and only work in [GitHub Copilot CLI](https://docs.github.com/copilot/concepts/agents/about-copilot-cli). They do not work in VS Code Copilot Chat. The knowledge in `AGENTS.md` and `.github/instructions/` files is shared with VS Code, but the tools and hooks below require the CLI.

This project ships four Copilot CLI extensions that provide domain-specific tools for managing articles, events, and design on the Offentlig PaaS website.

## Why extensions instead of agents?

Copilot CLI has two customization mechanisms:

|                   | Agents (`.agent.md`)                         | Extensions (`.mjs`)                                        |
| ----------------- | -------------------------------------------- | ---------------------------------------------------------- |
| What they are     | Static system-prompt files                   | JavaScript programs running via the SDK                    |
| What they can do  | Influence the LLM's persona and instructions | Register **callable tools** and **hooks**                  |
| How they activate | User explicitly `@mentions` them             | Hooks detect keywords and inject context **automatically** |
| Output            | Text advice                                  | Structured data, scaffolded files, generated code          |

We use **extensions** for the content workflow because the value is in _tools that do things_ — scaffolding an MDX article, generating a TypeScript event skeleton, returning the design token reference — not in persona prompts. An agent can tell you _how_ to write an article; an extension creates the boilerplate and hands you the design rules.

Extensions also **compose with agents**. The language-quality agents (`plain-language-no`, `plain-language-en`) are persona-based — they review and rewrite text. The extensions handle everything before and around that: planning, scaffolding, reference data, and checklists. Together they form a pipeline:

```plain
Plan (extension) → Scaffold (extension) → Write → Language cleanup (agent) → Validate
```

## Architecture

```plain
.github/extensions/
├── redaktor/          Editor-in-chief — triages requests, plans workflows
│   └── extension.mjs  Tools: content_plan, site_overview
├── article-writer/    MDX article specialist
│   └── extension.mjs  Tools: scaffold_article, article_guidelines
├── event-manager/     Fagdag/event specialist
│   └── extension.mjs  Tools: scaffold_event, event_checklist
└── designer/          Tailwind/component specialist
    └── extension.mjs  Tools: design_system_reference
```

Each extension registers:

- **Tools** — functions the LLM can call to produce output (scaffolded files, reference data, checklists)
- **Hook** (`onUserPromptSubmitted`) — detects domain keywords in your prompt and silently injects relevant context so the LLM knows which tools to use without being told

### How hooks work

When you type a prompt, every extension's hook runs. If it detects relevant keywords (e.g. "artikkel", "fagdag", "design"), it returns `additionalContext` that gets prepended to the LLM's context window. This is invisible to you but makes the LLM aware of the tools and conventions.

Example: typing "write an article about observability" triggers the article-writer hook, which injects the MDX structure, image conventions, and available tools. The LLM then knows to call `scaffold_article` without you needing to ask.

## Tools reference

### Redaktør (editor-in-chief)

| Tool            | Parameters                           | What it does                                                                                                                                             |
| --------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content_plan`  | `topic`, `content_type`, `language?` | Returns a step-by-step editorial workflow for the content type. Types: `article`, `event`, `event-summary`, `member-update`, `landing-page`, `component` |
| `site_overview` | —                                    | Returns a map of all content domains, tools, and available agents                                                                                        |

### Article Writer

| Tool                 | Parameters                                             | What it does                                                                                                        |
| -------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `scaffold_article`   | `title`, `author`, `description`, `language?`, `slug?` | Creates the MDX directory and `page.mdx` with correct metadata exports, ArticleLayout wrapper, and Next.js metadata |
| `article_guidelines` | `section?`                                             | Returns writing and design guidelines. Sections: `structure`, `design`, `writing`, `components`, `images`, or `all` |

### Event Manager

| Tool              | Parameters                                                                                                                                                | What it does                                                                                                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scaffold_event`  | `title`, `date`, `start_time`, `end_time`, `location`, `ingress`, `description?`, `max_capacity?`, `attendance_types?`, `has_social_event?`, `num_talks?` | Generates a complete TypeScript event object with correct types (`Event`, `Item`, `SlackUser`, `ItemType`, `AttendanceType`, `Audience`) ready to paste into `src/data/events.ts` |
| `event_checklist` | `phase?`                                                                                                                                                  | Returns operational checklist for event lifecycle. Phases: `before`, `during`, `after`, or `all`                                                                                  |

### Designer

| Tool                      | Parameters | What it does                                                                                                                  |
| ------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `design_system_reference` | `section?` | Returns the design system reference. Sections: `colors`, `typography`, `components`, `layout`, `dark-mode`, `icons`, or `all` |

## Language agents

These are persona agents (not extensions) that handle text quality. Use them _after_ writing content:

| Agent               | What it does                                                                          |
| ------------------- | ------------------------------------------------------------------------------------- |
| `plain-language-no` | Norwegian plain-language cleanup — klarspråk, AI markers, anglicisms, readability     |
| `plain-language-en` | English plain-language cleanup — simplifies, strips AI patterns, improves readability |

## Workflows

### Write a new article

```plain
1. Ask Copilot to write an article about [topic]
   → article-writer hook auto-injects context
   → LLM calls scaffold_article to create boilerplate
   → LLM writes content using article_guidelines

2. Ask plain-language-no to review the text (or plain-language-en for English)
3. Run: yarn run check
```

### Create a new event

```plain
1. Ask Copilot to create a fagdag about [topic] on [date]
   → event-manager hook auto-injects context
   → LLM calls scaffold_event to generate the TypeScript skeleton
   → You fill in speakers, descriptions, Slack IDs

2. Run: yarn run check
3. Use event_checklist for operational tasks (Slack channel, reminders, etc.)
```

### Add a promo banner image to an event

Events support an optional `bannerImage` field for social media sharing (OG/Twitter cards) and event list cards. This is useful for upcoming events that don't have photos yet.

**Image requirements:**

- Recommended size: **1200×630px** (standard OG image ratio)
- Format: PNG, JPG, or WebP
- Place the file in `public/images/events/`

**Usage in `src/data/events.ts`:**

```typescript
{
  slug: '2026-05-12-ki-kodeagenter',
  title: 'Erfaringsdeling: KI-kodeagenter',
  bannerImage: {
    src: '/images/events/2026-05-12-ki-agenter.png',
    alt: 'KI-kodeagenter fagdag banner',
  },
  // ... rest of event
}
```

**OG image priority:** `bannerImage` → first Sanity event photo → no image. Once an event has photos uploaded via the admin panel, those take precedence on the event list cards.

### Plan any content

```plain
1. Ask: "Plan content about [topic]"
   → redaktor hook auto-injects context
   → LLM calls content_plan with the right content_type
   → Returns step-by-step workflow with tool recommendations
```

## Development

Extensions are standard ES modules (`.mjs`) using the `@github/copilot-sdk/extension` SDK. The SDK provides:

- `joinSession({ tools, hooks })` — registers tools and hooks with the Copilot CLI runtime
- `session.log(message)` — sends a visible log message to the user (not `console.log`, which is reserved for JSON-RPC)

Extensions auto-load when a Copilot CLI session starts. To reload after changes:

- Type `/clear` in the CLI, or
- The LLM can call `extensions_reload()`

Tool names must be globally unique across all extensions. If two extensions register the same tool name, the second one fails to load.
