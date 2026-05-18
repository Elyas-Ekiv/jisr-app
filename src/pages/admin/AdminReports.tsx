import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Download,
  Users,
  BookOpen,
  TrendingUp,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react'
import AdminLayout from '../../layouts/AdminLayout'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import PageHeader from '../../components/PageHeader'
import Toast from '../../components/Toast'
import { adminService, PlatformAnalytics } from '../../services/adminService'
import { useLanguage } from '../../context/LanguageContext'
import { tr, t } from '../../i18n/translations'

interface ReportTemplate {
  id: 'users' | 'orders' | 'engagement' | 'monthly-trend'
  title: string
  description: string
  icon: any
  build: (data: PlatformAnalytics) => { filename: string; rows: (string | number)[][] }
}

// Report templates moved inside component for localization

const downloadCSV = (filename: string, rows: (string | number)[][]) => {
  const csv = rows
    .map((r) =>
      r
        .map((c) => {
          const s = String(c ?? '')
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
        })
        .join(',')
    )
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminReports() {
  const { language } = useLanguage()
  const isAr = language === 'ar'
  const [data, setData] = useState<PlatformAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<string | null>(null)
  const [toast, setToast] = useState({
    isVisible: false,
    type: 'success' as 'success' | 'info' | 'warning' | 'error',
    title: '',
    message: '',
  })

  const TEMPLATES: ReportTemplate[] = [
    {
      id: 'users',
      title: t(tr.adminReports.repUsersTitle, language),
      description: t(tr.adminReports.repUsersDesc, language),
      icon: Users,
      build: (data) => ({
        filename: `jisr-users-${Date.now()}.csv`,
        rows: [
          ['Name', 'Email', 'Role', 'Account type', 'Joined'],
          ...data.recentUsers.map((u: any) => [
            u.name,
            u.email,
            u.role,
            u.accountType || '',
            new Date(u.createdAt).toISOString(),
          ]),
        ],
      }),
    },
    {
      id: 'orders',
      title: t(tr.adminReports.repOrdersTitle, language),
      description: t(tr.adminReports.repOrdersDesc, language),
      icon: ShoppingBag,
      build: (data) => ({
        filename: `jisr-orders-${Date.now()}.csv`,
        rows: [
          ['Reference', 'User', 'Plan', 'Amount', 'Status', 'Created'],
          ...data.recentOrders.map((o: any) => [
            o.orderReference || o.id,
            `${o.user?.name || ''} <${o.user?.email || ''}>`,
            o.plan?.name || '',
            o.amount,
            o.status,
            new Date(o.createdAt).toISOString(),
          ]),
        ],
      }),
    },
    {
      id: 'engagement',
      title: t(tr.adminReports.repEngagementTitle, language),
      description: t(tr.adminReports.repEngagementDesc, language),
      icon: TrendingUp,
      build: (data) => ({
        filename: `jisr-engagement-${Date.now()}.csv`,
        rows: [
          ['Metric', 'Value'],
          ['Total users', data.totalUsers],
          ['Active users (30d)', data.activeUsers],
          ['Children profiles', data.totalChildren],
          ['Vocabulary entries', data.totalVocabulary],
          ['Orders', data.totalOrders],
          ['Completed payments', data.totalPayments],
          ['Pending tickets', data.pendingTickets],
          ['Published posts', data.publishedPosts],
          ['Revenue (OMR)', data.revenue],
        ],
      }),
    },
    {
      id: 'monthly-trend',
      title: t(tr.adminReports.repTrendTitle, language),
      description: t(tr.adminReports.repTrendDesc, language),
      icon: BookOpen,
      build: (data) => ({
        filename: `jisr-signup-trend-${Date.now()}.csv`,
        rows: [
          ['Month', 'New users'],
          ...data.monthlyTrend.map((t) => [t.month, t.value]),
        ],
      }),
    },
  ]

  const showToast = (
    title: string,
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'success'
  ) => {
    setToast({ isVisible: true, title, message, type })
    setTimeout(() => setToast((t) => ({ ...t, isVisible: false })), 3000)
  }

  const load = async () => {
    setLoading(true)
    try {
      const a = await adminService.getAnalytics()
      setData(a)
    } catch (err: any) {
      showToast('Failed to load', err?.message || 'Please retry.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleGenerate = (tpl: ReportTemplate) => {
    if (!data) return
    try {
      const { filename, rows } = tpl.build(data)
      if (rows.length <= 1) {
        showToast('No data yet', `${tpl.title} has no records to export.`, 'info')
        return
      }
      downloadCSV(filename, rows)
      showToast('Report generated', `Downloaded ${filename}`, 'success')
    } catch (err: any) {
      showToast('Failed to generate', err?.message || 'Could not build the report.', 'error')
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
          title={t(tr.adminReports.title, language)}
          description={t(tr.adminReports.description, language)}
          actions={
            <Button variant="ghost" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={load} disabled={loading}>
              {t(tr.common.reload, language)}
            </Button>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {TEMPLATES.map((tpl) => {
            const Icon = tpl.icon
            return (
              <motion.div
                key={tpl.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="h-full p-6 flex flex-col">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                   <h3 className="mt-4 font-bold text-ink-900 dark:text-ink-50">
                    {tpl.title}
                   </h3>
                   <p className="text-sm text-ink-500 dark:text-ink-400 mt-1 flex-1">
                    {tpl.description}
                   </p>
                   <div className="mt-4">
                     <Button
                       variant="primary"
                       fullWidth
                       leftIcon={<Download className="h-4 w-4" />}
                       onClick={() => handleGenerate(tpl)}
                       disabled={!data}
                     >
                       {t(tr.adminReports.btnGenerate, language)}
                     </Button>
                   </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Quick context */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-ink-900 dark:text-ink-50 mb-2">What's in a report?</h2>
          <p className="text-sm text-ink-600 dark:text-ink-300 mb-4">
            Reports are pulled live from the platform. Connect them to therapists, schools or
            stakeholders in just a click.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="primary" icon={<FileText className="h-3 w-3" />}>CSV</Badge>
            <Badge variant="success">Live data</Badge>
            <Badge variant="sky">Privacy-aware</Badge>
            <Badge variant="neutral">Spreadsheet-ready</Badge>
          </div>
        </Card>
      </motion.div>
    </AdminLayout>
  )
}
