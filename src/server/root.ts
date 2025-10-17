import { router, createTRPCContext } from './trpc'
import { eventRegistrationRouter } from './routers/eventRegistration'
import { eventFeedbackRouter } from './routers/eventFeedback'
import { adminRouter } from './routers/admin'
import { slackRouter } from './routers/slack'
import { userRouter } from './routers/user'
import { photosRouter } from './routers/photos'
import { headers } from 'next/headers'

export const appRouter = router({
  eventRegistration: eventRegistrationRouter,
  eventFeedback: eventFeedbackRouter,
  admin: adminRouter,
  slack: slackRouter,
  user: userRouter,
  photos: photosRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = async () => {
  return appRouter.createCaller(
    await createTRPCContext({ headers: await headers() })
  )
}
