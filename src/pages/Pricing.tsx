import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { tr, t } from '../i18n/translations'
import { Check, ArrowRight, Sparkles, Building2, Heart, Users } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Card from '../components/Card'
import { authService } from '../services/authService'

type Cycle = 'monthly' | 'yearly'

interface Plan {
  id: string | null
  name: string
  description: string
  monthly: number | null
  yearly: number | null
  features: string[]
  highlight?: boolean
  cta: string
  icon: typeof Heart
}

const getPlans = (lang: 'en' | 'ar'): Plan[] => [
  {
    id: 'free-plan',
    name: lang === 'ar' ? 'مجاني' : 'Free',
    description: lang === 'ar' ? 'جرب جسر مع لوحة أساسية.' : 'Try Jisr with a starter board.',
    monthly: 0,
    yearly: 0,
    features: lang === 'ar' ? [
      'حتى 50 بطاقة مفردات',
      'تحويل النص إلى كلام أساسي',
      'ملف شخصي لطفل واحد',
      'دعم المجتمع',
    ] : [
      'Up to 50 vocabulary cards',
      'Basic text-to-speech',
      'Single child profile',
      'Community support',
    ],
    cta: lang === 'ar' ? 'ابدأ مجانًا' : 'Start free',
    icon: Heart,
  },
  {
    id: 'family-plan',
    name: lang === 'ar' ? 'العائلة' : 'Family',
    description: lang === 'ar' ? 'الأفضل للعائلات التي لديها حتى 3 أطفال.' : 'Best for families with up to 3 children.',
    monthly: 15,
    yearly: 144,
    features: lang === 'ar' ? [
      'بطاقات مفردات غير محدودة',
      'تحويل نص إلى كلام متقدم',
      'أصوات ولغات مخصصة',
      'أولوية الدعم',
      'تحليلات تقدم مفصلة',
    ] : [
      'Unlimited vocabulary cards',
      'Advanced text-to-speech',
      'Custom voices & languages',
      'Priority support',
      'Detailed progress analytics',
    ],
    highlight: true,
    cta: lang === 'ar' ? 'ابدأ تجربة لمدة 14 يومًا' : 'Start 14-day trial',
    icon: Users,
  },
  {
    id: 'family-plus-plan',
    name: lang === 'ar' ? 'العائلة بلس' : 'Family Plus',
    description: lang === 'ar' ? 'عدة أطفال، حساب واحد.' : 'Multiple children, one account.',
    monthly: 25,
    yearly: 240,
    features: lang === 'ar' ? [
      'كل ما في خطة العائلة',
      'حتى 5 ملفات شخصية للأطفال',
      'لوحة إدارة العائلة',
      'مكتبات مفردات مشتركة',
      'أولوية الدعم على مدار الساعة',
    ] : [
      'Everything in Family',
      'Up to 5 child profiles',
      'Family management dashboard',
      'Shared vocabulary libraries',
      '24/7 priority support',
    ],
    cta: lang === 'ar' ? 'ابدأ تجربة لمدة 14 يومًا' : 'Start 14-day trial',
    icon: Users,
  },
  {
    id: null,
    name: lang === 'ar' ? 'المؤسسات' : 'Organization',
    description: lang === 'ar' ? 'المدارس والعيادات والمنظمات.' : 'Schools, clinics, and orgs.',
    monthly: null,
    yearly: null,
    features: lang === 'ar' ? [
      'مستخدمون غير محدودين',
      'لوحة تحكم المؤسسة والأدوار',
      'إدارة جماعية',
      'تسجيل دخول موحد وعلامة تجارية مخصصة',
      'مدير نجاح مخصص',
      'توجيه وتدريب',
    ] : [
      'Unlimited users',
      'Org dashboard & roles',
      'Bulk management',
      'SSO & custom branding',
      'Dedicated success manager',
      'Onboarding & training',
    ],
    cta: lang === 'ar' ? 'تواصل مع المبيعات' : 'Contact sales',
    icon: Building2,
  },
]

const getFaqs = (lang: 'en' | 'ar') => lang === 'ar' ? [
  { q: 'هل يمكنني تغيير الخطة لاحقًا؟', a: 'نعم — يمكنك الترقية أو الرجوع إلى خطة أقل في أي وقت. يتم تطبيق الرسوم التناسبية تلقائيًا.' },
  { q: 'هل توجد فترة تجريبية مجانية؟', a: 'تتضمن جميع الخطط المدفوعة فترة تجريبية مجانية لمدة 14 يومًا. لا حاجة لبطاقة ائتمان للبدء.' },
  { q: 'هل تقدمون خصومات للمدارس أو المعالجين؟', a: 'نعم. تواصل معنا عبر خطة المؤسسات لمناقشة أسعار الجملة والمنح.' },
  { q: 'كيف يتم التعامل مع الفواتير؟', a: 'تُفرض جميع رسوم الخطط المدفوعة بالريال العماني عبر الخروج الآمن لثواني. يمكنك الإلغاء في أي وقت من الإعدادات.' },
] : [
  { q: 'Can I change plans later?', a: 'Yes — upgrade or downgrade at any time. Pro-rated charges are applied automatically.' },
  { q: 'Is there a free trial?', a: 'All paid plans include a 14-day free trial. No credit card required to start.' },
  { q: 'Do you offer discounts for schools or therapists?', a: 'Yes. Reach out via the Organization plan to talk about volume pricing and grants.' },
  { q: 'How is billing handled?', a: 'All paid plans are billed in OMR via Thawani secure checkout. You can cancel anytime from settings.' },
]

export default function Pricing() {
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [cycle, setCycle] = useState<Cycle>('monthly')
  const isAuthenticated = authService.isAuthenticated()

  const PLANS = getPlans(language)
  const FAQS = getFaqs(language)

  const goPlan = (planId: string | null) => {
    if (!planId) return
    if (isAuthenticated) navigate(`/payment?plan=${planId}`)
    else navigate(`/signup?plan=${planId}`)
  }

  return (
    <div className="min-h-screen bg-brand-surface">
      <Navbar />

      <section className="border-b border-ink-100 bg-white">
        <div className="page-container py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mx-auto max-w-3xl text-center"
          >
            <Badge variant="primary" icon={<Sparkles className="h-3.5 w-3.5" />}>
              {t(tr.pricingPage.heroBadge, language)}
            </Badge>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl">
              {t(tr.pricingPage.title, language)}
            </h1>
            <p className="mt-4 text-lg text-ink-600">
              {t(tr.pricingPage.subtitle, language)}
            </p>

            <div className="mt-8 inline-flex items-center rounded-full border border-ink-200 bg-white p-1 shadow-soft">
              {(['monthly', 'yearly'] as Cycle[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCycle(c)}
                  className={[
                    'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-all',
                    cycle === c
                      ? 'bg-ink-900 text-white shadow-soft'
                      : 'text-ink-700 hover:text-ink-900',
                  ].join(' ')}
                >
                  <span className="capitalize">{c === 'monthly' ? (language === 'ar' ? 'شهرياً' : 'Monthly') : (language === 'ar' ? 'سنوياً' : 'Yearly')}</span>
                  {c === 'yearly' && (
                    <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      {language === 'ar' ? 'وفر ٢٠٪' : 'Save 20%'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-brand-surface py-16 lg:py-20">
        <div className="page-container">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((plan, idx) => (
              <motion.div
                key={plan.name}
                id={plan.id || 'organization'}
                className="scroll-mt-[4.75rem]"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <PlanCard plan={plan} cycle={cycle} onChoose={goPlan} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-24">
        <div className="page-container">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-bold tracking-tight text-ink-900">
              {t(tr.pricingPage.faq, language)}
            </h2>
            <div className="mt-10 divide-y divide-ink-100 rounded-3xl border border-ink-100 bg-white shadow-soft">
              {FAQS.map((f) => (
                <details key={f.q} className="group p-6">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-ink-900">
                    {f.q}
                    <span className="grid h-6 w-6 place-items-center rounded-full border border-ink-200 text-ink-600 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-ink-600">{f.a}</p>
                </details>
              ))}
            </div>

            <div className="mt-10 text-center">
              <p className="text-sm text-ink-600">
                {t(tr.pricingPage.stillQs, language)}{' '}
                <Link to="/support" className="font-semibold text-primary-700 hover:text-primary-800">
                  {t(tr.pricingPage.contactTeam, language)}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function PlanCard({
  plan,
  cycle,
  onChoose,
}: {
  plan: Plan
  cycle: Cycle
  onChoose: (id: string | null) => void
}) {
  const { language } = useLanguage()
  const Icon = plan.icon
  const isContact = plan.id === null
  const price = cycle === 'monthly' ? plan.monthly : plan.yearly
  const priceLabel =
    isContact || price === null
      ? 'Custom'
      : price === 0
      ? '0'
      : cycle === 'monthly'
      ? `${price}`
      : `${price}`
  const periodLabel = isContact || price === null ? '' : cycle === 'monthly' ? (language === 'ar' ? '/ شهر' : '/ month') : (language === 'ar' ? '/ سنة' : '/ year')

  return (
    <Card
      padding="lg"
      variant={plan.highlight ? 'primary' : 'default'}
      className={[
        'relative flex h-full flex-col',
        plan.highlight ? 'ring-2 ring-primary-400' : '',
      ].join(' ')}
    >
      {plan.highlight ? (
        <div className="absolute -top-3 left-6">
          <Badge variant="primary" size="md">
            {language === 'ar' ? 'الأكثر شهرة' : 'Most popular'}
          </Badge>
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <span
          className={[
            'grid h-10 w-10 place-items-center rounded-xl ring-1',
            plan.highlight
              ? 'bg-white/15 text-white ring-white/20'
              : 'bg-primary-50 text-primary-700 ring-primary-100',
          ].join(' ')}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className={`text-base font-bold ${plan.highlight ? 'text-white' : 'text-ink-900'}`}>{plan.name}</div>
          <div className={`text-xs ${plan.highlight ? 'text-white/75' : 'text-ink-500'}`}>{plan.description}</div>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-baseline gap-1">
          {isContact ? (
            <span className={`text-3xl font-extrabold ${plan.highlight ? 'text-white' : 'text-ink-900'}`}>{language === 'ar' ? 'مخصص' : 'Custom'}</span>
          ) : (
            <>
              <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-ink-900'}`}>{priceLabel}</span>
              <span className={`text-sm font-semibold ${plan.highlight ? 'text-white/80' : 'text-ink-600'}`}>{language === 'ar' ? 'ر.ع' : 'OMR'}</span>
            </>
          )}
          {periodLabel ? (
            <span className={`ml-1 text-sm font-medium ${plan.highlight ? 'text-white/70' : 'text-ink-500'}`}>{periodLabel}</span>
          ) : null}
        </div>
        {!isContact && cycle === 'yearly' && plan.monthly ? (
          <p className={`mt-1 text-xs ${plan.highlight ? 'text-white/80' : 'text-emerald-700'}`}>
            ≈ {(plan.yearly! / 12).toFixed(1)} {language === 'ar' ? 'ر.ع / شهر' : 'OMR / month'}
          </p>
        ) : null}
      </div>

      <ul className="mt-6 space-y-2.5 text-sm">
        {plan.features.map((f) => (
          <li key={f} className={`flex items-start gap-2.5 ${plan.highlight ? 'text-white/90' : 'text-ink-700'}`}>
            <span className={`mt-0.5 grid h-4 w-4 flex-none place-items-center rounded-full ${plan.highlight ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-700'}`}>
              <Check className="h-3 w-3" />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7 flex-1" />
      <Button
        variant={plan.highlight ? 'primary' : 'outline'}
        fullWidth
        size="md"
        rightIcon={<ArrowRight className="h-4 w-4" />}
        onClick={() => onChoose(plan.id)}
        className={plan.highlight ? '!bg-white !text-primary-700 hover:!bg-white/90' : ''}
      >
        {plan.cta}
      </Button>
    </Card>
  )
}
