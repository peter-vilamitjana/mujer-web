'use client'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Button } from './ui/button'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function')
      ? localStorage.getItem('theme')
      : null;
    const prefersDark = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;

    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    } else {
      document.documentElement.classList.remove('dark')
      setIsDark(false)
    }
  }, [])

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Toggle dark mode"
    >
      {isDark
        ? <Sun className="w-5 h-5 text-yellow-400" />
        : <Moon className="w-5 h-5" />}
    </Button>
  )
}
