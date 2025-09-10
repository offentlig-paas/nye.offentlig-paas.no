# Copilot Instructions - Offentlig PaaS Website

## Architecture Overview

This is a **Next.js 15** website built with **TypeScript**, **Tailwind CSS**, and **MDX** for content management. The site serves as the public face of Offentlig PaaS, a network for Norwegian public sector technology professionals.

### Core Structure

- **App Router**: Uses Next.js App Router with file-based routing in `src/app/`
- **Content Strategy**: MDX articles in `src/app/artikkel/[slug]/page.mdx` with metadata exports
- **Data Management**: Static data in `src/data/` (members, platforms, events)
- **Component Library**: Reusable UI components in `src/components/`
- **Styling**: Tailwind CSS with custom typography configuration

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
  github: 'github-org', // Optional, generates avatar
  logo: logoImage, // Optional, imported SVG/image
  logoBackgroundColor: '#color', // Optional
  linkedinUrl: 'https://linkedin.com/company/...',
})
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

### Build System

- **MDX Processing**: Custom Next.js configuration with `@next/mdx`
- **Syntax Highlighting**: Uses `@mapbox/rehype-prism` for code blocks
- **Images**: Remote patterns configured for GitHub and Slack avatars
- **Analytics**: Vercel Analytics and Speed Insights integrated

### Deployment & CI/CD

- **Platform**: Vercel handles automatic deployments from Git
- **Preview Builds**: Every PR gets a preview deployment
- **Production**: Main branch auto-deploys to production
- **Environment Variables**: `SLACK_BOT_TOKEN` required for API integration

### API Integration

The site includes a Slack API integration:

- `src/app/api/slack/userCount/route.ts` - Fetches member count
- Requires `SLACK_BOT_TOKEN` environment variable
- Implements cursor-based pagination for large member lists
- 1-hour revalidation caching

## File Organization

### Component Architecture

- `Layout.tsx` - Main site layout wrapper
- `ArticleLayout.tsx` - Article-specific layout with navigation
- `SimpleLayout.tsx` - Basic page layout for static content
- Component composition pattern with compound components (e.g., `Card.Title`, `Card.Description`)

### Data Flow

- Static data exports from `src/data/` files
- Dynamic article discovery via `fast-glob` in `src/lib/articles.ts`
- Server-side data fetching in page components
- No client-side state management (static site approach)

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
