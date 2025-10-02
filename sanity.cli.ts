import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },

  // Deployment configuration
  studioHost: 'offentlig-paas', // This will be your studio URL: https://offentlig-paas.sanity.studio

  // Auto-update
  deployment: {
    appId: 'p3cvo9g6iuws1hvwhb3hvme0',
    autoUpdates: true,
  },

  // GraphQL configuration
  graphql: [
    {
      tag: 'default',
      playground: true,
      generation: 'gen3',
    },
  ],
})
