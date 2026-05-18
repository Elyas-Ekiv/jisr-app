import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Award,
  Download,
  RefreshCw,
  ShoppingBag,
  MessageSquare,
  FileText,
} from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import PageHeader from '../../components/PageHeader'
import Skeleton from '../../components/Skeleton'
import EmptyState from '../../components/EmptyState'
import { adminService, PlatformAnalytics } from '../../services/adminService'
import { useLanguage } from '../../context/LanguageContext'
import { tr, t } from '../../i18n/translations'

export default function AdminAnalytics() {
  const { language } = useLanguage()
  const isAr = language === 'ar'
  const [data, setData] = useState<PlatformAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const a = await adminService.getAnalytics()
      setData(a)
    } catch (err: any) {
      setError(err?.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const trend = data?.monthlyTrend ?? []
  const maxTrend = useMemo(
    () => Math.max(1, ...trend.map((t) => t.value || 0)),
    [trend]
  )

  const exportCSV = () => {
    if (!data) return
    const lines = [
      ['Metric', 'Value'],
      ['Total users', data.totalUsers],
      ['Active users (30d)', data.activeUsers],
      ['Total children', data.totalChildren],
      ['Total vocabulary', data.totalVocabulary],
      ['Total orders', data.totalOrders],
      ['Completed payments', data.totalPayments],
      ['Pending tickets', data.pendingTickets],
      ['Published posts', data.publishedPosts],
      ['Revenue', data.revenue],
      [],
      ['Month', 'Signups'],
      ...trend.map((t) => [t.month, t.value]),
    ]
    const csv = lines.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jisr-analytics-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        <PageHeader
          eyebrow="Admin"
          title={t(tr.adminAnalytics.title, language)}
          description={t(tr.adminAnalytics.description, language)}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="ghost" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={load}>
                {t(tr.common.reload, language)}
              </Button>
              <Button variant="primary" leftIcon={<Download className="h-4 w-4" />} onClick={exportCSV} disabled={!data}>
                {t(tr.adminAnalytics.exportCSV, language)}
              </Button>
            </div>
          }
        />

        {loading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={<BarChart3 className="h-8 w-8 text-ink-400" />}
            title="Could not load analytics"
            description={error}
            action={
              <Button variant="primary" onClick={load}>
                Try again
              </Button>
            }
          />
        ) : data ? (
          <>
            {/* Key metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Metric icon={<Users className="h-5 w-5" />} label={t(tr.adminDash.totalUsers, language)} value={data.totalUsers} hint={`${data.activeUsers} ${t(tr.adminAnalytics.newIn30d, language)}`} />
              <Metric icon={<BookOpen className="h-5 w-5" />} label={t(tr.adminAnalytics.statChildren, language)} value={data.totalChildren} />
              <Metric icon={<Award className="h-5 w-5" />} label={t(tr.adminAnalytics.statVocabulary, language)} value={data.totalVocabulary} />
              <Metric icon={<ShoppingBag className="h-5 w-5" />} label={t(tr.adminAnalytics.statOrders, language)} value={data.totalOrders} hint={`${data.totalPayments} ${t(tr.adminAnalytics.paid, language)}`} />
              <Metric icon={<MessageSquare className="h-5 w-5" />} label={t(tr.adminDash.pendingTickets, language)} value={data.pendingTickets} />
              <Metric icon={<FileText className="h-5 w-5" />} label={t(tr.adminDash.publishedPosts, language)} value={data.publishedPosts} />
              <Metric icon={<TrendingUp className="h-5 w-5" />} label={t(tr.adminAnalytics.statRevenue, language)} value={data.revenue.toLocaleString(undefined, { style: 'currency', currency: 'OMR' })} />
              <Metric icon={<BarChart3 className="h-5 w-5" />} label={t(tr.adminAnalytics.statActiveUsers, language)} value={data.activeUsers} />
            </div>

            {/* Trend chart */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-ink-900 dark:text-ink-50">{t(tr.adminAnalytics.trendTitle, language)}</h2>
                  <p className="text-sm text-ink-500 dark:text-ink-400">{t(tr.adminAnalytics.trendSubtitle, language)}</p>
                </div>
              </div>
              <div className="flex items-end justify-between gap-3 h-56">
                {trend.length === 0 ? (
                  <div className="w-full text-center text-ink-500 dark:text-ink-400 text-sm">{t(tr.adminAnalytics.noTrendData, language)}</div>
                ) : (
                  trend.map((t, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex items-end justify-center mb-2">
                        <div
                          className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-primary-500 to-primary-700 transition-all"
                          style={{ height: `${(t.value / maxTrend) * 100}%`, minHeight: t.value ? 6 : 0 }}
                          title={`${t.value} signups`}
                        />
                      </div>
                      <span className="text-xs text-ink-600 dark:text-ink-300">{t.month}</span>
                      <span className="text-xs font-semibold text-ink-900 dark:text-ink-50">{t.value}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent users */}
              <Card className="p-6">
                <h2 className="text-lg font-bold text-ink-900 dark:text-ink-50 mb-4">{t(tr.adminDash.recentUsers, language)}</h2>
                {data.recentUsers.length === 0 ? (
                  <p className="text-sm text-ink-500 dark:text-ink-400">No recent signups.</p>
                ) : (
                  <div className="space-y-3">
                    {data.recentUsers.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between rounded-xl ring-1 ring-ink-200 dark:ring-ink-700 bg-white dark:bg-ink-800 p-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="grid h-9 w-9 flex-none place-items-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white font-bold text-xs">
                            {u.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-ink-900 dark:text-ink-50 truncate">{u.name}</p>
                            <p className="text-xs text-ink-500 dark:text-ink-400 truncate">{u.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={u.role === 'ADMIN' ? 'accent' : 'primary'}>{u.role}</Badge>
                          <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Recent orders */}
              <Card className="p-6">
                <h2 className="text-lg font-bold text-ink-900 dark:text-ink-50 mb-4">{t(tr.adminDash.recentOrders, language)}</h2>
                {data.recentOrders.length === 0 ? (
                  <p className="text-sm text-ink-500 dark:text-ink-400">No orders yet.</p>
                ) : (
                  <div className="space-y-3">
                    {data.recentOrders.map((o: any) => (
                      <div
                        key={o.id}
                        className="flex items-center justify-between rounded-xl ring-1 ring-ink-200 dark:ring-ink-700 bg-white dark:bg-ink-800 p-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink-900 dark:text-ink-50 truncate">
                            {o.user?.name || 'Unknown'} · {o.plan?.name || 'Plan'}
                          </p>
                          <p className="text-xs text-ink-500 dark:text-ink-400 truncate">{o.orderReference}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-ink-900 dark:text-ink-50">
                            {Number(o.amount || 0).toLocaleString(undefined, {
                              style: 'currency',
                              currency: 'OMR',
                            })}
                          </p>
                          <Badge
                            variant={
                              o.status === 'PAID'
                                ? 'success'
                                : o.status === 'PENDING'
                                  ? 'warning'
                                  : 'neutral'
                            }
                          >
                            {o.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </>
        ) : null}
      </motion.div>
    </AdminLayout>
  )
}

function Metric({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <Card className="p-4 !bg-primary-500 !border-primary-600">
      <div className="flex items-center justify-between">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/20 text-white ring-1 ring-white/30">{icon}</div>
        <span className="text-xs uppercase tracking-wide text-white/70">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-white truncate">{value}</p>
      {hint && <p className="text-xs text-white/70 mt-1">{hint}</p>}
    </Card>
  )
}
