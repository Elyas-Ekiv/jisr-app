import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2 } from 'lucide-react'
import { VocabularyItem } from '../../types/aac'
import Card from '../Card'
import { useLanguage } from '../../context/LanguageContext'

interface SentenceBuilderProps {
  sentence: VocabularyItem[]
  onRemove: (index: number) => void
  onClear: () => void
  maxLength?: number
}

export default function SentenceBuilder({
  sentence,
  onRemove,
  onClear,
  maxLength = 10
}: SentenceBuilderProps) {
  const { language } = useLanguage()
  const isAtMaxLength = sentence.length >= maxLength
  const sentenceText = sentence.map(item => language === 'ar' && item.text.ar ? item.text.ar : item.text.en).join(' ')

  return (
    <Card className="p-4 md:p-6 bg-gradient-to-br from-primary-50 to-primary-100 border-4 border-primary-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center">
          <span className="mr-2">📝</span>
          Your Sentence
          {sentence.length > 0 && (
            <span className="ml-3 text-lg text-primary-600">
              ({sentence.length}/{maxLength})
            </span>
          )}
        </h2>
        {sentence.length > 0 && (
          <button
            onClick={onClear}
            className="px-3 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center space-x-2"
            aria-label="Clear sentence"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Selected Images Display */}
      <div className={`
        min-h-[100px] md:min-h-[120px] p-3 md:p-4 
        bg-white rounded-xl border-2 border-dashed border-gray-300 mb-4
        ${isAtMaxLength ? 'border-red-400 bg-red-50' : ''}
      `}>
        {sentence.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p className="text-base md:text-lg text-center">
              Tap images below to build your sentence
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 md:gap-3">
            <AnimatePresence>
              {sentence.map((item, index) => (
                <motion.div
                  key={`${item.id}-${index}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="relative group"
                >
                  <div className={`
                    px-3 py-2 md:px-4 md:py-3 rounded-xl 
                    bg-gradient-to-br ${item.color || 'from-gray-400 to-gray-600'} 
                    text-white font-bold text-sm md:text-base shadow-lg 
                    flex items-center space-x-2 cursor-pointer hover:scale-105 transition-transform
                  `}>
                    <span className="text-xl md:text-2xl">{item.image}</span>
                    <span className="hidden sm:inline">{language === 'ar' && item.text.ar ? item.text.ar : item.text.en}</span>
                  </div>
                  <button
                    onClick={() => onRemove(index)}
                    className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                    aria-label={`Remove ${language === 'ar' && item.text.ar ? item.text.ar : item.text.en}`}
                  >
                    <X className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Sentence Text Preview */}
      {sentence.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 md:p-4 bg-white rounded-xl border-2 border-primary-200"
        >
          <p className="text-lg md:text-xl font-semibold text-gray-700 text-center">
            {sentenceText}
          </p>
        </motion.div>
      )}

      {/* Max Length Warning */}
      {isAtMaxLength && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 bg-yellow-100 border-2 border-yellow-400 rounded-lg text-center"
        >
          <p className="text-sm font-medium text-yellow-800">
            Maximum sentence length reached ({maxLength} items)
          </p>
        </motion.div>
      )}
    </Card>
  )
}
