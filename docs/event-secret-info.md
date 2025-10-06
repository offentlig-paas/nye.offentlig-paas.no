# Event Secret Information

This document explains how to manage secret information for events, such as streaming URLs that should only be visible to registered participants.

## Overview

The event secret information feature allows administrators to store sensitive information about events (like streaming URLs) that should only be accessible to registered participants. This information is stored in Sanity CMS and is never exposed in the public Git repository.

## Architecture

### Components

1. **Sanity Schema** (`src/lib/sanity/schemas.ts`): Defines the `eventSecretInfo` document type
2. **API Endpoint** (`src/app/api/events/[slug]/secret-info/route.ts`): Provides authenticated access to secret info
3. **React Component** (`src/components/EventSecretInfo.tsx`): Displays secret info to registered users
4. **Service Layer** (`src/lib/sanity/event-secret-info.ts`): Fetches secret info from Sanity

### Security

- Secret information is **only** stored in Sanity CMS, never in Git
- API endpoint requires user to be:
  1. Authenticated (logged in via Slack)
  2. Registered for the specific event
- API responses use cache headers to prevent caching of sensitive data
- Component automatically handles loading states and errors

## How to Add Secret Information to an Event

### Step 1: Access Sanity Studio

1. Navigate to the Sanity Studio (typically at `/studio` or your configured URL)
2. Log in with your admin credentials

### Step 2: Create Event Secret Info

1. In Sanity Studio, navigate to "Event Secret Info" in the sidebar
2. Click "Create new Event Secret Info"
3. Fill in the required fields:
   - **Event Slug**: Must exactly match the slug from `src/data/events.ts` (e.g., `2025-10-15-selvbetjening-fagdag`)
   - **Streaming URL**: The private streaming link for registered participants
   - **Private Notes** (optional): Any additional internal notes

### Step 3: Publish

1. Click "Publish" to save the secret information
2. The information will now be available to registered participants

## User Experience

### For Registered Participants

When a user is registered for an event and secret information exists:

1. They will see a blue information box on the event page
2. The box contains:
   - A description that this is for registered participants only
   - A button to open the streaming URL
   - Any private notes (if added)

### For Non-Registered Users

- No secret information is shown
- The API returns a 403 Forbidden if someone tries to access secret info without being registered

### For Event Organizers/Admins

- Can manage secret information through Sanity Studio
- Can view/edit/delete secret info at any time
- Changes are immediately reflected for all registered users

## Example Event Slug Mapping

Event slugs must match exactly between `src/data/events.ts` and Sanity:

| Event Title | Event Slug in events.ts | Event Slug in Sanity |
|-------------|------------------------|---------------------|
| Offentlig PaaS Fagdag Selvbetjening | `2025-10-15-selvbetjening-fagdag` | `2025-10-15-selvbetjening-fagdag` |
| Offentlig PaaS heldigital fagdag | `2024-12-12-offentlig-paas-digital` | `2024-12-12-offentlig-paas-digital` |

## API Reference

### GET `/api/events/[slug]/secret-info`

**Authentication**: Required (must be registered for the event)

**Parameters**:
- `slug` (path): The event slug

**Response** (200 OK):
```json
{
  "streamingUrl": "https://example.com/stream",
  "notes": "Optional private notes"
}
```

**Error Responses**:
- `401 Unauthorized`: User is not logged in
- `403 Forbidden`: User is not registered for the event
- `404 Not Found`: Event not found or no secret info available

## Troubleshooting

### Secret Info Not Showing

1. **Check user is logged in**: User must be authenticated via Slack
2. **Verify registration**: User must be registered for the specific event
3. **Confirm event slug matches**: The slug in Sanity must exactly match the event slug in `src/data/events.ts`
4. **Check Sanity document is published**: Draft documents are not visible to users

### Wrong Event Slug

If you created secret info with the wrong event slug:

1. In Sanity Studio, find the document
2. Edit the "Event Slug" field to match the correct slug
3. Publish the changes

## Development

### Running Tests

```bash
yarn test src/lib/sanity/__tests__/event-secret-info.test.ts
```

### Type Definitions

Event secret info type is defined in `src/lib/events/types.ts`:

```typescript
export interface EventSecretInfo {
  streamingUrl?: string
  notes?: string
}
```

## Future Enhancements

Possible improvements to this feature:

- Multiple streaming URLs (e.g., backup streams)
- Time-based access (only show URL during event hours)
- Different URLs for physical vs. digital participants
- Automatic streaming URL generation/validation
- Event-specific access codes or passwords
