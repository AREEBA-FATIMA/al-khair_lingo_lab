'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Lock, 
  Unlock, 
  CheckCircle, 
  Clock, 
  Star, 
  Trophy,
  Zap,
  Flame,
  ArrowLeft,
  Play,
  Target,
  Leaf
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import PenguinMascot from '@/components/PenguinMascot'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import ProgressManager from '@/utils/progressManager'

interface Level {
  id: number
  level_number: number
  name: string
  description: string
  difficulty: number
  xp_reward: number
  is_unlocked: boolean
  is_completed: boolean
  is_test_level: boolean
  questions_count: number
  completion_percentage: number
  score: number
  attempts: number
  time_spent: number
}

interface Group {
  id: number
  group_number: number
  name: string
  description: string
  difficulty: number
  completion_percentage: number
  levels_completed: number
  total_levels: number
}

export default function LevelsPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.groupId as string
  const [levels, setLevels] = useState<Level[]>([])
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState({
    total_xp: 0,
    current_streak: 0,
    hearts: 5
  })
  const { isLoggedIn } = useAuth()

  useEffect(() => {
    fetchGroupData()
    fetchLevels()
    fetchUserStats()
    loadProgressFromLocalStorage()

    // Listen for level completion events
    const handleLevelCompleted = () => {
      loadProgressFromLocalStorage()
    }

    window.addEventListener('levelCompleted', handleLevelCompleted)
    return () => window.removeEventListener('levelCompleted', handleLevelCompleted)
  }, [groupId])

  const loadProgressFromLocalStorage = () => {
    const progressManager = ProgressManager.getInstance()
    const userProgress = progressManager.getUserProgress()
    
    setUserStats(prev => ({
      ...prev,
      total_xp: userProgress.totalXP,
      current_streak: userProgress.currentStreak,
      hearts: userProgress.hearts
    }))
  }

  const fetchGroupData = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/groups/${groupId}/`)
      const data = await response.json()
      console.log('Group data:', data) // Debug log
      setGroup(data)
    } catch (error) {
      console.error('Error fetching group:', error)
    }
  }

  const fetchLevels = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/groups/${groupId}/levels/`)
      const data = await response.json()
      console.log('Levels data:', data) // Debug log
      setLevels(data.results || data) // Handle both paginated and non-paginated responses
    } catch (error) {
      console.error('Error fetching levels:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/progress/overview/')
      const data = await response.json()
      setUserStats(data)
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const getPlantStage = (completionPercentage: number) => {
    if (completionPercentage >= 80) return { emoji: '🍎', name: 'Fruit Tree', color: 'from-green-400 to-green-600' }
    if (completionPercentage >= 60) return { emoji: '🌲', name: 'Tree', color: 'from-green-500 to-green-700' }
    if (completionPercentage >= 40) return { emoji: '🌳', name: 'Sapling', color: 'from-green-600 to-green-800' }
    if (completionPercentage >= 20) return { emoji: '🌿', name: 'Sprout', color: 'from-green-700 to-green-900' }
    return { emoji: '🌱', name: 'Seed', color: 'from-yellow-400 to-green-600' }
  }

  const getDifficultyColor = (difficulty: number) => {
    const colors = [
      'from-green-400 to-green-600',    // Beginner
      'from-blue-400 to-blue-600',      // Elementary
      'from-yellow-400 to-orange-500',  // Intermediate
      'from-orange-400 to-red-500',     // Upper Intermediate
      'from-red-400 to-purple-600'      // Advanced
    ]
    return colors[difficulty - 1] || colors[0]
  }

  const getDifficultyName = (difficulty: number) => {
    const names = ['Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate', 'Advanced']
    return names[difficulty - 1] || 'Beginner'
  }

  const handleLevelClick = (level: Level) => {
    const progressManager = ProgressManager.getInstance()
    const isUnlocked = progressManager.isLevelUnlocked(level.level_number)
    
    if (!isUnlocked) {
      alert('Complete previous levels to unlock this level!')
      return
    }
    
    router.push(`/groups/${groupId}/levels/${level.level_number}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#00bfe6] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <p className="text-red-500">Group not found</p>
        </div>
      </div>
    )
  }

  const plantStage = getPlantStage(group.completion_percentage)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/groups"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Group {group.group_number}: {group.name}
                </h1>
                <p className="text-gray-600">{group.description}</p>
              </div>
            </div>
            
            {/* User Stats */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="font-bold text-gray-900">{userStats.total_xp}</span>
                <span className="text-gray-600">XP</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="font-bold text-gray-900">{userStats.current_streak}</span>
                <span className="text-gray-600">day streak</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full ${
                        i < userStats.hearts ? 'bg-red-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Group Progress */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <motion.div
                className={`w-16 h-16 bg-gradient-to-br ${plantStage.color} rounded-full flex items-center justify-center text-3xl shadow-lg`}
                animate={{ 
                  y: [0, -5, 0],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {plantStage.emoji}
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{plantStage.name}</h2>
                <p className="text-gray-600">Group Progress</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{group.levels_completed}</div>
              <div className="text-sm text-gray-600">of {group.total_levels} levels</div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className={`h-3 bg-gradient-to-r ${plantStage.color} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${group.completion_percentage}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>{Math.round(group.completion_percentage)}% Complete</span>
            <span>{getDifficultyName(group.difficulty)} Level</span>
          </div>
        </div>

        {/* Levels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {levels && levels.length > 0 ? levels.map((level, index) => {
            const progressManager = ProgressManager.getInstance()
            const isLocked = !progressManager.isLevelUnlocked(level.level_number)
            const isCompleted = progressManager.isLevelCompleted(level.level_number)
            const completionPercentage = progressManager.getLevelCompletionPercentage(level.level_number)
            const isTestLevel = level.is_test_level
            
            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`group relative bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-1 hover:scale-105 cursor-pointer'
                } ${isCompleted ? 'ring-2 ring-green-400' : ''}`}
                onClick={() => handleLevelClick(level)}
              >
                {/* Level Number */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isLocked 
                        ? 'bg-gray-300 text-gray-500' 
                        : 'bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white'
                  }`}>
                    {level.level_number}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {isLocked ? (
                      <Lock className="h-4 w-4 text-gray-400" />
                    ) : isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Play className="h-4 w-4 text-[#00bfe6]" />
                    )}
                    
                    {isTestLevel && (
                      <Trophy className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>

                {/* Level Info */}
                <div className="mb-3">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">
                    {level.name}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">
                    {level.questions_count} questions
                  </p>
                  
                  {isTestLevel && (
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-yellow-800 bg-yellow-100">
                      Test Level
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {completionPercentage > 0 && (
                  <div className="mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="h-1.5 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-full"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {Math.round(completionPercentage)}% complete
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Zap className="h-3 w-3" />
                    <span>{level.xp_reward} XP</span>
                  </div>
                  {level.attempts > 0 && (
                    <div className="flex items-center space-x-1">
                      <Target className="h-3 w-3" />
                      <span>{level.score}%</span>
                    </div>
                  )}
                </div>

                {/* Completion Badge */}
                {isCompleted && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white shadow-lg">
                      <CheckCircle className="h-3 w-3" />
                    </div>
                  </div>
                )}

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#03045e]/5 to-[#00bfe6]/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
            )
          }) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 text-lg">No levels available</div>
              <p className="text-gray-400 mt-2">Levels will appear here once they are created</p>
            </div>
          )}
        </div>

        {/* Group Jump Test */}
        {group.completion_percentage >= 80 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-center"
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Trophy className="h-8 w-8 text-white" />
              <h3 className="text-xl font-bold text-white">Group Jump Test Available!</h3>
            </div>
            <p className="text-white/90 mb-4">
              You've completed 80% of this group. Take the jump test to unlock the next group!
            </p>
            <button className="bg-white text-orange-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors">
              Take Jump Test
            </button>
          </motion.div>
        )}
      </div>

      {/* Penguin Mascot */}
      <PenguinMascot />
    </div>
  )
}
