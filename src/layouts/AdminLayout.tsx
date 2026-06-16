import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  Settings,
  Shield,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  HelpCircle,
  Newspaper,
  CreditCard,
  ImageIcon,
  Sun,
  Moon,
  Globe,
} from 'lucide-react'
import AccountSwitcher from '../components/AccountSwitcher'
import { authService } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import { useUserPreferences } from '../context/UserPreferencesContext'
import { useLanguage } from '../context/LanguageContext'
import { tr, t } from '../i18n/translations'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { preferences, savePreferences } = useUserPreferences()
  const { language, isArabic, setLanguage } = useLanguage()
  const { user: authUser } = useAuth()
  const [open, setOpen] = useState(false)

  const adminName = authUser?.name ?? 'Admin user'
  const adminEmail = authUser?.email ?? 'Administrator'
  const adminInitials = useMemo(() => {
    const name = authUser?.name ?? 'Admin user'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }, [authUser?.name])

  // Nav items with bilingual labels
  const NAV = useMemo(() => [
    { icon: LayoutDashboard, label: t(tr.admin.dashboard, language), path: '/admin/dashboard' },
    { icon: Users,           label: t(tr.admin.users, language),     path: '/admin/users'     },
    { icon: BarChart3,       label: t(tr.admin.analytics, language), path: '/admin/analytics' },
    { icon: FileText,        label: t(tr.admin.reports, language),   path: '/admin/reports'   },
    { icon: Newspaper,       label: t(tr.admin.blog, language),      path: '/admin/blog'      },
    { icon: HelpCircle,      label: t(tr.admin.support, language),   path: '/admin/support'   },
    { icon: CreditCard,      label: t(tr.admin.billing, language),   path: '/admin/billing'   },
    { icon: ImageIcon,       label: t(tr.admin.media, language),     path: '/admin/media'     },
    { icon: Settings,        label: t(tr.admin.settings, language),  path: '/admin/settings'  },
  ], [language])

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

  const toggleLanguage = () => {
    const next = isArabic ? 'en' : 'ar'
    setLanguage(next)
    void savePreferences({ language: next })
  }

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      /* noop */
    }
  }

  const isActive = (p: string) =>
    p === '/admin/dashboard'
      ? location.pathname === '/admin/dashboard'
      : location.pathname.startsWith(p)

  // RTL-aware sidebar positioning
  const sidebarPositionClass = isArabic ? 'right-0' : 'left-0'
  const sidebarClosedTranslate = isArabic ? 'translate-x-full' : '-translate-x-full'
  const mainPaddingClass = isArabic ? 'lg:pr-72' : 'lg:pl-72'

  return (
    <div className="min-h-screen bg-brand-surface dark:bg-ink-900">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm lg:hidden dark:bg-black/60"
          />
        )}
      </AnimatePresence>

      <aside
        className={[
          `fixed ${sidebarPositionClass} top-0 z-50 flex h-full w-72 flex-col border-r border-ink-100 bg-white dark:bg-ink-800 dark:border-ink-700`,
          'transform transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : sidebarClosedTranslate,
          'lg:translate-x-0',
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-600 shadow-soft">
              <Shield className="h-5 w-5 text-white" />
            </span>
            <div>
              <div className="text-base font-bold leading-tight text-ink-900 dark:text-ink-50">Jisr</div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">
                {t(tr.admin.adminConsole, language)}
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 lg:hidden dark:text-ink-300 dark:hover:bg-ink-700"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pt-2 pb-6">
          <div className="space-y-0.5">
            {NAV.map((item) => {
              const active = isActive(item.path)
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={[
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary-500 text-white shadow-soft'
                      : 'text-ink-700 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-700 dark:hover:text-ink-50',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'grid h-7 w-7 place-items-center rounded-lg transition-colors',
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-ink-100 text-ink-600 group-hover:bg-white dark:bg-ink-700 dark:text-ink-400 dark:group-hover:bg-ink-600',
                    ].join(' ')}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {item.label}
                </Link>
              )
            })}
          </div>

          <div className="mt-6 mx-2 rounded-2xl bg-gradient-to-br from-ink-900 via-ink-800 to-primary-700 p-4 text-white shadow-card">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
              {t(tr.sidebar.adminTip, language)}
            </div>
            <p className="mt-1.5 text-sm font-medium leading-snug">
              {t(tr.sidebar.adminTipText, language)}
            </p>
          </div>
        </nav>

        <div className="border-t border-ink-100 p-3 dark:border-ink-700">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2.5">
            <div className="grid h-9 w-9 flex-none place-items-center rounded-full bg-primary-600 text-white text-xs font-bold">
              {adminInitials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-ink-900 dark:text-ink-50">{adminName}</div>
              <div className="truncate text-xs text-ink-500 dark:text-ink-400">{adminEmail}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-700"
          >
            <LogOut className="h-4 w-4" />
            {t(tr.nav.signOut, language)}
          </button>
        </div>
      </aside>

      <div className={mainPaddingClass}>
        <header className="sticky top-0 z-30 bg-primary-500 shadow-soft">
          <div className="flex h-16 min-w-0 items-center gap-2 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="shrink-0 rounded-lg p-2 text-white/80 hover:bg-white/10 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden flex-1 min-w-0 max-w-xl md:block">
              <div className="relative">
                <Search className={`pointer-events-none absolute ${isArabic ? 'right-3.5' : 'left-3.5'} top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400`} />
                <input
                  type="search"
                  placeholder={t(tr.header.searchAdmin, language)}
                  className={`w-full rounded-xl border border-ink-200 bg-white py-2.5 ${isArabic ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-sm text-ink-900 transition-all placeholder:text-ink-400 hover:border-ink-300 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 focus:outline-none`}
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

              <AccountSwitcher />
              <button
                type="button"
                onClick={() => navigate('/admin/support')}
                aria-label={t(tr.header.notifications, language)}
                className="relative rounded-lg p-2 text-white/80 hover:bg-white/10"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 grid h-2 w-2 place-items-center rounded-full bg-accent-500 ring-2 ring-primary-500" />
              </button>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-xs font-bold text-white">
                {adminInitials}
              </span>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
