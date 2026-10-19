import { ogImage } from '@/lib/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Offentlig PAAS'

export default function Image() {
  return ogImage({
    title: 'Nettverk for offentlige plattformer og applikasjoner',
    meta: 'Over 2000 teknologer fra mer enn 80 offentlige virksomheter',
  })
}
