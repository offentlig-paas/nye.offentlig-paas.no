import assert from 'assert'
import * as cheerio from 'cheerio'
import { Feed } from 'feed'

import { metadata } from '../layout'

export async function GET(req: Request) {
  let siteUrl = process.env.NEXT_PUBLIC_URL

  if (!siteUrl) {
    throw Error('Missing NEXT_PUBLIC_URL environment variable')
  }

  let author = {
    name: 'Offentlig PaaS',
    email: 'kontakt@offentlig-paas.no',
  }

  let feed = new Feed({
    title: author.name,
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

  let articleIds = require
    .context('../artikkel', true, /\/page\.mdx$/)
    .keys()
    .filter((key) => key.startsWith('./'))
    .map((key) => key.slice(2).replace(/\/page\.mdx$/, ''))

  for (let id of articleIds) {
    let url = String(new URL(`/artikkel/${id}`, req.url))
    let html = await (await fetch(url)).text()
    let $ = cheerio.load(html)

    let publicUrl = `${siteUrl}/artikkel/${id}`
    let article = $('article').first()
    let title = article.find('h1').first().text()
    let date = article.find('time').first().attr('datetime')
    let content = article.find('[data-mdx-content]').first().html()

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

  return new Response(feed.rss2(), {
    status: 200,
    headers: {
      'content-type': 'application/xml',
      'cache-control': 's-maxage=31556952',
    },
  })
}
