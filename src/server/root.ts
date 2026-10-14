import { router, createTRPCContext } from './trpc'
import { eventRegistrationRouter } from './routers/eventRegistration'
import { eventFeedbackRouter } from './routers/eventFeedback'
import { eventRouter } from './routers/event'
import { adminRouter } from './routers/admin'
import { slackRouter } from './routers/slack'
import { userRouter } from './routers/user'
import { talkSubmissionRouter } from './routers/talkSubmission'
import { surveyRouter } from './routers/survey'
import { memberProfileRouter } from './routers/memberProfile'
import { headers } from 'next/headers'

export const appRouter = router({
  event: eventRouter,
  eventRegistration: eventRegistrationRouter,
  eventFeedback: eventFeedbackRouter,
  talkSubmission: talkSubmissionRouter,
  survey: surveyRouter,
  memberProfile: memberProfileRouter,
  admin: adminRouter,
  slack: slackRouter,
  user: userRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = async () => {
  return appRouter.createCaller(
    await createTRPCContext({ headers: await headers() })
  )
}
