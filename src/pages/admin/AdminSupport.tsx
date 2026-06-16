import { FormEvent, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Mail,
  ArrowUpRight,
  Send,
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
import {
  adminService,
  AdminTicketDetail,
  AdminTicketSummary,
  TicketPriority,
  TicketStatus,
} from '../../services/adminService'
import { useLanguage } from '../../context/LanguageContext'
import { tr, t } from '../../i18n/translations'

const STATUS_OPTIONS: { value: 'all' | TicketStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
]

export default function AdminSupport() {
  const { language } = useLanguage()
  const isAr = language === 'ar'
  const [tickets, setTickets] = useState<AdminTicketSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all')
  const [selected, setSelected] = useState<AdminTicketDetail | null>(null)
  const [selectedLoading, setSelectedLoading] = useState(false)
  const [reply, setReply] = useState('')
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
      const data = await adminService.listTickets({
        search: search || undefined,
        status: statusFilter,
        limit: 100,
      })
      setTickets(data.items)
    } catch (err: any) {
      showToast('Failed to load tickets', err?.message || 'Try again later.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const counts = useMemo(() => {
    return {
      pending: tickets.filter((t) => t.status === 'PENDING').length,
      inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
      resolved: tickets.filter((t) => t.status === 'RESOLVED').length,
    }
  }, [tickets])

  const openTicket = async (id: string) => {
    setSelectedLoading(true)
    try {
      const detail = await adminService.getTicket(id)
      setSelected(detail)
      setReply('')
    } catch (err: any) {
      showToast('Could not open ticket', err?.message || 'Try again.', 'error')
    } finally {
      setSelectedLoading(false)
    }
  }

  const updateStatus = async (id: string, status: TicketStatus) => {
    try {
      await adminService.updateTicket(id, { status })
      setTickets((ts) => ts.map((t) => (t.id === id ? { ...t, status } : t)))
      if (selected?.id === id) setSelected({ ...selected, status })
      showToast('Updated', `Ticket marked ${status.toLowerCase().replace('_', ' ')}`, 'success')
    } catch (err: any) {
      showToast('Update failed', err?.message || 'Try again.', 'error')
    }
  }

  const updatePriority = async (id: string, priority: TicketPriority) => {
    try {
      await adminService.updateTicket(id, { priority })
      setTickets((ts) => ts.map((t) => (t.id === id ? { ...t, priority } : t)))
      if (selected?.id === id) setSelected({ ...selected, priority })
    } catch (err: any) {
      showToast('Update failed', err?.message || 'Try again.', 'error')
    }
  }

  const sendReply = async (e: FormEvent) => {
    e.preventDefault()
    if (!selected || !reply.trim()) return
    setSubmitting(true)
    try {
      const updated = await adminService.replyToTicket(selected.id, reply.trim())
      setSelected(updated)
      setReply('')
      setTickets((ts) =>
        ts.map((t) =>
          t.id === selected.id
            ? {
                ...t,
                status: updated.status,
                _count: { messages: (t._count?.messages || 0) + 1 },
              }
            : t
        )
      )
      showToast('Reply sent', 'Your message has been recorded.', 'success')
    } catch (err: any) {
      showToast('Could not send', err?.message || 'Try again.', 'error')
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
          title={t(tr.adminSupport.title, language)}
          description={t(tr.adminSupport.description, language)}
          actions={
            <Button variant="ghost" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={load}>
              {t(tr.common.reload, language)}
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label={t(tr.adminSupport.statTotal, language)} value={tickets.length} icon={<MessageSquare className="h-5 w-5" />} />
          <StatCard label={t(tr.adminSupport.statPending, language)} value={counts.pending} icon={<AlertCircle className="h-5 w-5" />} />
          <StatCard label={t(tr.adminSupport.statInProgress, language)} value={counts.inProgress} icon={<Clock className="h-5 w-5" />} />
          <StatCard label={t(tr.adminSupport.statResolved, language)} value={counts.resolved} icon={<CheckCircle className="h-5 w-5" />} />
        </div>

        {/* Filters */}
        <Card className="p-4">
          <form
            className="flex flex-col gap-3 md:flex-row md:items-center"
            onSubmit={(e) => {
              e.preventDefault()
              void load()
            }}
          >
            <Input
              className="flex-1"
              leftIcon={<Search className="h-4 w-4 text-ink-400" />}
              placeholder="Search by subject, message or user…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((s) => (
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
                  {s.value === 'all' ? t(tr.support.filterAll, language) : 
                   s.value === 'PENDING' ? t(tr.support.filterPending, language) :
                   s.value === 'IN_PROGRESS' ? t(tr.support.filterInProgress, language) :
                   s.value === 'RESOLVED' ? t(tr.support.filterResolved, language) :
                   t(tr.adminSupport.statusClosed, language)}
                </button>
              ))}
            </div>
            <Button type="submit" variant="secondary">
              {t(tr.common.search, language)}
            </Button>
          </form>
        </Card>

        {/* Tickets */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="h-8 w-8 text-ink-400" />}
            title={t(tr.adminSupport.noTickets, language)}
            description={t(tr.adminSupport.noTicketsDesc, language)}
          />
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket, idx) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Card className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <StatusIcon status={ticket.status} />
                        <h3 className="text-lg font-bold text-ink-900 dark:text-ink-50 truncate">{ticket.subject}</h3>
                        <PriorityBadge priority={ticket.priority} />
                        <Badge variant="primary">{ticket.category}</Badge>
                        <StatusBadge status={ticket.status} />
                      </div>
                      <p className="text-ink-600 dark:text-ink-300 line-clamp-2">{ticket.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500 dark:text-ink-400">
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5" /> {ticket.user.name}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" /> {ticket.user.email}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />{' '}
                          {new Date(ticket.createdAt).toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />{' '}
                          {(ticket._count?.messages ?? 0)} {t(tr.adminSupport.messages, language)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateStatus(ticket.id, 'IN_PROGRESS')}
                        disabled={ticket.status === 'IN_PROGRESS'}
                      >
                        {t(tr.adminSupport.btnInProgress, language)}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateStatus(ticket.id, 'RESOLVED')}
                        disabled={ticket.status === 'RESOLVED'}
                        className="text-emerald-600 hover:text-emerald-700"
                      >
                        {t(tr.adminSupport.btnResolve, language)}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<ArrowUpRight className="h-4 w-4" />}
                        onClick={() => openTicket(ticket.id)}
                      >
                        {t(tr.common.view, language)}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Detail / reply modal */}
      <Modal
        isOpen={!!selected || selectedLoading}
        onClose={() => setSelected(null)}
        title={selected?.subject || 'Ticket'}
        description={selected ? `From ${selected.user.name} • ${selected.user.email}` : undefined}
        size="lg"
      >
        {selectedLoading ? (
          <div className="py-10 text-center text-ink-500 dark:text-ink-400">Loading conversation…</div>
        ) : selected ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={selected.priority} />
              <StatusBadge status={selected.status} />
              <Badge variant="primary">{selected.category}</Badge>
              <span className="text-xs text-ink-500 dark:text-ink-400">
                Opened {new Date(selected.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="block text-sm font-medium text-ink-800 dark:text-ink-200 mb-1.5">Status</span>
                <select
                  value={selected.status}
                  onChange={(e) => updateStatus(selected.id, e.target.value as TicketStatus)}
                  className="field-input"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-ink-800 dark:text-ink-200 mb-1.5">Priority</span>
                <select
                  value={selected.priority}
                  onChange={(e) => updatePriority(selected.id, e.target.value as TicketPriority)}
                  className="field-input"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </label>
            </div>

            <div className="rounded-2xl ring-1 ring-ink-200 dark:ring-ink-700 bg-ink-50/40 dark:bg-ink-800/40 p-4 max-h-72 overflow-y-auto space-y-3">
              <ConversationBubble
                isFromUser={true}
                author={selected.user.name}
                createdAt={selected.createdAt}
                message={selected.description}
              />
              {selected.messages.map((m) => (
                <ConversationBubble
                  key={m.id}
                  isFromUser={m.isFromUser}
                  author={m.isFromUser ? selected.user.name : 'Support'}
                  createdAt={m.createdAt}
                  message={m.message}
                />
              ))}
            </div>

            <form onSubmit={sendReply} className="space-y-3">
              <label className="block">
                <span className="block text-sm font-medium text-ink-800 dark:text-ink-200 mb-1.5">Reply</span>
                <textarea
                  className="field-input"
                  rows={4}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply…"
                  required
                />
              </label>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setSelected(null)}>
                  Close
                </Button>
                <Button type="submit" variant="primary" loading={submitting} leftIcon={<Send className="h-4 w-4" />}>
                  Send reply
                </Button>
              </div>
            </form>
          </div>
        ) : null}
      </Modal>
    </AdminLayout>
  )
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: React.ReactNode
}) {
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

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  if (priority === 'URGENT') return <Badge variant="danger">Urgent</Badge>
  if (priority === 'HIGH') return <Badge variant="accent">High</Badge>
  if (priority === 'MEDIUM') return <Badge variant="sunny">Medium</Badge>
  return <Badge variant="neutral">Low</Badge>
}

function StatusBadge({ status }: { status: TicketStatus }) {
  if (status === 'PENDING') return <Badge variant="warning">Pending</Badge>
  if (status === 'IN_PROGRESS') return <Badge variant="sky">In progress</Badge>
  if (status === 'RESOLVED') return <Badge variant="success">Resolved</Badge>
  return <Badge variant="neutral">Closed</Badge>
}

function StatusIcon({ status }: { status: TicketStatus }) {
  if (status === 'RESOLVED') return <CheckCircle className="h-5 w-5 text-emerald-600" />
  if (status === 'IN_PROGRESS') return <Clock className="h-5 w-5 text-sky-600" />
  if (status === 'PENDING') return <AlertCircle className="h-5 w-5 text-accent-600" />
  return <Clock className="h-5 w-5 text-ink-500 dark:text-ink-400" />
}

function ConversationBubble({
  isFromUser,
  author,
  createdAt,
  message,
}: {
  isFromUser: boolean
  author: string
  createdAt: string
  message: string
}) {
  return (
    <div className={isFromUser ? 'flex justify-start' : 'flex justify-end'}>
      <div
        className={[
          'max-w-[80%] rounded-2xl px-4 py-3 ring-1 shadow-soft',
          isFromUser
            ? 'bg-white dark:bg-ink-800 text-ink-900 dark:text-ink-50 ring-ink-200 dark:ring-ink-700'
            : 'bg-primary-600 text-white ring-primary-700',
        ].join(' ')}
      >
        <div className="text-xs font-semibold mb-1 opacity-80">
          {author} • {new Date(createdAt).toLocaleString()}
        </div>
        <div className="text-sm whitespace-pre-wrap">{message}</div>
      </div>
    </div>
  )
}
