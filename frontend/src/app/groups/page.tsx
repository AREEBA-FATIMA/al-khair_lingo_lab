'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Lock, 
  Unlock, 
  Trophy, 
  Star, 
  Leaf, 
  Target,
  Zap,
  BookOpen,
  CheckCircle,
  Clock,
  Flame
} from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import ProgressManager from '@/utils/progressManager'

interface Group {
  id: number
  group_number: number
  name: string
  description: string
  difficulty: number
  is_unlocked: boolean
  completion_percentage: number
  levels_completed: number
  total_levels: number
  xp_earned: number
  plant_stage: string
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState({
    total_xp: 0,
    current_streak: 0,
    hearts: 5,
    daily_goal: 50,
    total_levels_completed: 0,
    completion_percentage: 0,
    current_level: 1
  })
  const { isLoggedIn, user } = useAuth()

  useEffect(() => {
    fetchGroups()
    fetchUserStats()
    loadProgressFromLocalStorage()

    // Listen for level completion events
    const handleLevelCompleted = () => {
      loadProgressFromLocalStorage()
    }

    window.addEventListener('levelCompleted', handleLevelCompleted)
    return () => window.removeEventListener('levelCompleted', handleLevelCompleted)
  }, [])

  const loadProgressFromLocalStorage = () => {
    const progressManager = ProgressManager.getInstance()
    const userProgress = progressManager.getUserProgress()
    
    // Calculate proper completion percentage
    const totalLevels = 370 // Total levels in the system
    const completionPercentage = totalLevels > 0 ? (userProgress.completedLevels.length / totalLevels) * 100 : 0
    
    setUserStats(prev => ({
      ...prev,
      total_xp: userProgress.totalXP,
      current_streak: userProgress.currentStreak,
      hearts: userProgress.hearts,
      total_levels_completed: userProgress.completedLevels.length,
      completion_percentage: Math.round(completionPercentage),
      current_level: userProgress.highestUnlockedLevel
    }))
  }

  const fetchGroups = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/groups/')
      const data = await response.json()
      console.log('Groups data:', data) // Debug log
      setGroups(data.results || data) // Handle both paginated and non-paginated responses
    } catch (error) {
      console.error('Error fetching groups:', error)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />

      {/* Header with User Stats */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Learning Groups</h1>
              <p className="text-gray-600">Choose your learning path</p>
              
              {/* Overall Progress Bar */}
              <div className="mt-3 w-full max-w-md">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Overall Progress</span>
                  <span>{userStats.completion_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-[#03045e] to-[#00bfe6] h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, userStats.completion_percentage)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
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

      {/* Groups Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {groups && groups.length > 0 ? groups.map((group, index) => {
            const progressManager = ProgressManager.getInstance()
            const userProgress = progressManager.getUserProgress()
            
            // Calculate group progress based on completed levels in this specific group
            const groupLevels = userProgress.completedLevels.filter(levelId => {
              // This is a simplified calculation - in real app, you'd check which group the level belongs to
              return levelId >= (group.group_number * 20) && levelId < ((group.group_number + 1) * 20)
            })
            const groupProgress = Math.min(100, (groupLevels.length / 20) * 100) // 20 levels per group
            const plantStage = getPlantStage(groupProgress)
            const difficultyColor = getDifficultyColor(group.difficulty)
            const isLocked = group.group_number > 1 && userProgress.completedLevels.length < (group.group_number - 1) * 20
            
            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 ${
                  isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-2 hover:scale-105'
                }`}
              >
                {/* Lock Icon for locked groups */}
                {isLocked && (
                  <div className="absolute top-4 right-4">
                    <Lock className="h-6 w-6 text-gray-400" />
                  </div>
                )}

                {/* Plant Stage */}
                <div className="text-center mb-4">
                  <motion.div
                    className={`w-20 h-20 bg-gradient-to-br ${plantStage.color} rounded-full flex items-center justify-center text-4xl mx-auto shadow-lg`}
                    animate={!isLocked ? { 
                      y: [0, -5, 0],
                      rotate: [0, 2, -2, 0]
                    } : {}}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {plantStage.emoji}
                  </motion.div>
                  <p className="text-sm text-gray-600 mt-2">{plantStage.name}</p>
                            </div>

                {/* Group Info */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                              Group {group.group_number}
                            </h3>
                  <p className="text-gray-600 text-sm mb-2">{group.name}</p>
                  
                  {/* Difficulty Badge */}
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${difficultyColor}`}>
                    {getDifficultyName(group.difficulty)}
                          </div>
                        </div>
                        
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(groupProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className={`h-2 bg-gradient-to-r ${plantStage.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${groupProgress}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                        </div>
                      </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{group.levels_completed}</div>
                    <div className="text-xs text-gray-600">of {group.total_levels} levels</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{group.xp_earned}</div>
                    <div className="text-xs text-gray-600">XP earned</div>
                  </div>
                        </div>
                        
                        {/* Action Button */}
                <div className="text-center">
                  {isLocked ? (
                    <div className="bg-gray-100 text-gray-500 py-3 px-4 rounded-lg font-medium">
                      Complete previous group
                        </div>
                  ) : (
                    <Link
                      href={`/groups/${group.group_number}/levels`}
                      className="group/btn relative inline-block w-full bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white py-3 px-4 rounded-lg font-bold transition-all duration-300 hover:shadow-xl hover:scale-105"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {group.completion_percentage > 0 ? 'Continue' : 'Start'}
                        <BookOpen className="h-4 w-4" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#02033a] to-[#0099cc] rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    </Link>
                  )}
                      </div>

                {/* Completion Badge */}
                {group.completion_percentage === 100 && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white shadow-lg">
                      <Trophy className="h-4 w-4" />
                    </div>
                  </div>
                )}

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#03045e]/5 to-[#00bfe6]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </motion.div>
                )
          }) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 text-lg">No groups available</div>
              <p className="text-gray-400 mt-2">Groups will appear here once they are created</p>
            </div>
          )}
              </div>

        {/* Daily Goal Progress */}
        <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Daily Goal</h3>
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-[#00bfe6]" />
              <span className="text-sm text-gray-600">{userStats.total_xp} / {userStats.daily_goal} XP</span>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="h-3 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((userStats.total_xp / userStats.daily_goal) * 100, 100)}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          
          <p className="text-sm text-gray-600 mt-2">
            {userStats.total_xp >= userStats.daily_goal 
              ? "🎉 Daily goal completed! Great job!" 
              : `${userStats.daily_goal - userStats.total_xp} XP needed to complete daily goal`
            }
          </p>
        </div>
      </div>
    </div>
  )
}