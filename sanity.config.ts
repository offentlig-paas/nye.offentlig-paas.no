import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'

import { schemas } from './src/lib/sanity/schemas'

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
              .title('Event Participant Info')
              .child(
                S.documentTypeList('eventParticipantInfo')
                  .title('Event Participant Info')
                  .filter('_type == "eventParticipantInfo"')
              ),
            S.listItem()
              .title('Talk Attachments')
              .child(
                S.documentTypeList('talkAttachment')
                  .title('Talk Attachments')
                  .filter('_type == "talkAttachment"')
                  .defaultOrdering([{ field: 'uploadedAt', direction: 'desc' }])
              ),
            S.listItem()
              .title('Event Feedback')
              .child(
                S.documentTypeList('eventFeedback')
                  .title('Event Feedback')
                  .filter('_type == "eventFeedback"')
                  .defaultOrdering([
                    { field: 'submittedAt', direction: 'desc' },
                  ])
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
