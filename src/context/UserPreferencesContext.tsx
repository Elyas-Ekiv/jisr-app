import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  userPreferencesService,
  type UserPreferences,
  type UpdatePreferencesRequest,
} from '../services/userPreferencesService'
import { AUTH_LOGIN_EVENT, AUTH_LOGOUT_EVENT } from '../utils/api'
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
    if (!readToken()) resetDocumentAccessibility()
    void refresh()
  }, [refresh])

  // Refresh when auth state changes (login/logout), not on every page navigation
  useEffect(() => {
    const onAuthChange = () => void refresh()
    window.addEventListener(AUTH_LOGIN_EVENT, onAuthChange)
    window.addEventListener(AUTH_LOGOUT_EVENT, onAuthChange)
    return () => {
      window.removeEventListener(AUTH_LOGIN_EVENT, onAuthChange)
      window.removeEventListener(AUTH_LOGOUT_EVENT, onAuthChange)
    }
  }, [refresh])

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
