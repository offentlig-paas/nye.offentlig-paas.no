// Import all articles statically to ensure they're bundled in production
import { article as arsberetning2024 } from '@/app/artikkel/arsberetning-2024/article'
import { article as fagdagDataplattform } from '@/app/artikkel/fagdag-dataplattform-mai-2024/article'
import { article as plattformmodenhet2024 } from '@/app/artikkel/plattformmodenhet-2024/article'
import { article as plattformmodenhetUndersokelse2025 } from '@/app/artikkel/plattformmodenhet-undersokelse-2025/article'
import { article as stateOfPlatforms2024 } from '@/app/artikkel/state-of-platforms-2024/article'
import { article as stateOfPlatforms2026 } from '@/app/artikkel/state-of-platforms-2026/article'

interface Article {
  title: string
  description: string
  author: string
  date: string
}

export interface ArticleWithSlug extends Article {
  slug: string
}

const allArticles: ArticleWithSlug[] = [
  { ...arsberetning2024, slug: 'arsberetning-2024' },
  { ...fagdagDataplattform, slug: 'fagdag-dataplattform-mai-2024' },
  { ...plattformmodenhet2024, slug: 'plattformmodenhet-2024' },
  {
    ...plattformmodenhetUndersokelse2025,
    slug: 'plattformmodenhet-undersokelse-2025',
  },
  { ...stateOfPlatforms2024, slug: 'state-of-platforms-2024' },
  { ...stateOfPlatforms2026, slug: 'state-of-platforms-2026' },
]

export async function getAllArticles() {
  return allArticles.sort((a, z) => +new Date(z.date) - +new Date(a.date))
}
