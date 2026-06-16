// AAC System Types

export type VocabularyCategory = 
  | 'needs' 
  | 'actions' 
  | 'feelings' 
  | 'people' 
  | 'places'
  | 'social'
  | 'activities'

export type VocabularyLevel = 'basic' | 'intermediate' | 'advanced'

export type Language = 'en' | 'ar' | 'en-ar'

export interface VocabularyItem {
  id: string
  image: string // URL, emoji, or base64 encoded image
  text: {
    en: string
    ar: string // Required - Arabic text is mandatory
  }
  category: VocabularyCategory
  subcategory?: string // Subcategory within a category
  level: VocabularyLevel
  enabled: boolean
  order: number
  color?: string // Gradient color class
  tags?: string[]
  locations?: string[] // Which locations this item is available in (e.g., ['home', 'school'])
  audioUrl?: string
  createdAt?: string
  updatedAt?: string
}

export type LocationType = 'home' | 'school' | 'store' | 'restaurant' | 'park' | 'hospital' | 'custom'

export interface Location {
  id: string
  name: string
  type: LocationType
  icon: string // Emoji or icon
  color: string // Gradient color class
  categories: {
    category: VocabularyCategory
    subcategories?: string[]
    enabled: boolean
  }[]
  enabled: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface SentenceItem {
  id: string
  vocabularyId: string
  vocabulary: VocabularyItem
  order: number
}

export interface AACSettings {
  id?: string
  childId: string
  primaryLanguage: Language
  secondaryLanguage?: Language
  voiceType: 'child' | 'adult' | 'neutral'
  speechSpeed: number // 0.5 - 2.0
  volume: number // 0.0 - 1.0
  maxSentenceLength: number
  visibleImageCount: number
  vocabularyLevel: VocabularyLevel
  speechMode?: 'instant' | 'sentence'
  gridColumns?: 3 | 4 | 5 | 6 | 7   // columns in the AAC vocabulary grid
  cardSize?: 'small' | 'medium' | 'large' // size of the image/emoji inside each card
  createdAt?: string
  updatedAt?: string
}

export interface UsageAnalytics {
  childId: string
  date: string
  mostUsedImages: Array<{
    vocabularyId: string
    count: number
    vocabulary: VocabularyItem
  }>
  sentenceFrequency: number
  usageTimePatterns: Array<{
    hour: number
    count: number
  }>
  totalSentences: number
  averageSentenceLength: number
}

export interface SmartSuggestion {
  vocabularyId: string
  vocabulary: VocabularyItem
  reason: string
  confidence: number
}
