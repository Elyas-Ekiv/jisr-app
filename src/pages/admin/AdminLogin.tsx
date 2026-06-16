import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Shield, Eye, EyeOff } from 'lucide-react'
import AuthLayout from '../../components/AuthLayout'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Toast from '../../components/Toast'
import Badge from '../../components/Badge'
import { authService } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { tr, t } from '../../i18n/translations'

export default function AdminLogin() {
  const { language } = useLanguage()
  const isAr = language === 'ar'
  const navigate = useNavigate()
  const { refetch } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [toast, setToast] = useState<{
    isVisible: boolean
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
  }>({ isVisible: false, message: '', type: 'success' })

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'success'
  ) => {
    setToast({ isVisible: true, message, type })
    window.setTimeout(() => setToast((t) => ({ ...t, isVisible: false })), 3500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((p) => ({ ...p, [name]: value }))
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) errs.email = 'Email is required'
    else if (!emailRe.test(formData.email)) errs.email = 'Enter a valid email'
    if (!formData.password) errs.password = 'Password is required'
    else if (formData.password.length < 6) errs.password = 'Min 6 characters'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const auth = await authService.login({
        email: formData.email,
        password: formData.password,
      })
      if (auth.user?.role !== 'ADMIN') {
        await authService.logout(undefined, { hardReload: false })
        showToast('This account is not an administrator.', 'error')
        return
      }
      showToast('Welcome to the admin console.', 'success')
      await refetch()
      navigate('/admin/dashboard')
    } catch (err: any) {
      showToast(err?.message || 'Sign-in failed.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title={t(tr.adminLogin.title, language)}
      description={t(tr.adminLogin.subtitle, language)}
      hero={{
        title: t(tr.adminLogin.heroTitle, language),
        description: t(tr.adminLogin.heroDesc, language),
      }}
    >
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((t) => ({ ...t, isVisible: false }))}
      />

      <div className="mb-5">
        <Badge variant="danger" icon={<Shield className="h-3.5 w-3.5" />}>
          {t(tr.adminLogin.restricted, language)}
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Input
          name="email"
          type="email"
          label={t(tr.adminLogin.email, language)}
          placeholder="admin@jisr.app"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          leftIcon={<Mail className="h-4 w-4" />}
        />

        <Input
          name="password"
          type={showPw ? 'text' : 'password'}
          label={t(tr.adminLogin.password, language)}
          placeholder="••••••••"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
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

        <Button
          type="submit"
          variant="secondary"
          size="lg"
          fullWidth
          loading={submitting}
          rightIcon={!submitting ? <ArrowRight className="h-4 w-4" /> : undefined}
        >
          {t(tr.adminLogin.signIn, language)}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-ink-600">
        {t(tr.adminLogin.notAdmin, language)}{' '}
        <Link to="/signin" className="font-semibold text-primary-700 hover:text-primary-800">
          {t(tr.adminLogin.signInUser, language)}
        </Link>
      </div>
    </AuthLayout>
  )
}
