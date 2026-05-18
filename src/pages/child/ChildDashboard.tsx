import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  MessageSquare,
  Gamepad2,
  Trophy,
  Star,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ArrowLeft,
  LayoutDashboard
} from 'lucide-react'
import ChildLayout from '../../layouts/ChildLayout'
import Card from '../../components/Card'
import { useChild } from '../../context/ChildContext'

export default function ChildDashboard() {
  const { activeChild, children: childList, setActiveChildId } = useChild()
  const childName = activeChild?.name || 'Friend'

  const quickActions = [
    {
      id: 'talk',
      title: 'Talk',
      description: 'Build sentences with pictures',
      emoji: '💬',
      path: '/child/aac',
      color: 'from-green-400 to-green-600',
      highlight: true
    },
    {
      id: 'play',
      title: 'Play & Learn',
      description: 'Fun games and activities',
      emoji: '🎮',
      path: '/child/play',
      color: 'from-purple-400 to-purple-600'
    },
    {
      id: 'badges',
      title: 'My Badges',
      description: 'See your achievements',
      emoji: '🏆',
      path: '/child/badges',
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      id: 'stars',
      title: 'My Stars',
      description: 'Check your progress',
      emoji: '⭐',
      path: '/child/stars',
      color: 'from-orange-400 to-orange-600'
    }
  ]

  // Build greeting based on time of day
  const hour = new Date().getHours()
  let greeting = 'Hello'
  if (hour >= 5 && hour < 12) greeting = 'Good morning'
  else if (hour >= 12 && hour < 17) greeting = 'Good afternoon'
  else if (hour >= 17 && hour < 21) greeting = 'Good evening'
  else greeting = 'Good night'

  return (
    <ChildLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto p-4"
      >
        {/* Top bar: back to parent dashboard + child picker */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/80 backdrop-blur text-primary-700 font-semibold shadow-lg border border-primary-200 hover:bg-primary-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <LayoutDashboard className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>

          {/* Child picker — only visible when multiple children exist */}
          {childList.length > 1 && (
            <div className="relative inline-block">
              <select
                value={activeChild?.id || ''}
                onChange={(e) => setActiveChildId(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-2xl bg-white border-2 border-primary-300 text-primary-800 font-bold text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer"
              >
                {childList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-600" />
            </div>
          )}
        </div>

        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            {greeting}, {childName}!
          </h1>
          <p className="text-xl md:text-2xl text-gray-600">
            What would you like to do today?
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Link key={action.id} to={action.path}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`
                  p-6 border-4 transition-all cursor-pointer h-full
                  ${action.highlight
                    ? 'border-primary-400 bg-gradient-to-br from-primary-50 to-white shadow-xl hover:shadow-2xl'
                    : 'border-transparent hover:border-primary-200 shadow-lg hover:shadow-xl'
                  }
                `}>
                  <div className="flex items-start space-x-5">
                    {/* Large Emoji */}
                    <div className={`
                      w-20 h-20 rounded-2xl bg-gradient-to-br ${action.color}
                      flex items-center justify-center text-4xl shadow-lg
                      flex-shrink-0
                    `}>
                      {action.emoji}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                          {action.title}
                        </h2>
                        {action.highlight && (
                          <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-lg mb-4">
                        {action.description}
                      </p>
                      <div className="flex items-center text-primary-600 font-medium">
                        <span>Go there</span>
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-gray-900">1,250</div>
            <div className="text-sm text-gray-600">Stars</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-300">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-gray-900">8</div>
            <div className="text-sm text-gray-600">Badges</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300">
            <div className="text-3xl mb-2">🎮</div>
            <div className="text-2xl font-bold text-gray-900">12</div>
            <div className="text-sm text-gray-600">Games</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-gray-900">5</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </Card>
        </div>

        {/* Encouragement Message */}
        <Card className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 border-4 border-primary-200 text-center">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <Sparkles className="w-6 h-6 text-primary-600" />
            <h3 className="text-xl font-bold text-gray-900">
              You're doing great!
            </h3>
            <Sparkles className="w-6 h-6 text-primary-600" />
          </div>
          <p className="text-gray-600 text-lg">
            Keep learning and having fun! 🌟
          </p>
        </Card>
      </motion.div>
    </ChildLayout>
  )
}
