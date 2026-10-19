import { readFile } from 'node:fs/promises'
import { ImageResponse } from 'next/og'
import { formatDate } from '@/lib/formatDate'

const PRODUCTION_URL = 'https://offentlig-paas.no'

// NEXT_PUBLIC_URL can be empty or just "https://" in CI and previews.
export function siteUrl(env: Record<string, string | undefined> = process.env) {
  if (env.VERCEL_ENV === 'production') return new URL(PRODUCTION_URL)
  try {
    return new URL(env.NEXT_PUBLIC_URL ?? '')
  } catch {
    return new URL(PRODUCTION_URL)
  }
}

export const siteOpenGraph = {
  siteName: 'Offentlig PAAS',
  locale: 'nb_NO',
  type: 'website' as const,
}

export function truncate(text: string, max: number) {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

// Inter (latin subset, includes æøå) is bundled locally so builds need no network.
// 'use cache' keeps this file IO out of on-demand ISR renders (cacheComponents).
async function getAssets() {
  'use cache'
  // new URL(..., import.meta.url) makes the bundler trace and ship these files.
  const [regular, bold, logo] = await Promise.all([
    readFile(new URL('../fonts/inter-latin-400.woff', import.meta.url)),
    readFile(new URL('../fonts/inter-latin-700.woff', import.meta.url)),
    readFile(new URL('../images/logo.png', import.meta.url)),
  ])
  return {
    regular: regular.toString('base64'),
    bold: bold.toString('base64'),
    logo: `data:image/png;base64,${logo.toString('base64')}`,
  }
}

export function articleOgImage(article: {
  title: string
  date: string
  author: string
}) {
  return ogImage({
    eyebrow: 'Artikkel',
    title: article.title,
    meta: `${formatDate(article.date)} · ${article.author}`,
  })
}

export async function ogImage({
  eyebrow,
  title,
  meta,
}: {
  eyebrow?: string
  title: string
  meta?: string
}) {
  const t = truncate(title, 90)
  const { regular, bold, logo: logoSrc } = await getAssets()
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background: '#ffffff',
        borderTop: '16px solid #14b8a6',
        color: '#18181b',
        fontFamily: 'Inter',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={logoSrc} width={80} height={80} />
        <div style={{ fontSize: 36, fontWeight: 700 }}>Offentlig PAAS</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {eyebrow && (
          <div style={{ fontSize: 30, color: '#0d9488', fontWeight: 700 }}>
            {eyebrow}
          </div>
        )}
        <div
          style={{
            fontSize: t.length > 50 ? 60 : 76,
            fontWeight: 700,
            lineHeight: 1.15,
          }}
        >
          {t}
        </div>
      </div>
      <div style={{ fontSize: 28, color: '#52525b' }}>
        {truncate(meta ?? 'offentlig-paas.no', 80)}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: Buffer.from(regular, 'base64'), weight: 400 },
        { name: 'Inter', data: Buffer.from(bold, 'base64'), weight: 700 },
      ],
    }
  )
}
