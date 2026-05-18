import { VocabularyItem, AACSettings, UsageAnalytics, SmartSuggestion, VocabularyLevel, Language, Location } from '../types/aac'
import { defaultVocabulary } from '../data/vocabularyData'
import { api } from '../utils/api'
import { API_ENDPOINTS } from '../config/api'

// Mock API service - replace with actual API calls
class AACService {
  private vocabulary: VocabularyItem[] = [...defaultVocabulary]
  private settings: Map<string, AACSettings> = new Map()
  private analytics: Map<string, UsageAnalytics[]> = new Map()
  // Track which vocabulary items are assigned to which child
  private childVocabulary: Map<string, Set<string>> = new Map()

  // Initialize default vocabulary for a child (all enabled items)
  private initializeChildVocabulary(childId: string): void {
    if (!this.childVocabulary.has(childId)) {
      const enabledItems = this.vocabulary.filter(item => item.enabled)
      this.childVocabulary.set(childId, new Set(enabledItems.map(item => item.id)))
    }
  }

  // Vocabulary Management
  async getVocabulary(childId: string, _level?: VocabularyLevel): Promise<VocabularyItem[]> {
    try {
      const response = await api.get<any[]>(`${API_ENDPOINTS.VOCABULARY.CHILD}?childId=${childId}`)
      if (response.status === 'success' && Array.isArray(response.data)) {
        return response.data.map((item): VocabularyItem => {
          const textField = item.text as { en?: string; ar?: string } | null
          return {
            id: item.id,
            image: item.imageUrl || '',
            text: {
              en: textField?.en || '',
              ar: textField?.ar || '',
            },
            category: item.category as VocabularyItem['category'],
            level: ((item.level as string)?.toLowerCase() || 'basic') as VocabularyLevel,
            enabled: item.enabled ?? true,
            order: item.order ?? 0,
            audioUrl: item.audioUrl || undefined,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }
        })
      }
      return []
    } catch (error) {
      console.error('Failed to fetch vocabulary from API, falling back to defaults:', error)
      // Fallback: return in-memory defaults so the board is never blank
      this.initializeChildVocabulary(childId)
      const childVocabSet = this.childVocabulary.get(childId)!
      return this.vocabulary
        .filter(item => childVocabSet.has(item.id) && item.enabled)
        .sort((a, b) => a.order - b.order)
    }
  }

  async getAllVocabulary(): Promise<VocabularyItem[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return [...this.vocabulary]
  }

  // Get vocabulary assigned to a specific child
  async getChildVocabulary(childId: string): Promise<VocabularyItem[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    this.initializeChildVocabulary(childId)
    const childVocabSet = this.childVocabulary.get(childId)!
    return this.vocabulary.filter(item => childVocabSet.has(item.id))
  }

  // Add a vocabulary item to a child's vocabulary
  async addCardToChild(childId: string, vocabularyId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200))
    this.initializeChildVocabulary(childId)
    const childVocabSet = this.childVocabulary.get(childId)!
    childVocabSet.add(vocabularyId)
  }

  // Remove a vocabulary item from a child's vocabulary
  async removeCardFromChild(childId: string, vocabularyId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200))
    this.initializeChildVocabulary(childId)
    const childVocabSet = this.childVocabulary.get(childId)!
    childVocabSet.delete(vocabularyId)
  }

  // Check if a vocabulary item is assigned to a child
  async isCardAssignedToChild(childId: string, vocabularyId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 50))
    this.initializeChildVocabulary(childId)
    const childVocabSet = this.childVocabulary.get(childId)!
    return childVocabSet.has(vocabularyId)
  }

  async addVocabulary(item: Omit<VocabularyItem, 'id' | 'createdAt' | 'updatedAt'>, childId?: string): Promise<VocabularyItem> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const newItem: VocabularyItem = {
      ...item,
      id: `vocab-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.vocabulary.push(newItem)
    
    // If childId is provided, automatically assign to that child
    if (childId) {
      await this.addCardToChild(childId, newItem.id)
    }
    
    return newItem
  }

  async updateVocabulary(id: string, updates: Partial<VocabularyItem>): Promise<VocabularyItem> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const index = this.vocabulary.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Vocabulary item not found')
    
    this.vocabulary[index] = {
      ...this.vocabulary[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    return this.vocabulary[index]
  }

  async deleteVocabulary(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200))
    this.vocabulary = this.vocabulary.filter(item => item.id !== id)
  }

  // Settings Management
  async getSettings(childId: string): Promise<AACSettings> {
    try {
      const response = await api.get<any>(API_ENDPOINTS.SETTINGS.GET(childId))
      if (response.status === 'success' && response.data) {
        const raw = response.data
        const settings: AACSettings = {
          ...raw,
          // DB stores enums uppercase (BASIC, SENTENCE); frontend expects lowercase
          vocabularyLevel: ((raw.vocabularyLevel as string)?.toLowerCase() || 'basic') as VocabularyLevel,
          speechMode: raw.speechMode ? (raw.speechMode as string).toLowerCase() as 'instant' | 'sentence' : undefined,
        }
        this.settings.set(childId, settings)
        return settings
      }
    } catch (error) {
      console.error('Failed to fetch settings from API, using defaults:', error)
    }

    // Fallback to cached or default settings
    if (!this.settings.has(childId)) {
      const defaultSettings: AACSettings = {
        childId,
        primaryLanguage: 'en',
        voiceType: 'child',
        speechSpeed: 1.0,
        volume: 1.0,
        maxSentenceLength: 10,
        visibleImageCount: 0,
        vocabularyLevel: 'basic',
      }
      this.settings.set(childId, defaultSettings)
      return defaultSettings
    }

    return this.settings.get(childId)!
  }

  async updateSettings(childId: string, updates: Partial<AACSettings>): Promise<AACSettings> {
    try {
      // DB stores enums uppercase; map them back before sending
      const dbUpdates: Record<string, any> = { ...updates }
      if (updates.vocabularyLevel) {
        dbUpdates.vocabularyLevel = updates.vocabularyLevel.toUpperCase()
      }
      if (updates.speechMode) {
        dbUpdates.speechMode = updates.speechMode.toUpperCase()
      }
      const response = await api.put<any>(API_ENDPOINTS.SETTINGS.UPDATE(childId), dbUpdates)
      if (response.status === 'success' && response.data) {
        const raw = response.data
        const settings: AACSettings = {
          ...raw,
          vocabularyLevel: ((raw.vocabularyLevel as string)?.toLowerCase() || 'basic') as VocabularyLevel,
          speechMode: raw.speechMode ? (raw.speechMode as string).toLowerCase() as 'instant' | 'sentence' : undefined,
        }
        this.settings.set(childId, settings)
        return settings
      }
    } catch (error) {
      console.error('Failed to update settings in API, saving in-memory only:', error)
    }
    // Fallback: merge in-memory so the UI reflects the change for this session
    const current = await this.getSettings(childId)
    const updated = { ...current, ...updates }
    this.settings.set(childId, updated)
    return updated
  }

  // Analytics
  async getAnalytics(childId: string, date?: string): Promise<UsageAnalytics> {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const targetDate = date || new Date().toISOString().split('T')[0]
    const analytics = this.analytics.get(childId) || []
    const dayAnalytics = analytics.find(a => a.date === targetDate)
    
    if (dayAnalytics) {
      return dayAnalytics
    }
    
    // Return default empty analytics
    return {
      childId,
      date: targetDate,
      mostUsedImages: [],
      sentenceFrequency: 0,
      usageTimePatterns: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 })),
      totalSentences: 0,
      averageSentenceLength: 0
    }
  }

  async recordUsage(childId: string, vocabularyIds: string[], sentence?: string): Promise<void> {
    try {
      await api.post(`/analytics/${childId}/usage`, {
        vocabularyIds,
        sentence,
      });
    } catch (err) {
      console.error('Failed to record usage in database:', err);
    }
    
    await new Promise(resolve => setTimeout(resolve, 50))
    
    const today = new Date().toISOString().split('T')[0]
    const hour = new Date().getHours()
    
    let analytics = this.analytics.get(childId) || []
    let dayAnalytics = analytics.find(a => a.date === today)
    
    if (!dayAnalytics) {
      dayAnalytics = {
        childId,
        date: today,
        mostUsedImages: [],
        sentenceFrequency: 0,
        usageTimePatterns: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 })),
        totalSentences: 0,
        averageSentenceLength: 0
      }
      analytics.push(dayAnalytics)
      this.analytics.set(childId, analytics)
    }
    
    // Update sentence count
    dayAnalytics.totalSentences++
    dayAnalytics.sentenceFrequency++
    dayAnalytics.averageSentenceLength = 
      (dayAnalytics.averageSentenceLength * (dayAnalytics.totalSentences - 1) + vocabularyIds.length) / 
      dayAnalytics.totalSentences
    
    // Update usage by hour
    dayAnalytics.usageTimePatterns[hour].count++
    
    // Update most used images
    vocabularyIds.forEach(vocabId => {
      const existing = dayAnalytics.mostUsedImages.find(m => m.vocabularyId === vocabId)
      if (existing) {
        existing.count++
      } else {
        const vocab = this.vocabulary.find(v => v.id === vocabId)
        if (vocab) {
          dayAnalytics.mostUsedImages.push({
            vocabularyId: vocabId,
            count: 1,
            vocabulary: vocab
          })
        }
      }
    })
    
    // Sort most used images
    dayAnalytics.mostUsedImages.sort((a, b) => b.count - a.count)
  }

  // Smart Suggestions (deprecated - kept for backward compatibility)
  async getSuggestions(childId: string, currentSentence: VocabularyItem[]): Promise<SmartSuggestion[]> {
    await new Promise(resolve => setTimeout(resolve, 150))
    
    // Feature removed - always return empty array
    return []
    
    const suggestions: SmartSuggestion[] = []
    const vocabulary = await this.getVocabulary(childId)
    
    // If sentence is empty, suggest common starters
    if (currentSentence.length === 0) {
      const starters = vocabulary
        .filter(v => v.category === 'actions' && v.id === 'want')
        .slice(0, 1)
      suggestions.push(...starters.map(v => ({
        vocabularyId: v.id,
        vocabulary: v,
        reason: 'Common sentence starter',
        confidence: 0.8
      })))
    }
    
    // If sentence starts with "I", suggest verbs or objects
    if (currentSentence.length === 1 && currentSentence[0].text.en.toLowerCase() === 'i') {
      const verbs = vocabulary
        .filter(v => v.category === 'actions' && ['want', 'go', 'play'].includes(v.id))
        .slice(0, 3)
      suggestions.push(...verbs.map(v => ({
        vocabularyId: v.id,
        vocabulary: v,
        reason: 'Common action after "I"',
        confidence: 0.7
      })))
    }
    
    // If sentence has "want", suggest objects
    if (currentSentence.some(v => v.id === 'want' || v.text.en.toLowerCase().includes('want'))) {
      const objects = vocabulary
        .filter(v => ['needs', 'activities'].includes(v.category))
        .slice(0, 5)
      suggestions.push(...objects.map(v => ({
        vocabularyId: v.id,
        vocabulary: v,
        reason: 'Common object after "want"',
        confidence: 0.6
      })))
    }
    
    return suggestions.slice(0, 5)
  }

  // Location Management
  async getLocations(childId: string): Promise<Location[]> {
    try {
      const response = await api.get<Location[]>(API_ENDPOINTS.LOCATIONS.GET(childId))
      if (response.status === 'success' && response.data) {
        return response.data
      }
      return []
    } catch (error) {
      console.error('Failed to fetch locations:', error)
      return []
    }
  }

  async addLocation(childId: string, location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<Location> {
    const response = await api.post<Location>(API_ENDPOINTS.LOCATIONS.CREATE(childId), location)
    if (response.status === 'success' && response.data) {
      return response.data
    }
    throw new Error(response.message || 'Failed to add location')
  }

  async updateLocation(childId: string, locationId: string, updates: Partial<Location>): Promise<Location> {
    const response = await api.put<Location>(API_ENDPOINTS.LOCATIONS.UPDATE(childId, locationId), updates)
    if (response.status === 'success' && response.data) {
      return response.data
    }
    throw new Error(response.message || 'Failed to update location')
  }

  async deleteLocation(childId: string, locationId: string): Promise<void> {
    const response = await api.delete(API_ENDPOINTS.LOCATIONS.DELETE(childId, locationId))
    if (response.status !== 'success') {
      throw new Error(response.message || 'Failed to delete location')
    }
  }
}

export const aacService = new AACService()
