import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'
import {
  userPreferencesService,
  type UserPreferences,
  type UpdatePreferencesRequest,
} from '../services/userPreferencesService'
import { LANGUAGE_CHANGE_EVENT } from './LanguageContext'

function readToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem('accessToken')
}

export function applyPreferencesToDocument(p: UserPreferences): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = p.theme === 'dark' || (p.theme === 'auto' && prefersDark)
  root.classList.toggle('dark', dark)

  const fontMap: Record<string, string> = {
    small: 'small',
    medium: 'comfortable',
    large: 'large',
    'extra-large': 'extra-large',
  }
  root.dataset.fontSize = fontMap[p.fontSize] || 'comfortable'
}

function resetDocumentAccessibility(): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.remove('dark')
  // We do NOT reset lang/dir here because LanguageContext manages public language
  root.dataset.fontSize = 'comfortable'
}

type UserPreferencesContextValue = {
  preferences: UserPreferences | null
  loading: boolean
  refresh: () => Promise<void>
  savePreferences: (data: UpdatePreferencesRequest) => Promise<UserPreferences>
}

const UserPreferencesContext = createContext<UserPreferencesContextValue | null>(null)

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const token = readToken()
    if (!token) {
      resetDocumentAccessibility()
      setPreferences(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const prefs = await userPreferencesService.getPreferences()
      setPreferences(prefs)
      applyPreferencesToDocument(prefs)
    } catch {
      resetDocumentAccessibility()
      setPreferences(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Synchronously reset dark mode before async fetch so public pages never flash
    if (!readToken()) resetDocumentAccessibility()
    void refresh()
  }, [refresh, location.pathname])

  useEffect(() => {
    if (preferences?.theme !== 'auto') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (preferences) applyPreferencesToDocument(preferences)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [preferences])

  const savePreferences = useCallback(async (data: UpdatePreferencesRequest) => {
    const updated = await userPreferencesService.updatePreferences(data)
    setPreferences(updated)
    applyPreferencesToDocument(updated)
    return updated
  }, [])

  const value = useMemo(
    () => ({
      preferences,
      loading,
      refresh,
      savePreferences,
    }),
    [preferences, loading, refresh, savePreferences]
  )

  return (
    <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>
  )
}

export function useUserPreferences() {
  const ctx = useContext(UserPreferencesContext)
  if (!ctx) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider')
  }
  return ctx
}
