import { ogImage } from '@/lib/og'
import { findOpenSurvey, getProject } from '@/lib/research/helpers'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Forskningsprosjekt i Offentlig PAAS'

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) return ogImage({ title: 'Forskning' })
  return ogImage({
    eyebrow: findOpenSurvey(slug) ? 'Åpen undersøkelse' : 'Forskning',
    title: project.title,
    meta: `Status: ${project.status}`,
  })
}
