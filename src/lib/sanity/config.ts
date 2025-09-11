import { createClient } from '@sanity/client'

// Use NEXT_PUBLIC_ environment variables for client/server compatibility
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

if (!projectId) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable')
}

export const sanityConfig = {
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
}

// Client for reading data (no token needed for public data)
export const sanityClient = createClient(sanityConfig)

// Client for writing data (requires API token)
export const sanityWriteClient = createClient({
  ...sanityConfig,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false, // Always use fresh data for writes
})

// Ensure we have write permissions when needed
if (!process.env.SANITY_API_TOKEN && process.env.NODE_ENV !== 'development') {
  console.warn('Missing SANITY_API_TOKEN - write operations will fail')
}
