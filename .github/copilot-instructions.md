# Copilot Instructions - Offentlig PaaS Website

## Architecture Overview

This is a **Next.js 15** website built with **TypeScript**, **Tailwind CSS**, and **MDX** for content management. The site serves as the public face of Offentlig PaaS, a network for Norwegian public sector technology professionals.

### Core Structure

- **App Router**: Uses Next.js App Router with file-based routing in `src/app/`
- **Content Strategy**: MDX articles in `src/app/artikkel/[slug]/page.mdx` with metadata exports
- **Data Management**: Static data in `src/data/` (members, platforms, events)
- **Component Library**: Reusable UI components in `src/components/`
- **Styling**: Tailwind CSS with custom typography configuration
- **Authentication**: NextAuth.js v5 with Slack OAuth provider

## Key Patterns & Conventions

### Article System

Articles follow a strict MDX pattern in `src/app/artikkel/[slug]/page.mdx`:

```mdx
import { ArticleLayout } from '@/components/ArticleLayout'

export const article = {
  author: 'Author Name',
  date: '2024-MM-DD',
  title: 'Article Title',
  description: 'Brief description',
}

export const metadata = {
  title: article.title,
  description: article.description,
}

export default (props) => <ArticleLayout article={article} {...props} /

>
```

- Images go in the same folder as `page.mdx`
- Import images at top: `import image from './image.jpg'`
- Use Next.js `<Image>` component: `<Image src={image} alt="" />`
- `getAllArticles()` in `src/lib/articles.ts` dynamically discovers articles

### Member Management

Members are defined as class instances in `src/data/members.ts`:

```typescript
new Member({
  name: 'Organization Name',
  type: 'Stat|Kommune|Selskap|Andre|Forvaltningsorgan',
  github: 'github-org',
  logo: logoImage,
  logoBackgroundColor: '#color',
  linkedinUrl: 'https://linkedin.com/company/...',
})
```

### Authentication System

NextAuth.js v5 with Slack OAuth:

```typescript
// src/auth.ts
import NextAuth from 'next-auth'
import Slack from 'next-auth/providers/slack'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Slack({
      clientId: process.env.SLACK_CLIENT_ID!,
      clientSecret: process.env.SLACK_CLIENT_SECRET!,
    }),
  ],
})
```

```tsx
// Authentication UI component
import { useSession, signIn, signOut } from 'next-auth/react'

export function AuthButton() {
  const { data: session } = useSession()

  if (session) {
    return <button onClick={() => signOut()}>Logg ut</button>
  }

  return <button onClick={() => signIn('slack')}>Logg inn</button>
}
```

### Event Registration System

File-based JSON storage for event registrations:

```typescript
// src/lib/registrations.ts
export async function addEventRegistration(
  eventSlug: string,
  registration: EventRegistration
) {
  const filePath = path.join(
    process.cwd(),
    'data',
    'registrations',
    `${eventSlug}.json`
  )
  const registrations = await getEventRegistrations(eventSlug)
  registrations.push(registration)
  await fs.writeFile(filePath, JSON.stringify(registrations, null, 2))
}
```

```tsx
// Event registration component
export function EventRegistration({ eventSlug }: { eventSlug: string }) {
  const { data: session } = useSession()

  const handleRegister = async () => {
    await fetch(`/api/events/${eventSlug}/registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comments: '', dietary: '' }),
    })
  }

  if (!session) {
    return <AuthButton />
  }

  return <button onClick={handleRegister}>Meld deg på</button>
}
```

### Styling System

- **Tailwind CSS v4** with custom configuration in `tailwind.config.ts`
- Typography plugin with custom styles in `typography.ts`
- Dark mode support via `'selector'` strategy
- Component-based styling with consistent patterns
- Prettier + `prettier-plugin-tailwindcss` for automatic class sorting

## Development Workflow

### Essential Commands

```bash
yarn dev             # Development server (localhost:3000)
yarn build           # Production build
yarn lint            # ESLint checking
yarn format          # Prettier formatting
yarn typecheck       # TypeScript checking
```

### Environment Variables

```bash
# NextAuth.js v5
AUTH_SECRET="your-secret-key-here"

# Slack OAuth
SLACK_CLIENT_ID="your-slack-client-id"
SLACK_CLIENT_SECRET="your-slack-client-secret"

# Slack API (for member count)
SLACK_BOT_TOKEN="xoxb-your-slack-bot-token"
```

### Build System

- **MDX Processing**: Custom Next.js configuration with `@next/mdx`
- **Syntax Highlighting**: Uses `@mapbox/rehype-prism` for code blocks
- **Images**: Remote patterns configured for GitHub and Slack avatars
- **Analytics**: Vercel Analytics and Speed Insights integrated

### Deployment & CI/CD

- **Platform**: Vercel handles automatic deployments from Git
- **Preview Builds**: Every PR gets a preview deployment
- **Production**: Main branch auto-deploys to production

## File Organization

### Component Architecture

- `Layout.tsx` - Main site layout wrapper
- `ArticleLayout.tsx` - Article-specific layout with navigation
- `SimpleLayout.tsx` - Basic page layout for static content
- `AuthButton.tsx` - Login/logout component
- `EventRegistration.tsx` - Event signup component
- Component composition pattern with compound components

### Data Flow

- Static data exports from `src/data/` files
- Dynamic article discovery via `fast-glob` in `src/lib/articles.ts`
- Server-side data fetching in page components
- File-based JSON storage for event registrations
- JWT sessions (no database required)

### Image Handling

- Logo images in `src/images/logos/` as imported SVGs
- Article images co-located with MDX files
- Platform logos in `src/images/platforms/`
- Automatic GitHub avatar generation for members with `github` property

## Norwegian Content Context

This is a Norwegian public sector website. Content should be in Norwegian (bokmål) unless specified otherwise. The organization focuses on platform development, DevOps practices, and technology sharing across Norwegian government agencies.

Key terminology:

- "Fagdag" = Professional development day/conference
- "Offentlig sektor" = Public sector
- "Plattform" = Platform (technical)
- "Medlemmer" = Members
- "Artikkel" = Article

When adding content, maintain the professional tone and focus on practical technology insights relevant to Norwegian public sector developers and platform teams.

## Coding Style Guidelines

- Prefer code examples over long explanations
- Do not add comments to code unless asked
- Do not create new documentation files unless asked
- Keep documentation simple, accurate and to the point
- Avoid overly verbose or repetitious language
- Do not create lengthy summaries after coding sessions
- Clean up comments and unused code before finalizing
