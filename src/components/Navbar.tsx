import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Globe, ArrowRight } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import Button from './Button'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { useLanguage } from '../context/LanguageContext'

interface NavLink {
  to: string
  label: { en: string; ar: string }
}

const ALL_NAV_LINKS: NavLink[] = [
  { to: '/', label: { en: 'Home', ar: 'الرئيسية' } },
  { to: '/pricing', label: { en: 'Pricing', ar: 'الأسعار' } },
  { to: '/blog', label: { en: 'Blog', ar: 'المدونة' } },
]

export default function Navbar() {
  const location = useLocation()
  const { settings } = useSiteSettings()
  const flags = settings.flags
  const { isArabic, setLanguage } = useLanguage()

  const NAV_LINKS = useMemo(
    () =>
      ALL_NAV_LINKS.filter((l) => {
        if (l.to === '/pricing' && !flags.showPricing) return false
        if (l.to === '/blog' && !flags.showBlog) return false
        return true
      }),
    [flags.showPricing, flags.showBlog]
  )
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
    <header
      className={[
        'sticky top-0 z-50 transition-all duration-200',
        scrolled
          ? 'bg-primary-600 backdrop-blur-xl border-b border-primary-700 shadow-soft'
          : 'bg-primary-500/95 backdrop-blur-md border-b border-primary-600/50',
      ].join(' ')}
    >
      <div className="page-container" style={{ direction: 'ltr' }}>
        <div className="flex h-16 min-w-0 items-center justify-between gap-2">
          <Link to="/" className="flex items-center shrink-0">
            {settings.branding.logoUrl ? (
              <img
                src={settings.branding.logoUrl}
                alt={settings.branding.siteName}
                className="h-12 w-auto object-contain"
              />
            ) : (
              <img
                src={isArabic ? '/logos/JisrApp-12.png' : '/logos/JisrApp-11.png'}
                alt={settings.branding.siteName}
                className="h-14 w-auto"
              />
            )}
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={[
                  'rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                  isActive(link.to)
                    ? 'text-white bg-white/20'
                    : 'text-white/90 hover:text-white hover:bg-white/15',
                ].join(' ')}
              >
                {isArabic ? link.label.ar : link.label.en}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setLanguage(isArabic ? 'en' : 'ar')}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/15 transition-colors"
              title={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
            >
              <Globe className="h-4 w-4" />
              <span>{isArabic ? 'EN' : 'AR'}</span>
            </button>
            <Link to="/signin">
              <Button variant="ghost" size="sm" className="!text-white hover:!bg-white/15">
                {isArabic ? 'تسجيل الدخول' : 'Sign in'}
              </Button>
            </Link>
            {flags.enableSignups && (
              <Link to="/signup">
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="!bg-white !text-primary-700 hover:!bg-white/90"
                >
                  {isArabic ? 'ابدأ الآن' : 'Get started'}
                </Button>
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="md:hidden rounded-lg p-2 text-white hover:bg-white/15"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="space-y-1 py-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={[
                      'block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive(link.to)
                        ? 'text-white bg-white/20'
                        : 'text-white/90 hover:bg-white/15',
                    ].join(' ')}
                  >
                    {isArabic ? link.label.ar : link.label.en}
                  </Link>
                ))}
                <div className="my-3 h-px bg-white/20" />
                <button
                  onClick={() => setLanguage(isArabic ? 'en' : 'ar')}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/15"
                >
                  <Globe className="h-4 w-4" />
                  <span>{isArabic ? 'English' : 'العربية'}</span>
                </button>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link to="/signin">
                    <Button variant="outline" size="md" fullWidth className="!bg-white/10 !text-white !border-white/30 hover:!bg-white/20">
                      {isArabic ? 'تسجيل الدخول' : 'Sign in'}
                    </Button>
                  </Link>
                  {flags.enableSignups && (
                    <Link to="/signup">
                      <Button variant="primary" size="md" fullWidth className="!bg-white !text-primary-700 hover:!bg-white/90">
                        {isArabic ? 'ابدأ' : 'Sign up'}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
