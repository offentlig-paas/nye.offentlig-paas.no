import React from 'react'
import type { ComponentPropsWithoutRef } from 'react'
import clsx from 'clsx'

type ProseProps = ComponentPropsWithoutRef<'div'> & {
  className?: string
  children?: React.ReactNode
}

export function Prose({ className, ...props }: ProseProps) {
  return (
    <div
      className={clsx(
        className,
        'prose dark:prose-invert',
        '[&_h2]:mt-8 [&_h2]:mb-4',
        '[&_h3]:mt-6 [&_h3]:mb-3',
        '[&_ol]:my-4 [&_ul]:my-4',
        '[&_li]:my-1',
        '[&_ol>li]:my-0.5 [&_ul>li]:my-0.5'
      )}
      {...props}
    />
  )
}
