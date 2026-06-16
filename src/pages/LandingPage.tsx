import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  Users,
  Building2,
  Volume2,
  Languages,
  BarChart3,
  Sparkles,
  Star,
  PlayCircle,
  Shield,
  Pencil,
  Mic,
  LineChart,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Card from '../components/Card'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { useLanguage } from '../context/LanguageContext'
import { landingCopy } from '../i18n/landingCopy'
import { useTextToSpeech } from '../hooks/useTextToSpeech'
import { publicReviewService } from '../services/adminService'

const FEATURE_ICONS = [Volume2, Languages, Pencil, BarChart3, Heart, Shield] as const
const STEP_ICONS = [Pencil, Mic, LineChart] as const
const AUD_ICONS = [Users, Heart, Building2] as const

type LandingTestimonial = {
  name: string
  nameAr?: string | null
  role: string
  roleAr?: string | null
  quote: string
  quoteAr?: string | null
}

export default function LandingPage() {
  const { settings } = useSiteSettings()
  const hero = settings.hero
  const { language } = useLanguage()
  const L = useMemo(() => landingCopy(language), [language])

  const [dbReviews, setDbReviews] = useState<LandingTestimonial[]>([])

  useEffect(() => {
    void publicReviewService
      .listReviews()
      .then((data) => setDbReviews(data as LandingTestimonial[]))
      .catch(() => {})
  }, [])

  const fallbackReviews = L.testimonials
  const reviews = dbReviews.length ? dbReviews : fallbackReviews

  const featuresMerged = (settings.features.length ? settings.features : L.features).map((f, i) => ({
    ...f,
    title: language === 'ar' ? f.titleAr || f.title : f.title,
    description: language === 'ar' ? f.descriptionAr || f.description : f.description,
    icon: FEATURE_ICONS[i % FEATURE_ICONS.length],
  }))

  const stepsMerged = L.steps.map((s, i) => ({
    ...s,
    icon: STEP_ICONS[i % STEP_ICONS.length],
  }))

  const audiencesMerged = L.audiences.map((a, i) => ({
    ...a,
    icon: AUD_ICONS[i],
  }))

  const statsRows = [
    { value: '12k+', label: L.statWords },
    { value: '98%', label: L.statParents },
    { value: '2', label: L.statLangs },
    { value: '24/7', label: L.statAccess },
  ]

  const bgUrl = hero.backgroundImageUrl?.trim()
  return (
    <div className="min-h-screen bg-brand-surface">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 gradient-aurora" />
        {bgUrl ? (
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-cover bg-center opacity-[0.22]"
            style={{ backgroundImage: `url(${bgUrl})` }}
          />
        ) : null}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-[0.6] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(15,23,42,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.045) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="page-container pt-16 pb-20 lg:pt-24 lg:pb-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="primary" size="md" icon={<Sparkles className="h-3.5 w-3.5" />}>
                {language === 'ar' ? hero.eyebrowAr || L.heroEyebrow : hero.eyebrow}
              </Badge>
              <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
                {language === 'ar' ? hero.titleAr || L.heroTitle : hero.title}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-600">
                {language === 'ar' ? hero.subtitleAr || L.heroSubtitle : hero.subtitle}
              </p>
 
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to={hero.primaryCtaHref || '/signup'}>
                  <Button
                    variant="primary"
                    size="lg"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    {language === 'ar' ? hero.primaryCtaLabelAr || L.ctaPrimary : hero.primaryCtaLabel}
                  </Button>
                </Link>
                <Link to={hero.secondaryCtaHref || '/pricing'}>
                  <Button variant="outline" size="lg" leftIcon={<PlayCircle className="h-4 w-4" />}>
                    {language === 'ar' ? hero.secondaryCtaLabelAr || L.ctaPricing : hero.secondaryCtaLabel}
                  </Button>
                </Link>
              </div>

              <ul className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-600">
                {L.heroBullets.map((item) => (
                  <li key={item} className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-primary-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="relative"
            >
              <HeroDemo
                demoTitle={L.demoTitle}
                demoSpeak={L.demoSpeak}
                chipAr={L.demoChipAr}
                chipInstant={L.demoChipSpeak}
                tapHint={L.tapHint}
              />
            </motion.div>
          </div>

          {/* Stats strip */}
          <motion.dl
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
              className="mt-16 grid grid-cols-2 gap-x-6 gap-y-8 rounded-2xl border border-ink-100 bg-white/70 p-6 shadow-soft backdrop-blur sm:grid-cols-4"
          >
            {statsRows.map((s) => (
              <div key={s.label}>
                <dt className="text-2xl font-bold text-ink-900 sm:text-3xl">{s.value}</dt>
                <dd className="mt-1 text-xs leading-snug text-ink-600 sm:text-sm">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="scroll-mt-[4.75rem] border-y border-ink-100 bg-white py-20 lg:py-28">
        <div className="page-container">
          <SectionEyebrow text={L.featuresEyebrow}>{L.featuresHeading}</SectionEyebrow>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featuresMerged.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              >
                <Card padding="md" className="group h-full transition-all hover:border-primary-200 hover:shadow-card">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 ring-1 ring-primary-100 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-ink-900">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{f.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="scroll-mt-[4.75rem] bg-ink-50 py-20 lg:py-28">
        <div className="page-container">
          <SectionEyebrow text={L.howEyebrow}>{L.howHeading}</SectionEyebrow>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {stepsMerged.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card padding="lg" variant="elevated" className="relative h-full">
                  <div className="absolute -top-4 right-6 grid h-9 w-9 place-items-center rounded-full bg-ink-900 text-xs font-bold text-white shadow-soft">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-50 text-accent-600 ring-1 ring-accent-100">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-ink-900">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{s.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AUDIENCES */}
      <section className="bg-white py-20 lg:py-28">
        <div className="page-container">
          <SectionEyebrow text={L.audiencesEyebrow}>{L.audiencesHeading}</SectionEyebrow>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {audiencesMerged.map((a, i) => (
              <motion.div
                key={a.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <Link to={a.href} className="block h-full">
                  <Card hover padding="lg" variant="gradient" className="group h-full">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-primary-600 shadow-soft ring-1 ring-primary-100">
                      <a.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-ink-900">{a.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{a.blurb}</p>
                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 rtl:flex-row-reverse transition-transform group-hover:translate-x-0.5">
                      {L.learnMore}{language === 'ar' ? (
                        <ChevronLeft className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </span>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-y border-ink-100 bg-ink-50 py-20 lg:py-28">
        <div className="page-container">
          <SectionEyebrow text={L.testimonialsEyebrow}>{L.testimonialsHeading}</SectionEyebrow>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {reviews.map((t, i) => (
              <motion.figure
                key={t.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-6 shadow-soft"
              >
                <div className="flex items-center gap-1 text-sunny-500">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-700">
                  "{language === 'ar' ? t.quoteAr || t.quote : t.quote}"
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-ink-100 pt-4">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                    {(language === 'ar' ? t.nameAr || t.name : t.name)
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-ink-900">{language === 'ar' ? t.nameAr || t.name : t.name}</div>
                    <div className="text-xs text-ink-500">{language === 'ar' ? t.roleAr || t.role : t.role}</div>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="scroll-mt-[4.75rem] border-y border-ink-100 bg-white py-20 lg:py-28">
        <div className="page-container">
          <SectionEyebrow text={L.pricingEyebrow}>{L.pricingHeading}</SectionEyebrow>
          <p className="mx-auto mt-4 max-w-2xl text-center text-ink-600">{L.pricingIntro}</p>
          <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
            {L.pricingPlans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card padding="lg" className="h-full shadow-soft hover:border-primary-200 hover:shadow-card transition-all">
                  <div className="text-xs font-bold uppercase tracking-[0.12em] text-primary-700">{plan.name}</div>
                  <div className="mt-2 text-2xl font-extrabold text-ink-900">{plan.price}</div>
                  <p className="mt-2 text-sm text-ink-600 leading-relaxed">{plan.blurb}</p>
                  <div className="mt-6">
                    <Link to={`/pricing#${plan.id}`}>
                      <Button variant="outline" size="md" fullWidth rightIcon={<ArrowRight className="h-4 w-4" />}>
                        {L.learnMore}
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Link to="/pricing">
              <Button variant="primary" size="lg">
                {L.pricingViewFull}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-28">
        <div className="page-container">
          <div className="relative overflow-hidden rounded-3xl bg-ink-900 px-8 py-14 text-center shadow-card sm:px-12 sm:py-20">
            <div
              aria-hidden
              className="absolute inset-0 opacity-90"
              style={{
                backgroundImage:
                  'radial-gradient(80% 80% at 30% 0%, rgba(24,90,141,0.52) 0%, rgba(24,90,141,0) 60%), radial-gradient(60% 60% at 75% 90%, rgba(239,69,69,0.42) 0%, rgba(239,69,69,0) 60%)',
              }}
            />
            <div className="relative">
              <h2 className="text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {L.ctaHeading}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base text-white/80">
                {L.ctaSubtitle}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/signup">
                  <Button
                    variant="primary"
                    size="lg"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    {L.ctaPrimary}
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="!bg-white/10 !text-white hover:!bg-white/20"
                  >
                    {L.ctaPricing}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function SectionEyebrow({
  text,
  children,
}: {
  text: string
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <span className="eyebrow">{text}</span>
      <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
        {children}
      </h2>
    </div>
  )
}

function HeroDemo({
  demoTitle,
  demoSpeak,
  chipAr,
  chipInstant,
  tapHint,
}: {
  demoTitle: string
  demoSpeak: string
  chipAr: string
  chipInstant: string
  tapHint: string
}) {
  const cards = [
    { word: 'I', emoji: '🙂' },
    { word: 'want', emoji: '✋' },
    { word: 'water', emoji: '💧' },
    { word: 'please', emoji: '✨' },
    { word: 'eat', emoji: '🍎' },
    { word: 'play', emoji: '🎲' },
  ]
  const { speak } = useTextToSpeech({ rate: 0.9, pitch: 1.1, language: 'en', voiceType: 'child' })

  const speakSentence = () => speak('I want water')

  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary-100 via-primary-50 to-accent-50 blur-2xl opacity-60" />
      <div className="rounded-3xl border border-ink-100 bg-white p-3 shadow-card">
        <div className="flex items-center justify-between rounded-t-2xl bg-ink-50 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-accent-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-sunny-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="text-xs font-medium text-ink-500">{demoTitle}</div>
          <div className="text-xs text-ink-400">EN</div>
        </div>

        <div className="mt-3 rounded-xl border border-ink-100 bg-ink-50/60 p-3">
          <div className="flex items-center gap-2 overflow-hidden">
            {['I', 'want', 'water'].map((w) => (
              <button
                key={w}
                type="button"
                className="inline-flex cursor-pointer rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-ink-800 shadow-soft ring-1 ring-ink-100 transition-colors hover:bg-primary-50 hover:ring-primary-200"
                onClick={() => speak(w)}
              >
                {w}
              </button>
            ))}
            <button
              type="button"
              className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white shadow-soft hover:bg-primary-700"
              onClick={speakSentence}
            >
              <Volume2 className="h-3.5 w-3.5" aria-hidden /> {demoSpeak}
            </button>
          </div>
        </div>

        <p className="mt-2 px-1 text-[11px] text-center text-ink-500">{tapHint}</p>

        <div className="mt-1 grid grid-cols-3 gap-2 p-1">
          {cards.map((c, i) => (
            <motion.button
              key={c.word}
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => speak(c.word)}
              className={[
                'flex aspect-[5/4] flex-col items-center justify-center rounded-2xl border text-center transition-all',
                i === 2
                  ? 'border-primary-300 bg-primary-50 ring-2 ring-primary-200'
                  : 'border-ink-100 bg-white hover:border-primary-200',
              ].join(' ')}
            >
              <span className="text-3xl" aria-hidden>{c.emoji}</span>
              <span className="mt-1 text-xs font-semibold text-ink-800">{c.word}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="absolute -left-3 top-12 hidden rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 shadow-card ring-1 ring-ink-100 sm:block"
      >
        {chipAr}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="absolute -bottom-4 right-2 hidden rounded-full bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white shadow-card sm:block"
      >
        {chipInstant}
      </motion.div>
    </div>
  )
}
