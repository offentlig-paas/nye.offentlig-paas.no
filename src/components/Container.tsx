import React, { forwardRef, ComponentPropsWithoutRef, ElementRef } from 'react'
import clsx from 'clsx'

type OuterContainerProps = ComponentPropsWithoutRef<'div'> & {
  className?: string
  children?: React.ReactNode
}

export const ContainerOuter = forwardRef<
  ElementRef<'div'>,
  OuterContainerProps
>(function OuterContainer({ className, children, ...props }, ref) {
  return (
    <div ref={ref} className={clsx('sm:px-8', className)} {...props}>
      <div className="mx-auto w-full max-w-7xl lg:px-8">{children}</div>
    </div>
  )
})

type ContainerInnerProps = ComponentPropsWithoutRef<'div'> & {
  className?: string
  children?: React.ReactNode
}

export const ContainerInner = forwardRef<
  React.ElementRef<'div'>,
  ContainerInnerProps
>(function InnerContainer({ className, children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={clsx('relative px-4 sm:px-8 lg:px-12', className)}
      {...props}
    >
      <div className="mx-auto max-w-2xl lg:max-w-5xl">{children}</div>
    </div>
  )
})

type ContainerProps = ComponentPropsWithoutRef<'div'> & {
  className?: string
  children?: React.ReactNode
}

export const Container = forwardRef<
  React.ElementRef<typeof ContainerOuter>,
  ContainerProps
>(function Container({ children, ...props }, ref) {
  return (
    <ContainerOuter ref={ref} {...props}>
      <ContainerInner>{children}</ContainerInner>
    </ContainerOuter>
  )
})
