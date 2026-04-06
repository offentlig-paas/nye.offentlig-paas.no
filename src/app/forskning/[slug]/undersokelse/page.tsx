import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { researchProjects } from '@/data/research'
import { SurveyStatus } from '@/lib/research/types'

async function SurveyRedirectContent({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<never> {
  const { slug } = await params
  const project = researchProjects.find(p => p.slug === slug)
  const survey = project?.surveys?.find(
    s => s.status === SurveyStatus.Open && s.url
  )

  if (survey?.url) {
    redirect(survey.url)
  }

  redirect('/forskning')
}

export default function SurveyRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  return (
    <Suspense>
      <SurveyRedirectContent params={params} />
    </Suspense>
  )
}
