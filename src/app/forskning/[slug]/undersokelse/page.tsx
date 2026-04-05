import { redirect } from 'next/navigation'
import { researchProjects } from '@/data/research'
import { SurveyStatus } from '@/lib/research/types'

export default function SurveyRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  return params.then(({ slug }) => {
    const project = researchProjects.find(p => p.slug === slug)
    const survey = project?.surveys?.find(
      s => s.status === SurveyStatus.Open && s.url
    )

    if (survey?.url) {
      redirect(survey.url)
    }

    redirect('/forskning')
  })
}
