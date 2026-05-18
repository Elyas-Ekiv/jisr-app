import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Baby, Shield, ChevronDown, Check } from 'lucide-react'

type AccountId = 'parent' | 'child' | 'admin'

const ACCOUNT_TYPES: Array<{
  id: AccountId
  name: string
  icon: typeof User
  path: string
  description: string
  tone: string
}> = [
  {
    id: 'parent',
    name: 'Parent',
    icon: User,
    path: '/dashboard',
    description: 'Manage your family and boards',
    tone: 'bg-primary-50 text-primary-700 ring-primary-100',
  },
  {
    id: 'child',
    name: 'Child',
    icon: Baby,
    path: '/child/aac',
    description: 'Use the communication board',
    tone: 'bg-sunny-50 text-sunny-700 ring-sunny-100',
  },
  {
    id: 'admin',
    name: 'Admin',
    icon: Shield,
    path: '/admin/dashboard',
    description: 'Run the platform',
    tone: 'bg-ink-100 text-ink-800 ring-ink-200',
  },
]

export default function AccountSwitcher() {
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const detect = (): AccountId => {
    if (location.pathname.startsWith('/child')) return 'child'
    if (location.pathname.startsWith('/admin')) return 'admin'
    return 'parent'
  }
  const [current, setCurrent] = useState<AccountId>(detect())

  useEffect(() => {
    setCurrent(detect())
  }, [location.pathname])

  const currentAcc =
    ACCOUNT_TYPES.find((a) => a.id === current) || ACCOUNT_TYPES[0]

  const switchTo = (acc: (typeof ACCOUNT_TYPES)[number]) => {
    setOpen(false)
    setCurrent(acc.id)
    navigate(acc.path)
  }

  const Current = currentAcc.icon

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
      >
        <span
          className={`grid h-7 w-7 place-items-center rounded-lg ring-1 ${currentAcc.tone}`}
        >
          <Current className="h-4 w-4" />
        </span>
        <span className="hidden sm:inline text-white/90">{currentAcc.name}</span>
        <ChevronDown
          className={`h-4 w-4 text-white/70 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card"
            >
              <div className="px-4 py-3 border-b border-ink-100">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-ink-500">
                  Switch account
                </div>
              </div>
              <div className="p-1.5">
                {ACCOUNT_TYPES.map((acc) => {
                  const Icon = acc.icon
                  const active = current === acc.id
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => switchTo(acc)}
                      className={[
                        'flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors',
                        active ? 'bg-primary-50 ring-1 ring-primary-100' : 'hover:bg-ink-100',
                      ].join(' ')}
                    >
                      <span
                        className={`grid h-9 w-9 flex-none place-items-center rounded-xl ring-1 ${acc.tone}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-ink-900">{acc.name}</span>
                          {active ? (
                            <Check className="h-3.5 w-3.5 text-primary-600" />
                          ) : null}
                        </div>
                        <div className="text-xs text-ink-500">{acc.description}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
