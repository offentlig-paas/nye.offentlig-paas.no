import { ArticleLayout } from '@/components/ArticleLayout'
import { article } from './article'
import Content from './content.mdx'

export const metadata = {
  title: article.title,
  description: article.description,
  robots: { index: false },
}

export default function Page() {
  return (
    <ArticleLayout
      article={{
        ...article,
        slug: 'state-of-platforms-ki-oppfolging-2026',
      }}
    >
      <Content />
    </ArticleLayout>
  )
}
