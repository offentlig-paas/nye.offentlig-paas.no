import { router } from './trpc'
import { eventRegistrationRouter } from './routers/eventRegistration'
import { eventFeedbackRouter } from './routers/eventFeedback'
import { adminRouter } from './routers/admin'
import { slackRouter } from './routers/slack'

export const appRouter = router({
  eventRegistration: eventRegistrationRouter,
  eventFeedback: eventFeedbackRouter,
  admin: adminRouter,
  slack: slackRouter,
})

export type AppRouter = typeof appRouter
