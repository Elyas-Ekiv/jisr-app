import { motion } from 'framer-motion'
import { Lightbulb, X } from 'lucide-react'
import { SmartSuggestion } from '../../types/aac'
import Card from '../Card'
import { useLanguage } from '../../context/LanguageContext'

interface SmartSuggestionsProps {
  suggestions: SmartSuggestion[]
  onSelect: (suggestion: SmartSuggestion) => void
  onDismiss: () => void
}

export default function SmartSuggestions({
  suggestions,
  onSelect,
  onDismiss
}: SmartSuggestionsProps) {
  const { language } = useLanguage()
  if (suggestions.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-4"
    >
      <Card className="p-4 bg-yellow-50 border-4 border-yellow-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-bold text-gray-900">Suggestions</h3>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-yellow-200 rounded-lg transition-colors"
            aria-label="Dismiss suggestions"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.vocabularyId}
              onClick={() => onSelect(suggestion)}
              className={`
                px-3 py-2 rounded-lg bg-white border-2 border-yellow-300
                hover:bg-yellow-100 hover:border-yellow-400 transition-all
                flex items-center space-x-2
              `}
            >
              <span className="text-xl">{suggestion.vocabulary.image}</span>
              <span className="font-medium text-sm">{language === 'ar' && suggestion.vocabulary.text.ar ? suggestion.vocabulary.text.ar : suggestion.vocabulary.text.en}</span>
            </button>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
