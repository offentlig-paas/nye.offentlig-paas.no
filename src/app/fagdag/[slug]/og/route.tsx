import { getEvent } from '@/lib/events/helpers'
import { formatDateLong } from '@/lib/formatDate'
import { ogImage } from '@/lib/og'

// Fallback preview image, used by generateMetadata when the event has no photo.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const event = getEvent(slug)
  if (!event) return new Response('Not found', { status: 404 })
  return ogImage({
    eyebrow: 'Fagdag',
    title: event.title,
    meta: `${formatDateLong(event.start)} · ${event.location}`,
  })
}
