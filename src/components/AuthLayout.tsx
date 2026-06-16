import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageSquare, Sparkles, Volume2 } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { tr, t } from '../i18n/translations'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  description?: string
  hero?: {
    title: string
    description: string
  }
}

export default function AuthLayout({
  children,
  title,
  description,
  hero,
}: AuthLayoutProps) {
  const { language, isArabic } = useLanguage()
  const heroContent = hero || {
    title: t(tr.auth.heroTitle, language),
    description: t(tr.auth.heroDesc, language),
  }

  return (
    <div className="min-h-screen bg-brand-surface">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Form side */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 sm:px-10">
            <Link to="/" className="inline-flex items-center">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-600 shadow-soft">
                <img
                  src={isArabic ? '/logos/JisrApp-12.png' : '/logos/JisrApp-11.png'}
                  alt="Jisr"
                  className="h-9 w-auto"
                />
              </span>
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-ink-900"
            >
              <ArrowLeft className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
              {t(tr.auth.backToHome, language)}
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="w-full max-w-md"
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-2 text-sm text-ink-600">{description}</p>
                ) : null}
              </div>
              {children}
            </motion.div>
          </div>
        </div>

        {/* Hero / illustration side */}
        <aside className="relative hidden overflow-hidden bg-ink-900 lg:block">
          <div
            aria-hidden
            className="absolute inset-0 opacity-90"
            style={{
              backgroundImage:
                'radial-gradient(80% 80% at 30% 0%, rgba(24,90,141,0.55) 0%, rgba(24,90,141,0) 60%), radial-gradient(60% 60% at 80% 95%, rgba(239,69,69,0.45) 0%, rgba(239,69,69,0) 60%), radial-gradient(60% 60% at 5% 90%, rgba(33,165,255,0.30) 0%, rgba(33,165,255,0) 60%)',
            }}
          />
          <div className="relative flex h-full flex-col justify-between p-12 text-white">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-md ring-1 ring-white/15 self-start">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold tracking-wide">{t(tr.auth.aacPlatform, language)}</span>
            </div>

            <div>
              <h2 className="text-balance text-white text-3xl font-bold leading-tight sm:text-4xl">
                {heroContent.title}
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-white/80">
                {heroContent.description}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-3 rounded-xl bg-white/8 p-4 ring-1 ring-white/10 backdrop-blur-md">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/15">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold">{t(tr.auth.visualBoards, language)}</div>
                    <div className="text-xs text-white/70">{t(tr.auth.visualBoardsDesc, language)}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-white/8 p-4 ring-1 ring-white/10 backdrop-blur-md">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/15">
                    <Volume2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold">{t(tr.auth.speaksAloud, language)}</div>
                    <div className="text-xs text-white/70">{t(tr.auth.speaksAloudDesc, language)}</div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-white/60">
              © {new Date().getFullYear()} Jisr · {isArabic ? 'مبني بعناية للتواصل غير اللفظي' : 'Built with care for non-verbal communication'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
