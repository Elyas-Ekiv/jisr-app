import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { publicSiteService, SiteSettings } from '../services/adminService'

const DEFAULTS: SiteSettings = {
  branding: {
    siteName: 'Jisr',
    siteNameAr: 'جسر',
    tagline: 'AAC for kids — built with love',
    taglineAr: 'نظام تواصل بديل للأطفال — صنع بكل حب',
    logoUrl: '',
    primaryColor: '#0d9488',
    accentColor: '#fb7185',
  },
  hero: {
    eyebrow: 'AAC made joyful',
    eyebrowAr: 'تواصل مبهج',
    title: 'Help every child find their voice',
    titleAr: 'ساعد كل طفل في العثور على صوته',
    subtitle:
      'Jisr is a calm, accessible AAC platform that helps kids build language confidence at their own pace.',
    subtitleAr: 'جسر هو منصة تواصل هادئة وسهلة الاستخدام تساعد الأطفال على بناء الثقة اللغوية بالسرعة التي تناسبهم.',
    primaryCtaLabel: 'Start free',
    primaryCtaLabelAr: 'ابدأ مجاناً',
    primaryCtaHref: '/signup',
    secondaryCtaLabel: 'Watch demo',
    secondaryCtaLabelAr: 'شاهد العرض',
    secondaryCtaHref: '/blog',
    backgroundImageUrl: '',
  },
  features: [
    { icon: '🎯', title: 'Personalized boards', description: 'Custom vocabulary, categories, voice, and pacing — tuned to each child.' },
    { icon: '🗣️', title: 'Natural speech', description: 'High-quality bilingual TTS in English and Arabic.' },
    { icon: '📈', title: 'Progress tracking', description: 'Caregivers see growth in vocabulary, sentence length, and consistency.' },
  ],
  contact: {
    email: 'hello@jisr.app',
    phone: '+968 0000 0000',
    address: 'Muscat, Oman',
    twitter: '',
    instagram: '',
    facebook: '',
    linkedin: '',
  },
  seo: {
    metaTitle: 'Jisr — AAC platform for kids',
    metaDescription: 'Helping every child find their voice with a calm, accessible AAC experience.',
    ogImageUrl: '',
  },
  flags: { maintenanceMode: false, showPricing: true, showBlog: true, enableSignups: true },
}

interface SiteSettingsContextValue {
  settings: SiteSettings
  loading: boolean
  reload: () => Promise<void>
}

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  settings: DEFAULTS,
  loading: true,
  reload: async () => {},
})

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const s = await publicSiteService.getSettings()
      setSettings({ ...DEFAULTS, ...s })
    } catch {
      // Fail soft: keep defaults if backend isn't reachable.
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  // Apply meta tags + theme colors as CSS variables so any consumer can use them.
  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (settings.branding.primaryColor) {
      root.style.setProperty('--color-brand-primary', settings.branding.primaryColor)
    }
    if (settings.branding.accentColor) {
      root.style.setProperty('--color-brand-accent', settings.branding.accentColor)
    }
    if (settings.seo.metaTitle) {
      document.title = settings.seo.metaTitle
    }
    const setMeta = (name: string, value?: string) => {
      if (!value) return
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute('name', name)
        document.head.appendChild(el)
      }
      el.content = value
    }
    setMeta('description', settings.seo.metaDescription)
  }, [settings])

  const value = useMemo(() => ({ settings, loading, reload: load }), [settings, loading])

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}
