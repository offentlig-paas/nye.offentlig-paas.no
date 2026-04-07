import { router, createTRPCContext } from './trpc'
import { eventRegistrationRouter } from './routers/eventRegistration'
import { eventFeedbackRouter } from './routers/eventFeedback'
import { eventRouter } from './routers/event'
import { adminRouter } from './routers/admin'
import { slackRouter } from './routers/slack'
import { userRouter } from './routers/user'
import { photosRouter } from './routers/photos'
import { talkSubmissionRouter } from './routers/talkSubmission'
import { surveyRouter } from './routers/survey'
import { headers } from 'next/headers'

export const appRouter = router({
  event: eventRouter,
  eventRegistration: eventRegistrationRouter,
  eventFeedback: eventFeedbackRouter,
  talkSubmission: talkSubmissionRouter,
  survey: surveyRouter,
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
