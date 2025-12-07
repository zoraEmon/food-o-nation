"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/Button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="w-10 h-10 rounded-full">
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-10 h-10 rounded-full relative"
      aria-label="Toggle theme"
    >
      {/* Container to center icons perfectly */}
      <div className="relative w-[1.5rem] h-[1.5rem]">
        
        {/* SUN: Visible in Light Mode */}
        <Sun className="absolute inset-0 h-full w-full transition-all duration-500 
          rotate-0 scale-100 
          dark:-rotate-90 dark:scale-0" 
        />
        
        {/* MOON: Visible in Dark Mode */}
        <Moon className="absolute inset-0 h-full w-full transition-all duration-500 
          rotate-90 scale-0 
          dark:rotate-0 dark:scale-100" 
        />
      </div>

      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}