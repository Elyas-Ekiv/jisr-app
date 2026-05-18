import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Bell,
  Palette,
  Globe,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Grid,
  Type
} from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Toast from '../components/Toast'
import { userService, User as UserType } from '../services/userService'
import {
  applyPreferencesToDocument,
  useUserPreferences,
} from '../context/UserPreferencesContext'
import { useLanguage } from '../context/LanguageContext'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    weeklyReport: true
  })
  const { preferences, loading: preferencesContextLoading, savePreferences } = useUserPreferences()
  const { language: globalLang, setLanguage: setGlobalLang } = useLanguage()

  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light')
  const [language, setLanguage] = useState<'en' | 'ar'>(globalLang)
  const [soundEffects, setSoundEffects] = useState(true)
  const [backgroundMusic, setBackgroundMusic] = useState(false)
  const [gridView, setGridView] = useState(true)
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'extra-large'>('medium')
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' as 'success' | 'error' | 'info' | 'warning' })

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true)
        const userData = await userService.getUser()
        setUser(userData)
        setProfileForm({
          name: userData.name,
          email: userData.email,
        })
      } catch (error) {
        console.error('Failed to load user:', error)
        showToast('Failed to load user data', 'error')
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  useEffect(() => {
    if (activeTab !== 'preferences' || !preferences) return
    const lang: 'en' | 'ar' = preferences.language === 'ar' ? 'ar' : 'en'
    setTheme(
      preferences.theme === 'dark' || preferences.theme === 'auto' || preferences.theme === 'light'
        ? preferences.theme
        : 'light'
    )
    setLanguage(lang)
    setSoundEffects(preferences.soundEffects)
    setBackgroundMusic(preferences.backgroundMusic)
    setGridView(preferences.gridView)
    setFontSize(
      ['small', 'medium', 'large', 'extra-large'].includes(preferences.fontSize)
        ? preferences.fontSize
        : 'medium'
    )
  }, [activeTab, preferences])

  useEffect(() => {
    if (activeTab !== 'preferences' || !preferences) return
    applyPreferencesToDocument({
      ...preferences,
      theme,
      language,
      soundEffects,
      backgroundMusic,
      contrast: 'normal',
      gridView,
      fontSize,
    })
  }, [
    activeTab,
    preferences,
    theme,
    language,
    soundEffects,
    backgroundMusic,
    gridView,
    fontSize,
  ])

  const handleSavePreferences = async () => {
    try {
      setGlobalLang(language)
      await savePreferences({
        theme,
        language,
        soundEffects,
        backgroundMusic,
        contrast: 'normal',
        gridView,
        fontSize,
      })
      showToast('Preferences saved successfully!', 'success')
    } catch (error: any) {
      console.error('Failed to save preferences:', error)
      showToast(error.message || 'Failed to save preferences', 'error')
    }
  }


  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToast({ isVisible: true, message, type })
    setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 3000)
  }

  const tabs = [
    { id: 'profile', label: language === 'ar' ? 'الملف الشخصي' : 'Profile', icon: User },
    { id: 'notifications', label: language === 'ar' ? 'الإشعارات' : 'Notifications', icon: Bell },
    { id: 'preferences', label: language === 'ar' ? 'التفضيلات' : 'Preferences', icon: Palette },
  ]

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    try {
      await userService.updateUser(user.id, {
        name: profileForm.name,
        email: profileForm.email,
      })
      showToast('Profile updated successfully!', 'success')
      const updatedUser = await userService.getUser()
      setUser(updatedUser)
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      showToast(error.message || 'Failed to update profile', 'error')
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordForm.currentPassword) {
      showToast('Current password is required', 'error')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error')
      return
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) {
      showToast('New password needs uppercase, lowercase, and a number', 'error')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }
    try {
      await userService.changePassword(passwordForm.currentPassword, passwordForm.newPassword)
      showToast('Password updated successfully!', 'success')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      console.error('Failed to change password:', error)
      showToast(error.message || 'Failed to change password', 'error')
    }
  }

  const getUserInitials = () => {
    if (!user?.name) return 'U'
    const names = user.name.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    }
    return user.name.substring(0, 2).toUpperCase()
  }

  /* Shared toggle switch classes */
  const toggleTrack = 'w-11 h-6 bg-ink-200 dark:bg-ink-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ink-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600'

  return (
    <DashboardLayout>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink-900 dark:text-ink-50 mb-2">{language === 'ar' ? 'الإعدادات' : 'Settings'}</h1>
          <p className="text-ink-600 dark:text-ink-300">
            {language === 'ar' ? 'إدارة إعدادات حسابك وتفضيلاتك' : 'Manage your account settings and preferences'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <Card className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                        ${activeTab === tab.id
                          ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300'
                          : 'text-ink-700 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-700'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="p-6">
                  <h2 className="text-2xl font-bold text-ink-900 dark:text-ink-50 mb-6">{language === 'ar' ? 'معلومات الملف الشخصي' : 'Profile Information'}</h2>
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    {loading ? (
                      <div className="animate-pulse space-y-4">
                        <div className="h-20 bg-ink-200 dark:bg-ink-700 rounded-full w-20"></div>
                        <div className="h-10 bg-ink-200 dark:bg-ink-700 rounded"></div>
                        <div className="h-10 bg-ink-200 dark:bg-ink-700 rounded"></div>
                      </div>
                    ) : (
                      <>
                        {/* Avatar */}
                        <div className="flex items-center space-x-6">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                            {getUserInitials()}
                          </div>
                          <div>
                            <Button variant="ghost" type="button">
                              {language === 'ar' ? 'تغيير الصورة' : 'Change Photo'}
                            </Button>
                            <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
                              {language === 'ar' ? 'JPG، GIF أو PNG. أقصى حجم 2 ميجابايت' : 'JPG, GIF or PNG. Max size 2MB'}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Input
                            label={language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            required
                          />
                        </div>

                        <Input
                          label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          required
                        />
                      </>
                    )}

                    <div className="flex flex-wrap justify-end gap-3 pt-4">
                      <Button variant="ghost" type="button">
                        {language === 'ar' ? 'إلغاء' : 'Cancel'}
                      </Button>
                      <Button variant="primary" type="submit">
                        {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>

                  <form onSubmit={handleChangePassword} className="border-t border-ink-200 dark:border-ink-700 mt-10 pt-8 space-y-4">
                    <h3 className="text-lg font-semibold text-ink-900 dark:text-ink-50">{language === 'ar' ? 'تغيير كلمة المرور' : 'Change password'}</h3>
                    <div className="relative">
                      <Input
                        label={language === 'ar' ? 'كلمة المرور الحالية' : 'Current password'}
                        type={showPassword ? 'text' : 'password'}
                        placeholder={language === 'ar' ? 'أدخل كلمة المرور الحالية' : 'Enter current password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-[38px] text-ink-400 hover:text-ink-600 dark:text-ink-500 dark:hover:text-ink-300"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <Input
                      label={language === 'ar' ? 'كلمة المرور الجديدة' : 'New password'}
                      type="password"
                      placeholder={language === 'ar' ? 'يجب أن تحتوي على حروف كبيرة وصغيرة ورقم' : 'Must include uppercase, lowercase, and a number'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                    />
                    <Input
                      label={language === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm new password'}
                      type="password"
                      placeholder={language === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm new password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                    />
                    <Button type="submit" variant="primary">
                      {language === 'ar' ? 'تحديث كلمة المرور' : 'Update password'}
                    </Button>
                  </form>
                </Card>
              </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="p-6">
                  <h2 className="text-2xl font-bold text-ink-900 dark:text-ink-50 mb-6">{language === 'ar' ? 'تفضيلات الإشعارات' : 'Notification Preferences'}</h2>
                  <div className="space-y-6">
                    {[
                      { key: 'email', label: language === 'ar' ? 'إشعارات البريد' : 'Email Notifications', description: language === 'ar' ? 'تلقي التحديثات عبر البريد' : 'Receive updates via email' },
                      { key: 'weeklyReport', label: language === 'ar' ? 'تقرير التقدم الأسبوعي' : 'Weekly Progress Report', description: language === 'ar' ? 'احصل على ملخص كل أسبوع' : 'Get a summary every week' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 border border-ink-200 dark:border-ink-700 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-ink-900 dark:text-ink-50">{item.label}</h3>
                          <p className="text-sm text-ink-500 dark:text-ink-400">{item.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications[item.key as keyof typeof notifications]}
                            onChange={(e) => setNotifications({
                              ...notifications,
                              [item.key]: e.target.checked
                            })}
                            className="sr-only peer"
                          />
                          <div className={toggleTrack}></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="p-6">
                  <h2 className="text-2xl font-bold text-ink-900 dark:text-ink-50 mb-6">Preferences</h2>
                  <div className="space-y-6">
                    {activeTab === 'preferences' && preferencesContextLoading && !preferences ? (
                      <div className="space-y-4 animate-pulse">
                        <div className="h-20 bg-ink-200 dark:bg-ink-700 rounded"></div>
                        <div className="h-16 bg-ink-200 dark:bg-ink-700 rounded"></div>
                        <div className="h-24 bg-ink-200 dark:bg-ink-700 rounded"></div>
                      </div>
                    ) : (
                      <>
                        {/* Theme */}
                        <div>
                          <h3 className="text-lg font-semibold text-ink-900 dark:text-ink-100 mb-4">Theme</h3>
                          <div className="flex gap-3">
                            {(['light', 'dark', 'auto'] as const).map((t) => (
                              <button
                                key={t}
                                onClick={() => setTheme(t)}
                                className={`
                                  flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-colors capitalize
                                  ${theme === t
                                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200 dark:border-primary-500'
                                    : 'border-ink-200 hover:border-ink-300 dark:border-ink-600 dark:hover:border-ink-500 dark:text-ink-200'
                                  }
                                `}
                              >
                                {t === 'light' ? <Sun className="w-5 h-5" /> : t === 'dark' ? <Moon className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                                <span>{t}</span>
                              </button>
                            ))}
                          </div>
                        </div>


                        {/* Sound */}
                        <div>
                          <h3 className="text-lg font-semibold text-ink-900 dark:text-ink-100 mb-4">Sound &amp; Volume</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-ink-700 dark:text-ink-200">Sound Effects</span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={soundEffects}
                                  onChange={(e) => setSoundEffects(e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className={toggleTrack}></div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Top Bar Settings */}
                    <div className="border-t border-ink-200 dark:border-ink-700 pt-6">
                      <h3 className="text-lg font-semibold text-ink-900 dark:text-ink-50 mb-4 flex items-center">
                        <Palette className="w-5 h-5 mr-2" />
                        {language === 'ar' ? 'إعدادات عرض الشريط العلوي' : 'Top Bar Display Settings'}
                      </h3>

                      {/* Grid View */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Grid className="w-5 h-5 text-ink-600 dark:text-ink-400" />
                            <span className="font-medium text-ink-900 dark:text-ink-50">{language === 'ar' ? 'عرض الشبكة' : 'Grid View'}</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={gridView}
                              onChange={(e) => setGridView(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className={toggleTrack}></div>
                          </label>
                        </div>
                        <p className="text-sm text-ink-500 dark:text-ink-400">
                          Show grid lines for better alignment
                        </p>
                      </div>

                      {/* Font Size */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Type className="w-5 h-5 text-ink-600 dark:text-ink-400" />
                            <span className="font-medium text-ink-900 dark:text-ink-50">Font Size</span>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          {(['small', 'medium', 'large', 'extra-large'] as const).map((size) => (
                            <button
                              key={size}
                              onClick={() => setFontSize(size)}
                              className={`
                                flex-1 px-4 py-3 rounded-lg border-2 transition-colors capitalize
                                ${fontSize === size
                                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200'
                                  : 'border-ink-200 dark:border-ink-600 text-ink-700 dark:text-ink-200 hover:border-ink-300 dark:hover:border-ink-500'
                                }
                              `}
                            >
                              {size.replace('-', ' ')}
                            </button>
                          ))}
                        </div>
                        <p className="text-sm text-ink-500 dark:text-ink-400 mt-2">
                          Adjust text size for better readability
                        </p>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-6 border-t border-ink-200 dark:border-ink-700">
                      <Button variant="primary" onClick={handleSavePreferences} className="w-full">
                        {language === 'ar' ? 'حفظ التفضيلات' : 'Save Preferences'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}


          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}
