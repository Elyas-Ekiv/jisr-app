import { FormEvent, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Save,
  Palette,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Type,
  Plus,
  Trash2,
  Wrench,
  RefreshCw,
  MessageSquare,
} from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Toast from '../../components/Toast'
import Badge from '../../components/Badge'
import PageHeader from '../../components/PageHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import { adminService, SiteSettings, SiteFeature, SiteReview } from '../../services/adminService'
import { useLanguage } from '../../context/LanguageContext'
import { tr, t } from '../../i18n/translations'

type TabId = 'branding' | 'hero' | 'features' | 'reviews' | 'contact' | 'flags'

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'hero', label: 'Hero', icon: Sparkles },
  { id: 'features', label: 'Features', icon: Type },
  { id: 'reviews', label: 'Reviews', icon: MessageSquare },
  { id: 'contact', label: 'Contact', icon: Mail },
  { id: 'flags', label: 'Site flags', icon: Wrench },
]

const emptyFeature = (): SiteFeature => ({
  icon: '✨',
  title: 'New feature',
  titleAr: '',
  description: 'Describe what makes this special',
  descriptionAr: '',
})

const emptyReview = (): SiteReview => ({
  name: 'New reviewer',
  nameAr: '',
  role: 'Parent',
  roleAr: '',
  quote: 'Jisr has been wonderful for our family.',
  quoteAr: '',
})

export default function AdminSettings() {
  const { language } = useLanguage()
  const isAr = language === 'ar'
  const [active, setActive] = useState<TabId>('branding')
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState({
    isVisible: false,
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
    title: '',
    message: '',
  })

  useEffect(() => {
    void loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminService.getSettings()
      setSettings(data)
    } catch (err: any) {
      setError(err?.message || 'Could not load site settings')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'success'
  ) => {
    setToast({ isVisible: true, title, message, type })
    setTimeout(() => setToast((t) => ({ ...t, isVisible: false })), 3500)
  }

  const handleSave = async (e?: FormEvent) => {
    e?.preventDefault()
    if (!settings) return
    setSaving(true)
    try {
      const next = await adminService.updateSettings(settings)
      setSettings(next)
      showToast('Saved', 'Site settings updated successfully.', 'success')
    } catch (err: any) {
      showToast('Save failed', err?.message || 'Unable to save settings.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const update = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings((s) => (s ? { ...s, [key]: value } : s))
  }

  const Header = useMemo(
    () => (
      <PageHeader
        eyebrow="Admin"
        title={t(tr.adminSettings.title, language)}
        description={t(tr.adminSettings.description, language)}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={loadSettings} disabled={loading || saving}>
              {t(tr.common.reload, language)}
            </Button>
            <Button variant="primary" leftIcon={<Save className="h-4 w-4" />} loading={saving} onClick={() => handleSave()}>
              {t(tr.common.save, language)}
            </Button>
          </div>
        }
      />
    ),
    [saving, loading, language]
  )

  return (
    <AdminLayout>
      <Toast
        title={toast.title}
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((t) => ({ ...t, isVisible: false }))}
      />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
        {Header}

        {loading ? (
          <Card className="p-12 text-center">
            <LoadingSpinner label={t(tr.adminSettings.loadingSettings, language)} />
          </Card>
        ) : error ? (
          <Card className="p-8 text-center">
            <p className="text-ink-700 dark:text-ink-300">{error}</p>
            <Button variant="primary" onClick={loadSettings} className="mt-4">
              {t(tr.common.reload, language)}
            </Button>
          </Card>
        ) : settings ? (
          <>
            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'branding', label: t(tr.adminSettings.tabBranding, language), icon: Palette },
                { id: 'hero', label: t(tr.adminSettings.tabHero, language), icon: Sparkles },
                { id: 'features', label: t(tr.adminSettings.tabFeatures, language), icon: Type },
                { id: 'reviews', label: t(tr.adminSettings.tabReviews, language), icon: MessageSquare },
                { id: 'contact', label: t(tr.adminSettings.tabContact, language), icon: Mail },
                { id: 'flags', label: t(tr.adminSettings.tabSiteFlags, language), icon: Wrench },
              ].map((tab) => {
                const Icon = tab.icon
                const isActive = active === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActive(tab.id as TabId)}
                    className={[
                      'inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-600 text-white shadow-soft'
                        : 'bg-white dark:bg-ink-800 text-ink-700 dark:text-ink-300 ring-1 ring-ink-200 dark:ring-ink-700 hover:bg-ink-50 dark:hover:bg-ink-700',
                    ].join(' ')}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {active === 'branding' && (
                <Card className="p-6 space-y-5">
                  <SectionHeader title={t(tr.adminSettings.tabBranding, language)} subtitle={t(tr.adminSettings.brandingDesc, language)} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Site name"
                      value={settings.branding.siteName}
                      onChange={(e) =>
                        update('branding', { ...settings.branding, siteName: e.target.value })
                      }
                    />
                    <Input
                      label="Site name (Arabic)"
                      value={settings.branding.siteNameAr || ''}
                      onChange={(e) =>
                        update('branding', { ...settings.branding, siteNameAr: e.target.value })
                      }
                      dir="rtl"
                    />
                    <Input
                      label="Tagline"
                      value={settings.branding.tagline}
                      onChange={(e) =>
                        update('branding', { ...settings.branding, tagline: e.target.value })
                      }
                    />
                    <Input
                      label="Tagline (Arabic)"
                      value={settings.branding.taglineAr || ''}
                      onChange={(e) =>
                        update('branding', { ...settings.branding, taglineAr: e.target.value })
                      }
                      dir="rtl"
                    />
                    <Input
                      label="Logo URL"
                      placeholder="https://…/logo.svg"
                      value={settings.branding.logoUrl || ''}
                      onChange={(e) =>
                        update('branding', { ...settings.branding, logoUrl: e.target.value })
                      }
                    />
                    <div />
                  </div>
                </Card>
              )}

              {active === 'hero' && (
                <Card className="p-6 space-y-5">
                  <SectionHeader title={t(tr.adminSettings.tabHero, language)} subtitle={t(tr.adminSettings.heroDesc, language)} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Eyebrow"
                      value={settings.hero.eyebrow}
                      onChange={(e) => update('hero', { ...settings.hero, eyebrow: e.target.value })}
                    />
                    <Input
                      label="Eyebrow (Arabic)"
                      value={settings.hero.eyebrowAr || ''}
                      onChange={(e) => update('hero', { ...settings.hero, eyebrowAr: e.target.value })}
                      dir="rtl"
                    />
                    <Input
                      label="Title"
                      value={settings.hero.title}
                      onChange={(e) => update('hero', { ...settings.hero, title: e.target.value })}
                    />
                    <Input
                      label="Title (Arabic)"
                      value={settings.hero.titleAr || ''}
                      onChange={(e) => update('hero', { ...settings.hero, titleAr: e.target.value })}
                      dir="rtl"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextArea
                      label="Subtitle"
                      value={settings.hero.subtitle}
                      onChange={(v) => update('hero', { ...settings.hero, subtitle: v })}
                    />
                    <TextArea
                      label="Subtitle (Arabic)"
                      value={settings.hero.subtitleAr || ''}
                      onChange={(v) => update('hero', { ...settings.hero, subtitleAr: v })}
                      dir="rtl"
                    />
                  </div>
                  <Input
                    label="Hero background image URL"
                    placeholder="https://…/hero.jpg — optional overlay on the gradient"
                    value={settings.hero.backgroundImageUrl ?? ''}
                    onChange={(e) =>
                      update('hero', { ...settings.hero, backgroundImageUrl: e.target.value })
                    }
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Primary CTA label"
                      value={settings.hero.primaryCtaLabel}
                      onChange={(e) =>
                        update('hero', { ...settings.hero, primaryCtaLabel: e.target.value })
                      }
                    />
                    <Input
                      label="Primary CTA label (Arabic)"
                      value={settings.hero.primaryCtaLabelAr || ''}
                      onChange={(e) =>
                        update('hero', { ...settings.hero, primaryCtaLabelAr: e.target.value })
                      }
                      dir="rtl"
                    />
                    <Input
                      label="Primary CTA link"
                      value={settings.hero.primaryCtaHref}
                      onChange={(e) =>
                        update('hero', { ...settings.hero, primaryCtaHref: e.target.value })
                      }
                    />
                    <div />
                    <Input
                      label="Secondary CTA label"
                      value={settings.hero.secondaryCtaLabel}
                      onChange={(e) =>
                        update('hero', { ...settings.hero, secondaryCtaLabel: e.target.value })
                      }
                    />
                    <Input
                      label="Secondary CTA label (Arabic)"
                      value={settings.hero.secondaryCtaLabelAr || ''}
                      onChange={(e) =>
                        update('hero', { ...settings.hero, secondaryCtaLabelAr: e.target.value })
                      }
                      dir="rtl"
                    />
                    <Input
                      label="Secondary CTA link"
                      value={settings.hero.secondaryCtaHref}
                      onChange={(e) =>
                        update('hero', { ...settings.hero, secondaryCtaHref: e.target.value })
                      }
                    />
                  </div>
                </Card>
              )}

              {active === 'features' && (
                <Card className="p-6 space-y-5">
                  <SectionHeader
                    title={t(tr.adminSettings.tabFeatures, language)}
                    subtitle={t(tr.adminSettings.featuresDesc, language)}
                    action={
                      <Button
                        type="button"
                        variant="secondary"
                        leftIcon={<Plus className="h-4 w-4" />}
                        onClick={() =>
                          update('features', [...settings.features, emptyFeature()])
                        }
                      >
                        Add feature
                      </Button>
                    }
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    {settings.features.map((f, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl ring-1 ring-ink-200 dark:ring-ink-700 bg-white dark:bg-ink-800 p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="primary">Feature {idx + 1}</Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            leftIcon={<Trash2 className="h-4 w-4" />}
                            onClick={() =>
                              update(
                                'features',
                                settings.features.filter((_, i) => i !== idx)
                              )
                            }
                          >
                            Remove
                          </Button>
                        </div>
                        <Input
                          label="Icon (emoji)"
                          maxLength={4}
                          value={f.icon}
                          onChange={(e) =>
                            update(
                              'features',
                              settings.features.map((it, i) =>
                                i === idx ? { ...it, icon: e.target.value } : it
                              )
                            )
                          }
                        />
                        <div className="grid gap-3 md:grid-cols-2">
                          <Input
                            label="Title"
                            value={f.title}
                            onChange={(e) =>
                              update(
                                'features',
                                settings.features.map((it, i) =>
                                  i === idx ? { ...it, title: e.target.value } : it
                                )
                              )
                            }
                          />
                          <Input
                            label="Title (Arabic)"
                            value={f.titleAr || ''}
                            onChange={(e) =>
                              update(
                                'features',
                                settings.features.map((it, i) =>
                                  i === idx ? { ...it, titleAr: e.target.value } : it
                                )
                              )
                            }
                            dir="rtl"
                          />
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <TextArea
                            label="Description"
                            value={f.description}
                            onChange={(v) =>
                              update(
                                'features',
                                settings.features.map((it, i) =>
                                  i === idx ? { ...it, description: v } : it
                                )
                              )
                            }
                          />
                          <TextArea
                            label="Description (Arabic)"
                            value={f.descriptionAr || ''}
                            onChange={(v) =>
                              update(
                                'features',
                                settings.features.map((it, i) =>
                                  i === idx ? { ...it, descriptionAr: v } : it
                                )
                              )
                            }
                            dir="rtl"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {active === 'reviews' && (
                <ReviewsPanel showToast={showToast} />
              )}

              {active === 'contact' && (
                <Card className="p-6 space-y-5">
                  <SectionHeader title={t(tr.adminSettings.tabContact, language)} subtitle={t(tr.adminSettings.contactDesc, language)} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      leftIcon={<Mail className="h-4 w-4 text-ink-400" />}
                      label="Email"
                      type="email"
                      value={settings.contact.email}
                      onChange={(e) =>
                        update('contact', { ...settings.contact, email: e.target.value })
                      }
                    />
                    <Input
                      leftIcon={<Phone className="h-4 w-4 text-ink-400" />}
                      label="Phone"
                      value={settings.contact.phone}
                      onChange={(e) =>
                        update('contact', { ...settings.contact, phone: e.target.value })
                      }
                    />
                    <Input
                      leftIcon={<MapPin className="h-4 w-4 text-ink-400" />}
                      label="Address"
                      className="md:col-span-2"
                      value={settings.contact.address}
                      onChange={(e) =>
                        update('contact', { ...settings.contact, address: e.target.value })
                      }
                    />
                    <Input
                      label="Twitter / X"
                      value={settings.contact.twitter || ''}
                      onChange={(e) =>
                        update('contact', { ...settings.contact, twitter: e.target.value })
                      }
                    />
                    <Input
                      label="Instagram"
                      value={settings.contact.instagram || ''}
                      onChange={(e) =>
                        update('contact', { ...settings.contact, instagram: e.target.value })
                      }
                    />
                    <Input
                      label="Facebook"
                      value={settings.contact.facebook || ''}
                      onChange={(e) =>
                        update('contact', { ...settings.contact, facebook: e.target.value })
                      }
                    />
                    <Input
                      label="LinkedIn"
                      value={settings.contact.linkedin || ''}
                      onChange={(e) =>
                        update('contact', { ...settings.contact, linkedin: e.target.value })
                      }
                    />
                  </div>
                </Card>
              )}

              {active === 'flags' && (
                <Card className="p-6 space-y-5">
                  <SectionHeader
                    title={t(tr.adminSettings.tabSiteFlags, language)}
                    subtitle={t(tr.adminSettings.flagsDesc, language)}
                  />
                  <Toggle
                    label="Maintenance mode"
                    help="When enabled, visitors see maintenance except admins and child login."
                    checked={settings.flags.maintenanceMode}
                    onChange={(v) =>
                      update('flags', { ...settings.flags, maintenanceMode: v })
                    }
                  />
                </Card>
              )}

              {active !== 'reviews' && (
                <div className="flex justify-end">
                  <Button type="submit" variant="primary" loading={saving} leftIcon={<Save className="h-4 w-4" />}>
                    Save changes
                  </Button>
                </div>
              )}
            </form>
          </>
        ) : null}
      </motion.div>
    </AdminLayout>
  )
}

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-ink-900 dark:text-ink-50">{title}</h2>
        {subtitle && <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

function TextArea({
  label,
  value,
  onChange,
  dir,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  dir?: 'ltr' | 'rtl' | 'auto'
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink-800 dark:text-ink-200 mb-1.5">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        dir={dir}
        className="field-input"
      />
    </label>
  )
}

function Toggle({
  label,
  help,
  checked,
  onChange,
}: {
  label: string
  help?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-start gap-3 rounded-2xl ring-1 ring-ink-200 dark:ring-ink-700 bg-white dark:bg-ink-800 p-4 cursor-pointer hover:bg-ink-50/40 dark:hover:bg-ink-700/40 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
      />
      <div>
        <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">{label}</div>
        {help && <div className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{help}</div>}
      </div>
    </label>
  )
}

function ReviewsPanel({
  showToast,
}: {
  showToast: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void
}) {
  const { language } = useLanguage()
  const [reviews, setReviews] = useState<SiteReview[]>([])
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [addingNew, setAddingNew] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, { name: string; nameAr: string; role: string; roleAr: string; quote: string; quoteAr: string }>>({})

  const loadReviews = async () => {
    setLoadingReviews(true)
    try {
      const data = await adminService.listReviews()
      setReviews(data)
      const init: Record<string, { name: string; nameAr: string; role: string; roleAr: string; quote: string; quoteAr: string }> = {}
      data.forEach((r) => { if (r.id) init[r.id] = { name: r.name, nameAr: r.nameAr || '', role: r.role, roleAr: r.roleAr || '', quote: r.quote, quoteAr: r.quoteAr || '' } })
      setDrafts(init)
    } catch (err: any) {
      showToast('Failed to load reviews', err?.message || 'Try again.', 'error')
    } finally {
      setLoadingReviews(false)
    }
  }

  useEffect(() => { void loadReviews() }, [])

  const handleAdd = async () => {
    setAddingNew(true)
    try {
      const created = await adminService.createReview(emptyReview())
      setReviews((rs) => [...rs, created])
      if (created.id) setDrafts((d) => ({ ...d, [created.id!]: { name: created.name, nameAr: created.nameAr || '', role: created.role, roleAr: created.roleAr || '', quote: created.quote, quoteAr: created.quoteAr || '' } }))
      showToast('Review added', 'Edit the fields and click Save.', 'success')
    } catch (err: any) {
      showToast('Could not add review', err?.message || 'Try again.', 'error')
    } finally {
      setAddingNew(false)
    }
  }

  const handleSaveReview = async (id: string) => {
    setSavingId(id)
    try {
      const payload = drafts[id]
      const updated = await adminService.updateReview(id, payload)
      setReviews((rs) => rs.map((r) => r.id === id ? { ...r, ...updated } : r))
      showToast('Review saved', 'Changes updated successfully.', 'success')
    } catch (err: any) {
      showToast('Could not save review', err?.message || 'Try again.', 'error')
    } finally {
      setSavingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await adminService.deleteReview(id)
      setReviews((rs) => rs.filter((r) => r.id !== id))
      setDrafts((d) => { const next = { ...d }; delete next[id]; return next })
      showToast('Review deleted', 'Review removed.', 'success')
    } catch (err: any) {
      showToast('Could not delete review', err?.message || 'Try again.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const setDraft = (id: string, field: 'name' | 'nameAr' | 'role' | 'roleAr' | 'quote' | 'quoteAr', value: string) => {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], [field]: value } }))
  }

  if (loadingReviews) {
    return (
      <Card className="p-8 text-center">
        <LoadingSpinner label="Loading reviews…" />
      </Card>
    )
  }

  return (
    <Card className="p-6 space-y-5">
      <SectionHeader
        title={t(tr.adminSettings.customerReviews, language)}
        subtitle={t(tr.adminSettings.reviewsDesc, language)}
        action={
          <Button
            type="button"
            variant="secondary"
            leftIcon={<Plus className="h-4 w-4" />}
            loading={addingNew}
            onClick={() => void handleAdd()}
          >
            {t(tr.adminSettings.addReview, language)}
          </Button>
        }
      />
      {reviews.length === 0 ? (
        <p className="text-sm text-ink-500 dark:text-ink-400 text-center py-6">
          {t(tr.adminSettings.noReviews, language)}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((r, idx) => {
            const id = r.id!
            const draft = drafts[id] ?? { name: r.name, nameAr: r.nameAr || '', role: r.role, roleAr: r.roleAr || '', quote: r.quote, quoteAr: r.quoteAr || '' }
            return (
              <div
                key={id}
                className="rounded-2xl ring-1 ring-ink-200 dark:ring-ink-700 bg-white dark:bg-ink-800 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="primary">Review {idx + 1}</Badge>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      leftIcon={<Save className="h-4 w-4" />}
                      loading={savingId === id}
                      onClick={() => void handleSaveReview(id)}
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      leftIcon={<Trash2 className="h-4 w-4" />}
                      loading={deletingId === id}
                      onClick={() => void handleDelete(id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              <div className="grid gap-3">
                  <Input
                    label="Name"
                    value={draft.name}
                    onChange={(e) => setDraft(id, 'name', e.target.value)}
                  />
                  <Input
                    label="Role / title"
                    value={draft.role}
                    onChange={(e) => setDraft(id, 'role', e.target.value)}
                  />
                </div>
                <div className="grid gap-3">
                  <TextArea
                    label="Quote"
                    value={draft.quote}
                    onChange={(v) => setDraft(id, 'quote', v)}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
