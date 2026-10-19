import { ogImage } from '@/lib/og'
import { getMemberBySlug } from '@/domains/member-profile'

export function generateImageMetadata({
  params,
}: {
  params: { slug: string }
}) {
  const member = getMemberBySlug(params?.slug ?? '')
  return [
    {
      id: 'og',
      alt: member
        ? `${member.name} – medlem i Offentlig PAAS`
        : 'Offentlig PAAS',
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
  const member = getMemberBySlug(slug)
  if (!member) return ogImage({ title: 'Medlemmer' })
  return ogImage({ eyebrow: 'Medlem', title: member.name, meta: member.type })
}
