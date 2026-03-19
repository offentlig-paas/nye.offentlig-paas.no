import Image, { type ImageProps } from 'next/image'

type MDXComponents = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: React.ComponentType<any>
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Image: (props: ImageProps) => <Image {...props} alt={props.alt || ''} />,
  }
}
