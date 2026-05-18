import { FormEvent, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Shield,
  Pencil,
  Trash2,
  RefreshCw,
  Ban,
  Lock,
  Unlock,
  ShieldAlert,
  Baby,
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
import {
  adminService,
  AdminUser,
  AdminChild,
  UserRole,
  RESTRICTION_OPTIONS,
} from '../../services/adminService'
import { useLanguage } from '../../context/LanguageContext'
import { tr, t } from '../../i18n/translations'

type RoleFilter = 'all' | UserRole
type ViewMode = 'users' | 'children'

export default function AdminUsers() {
  const { language } = useLanguage()
  const isAr = language === 'ar'
  const [viewMode, setViewMode] = useState<ViewMode>('users')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [children, setChildren] = useState<AdminChild[]>([])
  const [total, setTotal] = useState(0)
  const [childTotal, setChildTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [editingChild, setEditingChild] = useState<AdminChild | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null)
  const [restrictionsTarget, setRestrictionsTarget] = useState<AdminUser | null>(null)
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
      if (viewMode === 'users') {
        const data = await adminService.listUsers({
          search: search || undefined,
          role: roleFilter,
          limit: 50,
        })
        setUsers(data.items)
        setTotal(data.total)
      } else {
        const data = await adminService.listChildren({
          search: search || undefined,
          limit: 50,
        })
        setChildren(data.items)
        setChildTotal(data.total)
      }
    } catch (err: any) {
      showToast('Failed to load', err?.message || 'Try again later.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, viewMode])

  const counts = useMemo(() => {
    const admins = users.filter((u) => u.role === 'ADMIN').length
    const regular = users.filter((u) => u.role === 'USER').length
    const verified = users.filter((u) => u.emailVerified).length
    const blocked = users.filter((u) => u.blocked).length
    return { admins, regular, verified, blocked }
  }, [users])

  const handleToggleBlock = async (user: AdminUser) => {
    setSubmitting(true)
    try {
      const updated = user.blocked
        ? await adminService.unblockUser(user.id)
        : await adminService.blockUser(user.id)
      setUsers((us) => us.map((u) => (u.id === user.id ? { ...u, ...updated } : u)))
      showToast(
        user.blocked ? 'User unblocked' : 'User blocked',
        `${user.name} is now ${user.blocked ? 'active' : 'suspended'}.`,
        'success'
      )
    } catch (err: any) {
      showToast('Action failed', err?.message || 'Try again.', 'error')
    } finally {
      setSubmitting(false)
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
          title={t(tr.adminUsers.title, language)}
          description={t(tr.adminUsers.description, language)}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="ghost" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={load}>
                {t(tr.common.reload, language)}
              </Button>
              {viewMode === 'users' && (
                <Button variant="primary" leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>
                  {t(tr.adminUsers.newUser, language)}
                </Button>
              )}
            </div>
          }
        />

        {/* View mode toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setViewMode('users')}
            className={[
              'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors',
              viewMode === 'users'
                ? 'bg-primary-600 text-white shadow-soft'
                : 'bg-white dark:bg-ink-800 text-ink-700 dark:text-ink-300 ring-1 ring-ink-200 dark:ring-ink-700 hover:bg-ink-50',
            ].join(' ')}
          >
            <Users className="h-4 w-4" />
            {t(tr.adminUsers.filterUsers, language)}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('children')}
            className={[
              'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors',
              viewMode === 'children'
                ? 'bg-primary-600 text-white shadow-soft'
                : 'bg-white dark:bg-ink-800 text-ink-700 dark:text-ink-300 ring-1 ring-ink-200 dark:ring-ink-700 hover:bg-ink-50',
            ].join(' ')}
          >
            <Baby className="h-4 w-4" />
            {t(tr.adminUsers.statChildren, language)}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label={t(tr.adminUsers.statTotalUsers, language)} value={total} icon={<Users className="h-5 w-5" />} />
          <StatCard label={t(tr.adminUsers.statAdmins, language)} value={counts.admins} icon={<Shield className="h-5 w-5" />} />
          <StatCard label={t(tr.adminUsers.statVerified, language)} value={counts.verified} icon={<Mail className="h-5 w-5" />} />
          <StatCard label={t(tr.adminUsers.statChildren, language)} value={childTotal} icon={<Baby className="h-5 w-5" />} tone="accent" />
        </div>

        {/* Filters */}
        <Card className="p-4">
          <form
            className="flex flex-col gap-3 md:flex-row md:items-center"
            onSubmit={(e) => { e.preventDefault(); void load() }}
          >
            <Input
              className="flex-1"
              leftIcon={<Search className="h-4 w-4 text-ink-400" />}
              placeholder={viewMode === 'users' ? 'Search by name or email…' : 'Search by name or username…'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {viewMode === 'users' && (
              <div className="flex flex-wrap gap-2">
                {(['all', 'USER', 'ADMIN'] as RoleFilter[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoleFilter(r)}
                    className={[
                      'rounded-xl px-3.5 py-2 text-sm font-medium transition-colors',
                      roleFilter === r
                        ? 'bg-primary-600 text-white shadow-soft'
                        : 'bg-white dark:bg-ink-800 text-ink-700 dark:text-ink-300 ring-1 ring-ink-200 dark:ring-ink-700 hover:bg-ink-50 dark:hover:bg-ink-700',
                    ].join(' ')}
                  >
                    {r === 'all' ? t(tr.adminUsers.filterAll, language) : r === 'USER' ? t(tr.adminUsers.filterUsers, language) : t(tr.adminUsers.filterAdmins, language)}
                  </button>
                ))}
              </div>
            )}
            <Button type="submit" variant="secondary">{t(tr.common.search, language)}</Button>
          </form>
        </Card>

        {/* Children grid */}
        {viewMode === 'children' && (
          loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
            </div>
          ) : children.length === 0 ? (
            <EmptyState
              icon={<Baby className="h-8 w-8 text-ink-400" />}
              title="No children found"
              description="No child accounts have been created yet."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {children.map((child, idx) => (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Card className="p-5 h-full flex flex-col">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="grid h-11 w-11 flex-none place-items-center rounded-full bg-gradient-to-br from-sunny-400 to-sunny-600 font-bold text-white text-lg">
                          {child.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-ink-900 dark:text-ink-50 truncate">{child.name}</h3>
                          {child.username && (
                            <p className="text-sm text-ink-500 dark:text-ink-400 truncate">@{child.username}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant="primary" icon={<Baby className="h-3 w-3" />}>{isAr ? 'طفل' : 'Child'}</Badge>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                      <Stat label={isAr ? 'العمر' : 'Age'} value={child.age ? (isAr ? `${child.age} سنة` : `${child.age} yr`) : '—'} />
                      <Stat label={isAr ? 'ولي الأمر' : 'Parent'} value={child.user?.name || '—'} />
                    </div>

                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <span className="text-xs text-ink-500 dark:text-ink-400">{isAr ? 'انضم في' : 'Joined'} {new Date(child.createdAt).toLocaleDateString()}</span>
                      <Button variant="ghost" size="sm" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => setEditingChild(child)}>
                        Edit
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )
        )}

        {/* Users grid */}
        {viewMode === 'users' && (loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52" />)}
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={<Users className="h-8 w-8 text-ink-400" />}
            title="No users found"
            description="Try a different search or filter, or invite a new user."
            action={
              <Button variant="primary" leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>
                Add user
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users.map((u, idx) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Card className={`p-5 h-full flex flex-col ${u.blocked ? 'ring-2 ring-accent-200 dark:ring-accent-800 bg-accent-50/30 dark:bg-accent-900/20' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`grid h-11 w-11 flex-none place-items-center rounded-full font-bold text-white ${u.blocked ? 'bg-accent-400' : 'bg-gradient-to-br from-primary-400 to-primary-600'}`}>
                        {u.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-ink-900 dark:text-ink-50 truncate">{u.name}</h3>
                        <p className="text-sm text-ink-500 dark:text-ink-400 truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge variant={u.role === 'ADMIN' ? 'accent' : 'primary'} icon={u.role === 'ADMIN' ? <Shield className="h-3 w-3" /> : undefined}>
                        {u.role}
                      </Badge>
                      {u.blocked && (
                        <Badge variant="danger" icon={<Ban className="h-3 w-3" />}>Blocked</Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <Stat label={isAr ? 'الأطفال' : 'Children'} value={u._count?.children ?? 0} />
                    <Stat label={isAr ? 'النوع' : 'Type'} value={u.accountType || '—'} />
                    <Stat label={isAr ? 'موثق' : 'Verified'} value={u.emailVerified ? (isAr ? 'نعم' : 'Yes') : (isAr ? 'لا' : 'No')} />
                  </div>

                  {/* Active restrictions */}
                  {(u.restrictions ?? []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(u.restrictions ?? []).map((r) => (
                         <span key={r} className="inline-flex items-center gap-1 rounded-full bg-sunny-50 dark:bg-sunny-900/30 px-2 py-0.5 text-[11px] font-semibold text-sunny-800 dark:text-sunny-300 ring-1 ring-sunny-200 dark:ring-sunny-800">
                          <Lock className="h-2.5 w-2.5" /> {r}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-xs text-ink-500 dark:text-ink-400">{isAr ? 'انضم في' : 'Joined'} {new Date(u.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1 flex-wrap justify-end">
                      <Button variant="ghost" size="sm" leftIcon={<ShieldAlert className="h-4 w-4" />} onClick={() => setRestrictionsTarget(u)} title={isAr ? 'إدارة القيود' : 'Manage restrictions'}>
                        {isAr ? 'تقييد' : 'Restrict'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={u.blocked ? <Unlock className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                        onClick={() => void handleToggleBlock(u)}
                        disabled={submitting || u.role === 'ADMIN'}
                        className={u.blocked ? 'text-emerald-600 hover:text-emerald-700' : 'text-accent-600 hover:text-accent-700'}
                      >
                        {u.blocked ? t(tr.adminUsers.unblock, language) : t(tr.adminUsers.block, language)}
                      </Button>
                      <Button variant="ghost" size="sm" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => setEditing(u)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setConfirmDelete(u)} className="text-accent-600 hover:text-accent-700">
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ))}
      </motion.div>

      {/* Create modal */}
      <UserFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Add user"
        submitting={submitting}
        onSubmit={async (payload) => {
          setSubmitting(true)
          try {
            await adminService.createUser(payload as any)
            setShowCreate(false)
            showToast('User created', `${payload.name} was added.`, 'success')
            void load()
          } catch (err: any) {
            showToast('Could not create user', err?.message || 'Try again.', 'error')
          } finally {
            setSubmitting(false)
          }
        }}
      />

      {/* Edit modal */}
      <UserFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit user"
        initial={editing || undefined}
        submitting={submitting}
        onSubmit={async (payload) => {
          if (!editing) return
          setSubmitting(true)
          try {
            await adminService.updateUser(editing.id, payload as any)
            setEditing(null)
            showToast('User updated', 'Changes saved successfully.', 'success')
            void load()
          } catch (err: any) {
            showToast('Could not save user', err?.message || 'Try again.', 'error')
          } finally {
            setSubmitting(false)
          }
        }}
      />

      {/* Restrictions modal */}
      <RestrictionsModal
        user={restrictionsTarget}
        onClose={() => setRestrictionsTarget(null)}
        submitting={submitting}
        onSave={async (restrictions) => {
          if (!restrictionsTarget) return
          setSubmitting(true)
          try {
            const updated = await adminService.setUserRestrictions(restrictionsTarget.id, restrictions)
            setUsers((us) => us.map((u) => (u.id === restrictionsTarget.id ? { ...u, ...updated } : u)))
            setRestrictionsTarget(null)
            showToast('Restrictions updated', `${restrictionsTarget.name}'s access has been updated.`, 'success')
          } catch (err: any) {
            showToast('Could not update restrictions', err?.message || 'Try again.', 'error')
          } finally {
            setSubmitting(false)
          }
        }}
      />

      {/* Edit child modal */}
      <ChildEditModal
        child={editingChild}
        onClose={() => setEditingChild(null)}
        submitting={submitting}
        onSave={async ({ name, username, age, pin }) => {
          if (!editingChild) return
          setSubmitting(true)
          try {
            const updated = await adminService.updateChild(editingChild.id, { name, username, age, pin })
            setChildren((cs) => cs.map((c) => (c.id === editingChild.id ? { ...c, ...updated } : c)))
            setEditingChild(null)
            showToast('Child updated', 'Changes saved successfully.', 'success')
          } catch (err: any) {
            showToast('Could not save child', err?.message || 'Try again.', 'error')
          } finally {
            setSubmitting(false)
          }
        }}
      />

      {/* Delete confirm */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete user?" description="This action permanently removes the user and their associated data." size="sm">
        <div className="space-y-4">
          <div className="rounded-xl bg-ink-50 dark:bg-ink-800 ring-1 ring-ink-200 dark:ring-ink-700 p-3 text-sm text-ink-700 dark:text-ink-300">
            <div className="font-semibold text-ink-900 dark:text-ink-50">{confirmDelete?.name}</div>
            <div className="text-ink-500 dark:text-ink-400">{confirmDelete?.email}</div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button
              variant="danger"
              loading={submitting}
              onClick={async () => {
                if (!confirmDelete) return
                setSubmitting(true)
                try {
                  await adminService.deleteUser(confirmDelete.id)
                  setConfirmDelete(null)
                  showToast('User deleted', `${confirmDelete.name} has been removed.`, 'success')
                  void load()
                } catch (err: any) {
                  showToast('Could not delete user', err?.message || 'Try again.', 'error')
                } finally {
                  setSubmitting(false)
                }
              }}
            >
              Delete user
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}

/* ─── Helper sub-components ──────────────────────────────────────────────── */

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode; tone?: 'primary' | 'accent' }) {
  return (
    <Card className="p-4 !bg-primary-500 !border-primary-600">
      <div className="flex items-center justify-between">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/20 text-white">{icon}</div>
        <span className="text-xs uppercase tracking-wide text-white/70">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-ink-50 dark:bg-ink-800 px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-ink-500 dark:text-ink-400">{label}</p>
      <p className="text-sm font-semibold text-ink-900 dark:text-ink-50 truncate">{value}</p>
    </div>
  )
}

/* ─── User form modal ────────────────────────────────────────────────────── */

interface UserFormPayload {
  name: string
  email: string
  role: UserRole
  accountType?: string
  emailVerified?: boolean
  password?: string
}

function UserFormModal({
  open, onClose, title, initial, submitting, onSubmit,
}: {
  open: boolean
  onClose: () => void
  title: string
  initial?: AdminUser
  submitting: boolean
  onSubmit: (payload: UserFormPayload) => Promise<void> | void
}) {
  const [form, setForm] = useState<UserFormPayload>({
    name: '', email: '', role: 'USER', accountType: 'parent', emailVerified: false, password: '',
  })

  useEffect(() => {
    if (initial) {
      setForm({ name: initial.name, email: initial.email, role: initial.role, accountType: initial.accountType || 'parent', emailVerified: !!initial.emailVerified, password: '' })
    } else if (open) {
      setForm({ name: '', email: '', role: 'USER', accountType: 'parent', emailVerified: false, password: '' })
    }
  }, [open, initial])

  return (
    <Modal isOpen={open} onClose={onClose} title={title} size="md">
      <form onSubmit={(e) => { e.preventDefault(); void onSubmit(form) }} className="space-y-4">
        <Input label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="block text-sm font-medium text-ink-800 dark:text-ink-200 mb-1.5">Role</span>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} className="field-input">
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-ink-800 dark:text-ink-200 mb-1.5">Account type</span>
            <select value={form.accountType} onChange={(e) => setForm({ ...form, accountType: e.target.value })} className="field-input">
              <option value="parent">Parent</option>
              <option value="therapist">Therapist</option>
              <option value="school">School</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        </div>
        <Input label={initial ? 'New password (optional)' : 'Initial password'} type="password" autoComplete="new-password" placeholder={initial ? 'Leave blank to keep current password' : 'At least 8 characters'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!initial} />
        <label className="flex items-center gap-2 text-sm text-ink-700 dark:text-ink-300">
          <input type="checkbox" checked={!!form.emailVerified} onChange={(e) => setForm({ ...form, emailVerified: e.target.checked })} className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500" />
          Email verified
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={submitting}>{initial ? 'Save changes' : 'Create user'}</Button>
        </div>
      </form>
    </Modal>
  )
}

/* ─── Child edit modal ───────────────────────────────────────────────────── */

function ChildEditModal({
  child, onClose, submitting, onSave,
}: {
  child: AdminChild | null
  onClose: () => void
  submitting: boolean
  onSave: (payload: { name: string; username: string; age: number | null; pin?: string }) => Promise<void>
}) {
  const [form, setForm] = useState({ name: '', username: '', age: '', pin: '' })

  useEffect(() => {
    if (child) {
      setForm({
        name: child.name,
        username: child.username || '',
        age: child.age != null ? String(child.age) : '',
        pin: '',
      })
    }
  }, [child])

  return (
    <Modal isOpen={!!child} onClose={onClose} title="Edit child" size="sm">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void onSave({
            name: form.name,
            username: form.username,
            age: form.age ? Number(form.age) : null,
            pin: form.pin || undefined,
          })
        }}
        className="space-y-4"
      >
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input
          label="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          placeholder="e.g. sara123"
        />
        <Input
          label="Age (optional)"
          type="number"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
          placeholder="e.g. 7"
          min={1}
          max={18}
        />
        <Input
          label="New PIN (optional)"
          type="password"
          autoComplete="new-password"
          value={form.pin}
          onChange={(e) => setForm({ ...form, pin: e.target.value })}
          placeholder="Leave blank to keep current PIN"
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={submitting}>Save changes</Button>
        </div>
      </form>
    </Modal>
  )
}

/* ─── Restrictions modal ─────────────────────────────────────────────────── */

function RestrictionsModal({
  user, onClose, submitting, onSave,
}: {
  user: AdminUser | null
  onClose: () => void
  submitting: boolean
  onSave: (restrictions: string[]) => Promise<void>
}) {
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    if (user) setSelected(user.restrictions ?? [])
  }, [user])

  const toggle = (key: string) =>
    setSelected((s) => s.includes(key) ? s.filter((k) => k !== key) : [...s, key])

  return (
    <Modal
      isOpen={!!user}
      onClose={onClose}
      title="Manage restrictions"
      description={user ? `Configure what ${user.name} is allowed to do.` : undefined}
      size="sm"
    >
      <div className="space-y-3">
        <div className="rounded-xl bg-sunny-50 dark:bg-sunny-900/30 ring-1 ring-sunny-200 dark:ring-sunny-800 p-3 text-sm text-sunny-900 dark:text-sunny-300 flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 mt-0.5 flex-none text-sunny-700 dark:text-sunny-400" />
          <span>Checked items will be <strong>blocked</strong> for this user.</span>
        </div>

        <div className="space-y-2">
          {RESTRICTION_OPTIONS.map((opt) => (
            <label
              key={opt.key}
              className="flex items-start gap-3 rounded-xl ring-1 ring-ink-200 dark:ring-ink-700 bg-white dark:bg-ink-800 p-3 cursor-pointer hover:bg-ink-50/60 dark:hover:bg-ink-700/50 transition-colors"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.key)}
                onChange={() => toggle(opt.key)}
                className="mt-0.5 h-4 w-4 rounded text-accent-600 focus:ring-accent-500"
              />
              <div>
                <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">{opt.label}</div>
                <div className="text-xs text-ink-500 dark:text-ink-400">{opt.description}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={submitting} onClick={() => void onSave(selected)}>
            Save restrictions
          </Button>
        </div>
      </div>
    </Modal>
  )
}
