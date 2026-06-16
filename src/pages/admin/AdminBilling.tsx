import { FormEvent, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Tag,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Star,
  Percent,
  DollarSign,
  Check,
  X,
  Calendar,
  Hash,
} from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Modal from '../../components/Modal'
import Toast from '../../components/Toast'
import EmptyState from '../../components/EmptyState'
import Badge from '../../components/Badge'
import PageHeader from '../../components/PageHeader'
import Skeleton from '../../components/Skeleton'
import { adminService } from '../../services/adminService'
import { useLanguage } from '../../context/LanguageContext'
import { tr, t } from '../../i18n/translations'

/* ─────────────────────────── Types ─────────────────────────── */

interface Plan {
  id: string
  name: string
  nameAr?: string | null
  price: number
  period: string
  description?: string | null
  descriptionAr?: string | null
  features: string[]
  popular: boolean
  enabled: boolean
  createdAt: string
}

interface PlanForm {
  name: string
  nameAr: string
  price: string
  period: 'month' | 'year'
  description: string
  descriptionAr: string
  features: string[]
  popular: boolean
  enabled: boolean
}

const emptyPlanForm = (): PlanForm => ({
  name: '',
  nameAr: '',
  price: '',
  period: 'month',
  description: '',
  descriptionAr: '',
  features: [''],
  popular: false,
  enabled: true,
})

interface Discount {
  id: string
  code: string
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  description?: string | null
  validFrom: string
  validTo: string
  maxUses?: number | null
  currentUses: number
  enabled: boolean
  createdAt: string
}

interface DiscountForm {
  code: string
  type: 'PERCENTAGE' | 'FIXED'
  value: string
  description: string
  validFrom: string
  validTo: string
  maxUses: string
  enabled: boolean
}

const toDateInput = (iso: string) => new Date(iso).toISOString().slice(0, 10)
const todayIso = () => new Date().toISOString().slice(0, 10)
const thirtyDaysIso = () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

const emptyDiscountForm = (): DiscountForm => ({
  code: '',
  type: 'PERCENTAGE',
  value: '',
  description: '',
  validFrom: todayIso(),
  validTo: thirtyDaysIso(),
  maxUses: '',
  enabled: true,
})

type TabId = 'plans' | 'discounts'

/* ─────────────────────────── Component ─────────────────────── */

export default function AdminBilling() {
  const { language } = useLanguage()
  const isAr = language === 'ar'
  const [tab, setTab] = useState<TabId>('plans')

  const [toast, setToast] = useState({
    isVisible: false,
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
    title: '',
    message: '',
  })
  const showToast = (title: string, message: string, type: typeof toast.type = 'success') => {
    setToast({ isVisible: true, title, message, type })
    setTimeout(() => setToast((t) => ({ ...t, isVisible: false })), 3500)
  }

  /* ── Plans state ─────────────────────────────────── */
  const [plans, setPlans] = useState<Plan[]>([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [creatingPlan, setCreatingPlan] = useState(false)
  const [planForm, setPlanForm] = useState<PlanForm>(emptyPlanForm())
  const [confirmDeletePlan, setConfirmDeletePlan] = useState<Plan | null>(null)
  const [planSubmitting, setPlanSubmitting] = useState(false)

  /* ── Discounts state ─────────────────────────────── */
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [discountsLoading, setDiscountsLoading] = useState(true)
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null)
  const [creatingDiscount, setCreatingDiscount] = useState(false)
  const [discountForm, setDiscountForm] = useState<DiscountForm>(emptyDiscountForm())
  const [confirmDeleteDiscount, setConfirmDeleteDiscount] = useState<Discount | null>(null)
  const [discountSubmitting, setDiscountSubmitting] = useState(false)

  /* ── Load ─────────────────────────────────────────── */
  const loadPlans = async () => {
    setPlansLoading(true)
    try {
      const data = await adminService.listPlans()
      setPlans(data as Plan[])
    } catch (err: any) {
      showToast('Failed to load plans', err?.message || 'Try again.', 'error')
    } finally {
      setPlansLoading(false)
    }
  }

  const loadDiscounts = async () => {
    setDiscountsLoading(true)
    try {
      const data = await adminService.listDiscounts()
      setDiscounts(data as Discount[])
    } catch (err: any) {
      showToast('Failed to load discounts', err?.message || 'Try again.', 'error')
    } finally {
      setDiscountsLoading(false)
    }
  }

  useEffect(() => {
    void loadPlans()
    void loadDiscounts()
  }, [])

  /* ── Plan handlers ────────────────────────────────── */
  const openCreatePlan = () => {
    setPlanForm(emptyPlanForm())
    setEditingPlan(null)
    setCreatingPlan(true)
  }

  const openEditPlan = (plan: Plan) => {
    setPlanForm({
      name: plan.name,
      nameAr: plan.nameAr || '',
      price: String(plan.price),
      period: plan.period as 'month' | 'year',
      description: plan.description || '',
      descriptionAr: plan.descriptionAr || '',
      features: plan.features.length > 0 ? [...plan.features] : [''],
      popular: plan.popular,
      enabled: plan.enabled,
    })
    setEditingPlan(plan)
    setCreatingPlan(false)
  }

  const handlePlanSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setPlanSubmitting(true)
    try {
      const payload = {
        ...planForm,
        price: parseFloat(planForm.price),
        features: planForm.features.filter((f) => f.trim() !== ''),
      }
      if (editingPlan) {
        await adminService.updatePlan(editingPlan.id, payload)
        showToast('Plan updated', planForm.name, 'success')
        setEditingPlan(null)
      } else {
        await adminService.createPlan(payload)
        showToast('Plan created', planForm.name, 'success')
        setCreatingPlan(false)
      }
      void loadPlans()
    } catch (err: any) {
      showToast('Could not save plan', err?.message || 'Try again.', 'error')
    } finally {
      setPlanSubmitting(false)
    }
  }

  const handleDeletePlan = async () => {
    if (!confirmDeletePlan) return
    setPlanSubmitting(true)
    try {
      await adminService.deletePlan(confirmDeletePlan.id)
      showToast('Plan deleted', confirmDeletePlan.name, 'success')
      setConfirmDeletePlan(null)
      void loadPlans()
    } catch (err: any) {
      showToast('Could not delete plan', err?.message || 'Try again.', 'error')
    } finally {
      setPlanSubmitting(false)
    }
  }

  /* ── Discount handlers ────────────────────────────── */
  const openCreateDiscount = () => {
    setDiscountForm(emptyDiscountForm())
    setEditingDiscount(null)
    setCreatingDiscount(true)
  }

  const openEditDiscount = (d: Discount) => {
    setDiscountForm({
      code: d.code,
      type: d.type,
      value: String(d.value),
      description: d.description || '',
      validFrom: toDateInput(d.validFrom),
      validTo: toDateInput(d.validTo),
      maxUses: d.maxUses != null ? String(d.maxUses) : '',
      enabled: d.enabled,
    })
    setEditingDiscount(d)
    setCreatingDiscount(false)
  }

  const handleDiscountSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setDiscountSubmitting(true)
    try {
      const payload = {
        ...discountForm,
        value: parseFloat(discountForm.value),
        maxUses: discountForm.maxUses ? parseInt(discountForm.maxUses, 10) : null,
      }
      if (editingDiscount) {
        await adminService.updateDiscount(editingDiscount.id, payload)
        showToast('Discount updated', discountForm.code, 'success')
        setEditingDiscount(null)
      } else {
        await adminService.createDiscount(payload)
        showToast('Discount created', discountForm.code, 'success')
        setCreatingDiscount(false)
      }
      void loadDiscounts()
    } catch (err: any) {
      showToast('Could not save discount', err?.message || 'Try again.', 'error')
    } finally {
      setDiscountSubmitting(false)
    }
  }

  const handleDeleteDiscount = async () => {
    if (!confirmDeleteDiscount) return
    setDiscountSubmitting(true)
    try {
      await adminService.deleteDiscount(confirmDeleteDiscount.id)
      showToast('Discount deleted', confirmDeleteDiscount.code, 'success')
      setConfirmDeleteDiscount(null)
      void loadDiscounts()
    } catch (err: any) {
      showToast('Could not delete discount', err?.message || 'Try again.', 'error')
    } finally {
      setDiscountSubmitting(false)
    }
  }

  /* ── Render ───────────────────────────────────────── */
  return (
    <AdminLayout>
      <Toast
        title={toast.title}
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((t) => ({ ...t, isVisible: false }))}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        <PageHeader
          eyebrow="Admin"
          title={t(tr.adminBilling.title, language)}
          description={t(tr.adminBilling.description, language)}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                leftIcon={<RefreshCw className="h-4 w-4" />}
                onClick={() => { void loadPlans(); void loadDiscounts() }}
              >
                {t(tr.common.reload, language)}
              </Button>
              {tab === 'plans' ? (
                <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreatePlan}>
                  {t(tr.adminBilling.newPlan, language)}
                </Button>
              ) : (
                <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateDiscount}>
                  {t(tr.adminBilling.newDiscount, language)}
                </Button>
              )}
            </div>
          }
        />

        {/* Tabs */}
        <div className="flex gap-2">
          {([
            { id: 'plans' as TabId, label: t(tr.adminBilling.tabPlans, language), icon: CreditCard },
            { id: 'discounts' as TabId, label: t(tr.adminBilling.tabDiscounts, language), icon: Tag },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={[
                'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                tab === id
                  ? 'bg-primary-600 text-white shadow-soft'
                  : 'bg-white dark:bg-ink-800 text-ink-700 dark:text-ink-300 ring-1 ring-ink-200 dark:ring-ink-700 hover:bg-ink-50 dark:hover:bg-ink-700',
              ].join(' ')}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Plans tab ───────────────────────────────────── */}
        {tab === 'plans' && (
          <>
            {plansLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : plans.length === 0 ? (
              <EmptyState
                icon={                <CreditCard className="h-8 w-8 text-ink-400 dark:text-ink-500" />}
                title={t(tr.adminBilling.noPlans, language)}
                description={t(tr.adminBilling.noPlansDesc, language)}
                action={
                  <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreatePlan}>
                    {t(tr.adminBilling.newPlan, language)}
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan, idx) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <Card className={`p-5 h-full flex flex-col transition-all duration-300 ${
                      plan.popular
                        ? '!bg-primary-600 !border-primary-700 shadow-lg shadow-primary-200 dark:shadow-none scale-[1.02]'
                        : ''
                    }`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`font-bold text-lg ${
                              plan.popular
                                ? 'text-white'
                                : 'text-ink-900 dark:text-ink-50'
                            }`}>
                              {isAr ? plan.nameAr || plan.name : plan.name}
                            </h3>
                            {plan.popular && (
                              <Badge variant="sunny" icon={<Star className="h-3 w-3" />}>Popular</Badge>
                            )}
                          </div>
                          <p className={`text-2xl font-extrabold mt-1 ${
                            plan.popular
                              ? 'text-white'
                              : 'text-primary-700'
                          }`}>
                            {Number(plan.price).toLocaleString(isAr ? 'ar-OM' : 'en-OM', { style: 'currency', currency: 'OMR' })}
                            <span className={`text-sm font-medium ${
                              plan.popular
                                ? 'text-white/80'
                                : 'text-ink-500 dark:text-ink-400'
                            }`}> / {plan.period}</span>
                          </p>
                          {(isAr ? plan.descriptionAr || plan.description : plan.description) && (
                            <p className={`text-sm mt-1 line-clamp-2 ${
                              plan.popular
                                ? 'text-white/90'
                                : 'text-ink-500 dark:text-ink-400'
                            }`}>
                              {isAr ? plan.descriptionAr || plan.description : plan.description}
                            </p>
                          )}
                        </div>
                        <Badge variant={plan.enabled ? 'success' : 'neutral'} size="sm">
                          {plan.enabled ? t(tr.adminBilling.planActive, language) : t(tr.adminBilling.planDisabled, language)}
                        </Badge>
                      </div>

                      {plan.features.length > 0 && (
                        <ul className="mt-4 space-y-1.5 flex-1">
                          {plan.features.map((f, i) => (
                            <li key={i} className={`flex items-center gap-2 text-sm ${
                              plan.popular
                                ? 'text-white'
                                : 'text-ink-700 dark:text-ink-300'
                            }`}>
                              <Check className={`h-3.5 w-3.5 flex-none ${
                                plan.popular
                                  ? 'text-white'
                                  : 'text-primary-600'
                              }`} />
                              {f}
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className={`mt-4 pt-4 border-t flex items-center justify-between ${
                        plan.popular
                          ? 'border-white/20'
                          : 'border-ink-100 dark:border-ink-700'
                      }`}>
                        <span className={`text-xs ${
                          plan.popular
                            ? 'text-white/70'
                            : 'text-ink-500 dark:text-ink-400'
                        }`}>
                          {isAr ? 'أنشئت في' : 'Created'} {new Date(plan.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant={
                              plan.popular
                                ? 'secondary'
                                : 'ghost'
                            }
                            size="sm"
                            leftIcon={<Edit className="h-4 w-4" />}
                            onClick={() => openEditPlan(plan)}
                          >
                            {t(tr.common.edit, language)}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Trash2 className="h-4 w-4" />}
                            onClick={() => setConfirmDeletePlan(plan)}
                            className={
                              plan.popular
                                ? 'text-white hover:bg-white/10'
                                : 'text-accent-600 hover:text-accent-700'
                            }
                          >
                            {t(tr.common.delete, language)}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Discounts tab ────────────────────────────────── */}
        {tab === 'discounts' && (
          <>
            {discountsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : discounts.length === 0 ? (
              <EmptyState
                icon={                <Tag className="h-8 w-8 text-ink-400 dark:text-ink-500" />}
                title={t(tr.adminBilling.noDiscounts, language)}
                description={t(tr.adminBilling.noDiscountsDesc, language)}
                action={
                  <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateDiscount}>
                    {t(tr.adminBilling.newDiscount, language)}
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {discounts.map((d, idx) => {
                  const isExpired = new Date(d.validTo) < new Date()
                  const usagePercent = d.maxUses ? Math.min(100, Math.round((d.currentUses / d.maxUses) * 100)) : null

                  return (
                    <motion.div
                      key={d.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      <Card className="p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="font-mono text-lg font-bold text-ink-900 dark:text-ink-50">{d.code}</span>
                              <Badge variant={d.type === 'PERCENTAGE' ? 'primary' : 'sky'}>
                                {d.type === 'PERCENTAGE' ? (
                                  <span className="inline-flex items-center gap-0.5">
                                    <Percent className="h-3 w-3" /> {d.value}%
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5">
                                    <DollarSign className="h-3 w-3" /> {d.value} OMR
                                  </span>
                                )}
                              </Badge>
                              <Badge variant={d.enabled && !isExpired ? 'success' : 'neutral'}>
                                {isExpired ? t(tr.adminBilling.discountExpired, language) : d.enabled ? t(tr.adminBilling.planActive, language) : t(tr.adminBilling.planDisabled, language)}
                              </Badge>
                            </div>
                            {d.description && (
                              <p className="text-sm text-ink-600 dark:text-ink-300 mb-2">{d.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500 dark:text-ink-400">
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(d.validFrom).toLocaleDateString()} – {new Date(d.validTo).toLocaleDateString()}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Hash className="h-3.5 w-3.5" />
                                {d.currentUses} used
                                {d.maxUses != null && ` / ${d.maxUses} max`}
                              </span>
                              {usagePercent !== null && (
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-24 rounded-full bg-ink-200 dark:bg-ink-700 overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-primary-500"
                                      style={{ width: `${usagePercent}%` }}
                                    />
                                  </div>
                                  <span>{usagePercent}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<Edit className="h-4 w-4" />}
                              onClick={() => openEditDiscount(d)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<Trash2 className="h-4 w-4" />}
                              onClick={() => setConfirmDeleteDiscount(d)}
                              className="text-accent-600 hover:text-accent-700"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* ── Plan create / edit modal ─────────────────────── */}
      <Modal
        isOpen={creatingPlan || !!editingPlan}
        onClose={() => { setCreatingPlan(false); setEditingPlan(null) }}
        title={editingPlan ? 'Edit plan' : 'New plan'}
        size="md"
      >
        <form onSubmit={handlePlanSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Plan name"
              placeholder="e.g. Pro"
              value={planForm.name}
              onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
              required
            />
            <Input
              label="Plan name (Arabic)"
              placeholder="e.g. برو"
              value={planForm.nameAr}
              onChange={(e) => setPlanForm({ ...planForm, nameAr: e.target.value })}
              dir="rtl"
            />
            <Input
              label="Price (OMR)"
              type="number"
              min="0"
              step="0.01"
              placeholder="9.99"
              value={planForm.price}
              onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
              required
            />
          </div>

          <label className="block">
            <span className="block text-sm font-medium text-ink-800 dark:text-ink-200 mb-1.5">Billing period</span>
            <select
              value={planForm.period}
              onChange={(e) => setPlanForm({ ...planForm, period: e.target.value as 'month' | 'year' })}
              className="field-input"
            >
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Description (optional)"
              placeholder="Short tagline for this plan"
              value={planForm.description}
              onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
            />
            <Input
              label="Description (Arabic)"
              placeholder="Short tagline in Arabic"
              value={planForm.descriptionAr}
              onChange={(e) => setPlanForm({ ...planForm, descriptionAr: e.target.value })}
              dir="rtl"
            />
          </div>

          {/* Features list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-ink-800 dark:text-ink-200">Features</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                leftIcon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => setPlanForm({ ...planForm, features: [...planForm.features, ''] })}
              >
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {planForm.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    className="field-input flex-1"
                    placeholder={`Feature ${i + 1}`}
                    value={f}
                    onChange={(e) => {
                      const next = [...planForm.features]
                      next[i] = e.target.value
                      setPlanForm({ ...planForm, features: next })
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setPlanForm({ ...planForm, features: planForm.features.filter((_, idx) => idx !== i) })}
                    className="rounded-lg p-1.5 text-ink-400 dark:text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-700 hover:text-accent-600 transition-colors"
                    aria-label="Remove feature"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-ink-800 dark:text-ink-200 cursor-pointer">
              <input
                type="checkbox"
                checked={planForm.popular}
                onChange={(e) => setPlanForm({ ...planForm, popular: e.target.checked })}
                className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500"
              />
              <Star className="h-4 w-4 text-sunny-500" /> Mark as popular
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-ink-800 dark:text-ink-200 cursor-pointer">
              <input
                type="checkbox"
                checked={planForm.enabled}
                onChange={(e) => setPlanForm({ ...planForm, enabled: e.target.checked })}
                className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500"
              />
              Plan is active
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setCreatingPlan(false); setEditingPlan(null) }}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={planSubmitting}>
              {editingPlan ? 'Save changes' : 'Create plan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Plan delete confirm ─────────────────────────── */}
      <Modal
        isOpen={!!confirmDeletePlan}
        onClose={() => setConfirmDeletePlan(null)}
        title="Delete plan?"
        description="This action permanently removes the plan."
        size="sm"
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-ink-50 dark:bg-ink-800 ring-1 ring-ink-200 dark:ring-ink-700 p-3 text-sm text-ink-700 dark:text-ink-300 font-semibold">
            {confirmDeletePlan?.name}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmDeletePlan(null)}>Cancel</Button>
            <Button variant="danger" loading={planSubmitting} onClick={handleDeletePlan}>
              Delete plan
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Discount create / edit modal ─────────────────── */}
      <Modal
        isOpen={creatingDiscount || !!editingDiscount}
        onClose={() => { setCreatingDiscount(false); setEditingDiscount(null) }}
        title={editingDiscount ? 'Edit discount' : 'New discount'}
        size="md"
      >
        <form onSubmit={handleDiscountSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Discount code"
              placeholder="e.g. SUMMER30"
              value={discountForm.code}
              onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })}
              required
            />
            <label className="block">
              <span className="block text-sm font-medium text-ink-800 dark:text-ink-200 mb-1.5">Type</span>
              <select
                value={discountForm.type}
                onChange={(e) => setDiscountForm({ ...discountForm, type: e.target.value as 'PERCENTAGE' | 'FIXED' })}
                className="field-input"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed amount (OMR)</option>
              </select>
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label={discountForm.type === 'PERCENTAGE' ? 'Discount (%)' : 'Discount (OMR)'}
              type="number"
              min="0"
              max={discountForm.type === 'PERCENTAGE' ? '100' : undefined}
              step={discountForm.type === 'PERCENTAGE' ? '1' : '0.01'}
              placeholder={discountForm.type === 'PERCENTAGE' ? '20' : '5.00'}
              value={discountForm.value}
              onChange={(e) => setDiscountForm({ ...discountForm, value: e.target.value })}
              required
            />
            <Input
              label="Max uses (blank = unlimited)"
              type="number"
              min="1"
              placeholder="Leave blank for unlimited"
              value={discountForm.maxUses}
              onChange={(e) => setDiscountForm({ ...discountForm, maxUses: e.target.value })}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="block text-sm font-medium text-ink-800 dark:text-ink-200 mb-1.5">Valid from</span>
              <input
                type="date"
                className="field-input"
                value={discountForm.validFrom}
                onChange={(e) => setDiscountForm({ ...discountForm, validFrom: e.target.value })}
                required
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-ink-800 dark:text-ink-200 mb-1.5">Valid to</span>
              <input
                type="date"
                className="field-input"
                value={discountForm.validTo}
                onChange={(e) => setDiscountForm({ ...discountForm, validTo: e.target.value })}
                required
              />
            </label>
          </div>

          <Input
            label="Description (optional)"
            placeholder="Internal note about this code"
            value={discountForm.description}
            onChange={(e) => setDiscountForm({ ...discountForm, description: e.target.value })}
          />

          <label className="inline-flex items-center gap-2 text-sm text-ink-800 dark:text-ink-200 cursor-pointer">
            <input
              type="checkbox"
              checked={discountForm.enabled}
              onChange={(e) => setDiscountForm({ ...discountForm, enabled: e.target.checked })}
              className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500"
            />
            Discount is active
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setCreatingDiscount(false); setEditingDiscount(null) }}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={discountSubmitting}>
              {editingDiscount ? 'Save changes' : 'Create discount'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Discount delete confirm ─────────────────────── */}
      <Modal
        isOpen={!!confirmDeleteDiscount}
        onClose={() => setConfirmDeleteDiscount(null)}
        title="Delete discount?"
        description="This permanently removes the discount code."
        size="sm"
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-ink-50 dark:bg-ink-800 ring-1 ring-ink-200 dark:ring-ink-700 p-3 text-sm font-mono font-bold text-ink-900 dark:text-ink-50">
            {confirmDeleteDiscount?.code}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmDeleteDiscount(null)}>Cancel</Button>
            <Button variant="danger" loading={discountSubmitting} onClick={handleDeleteDiscount}>
              Delete discount
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}
