import assert from 'assert'
import * as cheerio from 'cheerio'
import { Feed } from 'feed'

import { metadata } from '../layout'

import { getAllEvents } from '@/lib/events/helpers'

const author = {
  name: 'Offentlig PaaS',
  email: 'kontakt@offentlig-paas.no',
}

const siteUrl = process.env.NEXT_PUBLIC_URL

export async function GET(req: Request) {
  if (!siteUrl) {
    throw Error('Missing NEXT_PUBLIC_URL environment variable')
  }

  const baseUrl = new URL(req.url)

  const feed = new Feed({
    title: author.name,
    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
    description: metadata.description!!,
    author,
    id: siteUrl,
    link: siteUrl,
    image: `${siteUrl}/favicon.ico`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `CC BY-SA 4.0`,
    feedLinks: {
      rss2: `${siteUrl}/feed.xml`,
    },
  })

  if (baseUrl.searchParams.get('type') === 'events') {
    addAllEventsTo(feed, new URL(siteUrl))
  } else {
    await addAllArticlesTo(feed, baseUrl)
  }

  return new Response(feed.rss2(), {
    status: 200,
    headers: {
      'content-type': 'application/xml',
      'cache-control': 's-maxage=31556952',
    },
  })
}

const addAllArticlesTo = async (feed: Feed, baseURL: URL) => {
  const articleIds = require
    .context('../artikkel', true, /\/page\.mdx$/)
    .keys()
    .filter((key) => key.startsWith('./'))
    .map((key) => key.slice(2).replace(/\/page\.mdx$/, ''))

  for (const id of articleIds) {
    const url = String(new URL(`/artikkel/${id}`, baseURL))
    const html = await (await fetch(url)).text()
    const $ = cheerio.load(html)

    const publicUrl = `${siteUrl}/artikkel/${id}`
    const article = $('article').first()
    const title = article.find('h1').first().text()
    const date = article.find('time').first().attr('datetime')
    const content = article.find('[data-mdx-content]').first().html()

    assert(typeof title === 'string')
    assert(typeof date === 'string')
    assert(typeof content === 'string')

    feed.addItem({
      title,
      id: publicUrl,
      link: publicUrl,
      content,
      author: [author],
      contributor: [author],
      date: new Date(date),
    })
  }
}

const addAllEventsTo = async (feed: Feed, siteURL: URL) => {
  getAllEvents().forEach((event) => {
    feed.addItem({
      title: event.title,
      id: event.slug,
      link: `${siteURL}fagdag/${event.slug}`,
      content: event.description,
      author: [author],
      contributor: [author],
      date: new Date(event.start),
    })
  })
}
