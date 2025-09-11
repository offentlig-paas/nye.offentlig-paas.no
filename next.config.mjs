import rehypePrism from '@mapbox/rehype-prism'
import nextMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'

/** @type {import('next').NextConfig} */
const nextConfig = {
  publicRuntimeConfig: {
    githubRepo: 'offentlig-paas/nye.offentlig-paas.no',
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: 'ca.slack-edge.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.slack-edge.com',
      },
    ],
  },
  outputFileTracingIncludes: {
    '/': ['./src/app/artikkel/**/*.mdx'],
    '/artikkel': ['./src/app/artikkel/**/*.mdx'],
  },
}

const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypePrism],
  },
})

export const publicRuntimeConfig = nextConfig.publicRuntimeConfig
export default withMDX(nextConfig)
