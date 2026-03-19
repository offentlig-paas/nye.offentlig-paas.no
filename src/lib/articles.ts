import glob from 'fast-glob'

interface Article {
  title: string
  description: string
  author: string
  date: string
}

export interface ArticleWithSlug extends Article {
  slug: string
}

async function importArticle(
  articleFilename: string
): Promise<ArticleWithSlug> {
  const { article } = (await import(
    `../app/artikkel/${articleFilename.replace('/article.ts', '')}/article`
  )) as {
    article: Article
  }

  return {
    slug: articleFilename.replace(/\/article\.ts$/, ''),
    ...article,
  }
}

export async function getAllArticles() {
  const articleFilenames = await glob('*/article.ts', {
    cwd: `${process.cwd()}/src/app/artikkel`,
  })

  const artikkel = await Promise.all(articleFilenames.map(importArticle))

  return artikkel.sort((a, z) => +new Date(z.date) - +new Date(a.date))
}
