import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export type Language = 'en' | 'ar'

interface LanguageContextValue {
  language: Language
  isArabic: boolean
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  isArabic: false,
  setLanguage: () => {},
})

function readStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'en'
  return window.localStorage.getItem('language') === 'ar' ? 'ar' : 'en'
}

function applyToDocument(lang: Language): void {
  if (typeof document === 'undefined') return
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = lang
}

export const LANGUAGE_CHANGE_EVENT = 'jisr:language-change'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage)

  // Apply on first mount
  useEffect(() => {
    applyToDocument(language)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for external language changes (from UserPreferencesContext or Settings page)
  useEffect(() => {
    const handleCustom = (e: Event) => {
      const lang = (e as CustomEvent<{ language: Language }>).detail?.language
      if (lang === 'en' || lang === 'ar') {
        setLanguageState(lang)
      }
    }
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'language') {
        const lang: Language = e.newValue === 'ar' ? 'ar' : 'en'
        setLanguageState(lang)
        applyToDocument(lang)
      }
    }
    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleCustom)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleCustom)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
    applyToDocument(lang)
    window.dispatchEvent(
      new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: { language: lang } })
    )
  }, [])

  return (
    <LanguageContext.Provider value={{ language, isArabic: language === 'ar', setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
