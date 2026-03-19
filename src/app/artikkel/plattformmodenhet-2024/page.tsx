import { ArticleLayout } from '@/components/ArticleLayout'
import { article } from './article'
import Content from './content.mdx'

export const metadata = {
  title: article.title,
  description: article.description,
}

export default function Page() {
  return (
    <ArticleLayout article={{ ...article, slug: 'plattformmodenhet-2024' }}>
      <Content />
    </ArticleLayout>
  )
}
