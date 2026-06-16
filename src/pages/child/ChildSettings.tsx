import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Volume2, Languages, Gauge, Palette, AlertTriangle } from 'lucide-react'
import ChildLayout from '../../layouts/ChildLayout'
import { AACSettings, Language } from '../../types/aac'
import { aacService } from '../../services/aacService'
import { useTextToSpeech } from '../../hooks/useTextToSpeech'

interface ChildSettingsProps {
  onClose: () => void
  settings: AACSettings | null
  onSettingsUpdate: (settings: AACSettings) => void
  childId: string
}

export default function ChildSettings({ onClose, settings, onSettingsUpdate, childId }: ChildSettingsProps) {
  const [localSettings, setLocalSettings] = useState<AACSettings | null>(settings)
  const { speak, hasArabicVoice } = useTextToSpeech({ language: settings?.primaryLanguage || 'en' })

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleSave = async () => {
    if (!localSettings) return
    try {
      await aacService.updateSettings(childId, localSettings)
      onSettingsUpdate(localSettings)
      speak('Settings saved!')
      setTimeout(() => onClose(), 500)
    } catch (error) {
      console.error('Failed to save settings:', error)
      speak('Could not save settings')
    }
  }

  const handleLanguageChange = (lang: Language) => {
    if (!localSettings) return
    const newSettings = { ...localSettings, primaryLanguage: lang }
    setLocalSettings(newSettings)
    speak(`Language changed to ${lang === 'en' ? 'English' : lang === 'ar' ? 'Arabic' : 'Both'}`)
  }

  const handleSpeedChange = (speed: number) => {
    if (!localSettings) return
    const newSettings = { ...localSettings, speechSpeed: speed }
    setLocalSettings(newSettings)
    const speedText = speed <= 0.5 ? 'slow' : speed <= 1.0 ? 'normal' : 'fast'
    speak(`Speed set to ${speedText}`)
  }

  const handleVolumeChange = (volume: number) => {
    if (!localSettings) return
    const newSettings = { ...localSettings, volume }
    setLocalSettings(newSettings)
    const volumeText = volume === 0.5 ? 'quiet' : volume === 1.0 ? 'normal' : 'loud'
    speak(`Volume set to ${volumeText}`)
  }

  const handleGridColumnsChange = (cols: 3 | 4 | 5 | 6 | 7) => {
    if (!localSettings) return
    setLocalSettings({ ...localSettings, gridColumns: cols })
    const label = cols === 3 ? 'large' : cols === 4 ? 'medium' : cols === 5 ? 'small' : 'extra small'
    speak(`Grid set to ${label} cards`)
  }

  const handleCardSizeChange = (size: 'small' | 'medium' | 'large') => {
    if (!localSettings) return
    setLocalSettings({ ...localSettings, cardSize: size })
    speak(`Picture size set to ${size}`)
  }

  if (!localSettings) {
    return (
      <ChildLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-2xl text-gray-600">Loading settings...</p>
          </div>
        </div>
      </ChildLayout>
    )
  }

  const languages = [
    { value: 'en' as Language, label: 'English', emoji: '🇺🇸', color: 'from-blue-400 to-blue-600' },
    { value: 'ar' as Language, label: 'Arabic', emoji: '🇸🇦', color: 'from-green-400 to-green-600' },
    { value: 'en-ar' as Language, label: 'Both', emoji: '🌍', color: 'from-purple-400 to-purple-600' }
  ]

  // Wider speed spread so the difference is clearly noticeable
  const speeds = [
    { value: 0.5, label: 'Slow', emoji: '🐢', color: 'from-yellow-400 to-yellow-600' },
    { value: 1.0, label: 'Normal', emoji: '🚶', color: 'from-blue-400 to-blue-600' },
    { value: 1.8, label: 'Fast', emoji: '🚀', color: 'from-red-400 to-red-600' }
  ]

  const volumes = [
    { value: 0.5, label: 'Quiet', emoji: '🔇', color: 'from-gray-400 to-gray-600' },
    { value: 0.8, label: 'Normal', emoji: '🔊', color: 'from-blue-400 to-blue-600' },
    { value: 1.0, label: 'Loud', emoji: '📢', color: 'from-orange-400 to-orange-600' }
  ]

  const gridOptions: { value: 3 | 4 | 5 | 6 | 7; label: string; emoji: string; color: string }[] = [
    { value: 3, label: 'Large',  emoji: '🟦🟦🟦',          color: 'from-teal-400 to-teal-600' },
    { value: 4, label: 'Medium', emoji: '🟦🟦🟦🟦',        color: 'from-cyan-400 to-cyan-600' },
    { value: 5, label: 'Small',  emoji: '🟦🟦🟦🟦🟦',      color: 'from-sky-400 to-sky-600' },
    { value: 6, label: 'Tiny',   emoji: '🟦🟦🟦🟦🟦🟦',    color: 'from-indigo-400 to-indigo-600' },
  ]

  const cardSizeOptions: { value: 'small' | 'medium' | 'large'; label: string; emoji: string; color: string }[] = [
    { value: 'small',  label: 'Small',  emoji: '🔹', color: 'from-slate-400 to-slate-600' },
    { value: 'medium', label: 'Medium', emoji: '🔷', color: 'from-blue-400 to-blue-600' },
    { value: 'large',  label: 'Large',  emoji: '🔵', color: 'from-violet-400 to-violet-600' },
  ]

  return (
    <ChildLayout>
      <div className="h-screen overflow-y-auto bg-gradient-to-br from-primary-50 via-white to-primary-50">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b-4 border-primary-300 shadow-lg p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-5xl">⚙️</div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Settings</h1>
                <p className="text-lg text-gray-600">Change how things work</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-16 h-16 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-red-600 transition-colors"
              aria-label="Close settings"
            >
              <X className="w-8 h-8" />
            </motion.button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {/* Language Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-2xl border-4 border-primary-200"
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-5xl">🌍</div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Language</h2>
                <p className="text-lg text-gray-600">Choose your language</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {languages.map((lang) => (
                <motion.button
                  key={lang.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleLanguageChange(lang.value)}
                  className={`
                    p-6 rounded-2xl border-4 transition-all
                    ${localSettings.primaryLanguage === lang.value
                      ? `bg-gradient-to-br ${lang.color} text-white border-white shadow-2xl`
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300 shadow-lg'
                    }
                  `}
                >
                  <div className="text-6xl mb-3">{lang.emoji}</div>
                  <div className="text-2xl font-bold">{lang.label}</div>
                </motion.button>
              ))}
            </div>

            {/* Arabic voice not installed warning */}
            <AnimatePresence>
              {(localSettings.primaryLanguage === 'ar' || localSettings.primaryLanguage === 'en-ar') && !hasArabicVoice && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-4 flex items-start gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4"
                >
                  <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-500" />
                  <div>
                    <p className="font-bold text-amber-800">Arabic voice not found on this device</p>
                    <p className="mt-1 text-sm text-amber-700">
                      To enable Arabic speech on Windows: go to <strong>Settings → Time &amp; Language → Language</strong>, add <strong>Arabic</strong>, then download the <strong>Text-to-speech</strong> package.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Voice Speed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-8 shadow-2xl border-4 border-primary-200"
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-5xl">🚀</div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Voice Speed</h2>
                <p className="text-lg text-gray-600">How fast should I talk?</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {speeds.map((speed) => (
                <motion.button
                  key={speed.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSpeedChange(speed.value)}
                  className={`
                    p-6 rounded-2xl border-4 transition-all
                    ${Math.abs(localSettings.speechSpeed - speed.value) < 0.1
                      ? `bg-gradient-to-br ${speed.color} text-white border-white shadow-2xl`
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300 shadow-lg'
                    }
                  `}
                >
                  <div className="text-6xl mb-3">{speed.emoji}</div>
                  <div className="text-2xl font-bold">{speed.label}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Volume */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 shadow-2xl border-4 border-primary-200"
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-5xl">🔊</div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Volume</h2>
                <p className="text-lg text-gray-600">How loud should I be?</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {volumes.map((volume) => (
                <motion.button
                  key={volume.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleVolumeChange(volume.value)}
                  className={`
                    p-6 rounded-2xl border-4 transition-all
                    ${Math.abs(localSettings.volume - volume.value) < 0.1
                      ? `bg-gradient-to-br ${volume.color} text-white border-white shadow-2xl`
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300 shadow-lg'
                    }
                  `}
                >
                  <div className="text-6xl mb-3">{volume.emoji}</div>
                  <div className="text-2xl font-bold">{volume.label}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Grid Size */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl p-8 shadow-2xl border-4 border-primary-200"
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-5xl">🔲</div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Grid Size</h2>
                <p className="text-lg text-gray-600">How many cards across?</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gridOptions.map((opt) => (
                <motion.button
                  key={opt.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleGridColumnsChange(opt.value)}
                  className={`
                    p-6 rounded-2xl border-4 transition-all
                    ${(localSettings.gridColumns ?? 4) === opt.value
                      ? `bg-gradient-to-br ${opt.color} text-white border-white shadow-2xl`
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300 shadow-lg'
                    }
                  `}
                >
                  <div className="text-3xl mb-3 tracking-tighter">{opt.emoji}</div>
                  <div className="text-2xl font-bold">{opt.label}</div>
                  <div className="text-sm mt-1 opacity-75">{opt.value} per row</div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Picture / GIF Size */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl p-8 shadow-2xl border-4 border-primary-200"
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-5xl">🖼️</div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Picture Size</h2>
                <p className="text-lg text-gray-600">How big should the images be?</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cardSizeOptions.map((opt) => (
                <motion.button
                  key={opt.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCardSizeChange(opt.value)}
                  className={`
                    p-6 rounded-2xl border-4 transition-all
                    ${(localSettings.cardSize ?? 'medium') === opt.value
                      ? `bg-gradient-to-br ${opt.color} text-white border-white shadow-2xl`
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300 shadow-lg'
                    }
                  `}
                >
                  <div className="text-6xl mb-3">{opt.emoji}</div>
                  <div className="text-2xl font-bold">{opt.label}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className="px-12 py-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-bold text-3xl shadow-2xl hover:shadow-3xl transition-all flex items-center space-x-4"
            >
              <span className="text-4xl">💾</span>
              <span>Save</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-12 py-6 bg-gray-500 text-white rounded-2xl font-bold text-3xl shadow-2xl hover:bg-gray-600 transition-all flex items-center space-x-4"
            >
              <span className="text-4xl">❌</span>
              <span>Cancel</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </ChildLayout>
  )
}
