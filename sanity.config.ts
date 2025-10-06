import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'

import { schemas } from './src/lib/sanity/schemas'

// Get environment variables - use SANITY_STUDIO_ for Studio configuration
const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

if (!projectId) {
  throw new Error('Missing SANITY_STUDIO_PROJECT_ID environment variable')
}

export default defineConfig({
  name: 'default',
  title: 'Offentlig PaaS Events',

  projectId,
  dataset,

  plugins: [
    structureTool({
      structure: S =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Event Registrations')
              .child(
                S.documentTypeList('eventRegistration')
                  .title('Event Registrations')
                  .filter('_type == "eventRegistration"')
                  .defaultOrdering([
                    { field: 'registeredAt', direction: 'desc' },
                  ])
              ),
            S.listItem()
              .title('Event Secret Info')
              .child(
                S.documentTypeList('eventSecretInfo')
                  .title('Event Secret Info')
                  .filter('_type == "eventSecretInfo"')
              ),
          ]),
    }),
    visionTool({
      defaultApiVersion: '2024-01-01',
    }),
  ],

  schema: {
    types: schemas,
  },
})
