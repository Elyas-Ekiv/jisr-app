import React, { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import Button from '../components/Button'
import Input from '../components/Input'
import Toast from '../components/Toast'
import { authService } from '../services/authService'

type AccountType = 'parent'

const RECOVERY_QUESTIONS: { key: string; label: string }[] = [
  { key: 'city_birth', label: 'What city were you born in?' },
  { key: 'first_pet', label: 'What was the name of your first pet?' },
  { key: 'mother_maiden', label: 'What is your mother’s maiden name?' },
]

function passwordStrength(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

import { useLanguage } from '../context/LanguageContext'

export default function SignUp() {
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const planParam = searchParams.get('plan') || ''

  const accountType = 'parent' as AccountType

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    recoveryQuestionKey: RECOVERY_QUESTIONS[0].key,
    recoveryAnswer: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [agree, setAgree] = useState(false)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((p) => ({ ...p, [name]: value }))
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }))
  }

  const strength = useMemo(() => passwordStrength(formData.password), [formData.password])
  const strengthLabels = ['Too short', 'Weak', 'Fair', 'Strong', 'Very strong'] as const
  const strengthColors = ['bg-ink-200', 'bg-accent-400', 'bg-sunny-400', 'bg-emerald-500', 'bg-emerald-600']

  const recoveryQuestionLabel =
    RECOVERY_QUESTIONS.find((q) => q.key === formData.recoveryQuestionKey)?.label || ''

  const validate = () => {
    const errs: Record<string, string> = {}
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.name.trim()) errs.name = 'Full name is required'
    else if (formData.name.trim().length < 2) errs.name = 'Name must be at least 2 characters'
    if (!formData.email) errs.email = 'Email is required'
    else if (!emailRe.test(formData.email)) errs.email = 'Enter a valid email address'
    if (!formData.password) errs.password = 'Password is required'
    else if (formData.password.length < 8) errs.password = 'Password must be at least 8 characters'
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errs.password = 'Include uppercase, lowercase, and at least one number'
    }
    if (formData.password !== formData.confirmPassword)
      errs.confirmPassword = 'Passwords do not match'
    if (!formData.recoveryAnswer.trim())
      errs.recoveryAnswer = 'Security answer is required'
    else if (formData.recoveryAnswer.trim().length < 2)
      errs.recoveryAnswer = 'Answer must be at least 2 characters'
    else if (formData.recoveryAnswer.trim().length > 128)
      errs.recoveryAnswer = 'Answer is too long'
    if (!agree) errs.terms = 'Please agree to the Terms and Privacy Policy'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const auth = await authService.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        accountType,
        recoveryQuestion: recoveryQuestionLabel,
        recoveryAnswer: formData.recoveryAnswer.trim(),
      })
      showToast('Account created — welcome!', 'success')
      const role = auth.user?.role
      let dest = '/dashboard'
      if (role === 'ADMIN') dest = '/admin/dashboard'
      if (planParam) dest = `/payment?plan=${planParam}`
      window.setTimeout(() => navigate(dest), 400)
    } catch (err: any) {
      setSubmitting(false)
      if (err?.details && Array.isArray(err.details)) {
        const backendErrors: Record<string, string> = {}
        err.details.forEach((detail: any) => {
          if (detail.field) {
            backendErrors[detail.field] = detail.message
          }
        })
        setErrors(backendErrors)
        showToast('Please fix the errors below.', 'error')
      } else {
        showToast(err?.message || 'Could not create the account. Please try again.', 'error')
      }
    }
  }

  return (
    <AuthLayout
      title={language === 'ar' ? 'إنشاء حسابك' : 'Create your account'}
      description={language === 'ar' ? 'ابدأ في بناء لوحة تواصل طفلك في دقائق.' : "Start building your child's communication board in minutes."}
      hero={{
        title: language === 'ar' ? 'لوحة تنمو مع طفلك.' : 'A board that grows with your child.',
        description: language === 'ar' ? 'أضف الكلمات والصور، ونظم الفئات، وشاهد طفلك يبني جملًا يمكنه سماعها بصوت عالٍ.' : 'Add words and pictures, organize categories, and watch your child build sentences they can hear out loud.',
      }}
    >
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((t) => ({ ...t, isVisible: false }))}
      />

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Input
          name="name"
          type="text"
          label={language === 'ar' ? 'الاسم الكامل' : 'Full name'}
          placeholder={language === 'ar' ? 'أحمد محمد' : 'Alex Hernandez'}
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          leftIcon={<UserIcon className="h-4 w-4" />}
        />

        <Input
          name="email"
          type="email"
          label={language === 'ar' ? 'البريد الإلكتروني' : 'Email address'}
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          leftIcon={<Mail className="h-4 w-4" />}
        />

        <div>
          <label className="mb-2 block text-sm font-semibold text-ink-800">{language === 'ar' ? 'سؤال الأمان' : 'Security question'}</label>
          <p className="mb-2 text-xs text-ink-500">
            {language === 'ar' ? 'اختر سؤالاً — ستجيب عليه لاحقاً إذا نسيت كلمة المرور.' : 'Choose one question — you’ll answer it later if you forget your password.'}
          </p>
          <select
            name="recoveryQuestionKey"
            value={formData.recoveryQuestionKey}
            onChange={handleChange}
            className="field-input"
          >
            {RECOVERY_QUESTIONS.map((q) => (
              <option key={q.key} value={q.key}>
                {q.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          name="recoveryAnswer"
          type="text"
          label={language === 'ar' ? 'الإجابة على سؤال الأمان' : 'Answer to security question'}
          placeholder={language === 'ar' ? 'شيء تتذكره — لا يهم حالة الأحرف' : 'Something you’ll remember — not case sensitive'}
          autoComplete="off"
          value={formData.recoveryAnswer}
          onChange={handleChange}
          error={errors.recoveryAnswer}
        />

        <div>
          <Input
            name="password"
            type={showPw ? 'text' : 'password'}
            label={language === 'ar' ? 'كلمة المرور' : 'Password'}
            placeholder={language === 'ar' ? '8 أحرف على الأقل' : 'At least 8 characters'}
            autoComplete="new-password"
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
          {formData.password ? (
            <div className="mt-2">
              <div className="grid grid-cols-4 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={[
                      'h-1.5 rounded-full transition-colors',
                      i < strength ? strengthColors[strength] : 'bg-ink-100',
                    ].join(' ')}
                  />
                ))}
              </div>
              <p className="mt-1 text-[11px] font-medium text-ink-600">
                {strengthLabels[Math.min(strength, 4)]}
              </p>
            </div>
          ) : null}
        </div>

        <Input
          name="confirmPassword"
          type={showPw ? 'text' : 'password'}
          label={language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm password'}
          placeholder={language === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter your password'}
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          leftIcon={<Lock className="h-4 w-4" />}
        />

        <label className="flex items-start gap-2.5 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => {
              setAgree(e.target.checked)
              if (errors.terms) setErrors((p) => ({ ...p, terms: '' }))
            }}
            className="mt-1 h-4 w-4 rounded border-ink-300 text-primary-600 focus:ring-2 focus:ring-primary-200"
          />
          <span>
            {language === 'ar' ? 'أوافق على ' : 'I agree to the '}
            <a href="#" className="font-semibold text-primary-700 hover:underline">{language === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}</a>{' '}
            {language === 'ar' ? 'و' : 'and'}{' '}
            <a href="#" className="font-semibold text-primary-700 hover:underline">{language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</a>.
          </span>
        </label>
        {errors.terms ? (
          <p className="-mt-3 text-xs font-medium text-accent-600">{errors.terms}</p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={submitting}
          rightIcon={!submitting ? <ArrowRight className="h-4 w-4" /> : undefined}
        >
          {language === 'ar' ? 'إنشاء حساب' : 'Create account'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-ink-600">
        {language === 'ar' ? 'هل لديك حساب بالفعل؟ ' : 'Already have an account? '}
        <Link to="/signin" className="font-semibold text-primary-700 hover:text-primary-800">
          {language === 'ar' ? 'تسجيل الدخول' : 'Sign in'}
        </Link>
        {' · '}
        <Link to="/forgot-password" className="font-semibold text-primary-700 hover:text-primary-800">
          {language === 'ar' ? 'هل نسيت كلمة المرور؟' : 'Forgot password?'}
        </Link>
      </div>
    </AuthLayout>
  )
}
