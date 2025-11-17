'use client'

import React from 'react'
import { createContext, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { ThemeProvider, useTheme } from 'next-themes'
import { ToastProvider } from '@/components/ToastProvider'
import { TRPCProvider } from '@/lib/trpc/TRPCProvider'

function usePrevious<T>(value: T) {
  const ref = useRef<T | undefined>(undefined)
  const [previous, setPrevious] = React.useState<T | undefined>(undefined)

  useEffect(() => {
    setPrevious(ref.current)
    ref.current = value
  }, [value])

  return previous
}

function ThemeWatcher() {
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    function onMediaChange() {
      const systemTheme = media.matches ? 'dark' : 'light'
      if (resolvedTheme === systemTheme) {
        setTheme('system')
      }
    }

    onMediaChange()
    media.addEventListener('change', onMediaChange)

    return () => {
      media.removeEventListener('change', onMediaChange)
    }
  }, [resolvedTheme, setTheme])

  return null
}

export const AppContext = createContext<{ previousPathname?: string | null }>(
  {}
)

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const previousPathname = usePrevious(pathname)

  return (
    <AppContext.Provider value={{ previousPathname }}>
      <ThemeProvider attribute="class" disableTransitionOnChange>
        <ThemeWatcher />
        <TRPCProvider>
          <ToastProvider>{children}</ToastProvider>
        </TRPCProvider>
      </ThemeProvider>
    </AppContext.Provider>
  )
}
