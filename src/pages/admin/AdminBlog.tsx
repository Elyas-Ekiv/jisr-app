import { FormEvent, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Search,
  Save,
  Star,
  Home,
  RefreshCw,
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
import { adminService, BlogPost, BlogStatus } from '../../services/adminService'
import { useLanguage } from '../../context/LanguageContext'
import { tr, t } from '../../i18n/translations'

const CATEGORIES = ['Guide', 'Story', 'Update', 'Tips', 'News', 'Research']
const STATUSES: { value: 'all' | BlogStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'DRAFT', label: 'Drafts' },
  { value: 'ARCHIVED', label: 'Archived' },
]

interface PostForm {
  title: string
  titleAr?: string | null
  excerpt: string
  excerptAr?: string | null
  content: string
  contentAr?: string | null
  category: string
  status: BlogStatus
  featured: boolean
  showOnHomepage: boolean
  emoji: string
  coverImageUrl: string
  authorName: string
}

const emptyForm = (): PostForm => ({
  title: '',
  titleAr: '',
  excerpt: '',
  excerptAr: '',
  content: '',
  contentAr: '',
  category: 'Guide',
  status: 'DRAFT',
  featured: false,
  showOnHomepage: false,
  emoji: '📝',
  coverImageUrl: '',
  authorName: 'Jisr Team',
})

export default function AdminBlog() {
  const { language } = useLanguage()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | BlogStatus>('all')
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<BlogPost | null>(null)
  const [form, setForm] = useState<PostForm>(emptyForm())
  const [submitting, setSubmitting] = useState(false)
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
      const data = await adminService.listBlogPosts({
        search: search || undefined,
        status: statusFilter,
        limit: 100,
      })
      setPosts(data.items)
    } catch (err: any) {
      showToast('Failed to load posts', err?.message || 'Try again later.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const filtered = useMemo(() => {
    if (!search) return posts
    const q = search.toLowerCase()
    return posts.filter(
      (p) => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)
    )
  }, [posts, search])

  const openCreate = () => {
    setForm(emptyForm())
    setEditing(null)
    setCreating(true)
  }

  const openEdit = (post: BlogPost) => {
    setForm({
      title: post.title,
      titleAr: post.titleAr || '',
      excerpt: post.excerpt,
      excerptAr: post.excerptAr || '',
      content: post.content,
      contentAr: post.contentAr || '',
      category: post.category,
      status: post.status,
      featured: post.featured,
      showOnHomepage: post.showOnHomepage,
      emoji: post.emoji || '📝',
      coverImageUrl: post.coverImageUrl || '',
      authorName: post.authorName,
    })
    setEditing(post)
    setCreating(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editing) {
        await adminService.updateBlogPost(editing.id, form)
        showToast('Post updated', form.title, 'success')
      } else {
        await adminService.createBlogPost(form)
        showToast('Post created', form.title, 'success')
      }
      setEditing(null)
      setCreating(false)
      void load()
    } catch (err: any) {
      showToast('Could not save post', err?.message || 'Try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleField = async (post: BlogPost, field: 'featured' | 'showOnHomepage') => {
    try {
      await adminService.updateBlogPost(post.id, { [field]: !post[field] } as any)
      setPosts((ps) => ps.map((p) => (p.id === post.id ? { ...p, [field]: !p[field] } : p)))
    } catch (err: any) {
      showToast('Update failed', err?.message || 'Try again.', 'error')
    }
  }

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
          title={t(tr.adminBlog.title, language)}
          description={t(tr.adminBlog.description, language)}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="ghost" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={load}>
                {t(tr.common.reload, language)}
              </Button>
              <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
                {t(tr.adminBlog.newPost, language)}
              </Button>
            </div>
          }
        />

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Input
              className="flex-1"
              leftIcon={<Search className="h-4 w-4 text-ink-400" />}
              placeholder="Search by title or excerpt…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatusFilter(s.value)}
                  className={[
                    'rounded-xl px-3.5 py-2 text-sm font-medium transition-colors',
                    statusFilter === s.value
                      ? 'bg-primary-600 text-white shadow-soft'
                      : 'bg-white dark:bg-ink-800 text-ink-700 dark:text-ink-300 ring-1 ring-ink-200 dark:ring-ink-700 hover:bg-ink-50 dark:hover:bg-ink-700',
                  ].join(' ')}
                >
                  {s.value === 'all' ? t(tr.adminUsers.filterAll, language) :
                   s.value === 'PUBLISHED' ? t(tr.adminBlog.published, language) :
                   s.value === 'DRAFT' ? t(tr.adminBlog.draft, language) :
                   s.value === 'ARCHIVED' ? t(tr.adminBlog.archived, language) :
                   s.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Posts */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-8 w-8 text-ink-400" />}
            title="No posts yet"
            description="Create your first article to publish on the blog."
            action={
              <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
                New post
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Card className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-2xl leading-none">{post.emoji || '📝'}</span>
                        <h3 className="text-lg font-bold text-ink-900 dark:text-ink-50 truncate">{post.title}</h3>
                        <StatusBadge status={post.status} />
                        <Badge variant="primary">{post.category}</Badge>
                        {post.featured && (
                          <Badge variant="sunny" icon={<Star className="h-3 w-3" />}>Featured</Badge>
                        )}
                        {post.showOnHomepage && (
                          <Badge variant="sky" icon={<Home className="h-3 w-3" />}>Homepage</Badge>
                        )}
                      </div>
                      <p className="text-ink-600 dark:text-ink-300 mb-3 line-clamp-2">{post.excerpt}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500 dark:text-ink-400">
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5" /> {post.authorName}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />{' '}
                          {new Date(post.publishedAt || post.updatedAt).toLocaleDateString()}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" /> {post.views.toLocaleString()} views
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Star className={`h-4 w-4 ${post.featured ? 'fill-current' : ''}`} />}
                        onClick={() => toggleField(post, 'featured')}
                        className={post.featured ? 'text-sunny-600 hover:text-sunny-700' : ''}
                      >
                        {post.featured ? 'Featured' : 'Feature'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Home className={`h-4 w-4 ${post.showOnHomepage ? 'fill-current' : ''}`} />}
                        onClick={() => toggleField(post, 'showOnHomepage')}
                        className={post.showOnHomepage ? 'text-sky-600 hover:text-sky-700' : ''}
                      >
                        {post.showOnHomepage ? 'Homepage' : 'Hide'}
                      </Button>
                      <Button variant="ghost" size="sm" leftIcon={<Edit className="h-4 w-4" />} onClick={() => openEdit(post)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Trash2 className="h-4 w-4" />}
                        onClick={() => setConfirmDelete(post)}
                        className="text-accent-600 hover:text-accent-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Create / Edit modal */}
      <Modal
        isOpen={creating || !!editing}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        title={editing ? 'Edit post' : 'New post'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <Input
              label="Title (Arabic)"
              value={form.titleAr || ''}
              onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
              dir="rtl"
            />
            <Input
              label="Emoji"
              maxLength={4}
              value={form.emoji}
              onChange={(e) => setForm({ ...form, emoji: e.target.value })}
              className="md:w-32"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="block text-sm font-medium text-ink-800 dark:text-ink-200 mb-1.5">Excerpt</span>
              <textarea
                className="field-input"
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                required
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-ink-800 dark:text-ink-200 mb-1.5">Excerpt (Arabic)</span>
              <textarea
                className="field-input text-right"
                dir="rtl"
                rows={2}
                value={form.excerptAr || ''}
                onChange={(e) => setForm({ ...form, excerptAr: e.target.value })}
              />
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="block text-sm font-medium text-ink-800 dark:text-ink-200 mb-1.5">Content</span>
              <textarea
                className="field-input font-mono"
                rows={8}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-ink-800 dark:text-ink-200 mb-1.5">Content (Arabic)</span>
              <textarea
                className="field-input text-right font-mono"
                dir="rtl"
                rows={8}
                value={form.contentAr || ''}
                onChange={(e) => setForm({ ...form, contentAr: e.target.value })}
              />
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="block">
              <span className="block text-sm font-medium text-ink-800 dark:text-ink-200 mb-1.5">Category</span>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="field-input"
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-ink-800 dark:text-ink-200 mb-1.5">Status</span>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as BlogStatus })}
                className="field-input"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </label>
            <Input
              label="Author"
              value={form.authorName}
              onChange={(e) => setForm({ ...form, authorName: e.target.value })}
            />
          </div>
          <Input
            label="Cover image URL"
            placeholder="https://…/cover.jpg"
            value={form.coverImageUrl}
            onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
          />
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-ink-800 dark:text-ink-200">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <Star className="h-4 w-4" /> Mark as featured
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-ink-800 dark:text-ink-200">
              <input
                type="checkbox"
                checked={form.showOnHomepage}
                onChange={(e) => setForm({ ...form, showOnHomepage: e.target.checked })}
                className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <Home className="h-4 w-4" /> Show on homepage
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setCreating(false)
                setEditing(null)
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting} leftIcon={<Save className="h-4 w-4" />}>
              {editing ? 'Save changes' : 'Create post'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete post?"
        description="This permanently removes the post."
        size="sm"
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-ink-50 dark:bg-ink-800 ring-1 ring-ink-200 dark:ring-ink-700 p-3 text-sm text-ink-700 dark:text-ink-300">
            {confirmDelete?.title}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={submitting}
              onClick={async () => {
                if (!confirmDelete) return
                setSubmitting(true)
                try {
                  await adminService.deleteBlogPost(confirmDelete.id)
                  showToast('Post deleted', confirmDelete.title, 'success')
                  setConfirmDelete(null)
                  void load()
                } catch (err: any) {
                  showToast('Could not delete', err?.message || 'Try again.', 'error')
                } finally {
                  setSubmitting(false)
                }
              }}
            >
              Delete post
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}

function StatusBadge({ status }: { status: BlogStatus }) {
  if (status === 'PUBLISHED') return <Badge variant="success">Published</Badge>
  if (status === 'DRAFT') return <Badge variant="warning">Draft</Badge>
  return <Badge variant="neutral">Archived</Badge>
}
