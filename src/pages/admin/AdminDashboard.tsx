import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  Shield,
  Activity,
  ArrowRight,
  Clock,
  Newspaper,
  HelpCircle,
  Settings,
  TrendingUp,
} from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import PageHeader from '../../components/PageHeader'
import Skeleton from '../../components/Skeleton'
import { adminService, PlatformAnalytics } from '../../services/adminService'
import { useLanguage } from '../../context/LanguageContext'
import { tr, t } from '../../i18n/translations'

export default function AdminDashboard() {
  const { language } = useLanguage()
  const isAr = language === 'ar'
  const [data, setData] = useState<PlatformAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  const QUICK_ACTIONS = [
    { title: t(tr.adminDash.actionUsers, language), description: t(tr.adminDash.actionUsersDesc, language), icon: Users, path: '/admin/users', tone: 'primary' as const },
    { title: t(tr.adminDash.actionBlog, language), description: t(tr.adminDash.actionBlogDesc, language), icon: Newspaper, path: '/admin/blog', tone: 'sky' as const },
    { title: t(tr.adminDash.actionSupport, language), description: t(tr.adminDash.actionSupportDesc, language), icon: HelpCircle, path: '/admin/support', tone: 'sunny' as const },
    { title: t(tr.adminDash.actionAnalytics, language), description: t(tr.adminDash.actionAnalyticsDesc, language), icon: BarChart3, path: '/admin/analytics', tone: 'accent' as const },
    { title: t(tr.adminDash.actionSettings, language), description: t(tr.adminDash.actionSettingsDesc, language), icon: Settings, path: '/admin/settings', tone: 'primary' as const },
    { title: t(tr.adminDash.actionReports, language), description: t(tr.adminDash.actionReportsDesc, language), icon: FileText, path: '/admin/reports', tone: 'sky' as const },
  ]

  useEffect(() => {
    let cancelled = false
      ; (async () => {
        try {
          const analytics = await adminService.getAnalytics()
          if (!cancelled) setData(analytics)
        } catch {
          // The page should still render quick actions even if analytics fails.
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
    return () => {
      cancelled = true
    }
  }, [])

  const stats = [
    {
      title: t(tr.adminDash.totalUsers, language),
      value: data?.totalUsers ?? 0,
      hint: data ? `${data.activeUsers} ${t(tr.adminAnalytics.newIn30d, language)}` : '',
      icon: Users,
      tone: 'primary' as const,
    },
    {
      title: t(tr.adminDash.totalChildren, language),
      value: data?.activeUsers ?? 0,
      hint: isAr ? 'آخر 30 يوماً' : 'Past 30 days',
      icon: Activity,
      tone: 'sky' as const,
    },
    {
      title: t(tr.adminDash.pendingTickets, language),
      value: data?.pendingTickets ?? 0,
      hint: isAr ? 'تحتاج رداً' : 'Need a response',
      icon: MessageSquare,
      tone: 'sunny' as const,
    },
    {
      title: t(tr.adminDash.publishedPosts, language),
      value: data?.publishedPosts ?? 0,
      hint: isAr ? 'منشورة على المدونة' : 'Live on the blog',
      icon: FileText,
      tone: 'accent' as const,
    },
  ]

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-7xl">
        <PageHeader
          eyebrow="Admin"
          title={t(tr.adminDash.title, language)}
          description={t(tr.adminDash.subtitle, language)}
          actions={
            <Badge variant="danger" icon={<Shield className="h-3.5 w-3.5" />}>
              {isAr ? 'صلاحيات المشرف' : 'Admin access'}
            </Badge>
          }
          className="mb-8"
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {QUICK_ACTIONS.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link to={a.path} className="block h-full">
                <Card padding="md" hover variant="primary" className="group h-full hover:bg-primary-700 hover:border-primary-800 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl ring-1 bg-white/20 text-white ring-white/30">
                      <a.icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-semibold text-white">{a.title}</div>
                      <div className="text-sm text-white/80">{a.description}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/70 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.title} padding="md" className="!bg-primary-500 !border-primary-600">
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 text-white ring-1 ring-white/30">
                  <s.icon className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                  {s.title}
                </span>
              </div>
              <div className="mt-5 truncate text-2xl font-extrabold text-white">
                {loading ? <Skeleton className="h-7 w-24" /> : s.value.toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-white/70">{s.hint}</div>
            </Card>
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Card padding="md">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink-900 dark:text-ink-50">{t(tr.adminDash.recentUsers, language)}</h2>
              <Link to="/admin/users">
                <Button variant="ghost" size="sm">{t(tr.adminDash.viewAll, language)}</Button>
              </Link>
            </div>
            <div className="mt-4 space-y-2.5">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)
              ) : data && data.recentUsers.length > 0 ? (
                data.recentUsers.slice(0, 5).map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 dark:border-ink-700 bg-white dark:bg-ink-800 px-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-xs font-bold text-white">
                        {u.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-ink-900 dark:text-ink-50">{u.name}</div>
                        <div className="truncate text-xs text-ink-500 dark:text-ink-400">{u.email}</div>
                        <div className="text-[11px] text-ink-500 dark:text-ink-400">
                          Joined {new Date(u.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant={u.role === 'ADMIN' ? 'accent' : 'primary'} size="sm">
                      {u.role}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-ink-500 dark:text-ink-400">No users yet.</p>
              )}
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink-900 dark:text-ink-50">{t(tr.adminDash.recentOrders, language)}</h2>
              <Link to="/admin/analytics">
                <Button variant="ghost" size="sm">{t(tr.adminDash.viewAll, language)}</Button>
              </Link>
            </div>
            <div className="mt-4 space-y-2.5">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)
              ) : data && data.recentOrders.length > 0 ? (
                data.recentOrders.slice(0, 5).map((o: any) => (
                  <div
                    key={o.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-ink-100 dark:border-ink-700 bg-white dark:bg-ink-800 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                        <span className="truncate text-sm font-semibold text-ink-900 dark:text-ink-50">
                          {o.plan?.name || 'Plan'} ·{' '}
                          {Number(o.amount || 0).toLocaleString(undefined, {
                            style: 'currency',
                            currency: 'OMR',
                          })}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-ink-600 dark:text-ink-300">
                        {o.user?.name || 'Unknown'} · {o.user?.email}
                      </div>
                      <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-ink-500 dark:text-ink-400">
                        <Clock className="h-3 w-3" />
                        {new Date(o.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <Badge
                      variant={
                        o.status === 'PAID'
                          ? 'success'
                          : o.status === 'PENDING'
                            ? 'warning'
                            : 'neutral'
                      }
                      size="sm"
                    >
                      {o.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-ink-500 dark:text-ink-400">No orders yet.</p>
              )}
            </div>
          </Card>
        </div>
      </motion.div>
    </AdminLayout>
  )
}
