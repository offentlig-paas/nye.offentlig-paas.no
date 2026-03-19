import Image, { type ImageProps } from 'next/image'

type MDXComponents = {
  [key: string]: React.ComponentType<any>
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Image: (props: ImageProps) => <Image {...props} alt={props.alt || ''} />,
  }
}
