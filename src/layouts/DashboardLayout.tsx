import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  MessageSquare,
  CreditCard,
  HelpCircle,
  ChevronDown,
  Sun,
  Moon,
  Type,
  Globe,
} from 'lucide-react'
import { authService } from '../services/authService'
import { useUserPreferences } from '../context/UserPreferencesContext'
import { useLanguage } from '../context/LanguageContext'
import { tr, t } from '../i18n/translations'

interface DashboardLayoutProps {
  children: ReactNode
}

const FONT_SIZES = ['comfortable', 'large', 'extra-large'] as const
type FontSize = (typeof FONT_SIZES)[number]

function navFontToSettings(
  f: FontSize
): 'small' | 'medium' | 'large' | 'extra-large' {
  if (f === 'extra-large') return 'extra-large'
  if (f === 'large') return 'large'
  return 'medium'
}

function settingsFontToNav(
  fs: string | undefined
): FontSize {
  if (fs === 'large') return 'large'
  if (fs === 'extra-large') return 'extra-large'
  return 'comfortable'
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { preferences, savePreferences } = useUserPreferences()
  const { language, isArabic, setLanguage } = useLanguage()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; email?: string; accountType?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)

  // Nav items with bilingual labels
  const NAV_PRIMARY = useMemo(() => [
    { icon: LayoutDashboard, label: t(tr.nav.overview, language),   path: '/dashboard' },
    { icon: MessageSquare,   label: t(tr.nav.aacBoards, language),  path: '/aac/customization', highlight: true },
    { icon: Users,           label: t(tr.nav.children, language),   path: '/family' },
    { icon: BarChart3,       label: t(tr.nav.progress, language),   path: '/progress' },
  ], [language])

  const NAV_SECONDARY = useMemo(() => [
    { icon: HelpCircle, label: t(tr.nav.support, language),  path: '/support' },
    { icon: CreditCard, label: t(tr.nav.billing, language),  path: '/payment' },
    { icon: Settings,   label: t(tr.nav.settings, language), path: '/settings' },
  ], [language])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const me = await authService.getCurrentUser()
        if (!mounted) return
        setUser({ name: me.name, email: me.email, accountType: me.accountType || 'Account' })
      } catch (err) {
        console.error('Failed to load user:', err)
        if (mounted) setUser({ name: 'Guest', accountType: 'Account' })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const fontSize = settingsFontToNav(preferences?.fontSize)

  const isDarkMode = useMemo(() => {
    if (!preferences) return false
    if (preferences.theme === 'dark') return true
    if (preferences.theme === 'light') return false
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }, [preferences])

  const cycleTheme = () => {
    if (!preferences) return
    void savePreferences({ theme: isDarkMode ? 'light' : 'dark' })
  }

  const setNavFontSize = (f: FontSize) => {
    void savePreferences({ fontSize: navFontToSettings(f) })
  }

  const toggleLanguage = () => {
    const next = isArabic ? 'en' : 'ar'
    setLanguage(next)
    // Also persist to user preferences when logged in
    void savePreferences({ language: next })
  }

  const initials = useMemo(() => {
    if (!user?.name) return 'U'
    const parts = user.name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return user.name.slice(0, 2).toUpperCase()
  }, [user?.name])

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      navigate('/signin')
    }
  }

  const isActive = (path: string) =>
    path === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(path)

  // RTL-aware sidebar positioning
  const sidebarPositionClass = isArabic ? 'right-0' : 'left-0'
  const sidebarClosedTranslate = isArabic ? 'translate-x-full' : '-translate-x-full'
  const mainPaddingClass = isArabic ? 'lg:pr-72' : 'lg:pl-72'

  return (
    <div className="min-h-screen bg-brand-surface dark:bg-ink-900">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm lg:hidden dark:bg-black/60"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={[
          `fixed ${sidebarPositionClass} top-0 z-50 flex h-full w-72 flex-col border-r border-ink-100 bg-white dark:bg-ink-800 dark:border-ink-700`,
          'transform transition-transform duration-300 ease-out',
          sidebarOpen ? 'translate-x-0' : sidebarClosedTranslate,
          'lg:translate-x-0',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4">
          <Link to="/dashboard" className="flex items-center">
            <img
              src={isArabic ? '/logos/JisrApp-12.png' : '/logos/JisrApp-11.png'}
              alt="Jisr"
              className="h-9 w-auto"
            />
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 lg:hidden dark:text-ink-300 dark:hover:bg-ink-700"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pt-2 pb-6">
          <SidebarGroup label={t(tr.sidebar.workspace, language)}>
            {NAV_PRIMARY.map((item) => (
              <SidebarLink
                key={item.path}
                {...item}
                active={isActive(item.path)}
              />
            ))}
          </SidebarGroup>

          <SidebarGroup label={t(tr.sidebar.account, language)}>
            {NAV_SECONDARY.map((item) => (
              <SidebarLink
                key={item.path}
                {...item}
                active={isActive(item.path)}
              />
            ))}
          </SidebarGroup>

          <div className="mt-6 mx-2 rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-ink-900 p-4 text-white shadow-card">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              {t(tr.sidebar.proTip, language)}
            </div>
            <p className="mt-1.5 text-sm font-medium leading-snug">
              {t(tr.sidebar.proTipText, language)}
            </p>
            <Link
              to="/aac/customization"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white/95 hover:underline"
            >
              {t(tr.sidebar.customizeBoard, language)}
            </Link>
          </div>
        </nav>

        {/* User + logout */}
        <div className="border-t border-ink-100 p-3 dark:border-ink-700">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2.5">
            <div className="grid h-9 w-9 flex-none place-items-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-bold text-white">
              {loading ? '…' : initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-ink-900 dark:text-ink-50">
                {loading ? t(tr.common.loading, language) : user?.name}
              </div>
              <div className="truncate text-xs text-ink-500 dark:text-ink-400">
                {loading ? '' : user?.email || user?.accountType}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-700"
          >
            <LogOut className="h-4 w-4" />
            {t(tr.nav.signOut, language)}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={mainPaddingClass}>
        <header className="sticky top-0 z-30 bg-primary-500 shadow-soft">
          <div className="flex h-16 min-w-0 items-center gap-2 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="shrink-0 rounded-lg p-2 text-white/80 hover:bg-white/10 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden flex-1 min-w-0 max-w-xl md:block">
              <div className="relative">
                <Search className={`pointer-events-none absolute ${isArabic ? 'right-3.5' : 'left-3.5'} top-1/2 h-4 w-4 -translate-y-1/2 text-white/50`} />
                <input
                  type="search"
                  placeholder={t(tr.header.searchDashboard, language)}
                  className={`w-full rounded-xl border border-white/20 bg-white/10 py-2.5 ${isArabic ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-sm text-white transition-all placeholder:text-white/50 hover:border-white/30 focus:border-white/40 focus:ring-4 focus:ring-white/10 focus:outline-none`}
                />
              </div>
            </div>

            <div className="ms-auto flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={cycleTheme}
                title={isDarkMode ? t(tr.header.lightMode, language) : t(tr.header.darkMode, language)}
                className="rounded-lg p-2 text-white/80 hover:bg-white/10"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <FontSizeMenu value={fontSize} onChange={setNavFontSize} language={language} />

              {/* Language toggle */}
              <button
                type="button"
                onClick={toggleLanguage}
                title={t(tr.header.langTitle, language)}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
              >
                <Globe className="h-5 w-5" />
                <span className="hidden sm:inline text-xs font-bold">{t(tr.header.langLabel, language)}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/notifications')}
                aria-label={t(tr.header.notifications, language)}
                className="relative rounded-lg p-2 text-white/80 hover:bg-white/10"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 grid h-2 w-2 place-items-center rounded-full bg-accent-500 ring-2 ring-primary-500" />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  className="ml-1 inline-flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-3 transition-colors hover:bg-white/10"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-xs font-bold text-white">
                    {loading ? '…' : initials}
                  </span>
                  <span className="hidden text-sm font-medium text-white sm:inline">
                    {loading ? '…' : user?.name?.split(' ')[0] || 'You'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-white/70" />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className={`absolute ${isArabic ? 'left-0' : 'right-0'} top-12 w-56 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card dark:border-ink-600 dark:bg-ink-800`}
                    >
                      <div className="border-b border-ink-100 px-4 py-3 dark:border-ink-600">
                        <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">
                          {loading ? t(tr.common.loading, language) : user?.name}
                        </div>
                        <div className="truncate text-xs text-ink-500 dark:text-ink-400">
                          {user?.email || user?.accountType}
                        </div>
                      </div>
                      <div className="p-1.5">
                        <Link
                          to="/settings"
                          onClick={() => setProfileOpen(false)}
                          className="block rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-700"
                        >
                          {t(tr.nav.accountSettings, language)}
                        </Link>
                        <Link
                          to="/payment"
                          onClick={() => setProfileOpen(false)}
                          className="block rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-700"
                        >
                          {t(tr.nav.billingPlan, language)}
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false)
                            handleLogout()
                          }}
                          className="block w-full rounded-lg px-3 py-2 text-left text-sm text-accent-700 hover:bg-accent-50 dark:text-accent-400 dark:hover:bg-accent-900/20"
                        >
                          {t(tr.nav.signOut, language)}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}

function SidebarGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-3 first:mt-0">
      <div className="px-3 pb-1.5 pt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">
        {label}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function SidebarLink({
  icon: Icon,
  label,
  path,
  active,
  highlight,
}: {
  icon: typeof LayoutDashboard
  label: string
  path: string
  active: boolean
  highlight?: boolean
}) {
  const { language } = useLanguage()
  return (
    <Link
      to={path}
      className={[
        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
        active
          ? 'bg-primary-600 text-white shadow-soft'
          : 'text-ink-700 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-700 hover:text-ink-900 dark:hover:text-ink-50',
      ].join(' ')}
    >
      <span
        className={[
          'grid h-7 w-7 place-items-center rounded-lg transition-colors',
          active
            ? 'bg-white/20 text-white'
            : 'bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-ink-400 group-hover:bg-white dark:group-hover:bg-ink-600',
        ].join(' ')}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1">{label}</span>
      {highlight && !active ? (
        <span className="rounded-full bg-accent-100 dark:bg-accent-900/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-700 dark:text-accent-300">
          {t(tr.sidebar.new, language)}
        </span>
      ) : null}
    </Link>
  )
}

function FontSizeMenu({
  value,
  onChange,
  language,
}: {
  value: FontSize
  onChange: (v: FontSize) => void
  language: string
}) {
  const [open, setOpen] = useState(false)
  const { isArabic } = useLanguage()
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-2 text-white/80 hover:bg-white/10"
        aria-label={t(tr.header.adjustFontSize, language as 'en' | 'ar')}
      >
        <Type className="h-5 w-5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className={`absolute ${isArabic ? 'left-0' : 'right-0'} top-11 z-20 w-44 overflow-hidden rounded-xl border border-ink-100 bg-white p-1.5 shadow-card dark:border-ink-600 dark:bg-ink-800`}
          >
            {FONT_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  onChange(s)
                  setOpen(false)
                }}
                className={[
                  'block w-full rounded-lg px-3 py-2 text-left text-sm capitalize transition-colors',
                  value === s
                    ? 'bg-primary-50 text-primary-800 dark:bg-primary-900/30 dark:text-primary-200'
                    : 'text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-700',
                ].join(' ')}
              >
                {tr.fontSize[s] ? t(tr.fontSize[s], language as 'en' | 'ar') : s.replace('-', ' ')}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
