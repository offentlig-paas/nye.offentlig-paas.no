# Implementation Summary: Event Secret Information

## Issue
Store sensitive event information (streaming URLs) in Sanity CMS instead of the public Git repository, making it accessible only to registered participants.

## Solution Overview

A minimal, focused implementation that adds secret information support without duplicating event data:

### 1. Sanity Schema (Simple & Focused)
- **File**: `src/lib/sanity/schemas.ts`
- **Schema**: `eventSecretInfo` - Links to events via slug
- **Fields**:
  - `eventSlug` (required): Links to event in `src/data/events.ts`
  - `streamingUrl` (optional): Private streaming URL
  - `notes` (optional): Internal notes

### 2. API Endpoint (Secure Access)
- **File**: `src/app/api/events/[slug]/secret-info/route.ts`
- **Authorization**: Requires user to be:
  1. Authenticated (Slack login)
  2. Registered for the specific event
- **Security**:
  - Private cache headers (no caching)
  - Returns 401/403 for unauthorized access
  - Only returns data for matching event slug

### 3. Service Layer
- **File**: `src/lib/sanity/event-secret-info.ts`
- **Function**: `getEventSecretInfo(eventSlug)` 
- Fetches secret info from Sanity
- Returns null on errors or missing data

### 4. UI Component
- **File**: `src/components/EventSecretInfo.tsx`
- **Location**: Event pages (`/fagdag/[slug]`)
- **Behavior**:
  - Only visible to registered participants
  - Shows streaming URL button and optional notes
  - Blue information box styling
  - Graceful error handling

### 5. Type System
- **File**: `src/lib/events/types.ts`
- **Interface**: `EventSecretInfo`
- Optional field on `Event` type (never populated in Git)

## Files Created/Modified

### Created
1. `src/lib/sanity/event-secret-info.ts` - Service layer
2. `src/app/api/events/[slug]/secret-info/route.ts` - API endpoint
3. `src/components/EventSecretInfo.tsx` - UI component
4. `src/lib/sanity/__tests__/event-secret-info.test.ts` - Tests
5. `docs/event-secret-info.md` - Admin documentation
6. `docs/IMPLEMENTATION_SUMMARY.md` - This file

### Modified
1. `src/lib/sanity/schemas.ts` - Added `eventSecretInfoSchema`
2. `sanity.config.ts` - Added schema to Sanity Studio
3. `src/lib/events/types.ts` - Added `EventSecretInfo` interface
4. `src/app/fagdag/[slug]/page.tsx` - Integrated `EventSecretInfo` component

## Key Design Decisions

### 1. No Event Duplication
- Events remain in `src/data/events.ts` (single source of truth)
- Secret info is a separate document linked by slug
- Minimal schema keeps Sanity lean

### 2. Authorization at API Level
- Client-side component doesn't need to know authorization logic
- API enforces all security rules
- Reduces attack surface

### 3. Graceful Degradation
- Component silently handles missing data
- No error messages shown to users
- Logging for debugging

### 4. Cache Control
- Private data uses strict no-cache headers
- Prevents CDN/browser caching of sensitive URLs
- Follows security best practices

## Testing

### Unit Tests
- `src/lib/sanity/__tests__/event-secret-info.test.ts`
- Tests service layer with mocked Sanity client
- Covers success, error, and edge cases

### Manual Testing Checklist
- [ ] Create event secret info in Sanity Studio
- [ ] Verify non-registered users cannot see secret info
- [ ] Verify registered users can see and access streaming URL
- [ ] Test error handling (non-existent event, missing data)
- [ ] Verify API returns proper status codes

## Usage Example

### 1. Create Secret Info in Sanity Studio
```
Event Slug: 2025-10-15-selvbetjening-fagdag
Streaming URL: https://zoom.us/j/12345678
Notes: Backup URL: https://meet.google.com/abc-def-ghi
```

### 2. User Experience
- User registers for event
- Visits event page
- Sees blue info box with streaming URL button
- Clicks button → opens streaming link in new tab

### 3. Security Flow
```
User → EventSecretInfo component
  → useEventRegistration() checks if registered
  → Fetches /api/events/[slug]/secret-info
    → Validates authentication
    → Validates registration
    → Fetches from Sanity
  → Returns secret info or error
  → Component displays or hides accordingly
```

## Acceptance Criteria

✅ Streaming URL only accessible to registered users
✅ Administrators can add/edit streaming URL in Sanity Studio
✅ Minimal code changes - focused on specific need
✅ No duplication of event data between Git and Sanity
✅ Proper security with authentication and authorization
✅ Graceful error handling
✅ Tests included
✅ Documentation provided

## Future Enhancements (Not Implemented)

Potential improvements for future iterations:
- Multiple streaming URLs per event
- Time-based access (only during event)
- Different URLs for physical/digital participants
- Automatic URL validation
- Streaming platform integration
- Access analytics

## Deployment Notes

### Environment Variables Required
- `NEXT_PUBLIC_SANITY_PROJECT_ID` - Sanity project ID
- `NEXT_PUBLIC_SANITY_DATASET` - Sanity dataset (e.g., "production")
- `SANITY_API_TOKEN` - Sanity write token (for registration writes)

### Post-Deployment
1. Deploy code to production
2. Access Sanity Studio
3. Create "Event Secret Info" documents as needed
4. No migration required - works immediately

## References
- Issue: #[issue-number] - Støtte for hemmelig fagdag-informasjon
- Documentation: `docs/event-secret-info.md`
- Tests: `src/lib/sanity/__tests__/event-secret-info.test.ts`
