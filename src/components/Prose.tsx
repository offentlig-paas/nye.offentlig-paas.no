import React from 'react'
import type { ComponentPropsWithoutRef } from 'react'
import clsx from 'clsx'

type ProseProps = ComponentPropsWithoutRef<'div'> & {
  className?: string
  children?: React.ReactNode
}

export function Prose({ className, ...props }: ProseProps) {
  return (
    <div className={clsx(className, 'prose dark:prose-invert')} {...props} />
  )
}
