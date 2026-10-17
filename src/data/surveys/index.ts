import type { SurveyDefinition } from '@/lib/surveys/types'
import { aiAgents2026 } from './ai-agents-2026'
import { aiAgents2027 } from './ai-agents-2027'
import { stateOfPlatforms2027 } from './state-of-platforms-2027'

export const surveys: SurveyDefinition[] = [
  aiAgents2026,
  aiAgents2027,
  stateOfPlatforms2027,
]
