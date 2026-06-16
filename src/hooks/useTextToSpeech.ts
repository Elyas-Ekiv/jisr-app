import { useCallback, useState, useEffect } from 'react'
import { Language } from '../types/aac'

export interface TTSOptions {
  rate?: number // 0.1 - 10
  pitch?: number // 0 - 2
  volume?: number // 0 - 1
  voiceType?: 'child' | 'adult' | 'neutral'
  language?: Language
}

/**
 * Pure helper — finds the best matching voice from a given list.
 * Lives outside the hook so speakSingle can call it with fresh voices
 * instead of potentially stale React state.
 */
function findVoice(
  availableVoices: SpeechSynthesisVoice[],
  lang: 'en' | 'ar',
  type: 'child' | 'adult' | 'neutral'
): SpeechSynthesisVoice | null {
  if (availableVoices.length === 0) return null

  const langCode = lang === 'ar' ? 'ar' : 'en'

  // For Arabic, be liberal: match any Arabic dialect (ar-SA, ar-EG, ar-AE, etc.)
  const langMatches = availableVoices.filter(v => v.lang.startsWith(langCode))

  if (langMatches.length === 0) return null

  // Prefer voice type within language matches
  if (type === 'child') {
    const child = langMatches.find(v =>
      v.name.toLowerCase().includes('child') ||
      v.name.toLowerCase().includes('kid') ||
      v.name.toLowerCase().includes('young')
    )
    if (child) return child
  }

  if (type === 'adult') {
    const adult = langMatches.find(v => !v.name.toLowerCase().includes('child'))
    if (adult) return adult
  }

  // Default: first available voice for this language
  return langMatches[0]
}

/** True if the browser + OS have at least one Arabic voice installed. */
function checkArabicVoices(): boolean {
  if (!('speechSynthesis' in window)) return false
  return window.speechSynthesis.getVoices().some(v => v.lang.startsWith('ar'))
}

export function useTextToSpeech(options: TTSOptions = {}) {
  const {
    rate = 0.8,
    pitch = 1.2,
    volume = 1.0,
    voiceType = 'child',
    language = 'en'
  } = options

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [hasArabicVoice, setHasArabicVoice] = useState(false)

  useEffect(() => {
    if (!('speechSynthesis' in window)) return

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices()
      setVoices(available)
      setHasArabicVoice(available.some(v => v.lang.startsWith('ar')))
    }

    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
    }
  }, [])

  // Kept for external consumers who want to inspect available voices.
  const getVoice = useCallback((lang: 'en' | 'ar', type: 'child' | 'adult' | 'neutral'): SpeechSynthesisVoice | null => {
    return findVoice(voices, lang, type)
  }, [voices])

  /**
   * Speak a single utterance in the given language ('en' or 'ar').
   *
   * Uses window.speechSynthesis.getVoices() fresh on every call to avoid
   * the React-state timing race (Chrome loads voices asynchronously).
   *
   * Returns a Promise that resolves when speech ends (or on error).
   */
  const speakSingle = useCallback((
    text: string,
    lang: 'en' | 'ar',
    opts: { rate: number; pitch: number; volume: number; voiceType: 'child' | 'adult' | 'neutral' }
  ): Promise<void> => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window) || !text.trim()) {
        resolve()
        return
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = opts.rate
      utterance.pitch = opts.pitch
      utterance.volume = opts.volume
      utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US'

      // Always read voices fresh — avoids the stale-state timing issue.
      const freshVoices = window.speechSynthesis.getVoices()
      const selectedVoice = findVoice(freshVoices, lang, opts.voiceType)

      if (selectedVoice) {
        utterance.voice = selectedVoice
      } else if (lang === 'ar') {
        // No Arabic voice found — log a helpful warning so the developer/user
        // can see exactly what's happening in the browser console.
        console.warn(
          '[TTS] No Arabic voice found on this device.\n' +
          'Available voices:', freshVoices.map(v => `${v.name} (${v.lang})`).join(', ') || '(none loaded yet)',
          '\nTo enable Arabic speech on Windows: Settings → Time & Language → Language → Add Arabic → ensure "Text-to-speech" is downloaded.'
        )
      }

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => {
        setIsSpeaking(false)
        resolve()
      }
      utterance.onerror = (event) => {
        // 'interrupted' is normal (user tapped another card); only warn on real errors.
        if (event.error && event.error !== 'interrupted') {
          console.warn(`[TTS] Speech error for "${text}" (${lang}):`, event.error)
        }
        setIsSpeaking(false)
        resolve()
      }

      window.speechSynthesis.speak(utterance)
    })
  }, [])

  /**
   * Main speak function.
   *
   * For 'en' or 'ar': speaks the text in that language.
   * For 'en-ar' (bilingual): speaks English first, then Arabic after a short pause.
   *   - `bilingualArabicText` in customOptions overrides the Arabic portion.
   *
   * IMPORTANT: We defer the actual speak() call by one tick (setTimeout 0) after
   * cancel() because Chrome has a known race where speak() is silently dropped if
   * called in the same synchronous frame as cancel().
   */
  const speak = useCallback((text: string, customOptions?: Partial<TTSOptions> & { bilingualArabicText?: string }) => {
    if (!('speechSynthesis' in window)) {
      console.warn('[TTS] Speech synthesis not supported in this browser')
      return
    }

    window.speechSynthesis.cancel()

    const finalRate = customOptions?.rate ?? rate
    const finalPitch = customOptions?.pitch ?? pitch
    const finalVolume = customOptions?.volume ?? volume
    const finalVoiceType = customOptions?.voiceType ?? voiceType
    const targetLang = customOptions?.language ?? language

    const singleOpts = { rate: finalRate, pitch: finalPitch, volume: finalVolume, voiceType: finalVoiceType }

    // Defer by one tick — fixes Chrome's cancel→speak silent-drop bug.
    setTimeout(() => {
      if (targetLang === 'en-ar') {
        const arabicText = customOptions?.bilingualArabicText || text
        speakSingle(text, 'en', singleOpts).then(() => {
          setTimeout(() => speakSingle(arabicText, 'ar', singleOpts), 300)
        })
      } else if (targetLang === 'ar') {
        speakSingle(text, 'ar', singleOpts)
      } else {
        speakSingle(text, 'en', singleOpts)
      }
    }, 50)
  }, [rate, pitch, volume, voiceType, language, speakSingle])

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [])

  const pause = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause()
      setIsSpeaking(false)
    }
  }, [])

  const resume = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume()
      setIsSpeaking(true)
    }
  }, [])

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    voices,
    getVoice,
    hasArabicVoice,
  }
}
