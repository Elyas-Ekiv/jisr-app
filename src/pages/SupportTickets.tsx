import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Plus, Clock, Send, User, Headphones } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import Skeleton from '../components/Skeleton'
import { supportService, SupportTicket, SupportMessage } from '../services/supportService'
import { useLanguage } from '../context/LanguageContext'
import { tr, t } from '../i18n/translations'

type TicketStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'
type TicketCategory = 'TECHNICAL' | 'BILLING' | 'QUESTION' | 'FEATURE' | 'OTHER'
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
type TicketDetail = Omit<SupportTicket, 'messages'> & { messages: SupportMessage[] }

export default function SupportTickets() {
  const { language } = useLanguage()
  const isAr = language === 'ar'
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | TicketStatus>('all')
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    subject: '',
    category: 'TECHNICAL' as TicketCategory,
    priority: 'MEDIUM' as TicketPriority,
    message: '',
  })

  const [viewOpen, setViewOpen] = useState(false)
  const [viewTicket, setViewTicket] = useState<TicketDetail | null>(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [reply, setReply] = useState('')
  const [replying, setReplying] = useState(false)
  const threadBottomRef = useRef<HTMLDivElement>(null)

  const load = async () => {
    try {
      setLoading(true)
      const data = await supportService.getTickets({
        status: filter === 'all' ? undefined : filter,
      })
      setTickets(data)
    } catch (err) {
      console.error('Failed to load tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [filter])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const diffMs = Date.now() - date.getTime()
    const m = Math.floor(diffMs / 60000)
    const h = Math.floor(diffMs / 3600000)
    const d = Math.floor(diffMs / 86400000)
    if (m < 1) return t(tr.support.justNow, language)
    if (m < 60) return isAr ? `منذ ${m} د` : `${m}m ago`
    if (h < 24) return isAr ? `منذ ${h} س` : `${h}h ago`
    if (d < 7) return isAr ? `منذ ${d} ي` : `${d}d ago`
    const w = Math.floor(d / 7)
    if (w < 4) return isAr ? `منذ ${w} أسبوع` : `${w}w ago`
    const mo = Math.floor(d / 30)
    return isAr ? `منذ ${mo} شهر` : `${mo}mo ago`
  }

  const statusLabel = (s: string) => {
    if (s === 'PENDING') return t(tr.support.filterPending, language)
    if (s === 'IN_PROGRESS') return t(tr.support.filterInProgress, language)
    if (s === 'RESOLVED') return t(tr.support.filterResolved, language)
    return s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ')
  }

  const statusVariant = (s: string): 'success' | 'warning' | 'danger' | 'neutral' => {
    if (s === 'RESOLVED' || s === 'CLOSED') return 'success'
    if (s === 'IN_PROGRESS') return 'warning'
    if (s === 'PENDING') return 'danger'
    return 'neutral'
  }

  const priorityVariant = (p: string): 'success' | 'warning' | 'danger' | 'neutral' => {
    if (p === 'URGENT' || p === 'HIGH') return 'danger'
    if (p === 'MEDIUM') return 'warning'
    if (p === 'LOW') return 'success'
    return 'neutral'
  }

  const priorityLabel = (p: string) => {
    if (p === 'LOW') return t(tr.support.prioLow, language)
    if (p === 'MEDIUM') return t(tr.support.prioMedium, language)
    if (p === 'HIGH') return t(tr.support.prioHigh, language)
    if (p === 'URGENT') return t(tr.support.prioUrgent, language)
    return p.toLowerCase()
  }

  const handleView = async (ticket: SupportTicket) => {
    setViewOpen(true)
    setViewTicket(null)
    setReply('')
    setViewLoading(true)
    try {
      const raw = await supportService.getTicket(ticket.id)
      const detail: TicketDetail = {
        ...raw,
        messages: Array.isArray((raw as any).messages) ? (raw as any).messages : [],
      }
      setViewTicket(detail)
      setTimeout(() => threadBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    } catch (err) {
      console.error('Failed to load ticket:', err)
    } finally {
      setViewLoading(false)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!viewTicket || !reply.trim()) return
    setReplying(true)
    try {
      const msg = await supportService.addMessage(viewTicket.id, reply.trim())
      setViewTicket((prev): TicketDetail | null =>
        prev ? { ...prev, messages: [...prev.messages, msg] } : prev
      )
      setReply('')
      setTimeout(() => threadBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === viewTicket.id
            ? { ...ticket, messages: ticket.messages + 1, lastMessage: new Date().toISOString() }
            : ticket
        )
      )
    } catch (err: any) {
      alert(err?.message || 'Failed to send reply.')
    } finally {
      setReplying(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await supportService.createTicket(form)
      setOpen(false)
      setForm({ subject: '', category: 'TECHNICAL', priority: 'MEDIUM', message: '' })
      await load()
    } catch (err: any) {
      alert(err?.message || 'Failed to create ticket.')
    } finally {
      setSubmitting(false)
    }
  }

  const filterLabels: Record<string, string> = {
    all: t(tr.support.filterAll, language),
    PENDING: t(tr.support.filterPending, language),
    IN_PROGRESS: t(tr.support.filterInProgress, language),
    RESOLVED: t(tr.support.filterResolved, language),
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-7xl"
      >
        <PageHeader
          eyebrow={t(tr.support.eyebrow, language)}
          title={t(tr.support.title, language)}
          description={t(tr.support.description, language)}
          actions={
            <Button
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setOpen(true)}
            >
              {t(tr.support.newTicket, language)}
            </Button>
          }
          className="mb-6"
        />

        <div className="mb-6 flex flex-wrap gap-1.5">
          {(['all', 'PENDING', 'IN_PROGRESS', 'RESOLVED'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={[
                'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                filter === f
                  ? 'bg-ink-900 text-white shadow-soft'
                  : 'bg-ink-100 text-ink-700 hover:bg-ink-200',
              ].join(' ')}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} padding="md">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="mt-3 h-3 w-1/2" />
              </Card>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="h-7 w-7" />}
            title={t(tr.support.noTickets, language)}
            description={t(tr.support.noTicketsDesc, language)}
            action={
              <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>
                {t(tr.support.createTicket, language)}
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket, i) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card padding="md" hover>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-ink-900">{ticket.subject}</h3>
                        <Badge variant={statusVariant(ticket.status)} size="sm">
                          {statusLabel(ticket.status)}
                        </Badge>
                        <Badge variant={priorityVariant(ticket.priority)} size="sm">
                          {priorityLabel(ticket.priority)}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-600">
                        <span className="capitalize">{ticket.category.toLowerCase()}</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {t(tr.support.created, language)} {formatTimeAgo(ticket.createdAt)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {ticket.messages} {isAr ? (ticket.messages === 1 ? 'رسالة' : 'رسائل') : `message${ticket.messages === 1 ? '' : 's'}`}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-ink-500">
                        {t(tr.support.lastUpdate, language)} {formatTimeAgo(ticket.lastMessage)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleView(ticket)}>
                      {t(tr.common.view, language)}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Ticket detail modal */}
        <Modal
          isOpen={viewOpen}
          onClose={() => { setViewOpen(false); setViewTicket(null) }}
          title={viewTicket?.subject ?? t(tr.adminSupport.ticketDetail, language)}
          size="lg"
        >
          {viewLoading ? (
            <div className="space-y-3 py-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : viewTicket ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusVariant(viewTicket.status)} size="sm">
                  {statusLabel(viewTicket.status)}
                </Badge>
                <Badge variant={priorityVariant(viewTicket.priority)} size="sm">
                  {priorityLabel(viewTicket.priority)}
                </Badge>
                <span className="text-xs text-ink-500 capitalize">{viewTicket.category.toLowerCase()}</span>
                <span className="ml-auto text-xs text-ink-400">
                  <Clock className="inline h-3 w-3 mr-0.5" />
                  {formatTimeAgo(viewTicket.createdAt)}
                </span>
              </div>

              <div className="max-h-80 space-y-3 overflow-y-auto rounded-xl border border-ink-100 dark:border-ink-700 bg-ink-50/50 dark:bg-ink-800/30 p-4">
                {viewTicket.messages.length === 0 ? (
                  <p className="text-center text-sm text-ink-500 dark:text-ink-400 py-6">{t(tr.support.noMessages, language)}</p>
                ) : (
                  viewTicket.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex gap-3 ${m.isFromUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <span className={[
                        'grid h-8 w-8 flex-none place-items-center rounded-full text-xs font-bold',
                        m.isFromUser
                          ? 'bg-primary-600 text-white'
                          : 'bg-ink-200 dark:bg-ink-600 text-ink-700 dark:text-ink-200',
                      ].join(' ')}>
                        {m.isFromUser ? <User className="h-4 w-4" /> : <Headphones className="h-4 w-4" />}
                      </span>
                      <div className={[
                        'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                        m.isFromUser
                          ? 'rounded-tr-sm bg-primary-600 text-white'
                          : 'rounded-tl-sm bg-white dark:bg-ink-700 text-ink-800 dark:text-ink-100 border border-ink-100 dark:border-ink-600',
                      ].join(' ')}>
                        <p>{m.message}</p>
                        <p className={`mt-1 text-[11px] ${m.isFromUser ? 'text-white/70' : 'text-ink-400 dark:text-ink-500'}`}>
                          {formatTimeAgo(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={threadBottomRef} />
              </div>

              {viewTicket.status !== 'RESOLVED' && viewTicket.status !== 'CLOSED' ? (
                <form onSubmit={handleReply} className="flex gap-2">
                  <textarea
                    rows={2}
                    placeholder={t(tr.support.writeReply, language)}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    className="field-input flex-1 resize-none leading-relaxed"
                    required
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    loading={replying}
                    leftIcon={!replying ? <Send className="h-4 w-4" /> : undefined}
                    className="self-end"
                  >
                    {t(tr.common.send, language)}
                  </Button>
                </form>
              ) : (
                <p className="text-center text-sm text-ink-500 dark:text-ink-400">
                  {t(tr.support.ticketClosed, language)} {viewTicket.status.toLowerCase()} {t(tr.support.noFurtherReplies, language)}
                </p>
              )}
            </div>
          ) : null}
        </Modal>

        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title={t(tr.support.newTicketTitle, language)}
          description={t(tr.support.newTicketDesc, language)}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t(tr.support.subject, language)}
              placeholder={t(tr.support.subjectPlaceholder, language)}
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink-800">{t(tr.support.category, language)}</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as TicketCategory })}
                  className="field-input"
                >
                  <option value="TECHNICAL">{t(tr.support.catTechnical, language)}</option>
                  <option value="BILLING">{t(tr.support.catBilling, language)}</option>
                  <option value="QUESTION">{t(tr.support.catQuestion, language)}</option>
                  <option value="FEATURE">{t(tr.support.catFeature, language)}</option>
                  <option value="OTHER">{t(tr.support.catOther, language)}</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink-800">{t(tr.support.priority, language)}</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as TicketPriority })}
                  className="field-input"
                >
                  <option value="LOW">{t(tr.support.prioLow, language)}</option>
                  <option value="MEDIUM">{t(tr.support.prioMedium, language)}</option>
                  <option value="HIGH">{t(tr.support.prioHigh, language)}</option>
                  <option value="URGENT">{t(tr.support.prioUrgent, language)}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-800">{t(tr.support.message, language)}</label>
              <textarea
                rows={6}
                placeholder={t(tr.support.messagePlaceholder, language)}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="field-input min-h-[140px] resize-y leading-relaxed"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="ghost" fullWidth onClick={() => setOpen(false)}>
                {t(tr.common.cancel, language)}
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={submitting}
                leftIcon={!submitting ? <Send className="h-4 w-4" /> : undefined}
              >
                {t(tr.support.submitTicket, language)}
              </Button>
            </div>
          </form>
        </Modal>
      </motion.div>
    </DashboardLayout>
  )
}
