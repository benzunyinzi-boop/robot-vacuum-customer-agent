import { useState, useEffect } from 'react'
import type { Theme } from '../types'
import { getStoredTheme, setStoredTheme } from '../lib/api'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getStoredTheme)

  useEffect(() => {
    const root = document.getElementById('app-root')
    if (!root) return
    root.classList.remove('dark', 'light')
    root.classList.add(theme)
    setStoredTheme(theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return { theme, toggleTheme }
}
