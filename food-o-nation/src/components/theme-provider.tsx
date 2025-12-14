'use client'

import * as React from 'react'

type ThemeProviderProps = {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: string
  enableSystem?: boolean
}

export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = 'light',
  enableSystem = false,
}: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    if (defaultTheme && typeof document !== 'undefined') {
      document.documentElement.setAttribute(attribute, defaultTheme)
    }
  }, [attribute, defaultTheme])

  if (!mounted) {
    return <>{children}</>
  }

  return <>{children}</>
}






