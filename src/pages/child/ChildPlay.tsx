import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Gamepad2,
  BookOpen,
  Sparkles,
  Music,
  Paintbrush,
  Calculator,
  Play,
  Star,
  Lock,
  CheckCircle,
  Trophy,
  Volume2
} from 'lucide-react'
import ChildLayout from '../../layouts/ChildLayout'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { useTextToSpeech } from '../../hooks/useTextToSpeech'

export default function ChildPlay() {
  const { speak } = useTextToSpeech()
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Games', icon: Gamepad2, color: 'from-purple-400 to-purple-600' },
    { id: 'math', name: 'Math', icon: Calculator, color: 'from-blue-400 to-blue-600' },
    { id: 'reading', name: 'Reading', icon: BookOpen, color: 'from-green-400 to-green-600' },
    { id: 'science', name: 'Science', icon: Sparkles, color: 'from-yellow-400 to-yellow-600' },
    { id: 'art', name: 'Art', icon: Paintbrush, color: 'from-pink-400 to-pink-600' },
    { id: 'music', name: 'Music', icon: Music, color: 'from-indigo-400 to-indigo-600' }
  ]

  const games = [
    {
      id: 1,
      title: 'Number Adventure',
      category: 'math',
      description: 'Help the bunny collect numbers!',
      difficulty: 'Easy',
      stars: 3,
      unlocked: true,
      completed: true,
      progress: 100,
      color: 'from-blue-400 to-blue-600',
      speakText: 'Number Adventure. Help the bunny collect numbers!'
    },
    {
      id: 2,
      title: 'Space Explorer',
      category: 'science',
      description: 'Discover planets and stars!',
      difficulty: 'Medium',
      stars: 4,
      unlocked: true,
      completed: false,
      progress: 65,
      color: 'from-yellow-400 to-yellow-600',
      speakText: 'Space Explorer. Discover planets and stars!'
    },
    {
      id: 3,
      title: 'Story Time',
      category: 'reading',
      description: 'Read fun stories and answer questions!',
      difficulty: 'Easy',
      stars: 3,
      unlocked: true,
      completed: false,
      progress: 30,
      color: 'from-green-400 to-green-600',
      speakText: 'Story Time. Read fun stories and answer questions!'
    },
    {
      id: 4,
      title: 'Color Magic',
      category: 'art',
      description: 'Paint and create beautiful art!',
      difficulty: 'Easy',
      stars: 2,
      unlocked: true,
      completed: false,
      progress: 0,
      color: 'from-pink-400 to-pink-600',
      speakText: 'Color Magic. Paint and create beautiful art!'
    },
    {
      id: 5,
      title: 'Multiplication Master',
      category: 'math',
      description: 'Master your times tables!',
      difficulty: 'Medium',
      stars: 4,
      unlocked: false,
      completed: false,
      progress: 0,
      color: 'from-purple-400 to-purple-600',
      speakText: 'Multiplication Master. Master your times tables!'
    },
    {
      id: 6,
      title: 'Music Maker',
      category: 'music',
      description: 'Create your own music!',
      difficulty: 'Easy',
      stars: 3,
      unlocked: true,
      completed: false,
      progress: 0,
      color: 'from-indigo-400 to-indigo-600',
      speakText: 'Music Maker. Create your own music!'
    }
  ]

  const filteredGames = selectedCategory === 'all' 
    ? games 
    : games.filter(game => game.category === selectedCategory)

  const handleGameClick = (game: typeof games[0]) => {
    if (!game.unlocked) {
      speak('This game is locked. Complete other games to unlock it!')
      return
    }
    speak(game.speakText)
    // In a real app, this would navigate to the game
  }

  return (
    <ChildLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="inline-block mb-4"
          >
            <Gamepad2 className="w-16 h-16 text-primary-500" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Play & Learn
          </h1>
          <p className="text-xl text-gray-600">
            Choose a game and start learning while having fun! 🎮
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedCategory(category.id)
                    speak(`Showing ${category.name} games`)
                  }}
                  className={`
                    flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold text-lg transition-all
                    ${selectedCategory === category.id
                      ? `bg-gradient-to-r ${category.color} text-white shadow-xl`
                      : 'bg-white text-gray-700 hover:bg-gray-100 border-4 border-gray-200'
                    }
                  `}
                >
                  <Icon className="w-6 h-6" />
                  <span>{category.name}</span>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, type: "spring" }}
              onClick={() => handleGameClick(game)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleGameClick(game)
                }
              }}
              className="cursor-pointer"
            >
              <Card className={`p-6 border-4 ${game.unlocked ? 'border-transparent hover:border-primary-300' : 'border-gray-300 opacity-75'} transition-all relative overflow-hidden`}>
                {game.completed && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}
                
                {!game.unlocked && (
                  <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-10 rounded-2xl">
                    <div className="text-center">
                      <Lock className="w-16 h-16 text-white mx-auto mb-4" />
                      <p className="text-white font-bold text-xl">Locked</p>
                      <p className="text-white/80 text-sm mt-2">Complete previous games to unlock</p>
                    </div>
                  </div>
                )}

                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center mx-auto mb-4 shadow-xl`}>
                  <Gamepad2 className="w-12 h-12 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                  {game.title}
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  {game.description}
                </p>

                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < game.stars
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    game.difficulty === 'Easy'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {game.difficulty}
                  </span>
                </div>

                {game.progress > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium text-gray-700">Progress</span>
                      <span className="font-bold text-gray-900">{game.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`bg-gradient-to-r ${game.color} h-3 rounded-full`}
                        style={{ width: `${game.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <Button
                  variant={game.completed ? "secondary" : "primary"}
                  className="w-full text-lg py-4"
                  disabled={!game.unlocked}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleGameClick(game)
                  }}
                >
                  {game.completed ? (
                    <>
                      <Trophy className="inline w-5 h-5 mr-2" />
                      Completed!
                    </>
                  ) : game.progress > 0 ? (
                    <>
                      <Play className="inline w-5 h-5 mr-2" />
                      Continue Playing
                    </>
                  ) : (
                    <>
                      <Play className="inline w-5 h-5 mr-2" />
                      Start Game
                    </>
                  )}
                </Button>

                {/* Audio Indicator */}
                <div className="mt-3 flex items-center justify-center space-x-1 text-primary-600">
                  <Volume2 className="w-4 h-4" />
                  <span className="text-xs font-medium">Tap card to hear</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <Gamepad2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-xl">No games found in this category.</p>
          </div>
        )}
      </motion.div>
    </ChildLayout>
  )
}
