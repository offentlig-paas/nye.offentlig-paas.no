import { router, publicProcedure } from '../trpc'
import { z } from 'zod'
import { getPhotosByEventAndSpeaker } from '@/lib/sanity/event-photos'

export const photosRouter = router({
  bySpeaker: publicProcedure
    .input(
      z.object({
        eventSlug: z.string(),
        speakerName: z.string(),
      })
    )
    .query(async ({ input }) => {
      const photos = await getPhotosByEventAndSpeaker(
        input.eventSlug,
        input.speakerName
      )
      return photos
    }),
})
