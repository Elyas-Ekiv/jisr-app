import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, XCircle, CheckCircle2, AlertTriangle, Shield } from 'lucide-react'
import Card from './Card'
import Badge from './Badge'
import Button from './Button'
import { useLanguage } from '../context/LanguageContext'
import { tr, t } from '../i18n/translations'
import type { BillingInfo } from '../services/billingService'

interface Props {
  billing: BillingInfo
  onCancel: () => Promise<void>
  cancelLoading: boolean
}

export default function SubscriptionInfo({ billing, onCancel, cancelLoading }: Props) {
  const { language } = useLanguage()
  const isAr = language === 'ar'
  const [showConfirm, setShowConfirm] = useState(false)
  const plan = billing.currentPlan
  if (!plan) return null

  const fmtDate = (d: string) => new Date(d).toLocaleDateString(isAr ? 'ar-OM' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  const statusColor = plan.status === 'active' ? 'success' : plan.status === 'cancelled' ? 'warning' : 'default'
  const statusLabel = plan.status === 'active' ? t(tr.payment.active, language) : plan.status === 'cancelled' ? t(tr.payment.cancelled, language) : t(tr.payment.expired, language)

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-ink-900 dark:text-ink-50">{t(tr.payment.activeSubscription, language)}</h2>
        <Badge variant={statusColor as any} icon={plan.status === 'active' ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}>{statusLabel}</Badge>
      </div>

      <div className="rounded-2xl bg-primary-50 dark:bg-primary-900/20 p-4 ring-1 ring-primary-100 dark:ring-primary-800">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-ink-900 dark:text-ink-50">{plan.name}</div>
            <div className="text-xs text-ink-500 dark:text-ink-400">{plan.price} OMR / {plan.period === 'month' ? (isAr ? 'شهر' : 'month') : (isAr ? 'سنة' : 'year')}</div>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-400">
            <Shield className="h-5 w-5" />
          </div>
        </div>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="flex items-center gap-2 text-ink-500 dark:text-ink-400"><Calendar className="h-3.5 w-3.5" />{t(tr.payment.startDate, language)}</dt>
          <dd className="font-medium text-ink-900 dark:text-ink-50">{fmtDate(plan.startDate)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="flex items-center gap-2 text-ink-500 dark:text-ink-400"><Calendar className="h-3.5 w-3.5" />{t(tr.payment.endDate, language)}</dt>
          <dd className="font-medium text-ink-900 dark:text-ink-50">{fmtDate(plan.endDate)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="flex items-center gap-2 text-ink-500 dark:text-ink-400"><Clock className="h-3.5 w-3.5" />{t(tr.payment.daysRemaining, language)}</dt>
          <dd className="font-bold text-primary-700 dark:text-primary-400">{plan.daysRemaining} {isAr ? 'يوم' : 'days'}</dd>
        </div>
      </dl>

      {plan.status === 'cancelled' && (
        <div className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 p-3 text-xs text-amber-800 dark:text-amber-300 ring-1 ring-amber-100 dark:ring-amber-800">
          <AlertTriangle className="mr-1.5 inline h-3.5 w-3.5" />
          {t(tr.payment.cancelledNote, language)} {fmtDate(plan.endDate)}
        </div>
      )}

      {plan.status === 'active' && (
        <>
          <AnimatePresence>
            {showConfirm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 rounded-2xl border border-accent-200 dark:border-accent-800 bg-accent-50 dark:bg-accent-900/20 p-4">
                <p className="text-sm font-semibold text-accent-900 dark:text-accent-200">{t(tr.payment.cancelConfirmTitle, language)}</p>
                <p className="mt-1 text-xs text-accent-700 dark:text-accent-400">{t(tr.payment.cancelConfirmMsg, language)}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowConfirm(false)}>{t(tr.payment.cancelKeep, language)}</Button>
                  <Button size="sm" variant="primary" loading={cancelLoading} onClick={onCancel} className="!bg-accent-600 hover:!bg-accent-700">{t(tr.payment.cancelConfirmBtn, language)}</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!showConfirm && (
            <button type="button" onClick={() => setShowConfirm(true)} className="mt-4 flex items-center gap-1.5 text-xs font-medium text-accent-600 dark:text-accent-400 hover:text-accent-700 transition-colors">
              <XCircle className="h-3.5 w-3.5" />{t(tr.payment.cancelSubscription, language)}
            </button>
          )}
        </>
      )}
    </Card>
  )
}
