import { VocabularyItem, VocabularyCategory, VocabularyLevel } from '../types/aac'

// Mock vocabulary data - can be replaced with API calls
export const defaultVocabulary: VocabularyItem[] = [
  // Needs - Basic
  {
    id: 'water',
    image: '💧',
    text: { en: 'water', ar: 'ماء' },
    category: 'needs',
    level: 'basic',
    enabled: true,
    order: 1,
    color: 'from-blue-400 to-blue-600',
    tags: ['thirst', 'drink']
  },
  {
    id: 'food',
    image: '🍎',
    text: { en: 'food', ar: 'طعام' },
    category: 'needs',
    level: 'basic',
    enabled: true,
    order: 2,
    color: 'from-red-400 to-red-600',
    tags: ['hungry', 'eat']
  },
  {
    id: 'toilet',
    image: '🚽',
    text: { en: 'toilet', ar: 'حمام' },
    category: 'needs',
    level: 'basic',
    enabled: true,
    order: 3,
    color: 'from-green-400 to-green-600',
    tags: ['bathroom', 'restroom']
  },
  {
    id: 'sleep',
    image: '😴',
    text: { en: 'sleep', ar: 'نوم' },
    category: 'needs',
    level: 'basic',
    enabled: true,
    order: 4,
    color: 'from-purple-400 to-purple-600',
    tags: ['tired', 'rest']
  },
  
  // Actions - Basic
  {
    id: 'want',
    image: '✋',
    text: { en: 'want', ar: 'أريد' },
    category: 'actions',
    level: 'basic',
    enabled: true,
    order: 5,
    color: 'from-yellow-400 to-yellow-600',
    tags: ['desire', 'need']
  },
  {
    id: 'go',
    image: '🚶',
    text: { en: 'go', ar: 'اذهب' },
    category: 'actions',
    level: 'basic',
    enabled: true,
    order: 6,
    color: 'from-blue-400 to-blue-600',
    tags: ['move', 'walk']
  },
  {
    id: 'play',
    image: '🎮',
    text: { en: 'play', ar: 'ألعب' },
    category: 'actions',
    level: 'basic',
    enabled: true,
    order: 7,
    color: 'from-purple-400 to-purple-600',
    tags: ['fun', 'game']
  },
  {
    id: 'stop',
    image: '✋',
    text: { en: 'stop', ar: 'توقف' },
    category: 'actions',
    level: 'basic',
    enabled: true,
    order: 8,
    color: 'from-red-400 to-red-600',
    tags: ['halt', 'end']
  },
  
  // Feelings - Basic
  {
    id: 'happy',
    image: '😊',
    text: { en: 'happy', ar: 'سعيد' },
    category: 'feelings',
    level: 'basic',
    enabled: true,
    order: 9,
    color: 'from-yellow-400 to-yellow-600',
    tags: ['joy', 'glad']
  },
  {
    id: 'sad',
    image: '😢',
    text: { en: 'sad', ar: 'حزين' },
    category: 'feelings',
    level: 'basic',
    enabled: true,
    order: 10,
    color: 'from-blue-400 to-blue-600',
    tags: ['unhappy', 'upset']
  },
  {
    id: 'tired',
    image: '😴',
    text: { en: 'tired', ar: 'متعب' },
    category: 'feelings',
    level: 'basic',
    enabled: true,
    order: 11,
    color: 'from-gray-400 to-gray-600',
    tags: ['exhausted', 'sleepy']
  },
  {
    id: 'angry',
    image: '😡',
    text: { en: 'angry', ar: 'غاضب' },
    category: 'feelings',
    level: 'basic',
    enabled: true,
    order: 12,
    color: 'from-red-400 to-red-600',
    tags: ['mad', 'upset']
  },
  
  // People - Basic
  {
    id: 'mom',
    image: '👩',
    text: { en: 'mom', ar: 'أم' },
    category: 'people',
    level: 'basic',
    enabled: true,
    order: 13,
    color: 'from-pink-400 to-pink-600',
    tags: ['mother', 'parent']
  },
  {
    id: 'dad',
    image: '👨',
    text: { en: 'dad', ar: 'أب' },
    category: 'people',
    level: 'basic',
    enabled: true,
    order: 14,
    color: 'from-blue-400 to-blue-600',
    tags: ['father', 'parent']
  },
  {
    id: 'teacher',
    image: '👩‍🏫',
    text: { en: 'teacher', ar: 'معلم' },
    category: 'people',
    level: 'basic',
    enabled: true,
    order: 15,
    color: 'from-green-400 to-green-600',
    tags: ['instructor', 'educator']
  },
  {
    id: 'friend',
    image: '👫',
    text: { en: 'friend', ar: 'صديق' },
    category: 'people',
    level: 'basic',
    enabled: true,
    order: 16,
    color: 'from-purple-400 to-purple-600',
    tags: ['buddy', 'companion']
  },
  
  // Places - Basic
  {
    id: 'home',
    image: '🏠',
    text: { en: 'home', ar: 'منزل' },
    category: 'places',
    level: 'basic',
    enabled: true,
    order: 17,
    color: 'from-orange-400 to-orange-600',
    tags: ['house', 'residence']
  },
  {
    id: 'school',
    image: '🏫',
    text: { en: 'school', ar: 'مدرسة' },
    category: 'places',
    level: 'basic',
    enabled: true,
    order: 18,
    color: 'from-blue-400 to-blue-600',
    tags: ['education', 'learning']
  },
  
  // Social - Basic
  {
    id: 'hello',
    image: '👋',
    text: { en: 'hello', ar: 'مرحبا' },
    category: 'social',
    level: 'basic',
    enabled: true,
    order: 19,
    color: 'from-primary-400 to-primary-600',
    tags: ['greeting', 'hi']
  },
  {
    id: 'thank-you',
    image: '👍',
    text: { en: 'thank you', ar: 'شكرا' },
    category: 'social',
    level: 'basic',
    enabled: true,
    order: 20,
    color: 'from-green-400 to-green-600',
    tags: ['gratitude', 'thanks']
  },
  {
    id: 'please',
    image: '🙏',
    text: { en: 'please', ar: 'من فضلك' },
    category: 'social',
    level: 'basic',
    enabled: true,
    order: 21,
    color: 'from-blue-400 to-blue-600',
    tags: ['request', 'polite']
  },
  {
    id: 'yes',
    image: '✅',
    text: { en: 'yes', ar: 'نعم' },
    category: 'social',
    level: 'basic',
    enabled: true,
    order: 22,
    color: 'from-green-400 to-green-600',
    tags: ['agree', 'okay']
  },
  {
    id: 'no',
    image: '❌',
    text: { en: 'no', ar: 'لا' },
    category: 'social',
    level: 'basic',
    enabled: true,
    order: 23,
    color: 'from-red-400 to-red-600',
    tags: ['refuse', 'deny']
  },
  
  // Intermediate phrases
  {
    id: 'i-want-water',
    image: '💧',
    text: { en: 'I want water', ar: 'أريد ماء' },
    category: 'needs',
    level: 'intermediate',
    enabled: true,
    order: 24,
    color: 'from-blue-400 to-blue-600',
    tags: ['thirst', 'drink']
  },
  {
    id: 'i-want-food',
    image: '🍎',
    text: { en: 'I want food', ar: 'أريد طعام' },
    category: 'needs',
    level: 'intermediate',
    enabled: true,
    order: 25,
    color: 'from-red-400 to-red-600',
    tags: ['hungry', 'eat']
  },
  {
    id: 'i-am-happy',
    image: '😊',
    text: { en: 'I am happy', ar: 'أنا سعيد' },
    category: 'feelings',
    level: 'intermediate',
    enabled: true,
    order: 26,
    color: 'from-yellow-400 to-yellow-600',
    tags: ['joy', 'glad']
  },
  {
    id: 'i-am-sad',
    image: '😢',
    text: { en: 'I am sad', ar: 'أنا حزين' },
    category: 'feelings',
    level: 'intermediate',
    enabled: true,
    order: 27,
    color: 'from-blue-400 to-blue-600',
    tags: ['unhappy', 'upset']
  },
  {
    id: 'i-want-to-play',
    image: '🎮',
    text: { en: 'I want to play', ar: 'أريد أن ألعب' },
    category: 'activities',
    level: 'intermediate',
    enabled: true,
    order: 28,
    color: 'from-purple-400 to-purple-600',
    tags: ['fun', 'game']
  },
  {
    id: 'i-need-help',
    image: '🆘',
    text: { en: 'I need help', ar: 'أحتاج مساعدة' },
    category: 'actions',
    level: 'intermediate',
    enabled: true,
    order: 29,
    color: 'from-orange-400 to-orange-600',
    tags: ['assistance', 'support']
  },
  
  // Advanced sentences
  {
    id: 'i-want-to-go-home',
    image: '🏠',
    text: { en: 'I want to go home', ar: 'أريد الذهاب إلى المنزل' },
    category: 'places',
    level: 'advanced',
    enabled: true,
    order: 30,
    color: 'from-orange-400 to-orange-600',
    tags: ['home', 'leave']
  },
  {
    id: 'i-love-you',
    image: '❤️',
    text: { en: 'I love you', ar: 'أحبك' },
    category: 'social',
    level: 'advanced',
    enabled: true,
    order: 31,
    color: 'from-red-400 to-red-600',
    tags: ['love', 'affection']
  }
]

export const categoryLabels: Record<VocabularyCategory, string> = {
  needs: 'Needs',
  actions: 'Actions',
  feelings: 'Feelings',
  people: 'People',
  places: 'Places',
  social: 'Social',
  activities: 'Activities'
}

export const levelLabels: Record<VocabularyLevel, string> = {
  basic: 'Basic',
  intermediate: 'Intermediate',
  advanced: 'Advanced'
}
