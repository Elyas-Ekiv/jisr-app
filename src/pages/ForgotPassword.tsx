import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import Button from '../components/Button'
import Input from '../components/Input'
import Toast from '../components/Toast'
import { authService } from '../services/authService'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [question, setQuestion] = useState<string | null | undefined>(undefined)
  const [recoveryAnswer, setRecoveryAnswer] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success' as 'success' | 'error',
  })

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ isVisible: true, message, type })
    window.setTimeout(() => setToast((t) => ({ ...t, isVisible: false })), 4000)
  }

  const validateEmailStep = () => {
    const e: Record<string, string> = {}
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) e.email = 'Email is required'
    else if (!emailRe.test(email)) e.email = 'Enter a valid email address'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleLookup = async () => {
    setErrors({})
    if (!validateEmailStep()) return
    setBusy(true)
    try {
      const q = await authService.getRecoveryQuestion(email.trim())
      setQuestion(q)
      if (!q) {
        showToast('No security question is set up for this email. Contact support.', 'error')
      }
    } catch (err: any) {
      showToast(err?.message || 'Could not look up account.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleReset = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const e: Record<string, string> = {}
    if (!recoveryAnswer.trim()) e.recoveryAnswer = 'Answer is required'
    if (!newPassword) e.newPassword = 'New password is required'
    else if (newPassword.length < 8) e.newPassword = 'Use at least 8 characters'
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      e.newPassword = 'Include uppercase, lowercase, and a number'
    }
    if (newPassword !== confirmPw) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setBusy(true)
    try {
      await authService.resetPasswordWithRecovery(email.trim(), recoveryAnswer.trim(), newPassword)
      showToast('Password updated. You can sign in now.', 'success')
      window.setTimeout(() => {
        window.location.href = '/signin'
      }, 900)
    } catch (err: any) {
      showToast(err?.message || 'Reset failed — check your email and answer.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title="Reset password"
      description="We’ll verify your account with the security question you chose at signup."
      hero={{
        title: 'Forgot your password?',
        description:
          'Enter your email, answer your security question, and choose a new password. No email inbox required.',
      }}
    >
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((t) => ({ ...t, isVisible: false }))}
      />

      <div className="space-y-5">
        <div>
          <Input
            name="email"
            type="email"
            label="Email address"
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(ev) => {
              setEmail(ev.target.value)
              setQuestion(undefined)
              if (errors.email) setErrors((x) => ({ ...x, email: '' }))
            }}
            error={errors.email}
            leftIcon={<Mail className="h-4 w-4" />}
            disabled={typeof question === 'string'}
          />
          {question === undefined ? (
            <Button
              type="button"
              variant="secondary"
              className="mt-3"
              fullWidth
              loading={busy}
              onClick={() => void handleLookup()}
            >
              Continue
            </Button>
          ) : null}
        </div>

        {question ? (
          <form onSubmit={handleReset} className="space-y-4 border-t border-ink-100 pt-5">
            <div className="rounded-xl bg-primary-50 px-4 py-3 ring-1 ring-primary-100">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-800 mb-1">
                Your question
              </p>
              <p className="text-sm font-medium text-ink-900">{question}</p>
            </div>

            <Input
              label="Your answer"
              placeholder="Exact answer isn’t needed — capitalization and extra spaces are ignored"
              autoComplete="off"
              value={recoveryAnswer}
              onChange={(ev) => {
                setRecoveryAnswer(ev.target.value)
                if (errors.recoveryAnswer) setErrors((x) => ({ ...x, recoveryAnswer: '' }))
              }}
              error={errors.recoveryAnswer}
            />

            <div>
              <Input
                label="New password"
                type={showPw ? 'text' : 'password'}
                placeholder="Strong password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(ev) => {
                  setNewPassword(ev.target.value)
                  if (errors.newPassword) setErrors((x) => ({ ...x, newPassword: '' }))
                }}
                error={errors.newPassword}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="pointer-events-auto rounded-md p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
            </div>

            <Input
              label="Confirm new password"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPw}
              onChange={(ev) => {
                setConfirmPw(ev.target.value)
                if (errors.confirmPassword) setErrors((x) => ({ ...x, confirmPassword: '' }))
              }}
              error={errors.confirmPassword}
              leftIcon={<Lock className="h-4 w-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={busy}
              rightIcon={!busy ? <ArrowRight className="h-4 w-4" /> : undefined}
            >
              Update password
            </Button>

            <button
              type="button"
              className="w-full text-sm font-medium text-ink-500 hover:text-primary-700"
              onClick={() => {
                setQuestion(undefined)
                setRecoveryAnswer('')
                setNewPassword('')
                setConfirmPw('')
                setErrors({})
              }}
            >
              Start over with a different email
            </button>
          </form>
        ) : null}
      </div>

      <p className="mt-8 text-center text-sm text-ink-600">
        Remembered your password?{' '}
        <Link to="/signin" className="font-semibold text-primary-700 hover:text-primary-800">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
