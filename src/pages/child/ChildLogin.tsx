import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Smile, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { childLogin } from '../../services/childService'
import { useChild } from '../../context/ChildContext'

const PIN_LENGTH = 4

export default function ChildLogin() {
  const navigate = useNavigate()
  const isArabic = useMemo(() => window.localStorage.getItem('language') === 'ar', [])
  const { refresh } = useChild()
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [step, setStep] = useState<'username' | 'pin'>('username')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePinDigit = (digit: string) => {
    if (pin.length >= PIN_LENGTH) return
    const next = pin + digit
    setPin(next)

    // Auto-submit when 4 digits are entered
    if (next.length === PIN_LENGTH) {
      void handleLogin(next)
    }
  }

  const handlePinDelete = () => {
    setPin((p) => p.slice(0, -1))
  }

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return
    setError('')
    setStep('pin')
  }

  const handleLogin = async (pinValue: string) => {
    setLoading(true)
    setError('')
    try {
      const result = await childLogin(username.trim(), pinValue)
      // Store the child ID so ChildContext picks it up
      localStorage.setItem('jisr_active_child_id', result.child.id)
      localStorage.setItem('jisr_child_session', 'true')
      await refresh() // Refresh context with new session
      navigate('/child/aac', { replace: true })
    } catch (err: any) {
      setError(err?.message || 'Wrong username or PIN. Try again!')
      setPin('')
    } finally {
      setLoading(false)
    }
  }

  const pinDots = Array.from({ length: PIN_LENGTH }, (_, i) => i < pin.length)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        {/* Logo / mascot area */}
        <div className="mb-6 text-center">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-white/20 shadow-lg backdrop-blur-sm"
          >
            <img
              src={isArabic ? '/logos/JisrApp-12.png' : '/logos/JisrApp-11.png'}
              alt="Jisr"
              className="h-10 w-auto"
            />
          </motion.div>
          <h1 className="mt-4 text-2xl font-bold text-white">
            {step === 'username' ? 'Who are you?' : `Hi there!`}
          </h1>
          <p className="mt-1 text-sm text-white/80">
            {step === 'username'
              ? 'Type your username to get started'
              : 'Enter your secret PIN'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white p-6 shadow-card dark:bg-ink-800">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 rounded-xl bg-accent-50 dark:bg-accent-900/30 px-3 py-2.5 text-sm font-medium text-accent-700 dark:text-accent-300"
            >
              <AlertCircle className="h-4 w-4 flex-none" />
              {error}
            </motion.div>
          )}

          {step === 'username' ? (
            <form onSubmit={handleUsernameSubmit}>
              <label className="mb-2 block text-sm font-semibold text-ink-700 dark:text-ink-200">
                <Smile className="mr-1.5 inline h-4 w-4 text-primary-500" />
                Your Username
              </label>
              <input
                type="text"
                autoFocus
                autoComplete="off"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                placeholder="e.g. liam_2024"
                className="w-full rounded-xl border-2 border-ink-200 dark:border-ink-600 bg-ink-50 dark:bg-ink-900 px-4 py-3.5 text-lg font-semibold text-ink-900 dark:text-ink-50 placeholder:text-ink-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/40"
              />
              <button
                type="submit"
                disabled={!username.trim()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-3.5 text-base font-bold text-white shadow-soft transition-colors hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
          ) : (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-semibold text-ink-700 dark:text-ink-200">
                  <Lock className="mr-1.5 inline h-4 w-4 text-primary-500" />
                  Secret PIN
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep('username')
                    setPin('')
                    setError('')
                  }}
                  className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Change user
                </button>
              </div>

              <p className="mb-4 text-xs text-ink-500 dark:text-ink-400">
                Logging in as <span className="font-bold text-primary-600 dark:text-primary-400">{username}</span>
              </p>

              {/* PIN dots */}
              <div className="flex justify-center gap-3 mb-6">
                {pinDots.map((filled, i) => (
                  <motion.div
                    key={i}
                    animate={filled ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.2 }}
                    className={`h-5 w-5 rounded-full border-2 transition-colors ${
                      filled
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-ink-300 dark:border-ink-600 bg-transparent'
                    }`}
                  />
                ))}
              </div>

              {/* Number pad */}
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map(
                  (key) => {
                    if (key === '') return <div key="empty" />
                    if (key === 'del') {
                      return (
                        <button
                          key="del"
                          type="button"
                          onClick={handlePinDelete}
                          disabled={loading}
                          className="grid h-14 place-items-center rounded-xl bg-ink-100 dark:bg-ink-700 text-sm font-bold text-ink-700 dark:text-ink-200 transition-colors hover:bg-ink-200 dark:hover:bg-ink-600 active:bg-ink-300 disabled:opacity-40"
                        >
                          ←
                        </button>
                      )
                    }
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handlePinDigit(key)}
                        disabled={loading || pin.length >= PIN_LENGTH}
                        className="grid h-14 place-items-center rounded-xl bg-ink-50 dark:bg-ink-900 text-xl font-bold text-ink-900 dark:text-ink-50 transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/30 active:bg-primary-100 disabled:opacity-40"
                      >
                        {key}
                      </button>
                    )
                  }
                )}
              </div>

              {loading && (
                <div className="mt-4 text-center text-sm font-medium text-primary-600 dark:text-primary-400">
                  Logging in...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer link */}
        <p className="mt-4 text-center text-xs text-white/60">
          Are you a parent?{' '}
          <a href="/signin" className="font-semibold text-white/90 hover:underline">
            Sign in here
          </a>
        </p>
      </motion.div>
    </div>
  )
}
