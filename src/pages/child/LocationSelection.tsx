import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, LayoutDashboard, LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import ChildLayout from '../../layouts/ChildLayout'
import { Location, Language } from '../../types/aac'
import { useTextToSpeech } from '../../hooks/useTextToSpeech'
import { aacService } from '../../services/aacService'
import { authService } from '../../services/authService'

/** Arabic translations for the default location names */
const locationArabic: Record<string, string> = {
  home: 'البيت',
  school: 'المدرسة',
  store: 'المتجر',
  restaurant: 'المطعم',
}

interface LocationSelectionProps {
  onLocationSelect: (location: Location) => void
  language?: Language
  childId: string
}

export default function LocationSelection({ onLocationSelect, language = 'en', childId }: LocationSelectionProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const { speak } = useTextToSpeech({ language })
  const navigate = useNavigate()

  const handleLogout = async () => {
    localStorage.removeItem('jisr_child_session')
    localStorage.removeItem('jisr_active_child_id')
    try {
      await authService.logout()
    } catch (e) {}
    navigate('/signin')
  }

  useEffect(() => {
    const loadLocations = async () => {
      try {
        setLoading(true)
        const fetchedLocations = await aacService.getLocations(childId)
        setLocations(fetchedLocations)
      } catch (error) {
        console.error('Failed to load locations:', error)
        setLocations([])
      } finally {
        setLoading(false)
      }
    }
    loadLocations()
  }, [childId])

  const handleLocationClick = (location: Location) => {
    const arName = locationArabic[location.id] || location.name

    if (language === 'ar') {
      speak(arName)
    } else if (language === 'en-ar') {
      // Bilingual: speak English then Arabic via the hook's bilingual support
      speak(`Going to ${location.name}`, { bilingualArabicText: arName })
    } else {
      speak(`Going to ${location.name}`)
    }

    setTimeout(() => {
      onLocationSelect(location)
    }, 500)
  }

  if (loading) {
    return (
      <ChildLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading locations...</p>
          </div>
        </div>
      </ChildLayout>
    )
  }

  const enabledLocations = locations.filter(loc => loc.enabled)

  if (!loading && locations.length === 0) {
    return (
      <ChildLayout>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 p-8 text-center">
          <div className="text-6xl mb-4">📍</div>
          <h2 className="text-3xl font-bold text-ink-900 mb-2">
            {language === 'ar' ? 'لا توجد مواقع' : 'No locations yet'}
          </h2>
          <p className="text-xl text-ink-600">
            {language === 'ar' ? 'اطلب من والديك إضافة مواقع' : 'Ask a parent to add locations in the settings.'}
          </p>
        </div>
      </ChildLayout>
    )
  }

  return (
    <ChildLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex flex-col items-center justify-center p-4">
        {/* Back to Dashboard button */}
        <div className="absolute top-6 left-6 z-10">
          <Link
            to="/child/aac"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/80 backdrop-blur text-primary-700 font-semibold shadow-lg border border-primary-200 hover:bg-primary-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </Link>
        </div>

        {/* Logout button */}
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/80 backdrop-blur text-red-600 font-semibold shadow-lg border border-red-100 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>{language === 'ar' ? 'تسجيل خروج' : 'Logout'}</span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full"
        >
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              {language === 'ar' ? 'أين أنت؟ 👋' : 'Where are you? 👋'}
            </h1>
            <p className="text-2xl md:text-3xl text-gray-600">
              {language === 'ar' ? 'اختر موقعك للبدء' : 'Select your location to start'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {enabledLocations.map((location, index) => (
              <motion.button
                key={location.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLocationClick(location)}
                className={`
                  relative p-4 md:p-8 rounded-3xl bg-gradient-to-br ${location.color}
                  shadow-2xl hover:shadow-3xl transition-all
                  border-4 border-white flex flex-col items-center
                `}
              >
                <div className="text-5xl md:text-7xl lg:text-8xl mb-3">{location.icon}</div>
                <h2 className="text-base md:text-2xl lg:text-3xl font-bold text-white mb-1 text-center break-words w-full leading-tight">
                  {location.name}
                </h2>
                {/* Show Arabic name below when in Arabic or bilingual mode */}
                {(language === 'ar' || language === 'en-ar') && locationArabic[location.id] && (
                  <p className="text-sm md:text-lg text-white/90 font-semibold text-center" dir="rtl">
                    {locationArabic[location.id]}
                  </p>
                )}
                <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold">✓</span>
                </div>
              </motion.button>
            ))}
          </div>

          {enabledLocations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No locations available. Please ask a parent to set up locations.</p>
            </div>
          )}
        </motion.div>
      </div>
    </ChildLayout>
  )
}
