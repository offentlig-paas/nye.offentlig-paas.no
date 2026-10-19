import { ogImage } from '@/lib/og'
import { getMemberBySlug } from '@/domains/member-profile'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Medlem i Offentlig PAAS'

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
