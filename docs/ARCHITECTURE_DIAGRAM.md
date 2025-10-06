# Event Secret Information - Architecture Diagram

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Journey                             │
└─────────────────────────────────────────────────────────────────┘

1. User logs in via Slack OAuth
2. User registers for event
3. User visits event page /fagdag/[slug]
4. EventSecretInfo component checks if user is registered
5. If registered, fetches secret info from API
6. Displays streaming URL button


┌─────────────────────────────────────────────────────────────────┐
│                     Component Architecture                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ Event Page (/fagdag/[slug]/page.tsx)                            │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ EventRegistrationProvider (Context)                        │ │
│  │  - Tracks registration status                              │ │
│  │  - Provides isRegistered flag                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ EventRegistration (Component)                              │ │
│  │  - Registration form                                       │ │
│  │  - Registration status                                     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ EventSecretInfo (NEW Component)                            │ │
│  │  - Checks isRegistered from context                        │ │
│  │  - Fetches secret info if registered                       │ │
│  │  - Displays streaming URL button                           │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                         API Flow                                 │
└─────────────────────────────────────────────────────────────────┘

EventSecretInfo Component
    │
    │ fetch('/api/events/[slug]/secret-info')
    ▼
┌──────────────────────────────────────────────────────────────┐
│ API Route (/api/events/[slug]/secret-info/route.ts)         │
│                                                               │
│  1. Check Authentication (Slack session)                     │
│     ├─ No session? → 401 Unauthorized                        │
│     └─ Session OK → Continue                                 │
│                                                               │
│  2. Validate Event Exists                                    │
│     ├─ Event not found? → 404 Not Found                      │
│     └─ Event exists → Continue                               │
│                                                               │
│  3. Check Registration                                        │
│     ├─ Not registered? → 403 Forbidden                       │
│     └─ Registered → Continue                                 │
│                                                               │
│  4. Fetch Secret Info from Sanity                            │
│     │                                                         │
│     ├─ getEventSecretInfo(slug)                              │
│     │     │                                                   │
│     │     ▼                                                   │
│     │  ┌──────────────────────────────────────────────────┐ │
│     │  │ Sanity Query                                     │ │
│     │  │ *[_type == "eventSecretInfo" &&                  │ │
│     │  │   eventSlug == $eventSlug][0]                    │ │
│     │  └──────────────────────────────────────────────────┘ │
│     │                                                         │
│     ├─ No data? → 404 Not Found                              │
│     └─ Data found → Return secret info                       │
│                                                               │
│  Response Headers:                                            │
│    - Cache-Control: private, no-store, no-cache              │
│    - Pragma: no-cache                                         │
│    - Expires: 0                                               │
└──────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                      Data Storage                                │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Git Repository (src/data/events.ts)                          │
│                                                               │
│  - Event slug: "2025-10-15-selvbetjening-fagdag"             │
│  - Event title: "Offentlig PaaS Fagdag Selvbetjening"       │
│  - Event description, schedule, etc.                         │
│  - NO SECRET INFORMATION                                     │
└──────────────────────────────────────────────────────────────┘
                         │
                         │ Linked by slug
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ Sanity CMS (eventSecretInfo document)                        │
│                                                               │
│  - eventSlug: "2025-10-15-selvbetjening-fagdag"              │
│  - streamingUrl: "https://zoom.us/j/12345678"                │
│  - notes: "Backup URL: https://meet.google.com/abc"          │
│  - ONLY ACCESSIBLE TO REGISTERED USERS                       │
└──────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                     Security Layers                              │
└─────────────────────────────────────────────────────────────────┘

Layer 1: Authentication
  ✓ User must be logged in via Slack OAuth
  ✓ Session verified by NextAuth.js

Layer 2: Authorization
  ✓ User must be registered for specific event
  ✓ Registration checked in Sanity database

Layer 3: Data Isolation
  ✓ Secret info stored only in Sanity (not Git)
  ✓ Separate document type from registrations

Layer 4: Cache Control
  ✓ Private cache headers
  ✓ No CDN/browser caching

Layer 5: UI Protection
  ✓ Component silently fails for unauthorized
  ✓ No error messages revealing functionality


┌─────────────────────────────────────────────────────────────────┐
│                     Admin Workflow                               │
└─────────────────────────────────────────────────────────────────┘

1. Admin logs into Sanity Studio
   │
   ▼
2. Navigate to "Event Secret Info"
   │
   ▼
3. Click "Create new Event Secret Info"
   │
   ▼
4. Enter:
   - Event Slug (must match events.ts)
   - Streaming URL
   - Optional notes
   │
   ▼
5. Publish document
   │
   ▼
6. Immediately available to registered users
