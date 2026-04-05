import { researchProjects } from '@/data/research'
import {
  SurveyStatus,
  type ResearchProject,
  type ResearchSurvey,
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
