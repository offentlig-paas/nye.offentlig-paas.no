import { ogImage } from '@/lib/og'
import { findOpenSurvey, getProject } from '@/lib/research/helpers'

export function generateImageMetadata({
  params,
}: {
  params: { slug: string }
}) {
  const project = getProject(params?.slug ?? '')
  return [
    {
      id: 'og',
      alt: project ? `${project.title} – Offentlig PAAS` : 'Offentlig PAAS',
      size: { width: 1200, height: 630 },
      contentType: 'image/png',
    },
  ]
}

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
