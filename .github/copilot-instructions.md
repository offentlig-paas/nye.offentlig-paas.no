# Copilot Instructions - Offentlig PaaS Website

## Architecture Overview

**Next.js 15** website with **TypeScript**, **Tailwind CSS**, and **MDX**. Public site for Norwegian public sector technology professionals.

**Tech Stack:**

- Next.js App Router with file-based routing
- MDX articles with metadata exports
- Static data in `src/data/` (members, platforms, events)
- NextAuth.js v5 with Slack OAuth
- Sanity storage for dynamic and user data like event registrations and feedback

### Utility Functions - Always Check Before Creating

**CRITICAL**: Before creating ANY utility function, search these locations first:

**Date/Time utilities** - `src/lib/formatDate.ts`:

- `formatDateTime()` - Full date and time with weekday
- `formatDate()` - Date only
- `formatDateLong()` - Date with weekday
- `formatDateShort()` - Short date format
- `formatTime()` - Time only
- `formatTimeRange()` - Time range
- `NORWEGIAN_MONTHS` - Month names constant

**Event utilities** - `src/lib/events/helpers.ts`:

- `getStatus()` - Event status (upcoming/current/past)
- `isAcceptingRegistrations()` - Registration check
- `isCallForPapersOpen()` - CFP status
- `getAllEvents()` - Fetch all events
- `getUniqueSpeakers()` - Extract unique speakers from schedule

**Slack utilities** - `src/lib/slack/utils.ts`:

- `extractSlackUserId()` - Extract user ID from Slack URL
- `extractSlackIds()` - Extract IDs from array of objects

**Slack channel operations** - `src/lib/slack/channels.ts`:

- `generateChannelName()` - Generate channel name from date
- `createChannel()` - Create or get existing channel
- `ensureBotInChannel()` - Ensure bot is channel member
- `inviteUsersToChannel()` - Batch invite users
- `findChannelByName()` - Find channel by name
- `archiveChannel()` - Archive a channel

**Sanity utilities** - `src/lib/sanity/utils.ts`:

- `generateSanityKey()` - Generate unique key for Sanity array items
- `addKeysToArrayItems()` - Add `_key` to array items
- `prepareSanityDocument()` - Prepare document with arrays for Sanity (auto-adds `_key` to all array items)

**IMPORTANT**: When creating Sanity documents with arrays, always use `prepareSanityDocument()` to ensure all array items have the required `_key` property. Sanity will reject documents with array items missing `_key`.

## Key Patterns & Conventions

### Key Patterns

**Articles:** MDX files in `src/app/artikkel/[slug]/page.mdx` with article metadata export and `<ArticleLayout>` wrapper. Images co-located with page.mdx files.

**Members:** Class instances in `src/data/members.ts` with name, type, logo, and optional GitHub/LinkedIn links.

**Events:** Static data in `src/data/events.ts` with file-based JSON storage for registrations in `data/registrations/`.

### tRPC API

**Type-safe API layer** - Most endpoints use tRPC v11 for end-to-end type safety:

- **Server**: `src/server/` - Context creation, routers, and procedures
- **Client**: `src/lib/trpc/client.ts` - Typed client with React Query
- **Provider**: `src/lib/trpc/TRPCProvider.tsx` - Wraps app with React Query

**Access control procedures**:

- `publicProcedure` - No authentication required
- `protectedProcedure` - Requires authenticated user
- `adminProcedure` - Requires admin role
- `adminEventProcedure` - Requires admin + event access

**REST endpoints preserved**:

- NextAuth (`/api/auth`) - OAuth authentication
- File uploads (`/api/talk-attachments`, `/api/admin/events/[slug]/talk-attachments`) - Multipart form data
- Some admin operations - Full CRUD on events, speaker updates (dev only)
- Slack avatar proxy - Image caching
- User deletion - Account management

Use tRPC for new features. Only use REST for multipart uploads or when tRPC is not suitable.

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
- Avoid overly verbose or repetitive language
- Do not create lengthy summaries after coding sessions
- Clean up comments and unused code before finalizing
- Always run `yarn run check` after making changes

## Development Best Practices

### Search Strategy: Always Check Existing Code First

When asked to create functionality:

1. **Search first**: Use `grep_search` or `semantic_search` to find existing implementations
2. **Reuse**: Import and use existing functions from utility files (see Architecture section)
3. **Extend**: If existing function is close, extend it rather than duplicate
4. **Create**: Only create new utilities if truly unique

### Common Patterns to Check

- Authentication middleware for admin routes (see Authentication section)
- Date/time formatting (always check `formatDate.ts`)
- Event-related logic (check `events/helpers.ts`)
- Slack integration (check `slack/` directory)
- Form validation patterns
- Error handling patterns
