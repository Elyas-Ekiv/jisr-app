import { motion } from 'framer-motion'
import {
  Trophy,
  Award,
  Star,
  Crown,
  Medal,
  Target,
  Zap,
  Heart,
  BookOpen,
  Calculator,
  Sparkles,
  CheckCircle,
  Lock,
  Volume2
} from 'lucide-react'
import ChildLayout from '../../layouts/ChildLayout'
import Card from '../../components/Card'
import { useTextToSpeech } from '../../hooks/useTextToSpeech'

export default function ChildBadges() {
  const { speak } = useTextToSpeech()
  const earnedBadges = [
    {
      id: 1,
      title: 'Math Master',
      description: 'Completed 10 math lessons',
      icon: Calculator,
      color: 'from-blue-400 to-blue-600',
      earnedDate: '2 days ago',
      rarity: 'gold'
    },
    {
      id: 2,
      title: 'Science Explorer',
      description: 'Finished science module',
      icon: Sparkles,
      color: 'from-yellow-400 to-yellow-600',
      earnedDate: '5 days ago',
      rarity: 'silver'
    },
    {
      id: 3,
      title: 'Reading Champion',
      description: 'Read 20 stories',
      icon: BookOpen,
      color: 'from-green-400 to-green-600',
      earnedDate: '1 week ago',
      rarity: 'bronze'
    },
    {
      id: 4,
      title: 'Perfect Week',
      description: 'Completed all daily challenges',
      icon: Target,
      color: 'from-purple-400 to-purple-600',
      earnedDate: '2 weeks ago',
      rarity: 'gold'
    },
    {
      id: 5,
      title: 'Speed Learner',
      description: 'Completed 5 lessons in one day',
      icon: Zap,
      color: 'from-orange-400 to-orange-600',
      earnedDate: '3 weeks ago',
      rarity: 'silver'
    },
    {
      id: 6,
      title: 'Kind Helper',
      description: 'Helped others learn',
      icon: Heart,
      color: 'from-pink-400 to-pink-600',
      earnedDate: '1 month ago',
      rarity: 'bronze'
    }
  ]

  const lockedBadges = [
    {
      id: 7,
      title: 'Super Star',
      description: 'Earn 1000 stars',
      icon: Star,
      color: 'from-yellow-300 to-yellow-500',
      progress: 75,
      rarity: 'gold'
    },
    {
      id: 8,
      title: 'Crown Champion',
      description: 'Complete all lessons',
      icon: Crown,
      color: 'from-purple-300 to-purple-500',
      progress: 60,
      rarity: 'platinum'
    },
    {
      id: 9,
      title: 'Perfect Month',
      description: 'Complete 30 daily challenges',
      icon: Medal,
      color: 'from-blue-300 to-blue-500',
      progress: 40,
      rarity: 'gold'
    }
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'platinum': return 'border-purple-500 shadow-purple-200'
      case 'gold': return 'border-yellow-500 shadow-yellow-200'
      case 'silver': return 'border-gray-400 shadow-gray-200'
      case 'bronze': return 'border-orange-500 shadow-orange-200'
      default: return 'border-gray-300'
    }
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
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-block mb-4"
          >
            <Trophy className="w-16 h-16 text-yellow-500" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            My Badges Collection
          </h1>
          <p className="text-xl text-gray-600">
            You've earned {earnedBadges.length} amazing badges! Keep going! 🏆
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center border-4 border-yellow-300">
            <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <p className="text-3xl font-bold text-gray-900">{earnedBadges.length}</p>
            <p className="text-gray-600 font-medium">Badges Earned</p>
          </Card>
          <Card className="p-6 text-center border-4 border-primary-300">
            <Star className="w-12 h-12 text-primary-500 mx-auto mb-3" />
            <p className="text-3xl font-bold text-gray-900">1,250</p>
            <p className="text-gray-600 font-medium">Total Stars</p>
          </Card>
          <Card className="p-6 text-center border-4 border-secondary-300">
            <Target className="w-12 h-12 text-secondary-500 mx-auto mb-3" />
            <p className="text-3xl font-bold text-gray-900">3</p>
            <p className="text-gray-600 font-medium">More to Unlock</p>
          </Card>
        </div>

        {/* Earned Badges */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
            Earned Badges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {earnedBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, type: "spring" }}
              >
                <Card className={`p-6 text-center border-4 ${getRarityColor(badge.rarity)} shadow-2xl hover:scale-105 transition-transform`}>
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => speak(`${badge.title}. ${badge.description}. Earned ${badge.earnedDate}`)}
                    className={`w-32 h-32 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center mx-auto mb-4 shadow-xl cursor-pointer`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        speak(`${badge.title}. ${badge.description}. Earned ${badge.earnedDate}`)
                      }
                    }}
                  >
                    <badge.icon className="w-16 h-16 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {badge.title}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {badge.description}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    Earned {badge.earnedDate}
                  </p>
                  <div className="flex items-center justify-center space-x-1 text-primary-600">
                    <Volume2 className="w-4 h-4" />
                    <span className="text-xs font-medium">Tap to hear</span>
                  </div>
                  <div className="mt-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      badge.rarity === 'gold' ? 'bg-yellow-100 text-yellow-700' :
                      badge.rarity === 'silver' ? 'bg-gray-100 text-gray-700' :
                      badge.rarity === 'bronze' ? 'bg-orange-100 text-orange-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {badge.rarity.toUpperCase()}
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Locked Badges */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <Target className="w-8 h-8 text-gray-400 mr-3" />
            Coming Soon
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lockedBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1, type: "spring" }}
              >
                <Card className="p-6 text-center border-4 border-gray-300 opacity-75 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gray-900/20 flex items-center justify-center z-10">
                    <div className="text-center">
                      <Lock className="w-12 h-12 text-white mx-auto mb-2" />
                      <p className="text-white font-bold">Locked</p>
                    </div>
                  </div>
                  <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center mx-auto mb-4 opacity-50`}>
                    <badge.icon className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {badge.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {badge.description}
                  </p>
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">Progress</span>
                      <span className="font-bold text-gray-900">{badge.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </ChildLayout>
  )
}

