import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Image,
  Upload,
  Search,
  Trash2,
  RefreshCw,
  Tag,
  ToggleLeft,
  ToggleRight,
  Pencil,
  X,
  Check,
} from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Modal from '../../components/Modal'
import Toast from '../../components/Toast'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import Skeleton from '../../components/Skeleton'
import Badge from '../../components/Badge'
import { adminService, MediaAsset, MEDIA_CATEGORIES } from '../../services/adminService'
import { useLanguage } from '../../context/LanguageContext'
import { tr, t } from '../../i18n/translations'

type CategoryFilter = 'all' | typeof MEDIA_CATEGORIES[number]

export default function AdminMedia() {
  const { language } = useLanguage()
  const isAr = language === 'ar'
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<MediaAsset | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<MediaAsset | null>(null)
  const [preview, setPreview] = useState<MediaAsset | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [toast, setToast] = useState({
    isVisible: false,
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
    title: '',
    message: '',
  })

  const showToast = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'success'
  ) => {
    setToast({ isVisible: true, title, message, type })
    setTimeout(() => setToast((t) => ({ ...t, isVisible: false })), 3500)
  }

  const load = async () => {
    setLoading(true)
    try {
      const data = await adminService.listMedia({
        search: search || undefined,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
      })
      setAssets(data)
    } catch (err: any) {
      showToast('Failed to load media', err?.message || 'Try again later.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter])

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    let ok = 0
    let fail = 0
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('category', categoryFilter === 'all' ? 'general' : categoryFilter)
      try {
        const asset = await adminService.uploadMedia(fd)
        setAssets((prev) => [asset, ...prev])
        ok++
      } catch {
        fail++
      }
    }
    setUploading(false)
    if (ok > 0) showToast('Upload complete', `${ok} file${ok > 1 ? 's' : ''} uploaded.`, 'success')
    if (fail > 0) showToast('Some uploads failed', `${fail} file${fail > 1 ? 's' : ''} could not be uploaded.`, 'error')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleToggleActive = async (asset: MediaAsset) => {
    setSubmitting(true)
    try {
      const updated = await adminService.updateMedia(asset.id, { active: !asset.active })
      setAssets((prev) => prev.map((a) => (a.id === asset.id ? { ...a, ...updated } : a)))
    } catch (err: any) {
      showToast('Update failed', err?.message || 'Try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setSubmitting(true)
    try {
      await adminService.deleteMedia(confirmDelete.id)
      setAssets((prev) => prev.filter((a) => a.id !== confirmDelete.id))
      setConfirmDelete(null)
      showToast('Asset deleted', `${confirmDelete.originalName} was removed.`, 'success')
    } catch (err: any) {
      showToast('Delete failed', err?.message || 'Try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const activeCount = assets.filter((a) => a.active).length

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
          title={t(tr.adminMedia.title, language)}
          description={t(tr.adminMedia.description, language)}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="ghost" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={load}>
                {t(tr.common.reload, language)}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={(e) => void handleUpload(e.target.files)}
              />
              <Button
                variant="primary"
                leftIcon={<Upload className="h-4 w-4" />}
                loading={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {t(tr.adminMedia.upload, language)}
              </Button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label={t(tr.adminMedia.totalAssets, language)} value={assets.length} />
          <StatCard label={t(tr.adminMedia.active, language)} value={activeCount} />
          <StatCard label={t(tr.adminMedia.hidden, language)} value={assets.length - activeCount} />
          <StatCard label={t(tr.adminMedia.categories, language)} value={new Set(assets.map((a) => a.category)).size} />
        </div>

        {/* Filters */}
        <Card className="p-4">
          <form
            className="flex flex-col gap-3 md:flex-row md:items-center"
            onSubmit={(e) => { e.preventDefault(); void load() }}
          >
            <Input
              className="flex-1"
              leftIcon={<Search className="h-4 w-4 text-ink-400 dark:text-ink-500" />}
              placeholder="Search by name or tag…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={[
                  'rounded-xl px-3.5 py-2 text-sm font-medium transition-colors',
                  categoryFilter === 'all'
                    ? 'bg-primary-600 text-white shadow-soft'
                    : 'bg-white dark:bg-ink-800 text-ink-700 dark:text-ink-300 ring-1 ring-ink-200 dark:ring-ink-700 hover:bg-ink-50 dark:hover:bg-ink-700',
                ].join(' ')}
              >
                {t(tr.adminMedia.catAll, language)}
              </button>
              {MEDIA_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={[
                    'rounded-xl px-3.5 py-2 text-sm font-medium capitalize transition-colors',
                    categoryFilter === cat
                    ? 'bg-primary-600 text-white shadow-soft'
                    : 'bg-white dark:bg-ink-800 text-ink-700 dark:text-ink-300 ring-1 ring-ink-200 dark:ring-ink-700 hover:bg-ink-50 dark:hover:bg-ink-700',
                  ].join(' ')}
                >
                  {cat === 'general' ? t(tr.adminMedia.catGeneral, language) :
                   cat === 'symbols' ? t(tr.adminMedia.catSymbols, language) :
                   cat === 'photos' ? t(tr.adminMedia.catPhotos, language) :
                   cat === 'icons' ? t(tr.adminMedia.catIcons, language) :
                   cat === 'gifs' ? t(tr.adminMedia.catGifs, language) :
                   cat}
                </button>
              ))}
            </div>
            <Button type="submit" variant="secondary">Search</Button>
          </form>
        </Card>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-52" />)}
          </div>
        ) : assets.length === 0 ? (
          <EmptyState
            icon={<Image className="h-8 w-8 text-ink-400 dark:text-ink-500" />}
            title="No media assets"
            description="Upload images or GIFs to build the shared media library."
            action={
              <Button variant="primary" leftIcon={<Upload className="h-4 w-4" />} onClick={() => fileInputRef.current?.click()}>
                Upload images
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {assets.map((asset, idx) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Card className={`overflow-hidden flex flex-col ${!asset.active ? 'opacity-60' : ''}`}>
                  <button
                    type="button"
                    className="relative block w-full overflow-hidden bg-ink-100 dark:bg-ink-700"
                    style={{ paddingBottom: '66%' }}
                    onClick={() => setPreview(asset)}
                  >
                    <img
                      src={asset.url}
                      alt={asset.originalName}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        const t = e.currentTarget
                        t.style.display = 'none'
                        const parent = t.parentElement
                        if (parent && !parent.querySelector('.img-fallback')) {
                          const fb = document.createElement('div')
                          fb.className = 'img-fallback absolute inset-0 flex flex-col items-center justify-center gap-1 text-ink-400 dark:text-ink-500'
                          fb.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg><span style="font-size:10px">No preview</span>'
                          parent.appendChild(fb)
                        }
                      }}
                    />
                    {!asset.active && (
                      <span className="absolute inset-0 flex items-center justify-center bg-ink-900/40">
                        <span className="rounded-full bg-ink-900/70 px-2 py-0.5 text-xs font-semibold text-white">Hidden</span>
                      </span>
                    )}
                  </button>

                  <div className="flex flex-col flex-1 p-3 gap-2">
                    <p className="text-xs font-medium text-ink-900 dark:text-ink-50 truncate">{asset.originalName}</p>

                    <div className="flex items-center gap-1 flex-wrap">
                      <Badge variant="primary" size="sm" className="capitalize">{asset.category}</Badge>
                      {asset.tags.slice(0, 2).map((t) => (
                        <span key={t} className="inline-flex items-center gap-0.5 rounded-full bg-ink-100 dark:bg-ink-700 px-1.5 py-0.5 text-[10px] text-ink-600 dark:text-ink-300">
                          <Tag className="h-2.5 w-2.5" />{t}
                        </span>
                      ))}
                      {asset.tags.length > 2 && (
                        <span className="text-[10px] text-ink-400 dark:text-ink-500">+{asset.tags.length - 2}</span>
                      )}
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-1">
                      <span className="text-[10px] text-ink-400 dark:text-ink-500">{formatBytes(asset.size)}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title={asset.active ? 'Hide from users' : 'Show to users'}
                          disabled={submitting}
                          onClick={() => void handleToggleActive(asset)}
                          className="rounded-lg p-1 text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors"
                        >
                          {asset.active
                            ? <ToggleRight className="h-4 w-4 text-emerald-600" />
                            : <ToggleLeft className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => setEditing(asset)}
                          className="rounded-lg p-1 text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          onClick={() => setConfirmDelete(asset)}
                          className="rounded-lg p-1 text-accent-500 hover:bg-accent-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Edit modal */}
      <EditModal
        asset={editing}
        submitting={submitting}
        onClose={() => setEditing(null)}
        onSave={async (payload) => {
          if (!editing) return
          setSubmitting(true)
          try {
            const updated = await adminService.updateMedia(editing.id, payload)
            setAssets((prev) => prev.map((a) => (a.id === editing.id ? { ...a, ...updated } : a)))
            setEditing(null)
            showToast('Asset updated', 'Changes saved.', 'success')
          } catch (err: any) {
            showToast('Update failed', err?.message || 'Try again.', 'error')
          } finally {
            setSubmitting(false)
          }
        }}
      />

      {/* Delete confirm */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete asset?" size="sm">
        <div className="space-y-4">
          {confirmDelete && (
            <div className="rounded-xl overflow-hidden">
              <img src={confirmDelete.url} alt={confirmDelete.originalName} className="w-full h-32 object-cover" />
              <div className="bg-ink-50 dark:bg-ink-800 p-3 text-sm">
                <div className="font-semibold text-ink-900 dark:text-ink-50">{confirmDelete.originalName}</div>
                <div className="text-ink-500 dark:text-ink-400">{formatBytes(confirmDelete.size)}</div>
              </div>
            </div>
          )}
          <p className="text-sm text-ink-600 dark:text-ink-300">This will permanently remove the file from the server.</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="danger" loading={submitting} onClick={() => void handleDelete()}>Delete</Button>
          </div>
        </div>
      </Modal>

      {/* Preview lightbox */}
      <Modal isOpen={!!preview} onClose={() => setPreview(null)} title={preview?.originalName ?? ''} size="lg">
        {preview && (
          <div className="space-y-3">
            <img src={preview.url} alt={preview.originalName} className="w-full rounded-xl object-contain max-h-[60vh]" />
            <div className="grid grid-cols-2 gap-2 text-sm text-ink-700 dark:text-ink-300">
              <div><span className="font-semibold">Category:</span> {preview.category}</div>
              <div><span className="font-semibold">Size:</span> {formatBytes(preview.size)}</div>
              <div><span className="font-semibold">Type:</span> {preview.mimeType}</div>
              <div><span className="font-semibold">Status:</span> {preview.active ? 'Active' : 'Hidden'}</div>
            </div>
            {preview.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {preview.tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-0.5 rounded-full bg-ink-100 dark:bg-ink-700 px-2 py-0.5 text-xs text-ink-600 dark:text-ink-300">
                    <Tag className="h-3 w-3" />{t}
                  </span>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="danger"
                onClick={() => {
                  setPreview(null)
                  setConfirmDelete(preview)
                }}
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                Delete image
              </Button>
              <Button variant="ghost" onClick={() => setPreview(null)} leftIcon={<X className="h-4 w-4" />}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  )
}

/* ─── Sub-components ──────────────────────────────────────────────────────── */

function StatCard({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <Card className="p-4 !bg-primary-500 !border-primary-600">
      <p className="text-xs uppercase tracking-wide text-white/70">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </Card>
  )
}


function EditModal({
  asset,
  submitting,
  onClose,
  onSave,
}: {
  asset: MediaAsset | null
  submitting: boolean
  onClose: () => void
  onSave: (payload: { category: string; tags: string[]; active: boolean; originalName: string }) => Promise<void>
}) {
  const [form, setForm] = useState({ category: 'general', tagsInput: '', active: true, originalName: '' })

  useEffect(() => {
    if (asset) {
      setForm({
        category: asset.category,
        tagsInput: asset.tags.join(', '),
        active: asset.active,
        originalName: asset.originalName,
      })
    }
  }, [asset])

  return (
    <Modal isOpen={!!asset} onClose={onClose} title="Edit asset" size="sm">
      {asset && (
        <div className="space-y-4">
          <img src={asset.url} alt={asset.originalName} className="w-full h-32 rounded-xl object-cover" />
          <Input
            label="Display name"
            value={form.originalName}
            onChange={(e) => setForm({ ...form, originalName: e.target.value })}
          />
          <label className="block">
            <span className="block text-sm font-medium text-ink-800 dark:text-ink-200 mb-1.5">Category</span>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="field-input"
            >
              {MEDIA_CATEGORIES.map((c) => (
                <option key={c} value={c} className="capitalize">{c}</option>
              ))}
            </select>
          </label>
          <Input
            label="Tags (comma-separated)"
            placeholder="e.g. happy, greeting, school"
            value={form.tagsInput}
            onChange={(e) => setForm({ ...form, tagsInput: e.target.value })}
            leftIcon={<Tag className="h-4 w-4 text-ink-400 dark:text-ink-500" />}
          />
          <label className="flex items-center gap-2 text-sm text-ink-700 dark:text-ink-300 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500"
            />
            <span>Visible to users</span>
            {form.active
              ? <Check className="h-3.5 w-3.5 text-emerald-600" />
              : <X className="h-3.5 w-3.5 text-accent-500" />}
          </label>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button
              variant="primary"
              loading={submitting}
              onClick={() =>
                void onSave({
                  category: form.category,
                  tags: form.tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
                  active: form.active,
                  originalName: form.originalName,
                })
              }
            >
              Save changes
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
