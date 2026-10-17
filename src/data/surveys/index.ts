import type { SurveyDefinition } from '@/lib/surveys/types'
import { aiAgents2026 } from './ai-agents-2026'
import { aiAgents2026W2 } from './ai-agents-2026-w2'
import { stateOfPlatforms2026W3 } from './state-of-platforms-2026-w3'

export const surveys: SurveyDefinition[] = [
  aiAgents2026,
  aiAgents2026W2,
  stateOfPlatforms2026W3,
]
