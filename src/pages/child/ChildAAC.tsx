import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Volume2,
  VolumeX,
  Trash2,
  Home,
  User,
  Utensils,
  Gamepad2,
  Users,
  Lightbulb,
  Heart,
  X,
  MapPin,
  Sparkles,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import ChildLayout from '../../layouts/ChildLayout'
import { VocabularyItem, VocabularyCategory, Location } from '../../types/aac'
import { useTextToSpeech, TTSOptions } from '../../hooks/useTextToSpeech'
import { aacService } from '../../services/aacService'
import LocationSelection from './LocationSelection'
import { useChild } from '../../context/ChildContext'

const categoryNames: Record<VocabularyCategory | 'all', string> = {
  all: 'All',
  feelings: 'Feelings',
  activities: 'Activities',
  needs: 'Food',
  people: 'Family',
  actions: 'Actions',
  places: 'Places',
  social: 'Social',
}

const categoryIcons: Record<VocabularyCategory | 'all', typeof Heart> = {
  all: Sparkles,
  feelings: Heart,
  activities: Gamepad2,
  needs: Utensils,
  people: Users,
  actions: Lightbulb,
  places: Home,
  social: Users,
}

const DEFAULT_SETTINGS = {
  speechSpeed: 1.0,
  volume: 1.0,
  voiceType: 'child',
  primaryLanguage: 'en',
  maxSentenceLength: 12,
  gridColumns: 4 as 3 | 4 | 5 | 6 | 7,
  cardSize: 'medium' as 'small' | 'medium' | 'large',
}

const GRID_COLS_CLASS: Record<number, string> = {
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
}

const EMOJI_SIZE_CLASS: Record<string, string> = {
  small:  'text-[1.5rem]',
  medium: 'text-[2.25rem]',
  large:  'text-[3rem]',
}

const IMG_HEIGHT_CLASS: Record<string, string> = {
  small:  'h-[45%]',
  medium: 'h-[60%]',
  large:  'h-[70%]',
}

function isRenderableImageSrc(s: unknown): boolean {
  if (typeof s !== 'string') return false
  const v = s.trim()
  if (!v) return false
  return (
    /^https?:\/\//i.test(v) ||
    v.startsWith('/') ||
    v.startsWith('data:image') ||
    (v.startsWith('data:') && v.includes('base64'))
  )
}

function SentenceSymbolDisplay({ raw }: { raw?: string }) {
  const s = typeof raw === 'string' ? raw.trim() : ''
  if (!s) return <span aria-hidden className="text-2xl">✨</span>
  if (isRenderableImageSrc(s)) {
    return (
      <img src={s} alt="" className="h-8 w-8 shrink-0 rounded-md object-cover" />
    )
  }
  return (
    <span className="text-2xl" aria-hidden>{s}</span>
  )
}

export default function ChildAAC() {
  const navigate = useNavigate()
  const { activeChild, children: childList, setActiveChildId, loading: childLoading } = useChild()
  const isChildSession = localStorage.getItem('jisr_child_session') === 'true'

  // Auto-fullscreen for child sessions
  useEffect(() => {
    if (isChildSession && document.fullscreenEnabled) {
      document.documentElement.requestFullscreen?.().catch(() => {})
    }
  }, [])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([])
  const [sentence, setSentence] = useState<VocabularyItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<VocabularyCategory | 'all'>('all')
  const [settings, setSettings] = useState<any>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(false)
  const [showGreeting, setShowGreeting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const greetingShownRef = useRef<string | null>(null)

  const childId = activeChild?.id || 'child-1'
  const childName = activeChild?.name || 'Friend'

  const ttsOptions: TTSOptions = useMemo(() => {
    if (!settings) return {}
    return {
      rate: settings.speechSpeed || 0.85,
      volume: settings.volume || 1.0,
      voiceType: settings.voiceType || 'child',
      language: settings.primaryLanguage || 'en',
    }
  }, [
    settings?.speechSpeed,
    settings?.volume,
    settings?.voiceType,
    settings?.primaryLanguage,
  ])

  const { speak, stop, isSpeaking } = useTextToSpeech(ttsOptions)

  const greetingText = useMemo(() => {
    try {
      const hour = new Date().getHours()
      if (hour >= 5 && hour < 12) return `Good morning ${childName}`
      if (hour >= 12 && hour < 17) return `Good afternoon ${childName}`
      if (hour >= 17 && hour < 21) return `Good evening ${childName}`
      return `Good night ${childName}`
    } catch {
      return `Hello ${childName}`
    }
  }, [childName])

  // Load settings
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const data = await aacService.getSettings(childId)
        if (mounted) setSettings((prev: any) => ({ ...prev, ...data }))
      } catch (err) {
        console.error('Failed to load settings:', err)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [childId])

  // Load vocabulary when location is set
  useEffect(() => {
    if (!selectedLocation) {
      setVocabulary([])
      setShowGreeting(false)
      greetingShownRef.current = null
      setLoading(false)
      setError(null)
      return
    }

    let mounted = true
    const locationId = selectedLocation.id

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const allVocab = await aacService.getVocabulary(childId)
        if (!mounted) return

        const enabled = Array.isArray(selectedLocation.categories)
          ? selectedLocation.categories.filter((c) => c && c.enabled).map((c) => c.category)
          : []

        const filtered = allVocab.filter((item) => {
          if (!item.locations || item.locations.length === 0) {
            return enabled.length === 0 || enabled.includes(item.category)
          }
          return (
            item.locations.includes(selectedLocation.id) &&
            (enabled.length === 0 || enabled.includes(item.category))
          )
        })

        setVocabulary(filtered)

        if (greetingShownRef.current !== locationId) {
          greetingShownRef.current = locationId
          setShowGreeting(true)
          window.setTimeout(() => {
            try {
              speak?.(greetingText)
            } catch (err) {
              console.error('Error speaking greeting:', err)
            }
          }, 200)
          window.setTimeout(() => setShowGreeting(false), 3500)
        }
      } catch (err: any) {
        console.error('Failed to load vocabulary:', err)
        if (mounted) {
          setError(err?.message || 'Failed to load vocabulary')
          setVocabulary([])
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [childId, selectedLocation, greetingText, speak])

  const availableCategories = useMemo<Array<VocabularyCategory | 'all'>>(() => {
    try {
      if (!selectedLocation || !Array.isArray(selectedLocation.categories)) {
        return ['all', 'feelings', 'activities', 'needs', 'people']
      }
      return [
        'all',
        ...selectedLocation.categories
          .filter((c) => c && c.enabled)
          .map((c) => c.category),
      ]
    } catch {
      return ['all', 'feelings', 'activities', 'needs', 'people']
    }
  }, [selectedLocation])

  const selectedCounts = useMemo(() => {
    const counts = new Map<string, number>()
    sentence.forEach((item) => {
      if (item?.id) counts.set(item.id, (counts.get(item.id) || 0) + 1)
    })
    return counts
  }, [sentence])

  const maxLen = settings?.maxSentenceLength || 12
  const sentenceFull = sentence.length >= maxLen

  const handlePick = useCallback(
    (item: VocabularyItem) => {
      if (!item) return
      if (sentenceFull) {
        speak?.('Your sentence is full')
        return
      }
      // Speak this single word for instant audio feedback
      const lang = settings?.primaryLanguage || 'en'
      if (lang === 'en-ar') {
        // Bilingual: speak English then Arabic
        const enWord = item.text?.en || ''
        const arWord = item.text?.ar || ''
        if (enWord) speak?.(enWord, { bilingualArabicText: arWord || enWord })
      } else {
        const word = lang === 'ar' && item.text?.ar ? item.text.ar : item.text?.en || ''
        if (word) speak?.(word)
      }
      setSentence((prev) => [...prev, item])
    },
    [sentenceFull, speak, settings?.primaryLanguage]
  )

  const handleRemove = useCallback((index: number) => {
    setSentence((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleClear = useCallback(() => {
    setSentence([])
    stop?.()
  }, [stop])

  const handleTalk = useCallback(async () => {
    try {
      if (sentence.length === 0) {
        speak?.('Tap pictures to make a sentence')
        return
      }
      stop?.()
      const lang = settings?.primaryLanguage || 'en'

      let finalSentenceText = ''
      if (lang === 'en-ar') {
        // Bilingual: build both English and Arabic sentences
        const enText = sentence.map((item) => item?.text?.en || '').filter(Boolean).join(' ')
        const arText = sentence.map((item) => item?.text?.ar || item?.text?.en || '').filter(Boolean).join(' ')
        if (enText) speak?.(enText, { bilingualArabicText: arText || enText })
        finalSentenceText = `${enText} / ${arText}`
      } else {
        const text = sentence
          .map((item) =>
            lang === 'ar' && item?.text?.ar ? item.text.ar : item?.text?.en || ''
          )
          .filter(Boolean)
          .join(' ')
        if (text) speak?.(text)
        finalSentenceText = text
      }

      try {
        await aacService.recordUsage(
          childId,
          sentence.map((i) => i.id).filter(Boolean),
          finalSentenceText
        )
      } catch (err) {
        console.error('Failed to record usage:', err)
      }
    } catch (err) {
      console.error('Error in handleTalk:', err)
    }
  }, [sentence, settings, speak, stop, childId])

  const filteredVocab = useMemo(() => {
    if (!Array.isArray(vocabulary) || vocabulary.length === 0) return []
    if (selectedCategory === 'all') return vocabulary
    return vocabulary.filter((item) => item && item.category === selectedCategory)
  }, [vocabulary, selectedCategory])

  if (childLoading) {
    return (
      <ChildLayout>
        <div className="flex h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="mx-auto mb-5 h-14 w-14 rounded-full border-4 border-primary-200 border-t-primary-600"
            />
            <p className="text-lg font-semibold text-ink-700">Loading profile…</p>
          </div>
        </div>
      </ChildLayout>
    )
  }

  if (!selectedLocation) {
    return <LocationSelection onLocationSelect={setSelectedLocation} language={settings?.primaryLanguage || 'en'} childId={childId} />
  }

  if (loading && vocabulary.length === 0) {
    return (
      <ChildLayout>
        <div className="flex h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="mx-auto mb-5 h-14 w-14 rounded-full border-4 border-primary-200 border-t-primary-600"
            />
            <p className="text-lg font-semibold text-ink-700">Loading your board…</p>
          </div>
        </div>
      </ChildLayout>
    )
  }

  if (error && vocabulary.length === 0) {
    return (
      <ChildLayout>
        <div className="flex h-screen items-center justify-center bg-white px-4">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-accent-50 text-accent-600 ring-1 ring-accent-200">
              <X className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-ink-900">Something went wrong</h2>
            <p className="mt-1.5 text-sm text-ink-600">{error}</p>
            <button
              onClick={() => setSelectedLocation(null)}
              className="mt-6 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary-700"
            >
              Pick another location
            </button>
          </div>
        </div>
      </ChildLayout>
    )
  }

  const lang = settings?.primaryLanguage || 'en'

  return (
    <ChildLayout>
      <div className="flex h-screen flex-col overflow-hidden bg-brand-surface">
        {/* Greeting banner */}
        <AnimatePresence>
          {showGreeting && selectedLocation && (
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              className="flex-shrink-0 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 px-6 py-4 text-white shadow-card"
            >
              <div className="page-container flex items-center justify-between gap-3">
                <div>
                  <div className="text-2xl font-extrabold sm:text-3xl">
                    {greetingText} 👋
                  </div>
                  <div className="text-sm text-white/85 sm:text-base">
                    Ready to talk at {selectedLocation.name || 'your location'}{' '}
                    {selectedLocation.icon || '📍'}
                  </div>
                </div>
                <button
                  onClick={() => setShowGreeting(false)}
                  className="rounded-full bg-white/15 p-2 text-white/90 transition-colors hover:bg-white/25"
                  aria-label="Dismiss greeting"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top bar with sentence */}
        <div className="flex-shrink-0 border-b border-ink-100 bg-white/85 px-3 py-3 backdrop-blur-xl sm:px-5">
          <div className="flex items-center gap-3">
            {/* Speak button */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={handleTalk}
              disabled={isSpeaking}
              className={[
                'grid h-14 w-14 flex-none place-items-center rounded-2xl shadow-soft transition-colors',
                sentence.length === 0
                  ? 'bg-ink-100 text-ink-500'
                  : 'bg-primary-600 text-white hover:bg-primary-700',
                isSpeaking ? 'animate-pulse-soft' : '',
              ].join(' ')}
              aria-label="Speak sentence"
              title="Speak"
            >
              {isSpeaking ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </motion.button>

            {/* Sentence area */}
            <div className="flex min-h-[64px] flex-1 items-center rounded-2xl border border-ink-100 bg-white px-3 py-2 shadow-soft">
              {sentence.length === 0 ? (
                <div className="flex w-full items-center justify-center gap-2 text-sm text-ink-500">
                  <span aria-hidden className="text-xl">👆</span>
                  <span className="font-medium">Tap pictures to make a sentence</span>
                </div>
              ) : (
                <div className="flex w-full flex-wrap gap-2">
                  <AnimatePresence>
                    {sentence.map((item, index) => (
                      <motion.div
                        key={`${item?.id || 'item'}-${index}`}
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.6, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                        className="group flex items-center gap-2 rounded-xl bg-primary-50 px-3 py-1.5 shadow-soft ring-1 ring-primary-200"
                      >
                        <SentenceSymbolDisplay raw={item?.image} />
                        <span className="hidden text-sm font-bold text-primary-900 sm:inline">
                          {lang === 'ar' && item?.text?.ar ? item.text.ar : item?.text?.en || ''}
                        </span>
                        <button
                          onClick={() => handleRemove(index)}
                          className="grid h-5 w-5 place-items-center rounded-full bg-primary-700/15 text-primary-700 transition-colors hover:bg-accent-500 hover:text-white"
                          aria-label="Remove word"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5">
              {sentence.length > 0 ? (
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={handleClear}
                  className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-50 text-accent-700 ring-1 ring-accent-200 transition-colors hover:bg-accent-500 hover:text-white"
                  aria-label="Clear sentence"
                  title="Clear"
                >
                  <Trash2 className="h-5 w-5" />
                </motion.button>
              ) : null}

              <button
                onClick={() => setSelectedLocation(null)}
                className="grid h-12 w-12 place-items-center rounded-2xl bg-ink-100 text-ink-700 transition-colors hover:bg-ink-200"
                aria-label="Back to location selection"
                title="Change location"
              >
                <Home className="h-5 w-5" />
              </button>

              {!isChildSession && childList.length > 1 ? (
                <select
                  value={activeChild?.id || ''}
                  onChange={(e) => setActiveChildId(e.target.value)}
                  className="h-12 rounded-2xl border-2 border-primary-200 bg-white px-2 text-sm font-semibold text-ink-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-ink-800 dark:text-ink-100"
                  title="Switch child"
                >
                  {childList.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              ) : (
                <div
                  className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-100 text-primary-700 ring-1 ring-primary-200"
                  title={childName}
                >
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
          </div>

          {/* Sentence length progress */}
          {sentence.length > 0 ? (
            <div className="mt-2.5">
              <div className="flex items-center justify-between text-[11px] font-medium text-ink-500">
                <span>{sentence.length}/{maxLen} words</span>
                <button
                  onClick={() => setSentence((prev) => prev.slice(0, -1))}
                  className="text-primary-700 hover:underline"
                >
                  Remove last
                </button>
              </div>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-ink-100">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all"
                  style={{ width: `${(sentence.length / maxLen) * 100}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Main */}
        <div className="flex flex-1 overflow-hidden">
          {/* Categories sidebar */}
          <aside className="hidden w-28 flex-shrink-0 flex-col items-center gap-2 overflow-y-auto bg-white px-2.5 py-4 shadow-soft sm:flex">
            <Link
              to="/child"
              className="mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary-700 ring-1 ring-primary-200 transition-colors hover:bg-primary-100"
              title="Change location"
            >
              <MapPin className="h-5 w-5" />
            </Link>
            <div className="my-1 h-px w-12 bg-ink-100" />

            {availableCategories.map((category) => {
              const Icon = categoryIcons[category] || Heart
              const active = selectedCategory === category
              const name = categoryNames[category] || ''
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={[
                    'group flex w-full flex-col items-center gap-1.5 rounded-2xl px-1.5 py-2 transition-all',
                    active
                      ? 'bg-primary-600 text-white shadow-soft'
                      : 'text-ink-700 hover:bg-ink-100',
                  ].join(' ')}
                  title={name}
                >
                  <span
                    className={[
                      'grid h-10 w-10 place-items-center rounded-xl',
                      active ? 'bg-white/20' : 'bg-primary-50 text-primary-700 group-hover:bg-white',
                    ].join(' ')}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wide">{name}</span>
                </button>
              )
            })}
          </aside>

          {/* Mobile category strip */}
          <div className="absolute left-0 right-0 top-[140px] z-10 sm:hidden">
            <div className="page-container">
              <div className="flex gap-2 overflow-x-auto rounded-full bg-white p-1.5 shadow-card scrollbar-hide">
                {availableCategories.map((category) => {
                  const Icon = categoryIcons[category] || Heart
                  const active = selectedCategory === category
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={[
                        'inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold',
                        active
                          ? 'bg-primary-600 text-white'
                          : 'bg-transparent text-ink-700 hover:bg-ink-100',
                      ].join(' ')}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {categoryNames[category]}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Vocab grid */}
          <main className="flex-1 overflow-y-auto px-3 pt-16 pb-8 sm:px-6 sm:pt-6">
            {filteredVocab.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-ink-500">
                <div className="mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-soft">
                  <span className="text-3xl" aria-hidden>📚</span>
                </div>
                <p className="text-base font-semibold text-ink-700">No cards yet!</p>
                <p className="mt-1 text-sm">Ask a parent to add some words.</p>
              </div>
            ) : (
              <div className={`grid gap-2.5 ${GRID_COLS_CLASS[settings?.gridColumns ?? 4] ?? 'grid-cols-4'}`}>
                {filteredVocab.map((item, index) => {
                  if (!item) return null
                  const count = selectedCounts.get(item.id) || 0
                  const selected = count > 0
                  const imageStr = String(item.image || '')
                  const cardSize = settings?.cardSize ?? 'medium'
                  const emojiCls = EMOJI_SIZE_CLASS[cardSize] ?? 'text-[2.25rem]'
                  const imgHeightCls = IMG_HEIGHT_CLASS[cardSize] ?? 'h-[60%]'

                  return (
                    <motion.button
                      key={item.id || `i-${index}`}
                      type="button"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index, 16) * 0.015 }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePick(item)}
                      disabled={sentenceFull}
                      className={[
                        'group relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border bg-white p-2 text-center shadow-soft transition-all',
                        selected
                          ? 'border-primary-400 ring-2 ring-primary-200'
                          : 'border-ink-100 hover:border-primary-200 hover:shadow-card',
                        sentenceFull ? 'opacity-50' : '',
                      ].join(' ')}
                      title={item.text?.en || ''}
                    >
                      <div className={`grid ${imgHeightCls} w-full place-items-center rounded-xl bg-ink-50/60 group-hover:bg-primary-50/60`}>
                        {imageStr.startsWith('data:') || imageStr.startsWith('http') ? (
                          <img
                            src={imageStr}
                            alt={item.text?.en || 'vocabulary'}
                            className="h-full w-full rounded-xl object-cover"
                          />
                        ) : (
                          <span className={`${emojiCls} leading-none`}>{imageStr || '✨'}</span>
                        )}
                      </div>

                      {item.text?.en ? (
                        <p className="line-clamp-1 text-xs font-bold text-ink-800">
                          {lang === 'ar' && item.text?.ar ? item.text.ar : item.text.en}
                        </p>
                      ) : null}

                      {count > 0 ? (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-primary-600 text-[10px] font-bold text-white shadow-soft"
                        >
                          {count}
                        </motion.span>
                      ) : null}
                    </motion.button>
                  )
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </ChildLayout>
  )
}
