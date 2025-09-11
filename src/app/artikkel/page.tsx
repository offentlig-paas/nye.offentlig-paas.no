import React from 'react'
import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Card } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'
import { type ArticleWithSlug, getAllArticles } from '@/lib/articles'
import { formatDate } from '@/lib/formatDate'

import rssLogo from '@/images/rss.svg'

function Article({ article }: { article: ArticleWithSlug }) {
  return (
    <article className="md:grid md:grid-cols-4 md:items-baseline">
      <Card className="md:col-span-3">
        <Card.Title href={`/artikkel/${article.slug}`}>
          {article.title}
        </Card.Title>
        <Card.Eyebrow
          as="time"
          dateTime={article.date}
          className="md:hidden"
          decorate
        >
          {formatDate(article.date)}
        </Card.Eyebrow>
        <Card.Description>{article.description}</Card.Description>
        <Card.Cta>Lest artikkel</Card.Cta>
      </Card>
      <Card.Eyebrow
        as="time"
        dateTime={article.date}
        className="mt-1 hidden md:block"
      >
        {formatDate(article.date)}
      </Card.Eyebrow>
    </article>
  )
}

export const metadata: Metadata = {
  title: 'Artikkel',
  description:
    'Artikler om moderne applikasjonsplattformer i norsk offentlig sektor, teknologi, ledelse og produktutvikling.',
}

export default async function ArtikkelIndex() {
  const artikkel = await getAllArticles()

  return (
    <SimpleLayout
      title="Det siste om Norske plattformer, utvikling, teknologi og ledelse"
      intro="Her finner du de siste artiklene våre om moderne applikasjonsplattformer i norsk offentlig sektor, plattformutvikling, teknologi, ledelse og produktutvikling."
    >
      <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
        <div className="flex max-w-3xl flex-col space-y-16">
          {artikkel.map(article => (
            <Article key={article.slug} article={article} />
          ))}
        </div>
      </div>

      <Link href="/feed.xml?type=articles">
        <Image
          src={rssLogo}
          className="float-right mt-3 size-6"
          alt="Article RSS feed"
        />
      </Link>
    </SimpleLayout>
  )
}
