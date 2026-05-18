import { motion } from 'framer-motion'
import { VocabularyItem, VocabularyCategory } from '../../types/aac'
import Card from '../Card'
import { useLanguage } from '../../context/LanguageContext'

interface ImageGridProps {
  vocabulary: VocabularyItem[]
  selectedCategory: VocabularyCategory | 'all'
  onImageClick: (item: VocabularyItem) => void
  selectedCounts: Map<string, number>
  disabled?: boolean
}

export default function ImageGrid({
  vocabulary,
  selectedCategory,
  onImageClick,
  selectedCounts,
  disabled = false
}: ImageGridProps) {
  const { language } = useLanguage()
  const filteredVocabulary = selectedCategory === 'all'
    ? vocabulary
    : vocabulary.filter(item => item.category === selectedCategory)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {filteredVocabulary.map((item, index) => {
        const count = selectedCounts.get(item.id) || 0
        const isSelected = count > 0

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02, type: "spring", stiffness: 200 }}
            onClick={() => !disabled && onImageClick(item)}
            role="button"
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
              if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                onImageClick(item)
              }
            }}
            className={`cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={`Select ${language === 'ar' && item.text.ar ? item.text.ar : item.text.en}`}
          >
            <motion.div
              whileHover={!disabled ? { scale: 1.05 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
              className={`
                p-4 md:p-6 text-center border-4 transition-all rounded-2xl
                min-h-[180px] md:min-h-[200px] flex flex-col items-center justify-center
                ${isSelected 
                  ? 'border-primary-500 bg-primary-50 shadow-2xl' 
                  : 'border-gray-200 bg-white hover:border-primary-400 hover:shadow-xl'
                }
                ${disabled ? 'pointer-events-none' : ''}
              `}
            >
              {/* Extra Large Image/Emoji */}
              <div
                className={`
                  w-24 h-24 md:w-28 md:h-28 rounded-3xl 
                  bg-gradient-to-br ${item.color || 'from-gray-400 to-gray-600'} 
                  flex items-center justify-center mx-auto mb-3 md:mb-4 
                  shadow-xl text-5xl md:text-6xl
                `}
              >
                {item.image}
              </div>
              
              {/* Text Label - Larger */}
              <p className="text-base md:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                {language === 'ar' && item.text.ar ? item.text.ar : item.text.en}
              </p>
              
              {/* Selection Count Badge */}
              {count > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-2 px-3 py-1 bg-primary-600 text-white rounded-full text-sm font-bold"
                >
                  {count}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )
      })}
    </div>
  )
}
