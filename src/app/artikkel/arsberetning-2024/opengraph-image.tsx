import { articleOgImage } from '@/lib/og'
import { article } from './article'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = article.title

export default function Image() {
  return articleOgImage(article)
}
