import { researchProjects } from '@/data/research'
import { members } from '@/data/members'
import {
  ResearchStatus,
  SurveyStatus,
  type ResearchProject,
  type ResearchSurvey,
  type ResearchWave,
} from '@/lib/research/types'

export function getAllProjects(): ResearchProject[] {
  return [...researchProjects].sort(
    (a, b) => +new Date(b.lastUpdated) - +new Date(a.lastUpdated)
  )
}

export function getProject(slug: string): ResearchProject | undefined {
  return researchProjects.find(p => p.slug === slug)
}

export function getOpenSurveys(): Array<{
  survey: ResearchSurvey
  project: ResearchProject
}> {
  return researchProjects.flatMap(project =>
    (project.surveys ?? [])
      .filter(s => s.status === SurveyStatus.Open && s.url)
      .map(survey => ({ survey, project }))
  )
}

export function getResponseRate(responses: number, population: number): number {
  if (population <= 0) return 0
  return Math.round((responses / population) * 100)
}

export function getWaveResponseRate(wave: ResearchWave): number | null {
  if (wave.organizations == null || wave.invited == null) return null
  return getResponseRate(wave.organizations, wave.invited)
}

export function getSurveyResponseRate(survey: ResearchSurvey): {
  responses: number
  total: number
  rate: number
} {
  const responses = survey.responses ?? 0
  const total = members.length
  return {
    responses,
    total,
    rate: getResponseRate(responses, total),
  }
}

export function findWaveForSurvey(
  survey: ResearchSurvey,
  waves?: ResearchWave[]
): ResearchWave | undefined {
  if (!survey.waveName || !waves) return undefined
  return waves.find(w => w.name === survey.waveName)
}

export const statusColors: Record<ResearchStatus, string> = {
  [ResearchStatus.Planning]:
    'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:ring-amber-400/20',
  [ResearchStatus.DataCollection]:
    'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20',
  [ResearchStatus.Analysis]:
    'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-400/10 dark:text-purple-400 dark:ring-purple-400/20',
  [ResearchStatus.Writing]:
    'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/20',
  [ResearchStatus.UnderReview]:
    'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-400 dark:ring-orange-400/20',
  [ResearchStatus.Published]:
    'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:ring-green-400/20',
  [ResearchStatus.Ongoing]:
    'bg-teal-50 text-teal-700 ring-teal-600/20 dark:bg-teal-400/10 dark:text-teal-400 dark:ring-teal-400/20',
}
