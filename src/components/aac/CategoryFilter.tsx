import { VocabularyCategory } from '../../types/aac'
import { categoryLabels } from '../../data/vocabularyData'
import { Home, Utensils, Heart, Gamepad2, Smile, StopCircle, MapPin, Users } from 'lucide-react'

const categoryIcons: Record<VocabularyCategory | 'all', typeof Home> = {
  all: Home,
  needs: Utensils,
  actions: StopCircle,
  feelings: Heart,
  people: Users,
  places: MapPin,
  social: Smile,
  activities: Gamepad2
}

interface CategoryFilterProps {
  selectedCategory: VocabularyCategory | 'all'
  onSelectCategory: (category: VocabularyCategory | 'all') => void
  availableCategories: (VocabularyCategory | 'all')[]
}

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  availableCategories
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
      {availableCategories.map((category) => {
        const Icon = categoryIcons[category]
        const isSelected = selectedCategory === category
        
        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`
              flex items-center space-x-2 px-4 md:px-6 py-2 md:py-3 
              rounded-xl md:rounded-2xl font-bold text-sm md:text-lg 
              transition-all transform hover:scale-105
              ${isSelected
                ? 'bg-primary-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100 border-2 md:border-4 border-gray-200'
              }
            `}
            aria-label={`Filter by ${category === 'all' ? 'all categories' : categoryLabels[category]}`}
          >
            <Icon className="w-4 h-4 md:w-6 md:h-6" />
            <span>{category === 'all' ? 'All' : categoryLabels[category]}</span>
          </button>
        )
      })}
    </div>
  )
}
