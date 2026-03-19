import { joinSession } from "@github/copilot-sdk/extension";

// ─── Article Writer Agent Extension ─────────────────────────────────────────
//
// A specialized web/design article writer for the Offentlig PaaS website.
// Understands the MDX article system, Tailwind typography design tokens,
// and Norwegian public-sector content conventions.
//
// Inspired by:
//   - msitarzewski/agency-agents (design-visual-storyteller, technical-writer)
//   - github/awesome-copilot agent patterns
//   - wshobson/agents progressive disclosure architecture

import { readdir, mkdir, writeFile, access } from "node:fs/promises";
import { join, resolve } from "node:path";

const ARTICLE_DIR = "src/app/artikkel";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[æ]/g, "ae")
    .replace(/[ø]/g, "o")
    .replace(/[å]/g, "a")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function generateMDXBoilerplate({ title, author, date, description, language }) {
  return `import { ArticleLayout } from '@/components/ArticleLayout'

export const article = {
  author: '${author}',
  date: '${date}',
  title: '${title}',
  description:
    '${description}',
}

export const metadata = {
  title: article.title,
  language: '${language}',
  description: article.description,
}

export default props => <ArticleLayout article={article} {...props} />

`;
}

// ─── Tool: scaffold_article ─────────────────────────────────────────────────

const scaffoldArticleTool = {
  name: "scaffold_article",
  description:
    "Creates a new MDX article directory with boilerplate for the Offentlig PaaS website. " +
    "Generates the slug, directory, and page.mdx with correct metadata exports, " +
    "ArticleLayout wrapper, and Next.js metadata. Returns the file path for further editing.",
  parameters: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Article title (Norwegian or English)",
      },
      author: {
        type: "string",
        description: "Author full name, e.g. 'Hans Kristian Flaatten'",
      },
      description: {
        type: "string",
        description: "Short meta description (1-2 sentences) for SEO and article cards",
      },
      language: {
        type: "string",
        enum: ["no", "en"],
        description: "Content language: 'no' for Norwegian bokmål (default), 'en' for English",
      },
      slug: {
        type: "string",
        description: "Optional URL slug override. If omitted, auto-generated from title.",
      },
    },
    required: ["title", "author", "description"],
  },
  handler: async (args, invocation) => {
    const slug = args.slug || slugify(args.title);
    const language = args.language || "no";
    const date = todayISO();
    const cwd = process.cwd();
    const dirPath = join(cwd, ARTICLE_DIR, slug);
    const filePath = join(dirPath, "page.mdx");

    try {
      await access(dirPath);
      return {
        textResultForLlm: `Article directory already exists at ${ARTICLE_DIR}/${slug}/. Use the existing page.mdx or choose a different slug.`,
        resultType: "failure",
      };
    } catch {
      // Directory doesn't exist — good, we'll create it
    }

    await mkdir(dirPath, { recursive: true });

    const content = generateMDXBoilerplate({
      title: args.title,
      author: args.author,
      date,
      description: args.description,
      language,
    });

    await writeFile(filePath, content, "utf-8");

    return [
      `✅ Article scaffolded at ${ARTICLE_DIR}/${slug}/page.mdx`,
      "",
      "Created with:",
      `  Title:       ${args.title}`,
      `  Author:      ${args.author}`,
      `  Date:        ${date}`,
      `  Language:    ${language}`,
      `  Slug:        ${slug}`,
      "",
      "Next steps:",
      `  1. Open ${ARTICLE_DIR}/${slug}/page.mdx and write the article content below the boilerplate`,
      "  2. Add images to the same directory and import them: import myImage from './my-image.png'",
      "  3. Use <Image src={myImage} alt=\"descriptive alt text\" /> to display images",
      "  4. Import custom components from @/components/ if needed (e.g. InfoCard, SocialLink)",
      "  5. Run 'yarn run check' when finished",
    ].join("\n");
  },
};

// ─── Tool: article_guidelines ─────────────────────────────────────────────────

const articleGuidelinesTool = {
  name: "article_guidelines",
  description:
    "Returns comprehensive writing and design guidelines for Offentlig PaaS articles. " +
    "Covers MDX structure, Tailwind typography tokens, Norwegian content conventions, " +
    "image handling, component usage, and editorial tone. " +
    "Use this before writing or reviewing article content.",
  parameters: {
    type: "object",
    properties: {
      section: {
        type: "string",
        enum: ["all", "structure", "design", "writing", "components", "images"],
        description: "Which guideline section to return. Defaults to 'all'.",
      },
    },
  },
  handler: async (args) => {
    const section = args.section || "all";
    const sections = {};

    sections.structure = `
## MDX Article Structure

Every article lives at src/app/artikkel/[slug]/page.mdx and follows this exact pattern:

\`\`\`mdx
import { ArticleLayout } from '@/components/ArticleLayout'
import myImage from './my-image.png'

export const article = {
  author: 'Full Name',
  date: 'YYYY-MM-DD',
  title: 'Article Title',
  description: 'One or two sentence meta description.',
}

export const metadata = {
  title: article.title,
  language: 'no',  // 'no' for Norwegian, 'en' for English
  description: article.description,
}

export default props => <ArticleLayout article={article} {...props} />

Article content starts here...
\`\`\`

Key rules:
- The three exports (article, metadata, default) MUST come before any content
- The default export wraps everything in ArticleLayout which provides the Prose styling
- Article content uses standard Markdown plus JSX components
- remark-gfm is enabled: tables, strikethrough, autolinks, and task lists all work
- Images are co-located in the same directory as page.mdx
`;

    sections.design = `
## Design System & Typography

The site uses a zinc/teal color palette with @tailwindcss/typography (prose).

### Color Palette
- **Body text:** zinc.600 (light) / zinc.400 (dark)
- **Headings:** zinc.900 (light) / zinc.200 (dark)
- **Links:** teal.500 → teal.600 hover (light) / teal.400 (dark)
- **Code inline bg:** zinc.300/0.2 (light) / zinc.200/0.05 (dark)
- **Code block bg:** zinc.900 (light) / black/0.4 (dark)
- **Blockquote border:** zinc.200 (light) / zinc.500 (dark), italic style

### Typography Scale
- Body: 1rem/1.75rem
- H2: 1.25rem (xl), semibold, 5rem top margin — use for main sections
- H3: 1rem (base), semibold, 4rem top margin — use for subsections
- Code: 0.875rem (sm), semibold, inline-block with rounded-lg background
- Tables: 0.875rem (sm), full-width, auto layout

### Spacing Rules
- Paragraphs: 1.75rem vertical spacing
- H2 sections create large visual breaks (5rem top margin)
- Images get 3xl border radius automatically
- Horizontal rules span extra wide on lg+ screens
- Lists use disc/decimal with generous spacing (1.5rem between items)

### Dark Mode
- darkMode: 'selector' — fully supported
- All prose elements have dark variants via CSS custom properties
- Dark backgrounds shift from zinc.900 to transparent blacks
- Never hardcode colors — let the prose plugin handle it
`;

    sections.writing = `
## Writing Guidelines

### Language & Tone
- Default language is Norwegian bokmål unless specified otherwise
- Professional but accessible tone — write for fellow developers and platform engineers
- Focus on practical insights, not marketing speak
- Share real experiences, data, and lessons learned

### Norwegian Terminology
- "Fagdag" = Professional development day / conference
- "Offentlig sektor" = Public sector
- "Plattform" = Platform (technical)
- "Medlemmer" = Members
- "Artikkel" = Article
- "Virksomhet" = Government agency / organisation
- "Undersøkelse" = Survey / study

### Content Structure
- Start with context — why does this article exist?
- Use H2 (##) for major sections, H3 (###) for subsections
- Keep paragraphs short (3-5 sentences max)
- Use lists for enumeration (agenda items, findings, takeaways)
- Include images to break up text and add visual interest
- End with a conclusion, summary, or call-to-action where appropriate

### Editorial Rules
- Do NOT use emojis — use Heroicons if icons are needed
- Do NOT add unnecessary code comments
- Keep descriptions concise and accurate
- Prefer code examples over long explanations when relevant
- Link to external resources (YouTube videos, GitHub repos) where appropriate
- Always include alt text for images (accessibility)
`;

    sections.components = `
## Available Components

### Built-in via mdx-components.tsx
- **Image** — Next.js Image component. Import images from the same directory:
  \`\`\`mdx
  import photo from './photo.png'
  <Image src={photo} alt="Description of the image" />
  \`\`\`

### From @/components/ (import as needed)
- **SocialLink** + icons (GitHubIcon, SlackIcon, YouTubeIcon) — social media links
  \`\`\`mdx
  import { SocialLink, GitHubIcon } from '@/components/SocialIcons'
  <SocialLink href="https://github.com/org" icon={GitHubIcon} aria-label="GitHub" />
  \`\`\`

- **InfoCard** — stats display cards
  \`\`\`mdx
  import { InfoCard } from '@/components/Stats'
  <div className="not-prose mt-6 flex flex-col justify-center gap-6 sm:flex-row">
    <InfoCard title="Meldinger på Slack" number="68,970" />
    <InfoCard title="Brukere på Slack" number="1889" />
  </div>
  \`\`\`

### Tailwind in MDX
- Use className on JSX elements: \`<div className="mt-6 flex gap-6">\`
- Use "not-prose" class to opt out of typography styles for custom layouts
- Never use inline styles — always Tailwind utilities
`;

    sections.images = `
## Image Guidelines

### File Handling
- Co-locate images with the page.mdx file in the same directory
- Use descriptive filenames: "1-maturity-model.png" not "img1.png"
- Number-prefix images to maintain visual order: "1-intro.png", "2-results.png"
- Supported formats: PNG, JPG, WebP (Next.js handles optimization)

### Import Pattern
\`\`\`mdx
import maturityModel from './1-maturity-model.png'
import respondents from './2-respondents.png'

<Image src={maturityModel} alt="CNCF Platform Maturity Model with 5 levels" />
\`\`\`

### Alt Text
- Always provide meaningful alt text for accessibility
- Describe what the image shows, not just its title
- For decorative images, use alt="" (empty string)
- For charts/diagrams, describe the key insight

### Sizing
- Images are rendered at full article width (max-w-2xl ≈ 672px)
- Images automatically get 3xl border radius from the typography config
- No need to specify width/height — Next.js Image handles this from imports

### Remote Images
- The site allows images from: github.com, slack-edge.com, gravatar.com, cdn.sanity.io
- For other remote sources, add the domain to next.config.mjs remotePatterns
`;

    if (section === "all") {
      return Object.values(sections).join("\n---\n");
    }

    if (sections[section]) {
      return sections[section];
    }

    return {
      textResultForLlm: `Unknown section '${section}'. Valid: all, structure, design, writing, components, images`,
      resultType: "failure",
    };
  },
};

// ─── Hook: onUserPromptSubmitted ────────────────────────────────────────────

async function onUserPromptSubmitted(input) {
  const prompt = input.prompt.toLowerCase();

  const articleKeywords = [
    "artikkel",
    "article",
    "blog",
    "write",
    "skriv",
    "mdx",
    "fagdag",
    "annual report",
    "årsberetning",
    "survey",
    "undersøkelse",
    "publiser",
    "publish",
  ];

  const isArticleRelated = articleKeywords.some((kw) => prompt.includes(kw));
  if (!isArticleRelated) return;

  return {
    additionalContext: `
[Article Writer Context — Offentlig PaaS]

You are writing for the Offentlig PaaS website, a Norwegian public sector platform community.
Use the scaffold_article tool to create new articles, and article_guidelines tool for reference.

Quick reference:
- Articles are MDX files at src/app/artikkel/[slug]/page.mdx
- Every article exports: article (metadata), metadata (Next.js), default (ArticleLayout wrapper)
- Images are co-located and imported as ESM imports
- Content language defaults to Norwegian bokmål
- Design uses zinc/teal color palette with @tailwindcss/typography prose
- Use Heroicons, not emojis. Use Tailwind classes, not inline styles.
- Available components: Image (built-in), SocialLink, InfoCard, and any from @/components/
- Run 'yarn run check' after finishing to validate

Call article_guidelines for comprehensive writing, design, and structural reference.
`,
  };
}

// ─── Start Extension ────────────────────────────────────────────────────────

const session = await joinSession({
  tools: [scaffoldArticleTool, articleGuidelinesTool],
  hooks: {
    onUserPromptSubmitted,
  },
});

await session.log("Article Writer agent ready — scaffold_article & article_guidelines available");
