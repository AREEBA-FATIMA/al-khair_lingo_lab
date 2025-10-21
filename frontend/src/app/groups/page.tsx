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
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#03045e] to-[#00bfe6] bg-clip-text text-transparent mb-2">
                Learning Groups
              </h1>
              <p className="text-gray-600 text-lg">Choose your learning path and grow your English skills</p>
              
              {/* Overall Progress Bar */}
              <div className="mt-4 w-full max-w-md">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span className="font-medium">Overall Progress</span>
                  <span className="font-bold text-[#03045e]">{userStats.completion_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                  <motion.div
                    className="bg-gradient-to-r from-[#03045e] to-[#00bfe6] h-3 rounded-full shadow-lg"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, userStats.completion_percentage)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
          </div>
          
            {/* User Stats */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3 bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-3 rounded-xl border border-yellow-200">
                <Zap className="h-6 w-6 text-yellow-500" />
                <div>
                  <span className="font-bold text-2xl text-gray-900">{userStats.total_xp}</span>
                  <span className="text-gray-600 ml-1">XP</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-3 rounded-xl border border-orange-200">
                <Flame className="h-6 w-6 text-orange-500" />
                <div>
                  <span className="font-bold text-2xl text-gray-900">{userStats.current_streak}</span>
                  <span className="text-gray-600 ml-1">day streak</span>
                </div>
              </div>
                      
              <div className="flex items-center space-x-3 bg-gradient-to-r from-red-50 to-pink-50 px-4 py-3 rounded-xl border border-red-200">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-5 h-5 rounded-full ${
                        i < userStats.hearts ? 'bg-red-500 shadow-lg' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 font-medium">Hearts</span>
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
                className={`group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 ${
                  isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-3 hover:scale-105'
                }`}
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {/* Lock Icon for locked groups */}
                {isLocked && (
                  <div className="absolute top-4 right-4">
                    <Lock className="h-6 w-6 text-gray-400" />
                  </div>
                )}

                {/* Plant Stage */}
                <div className="text-center mb-6">
                  <motion.div
                    className={`w-24 h-24 bg-gradient-to-br ${plantStage.color} rounded-full flex items-center justify-center text-5xl mx-auto shadow-2xl border-4 border-white`}
                    animate={!isLocked ? { 
                      y: [0, -8, 0],
                      rotate: [0, 3, -3, 0],
                      scale: [1, 1.05, 1]
                    } : {}}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{
                      boxShadow: '0 10px 30px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1)'
                    }}
                  >
                    {plantStage.emoji}
                  </motion.div>
                  <p className="text-sm font-semibold text-gray-700 mt-3 bg-gray-100 px-3 py-1 rounded-full inline-block">
                    {plantStage.name}
                  </p>
                </div>

                {/* Group Info */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-[#03045e] to-[#00bfe6] bg-clip-text text-transparent mb-2">
                    Group {group.group_number}
                  </h3>
                  <p className="text-gray-700 text-base mb-4 font-medium">{group.name}</p>
                  
                  {/* Difficulty Badge */}
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${difficultyColor} shadow-lg`}>
                    <Trophy className="h-4 w-4 mr-2" />
                    {getDifficultyName(group.difficulty)}
                  </div>
                </div>
                        
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm font-semibold text-gray-700 mb-3">
                    <span>Progress</span>
                    <span className="text-[#03045e]">{Math.round(groupProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                    <motion.div
                      className={`h-3 bg-gradient-to-r ${plantStage.color} rounded-full shadow-lg`}
                      initial={{ width: 0 }}
                      animate={{ width: `${groupProgress}%` }}
                      transition={{ duration: 1.2, delay: index * 0.1 }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                    <div className="text-2xl font-bold text-[#03045e]">{group.levels_completed}</div>
                    <div className="text-sm text-gray-600 font-medium">of {group.total_levels} levels</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-100">
                    <div className="text-2xl font-bold text-[#00bfe6]">{group.xp_earned}</div>
                    <div className="text-sm text-gray-600 font-medium">XP earned</div>
                  </div>
                </div>
                        
                {/* Action Button */}
                <div className="text-center">
                  {isLocked ? (
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500 py-4 px-6 rounded-2xl font-semibold border border-gray-200 shadow-inner">
                      <Lock className="h-5 w-5 inline mr-2" />
                      Complete previous group
                    </div>
                  ) : (
                    <Link
                      href={`/groups/${group.group_number}/levels`}
                      className="group/btn relative inline-block w-full bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white py-4 px-6 rounded-2xl font-bold transition-all duration-300 hover:shadow-2xl hover:scale-105 shadow-lg"
                      style={{
                        boxShadow: '0 8px 25px rgba(3, 4, 94, 0.3), 0 4px 12px rgba(0, 191, 230, 0.2)'
                      }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3 text-lg">
                        {group.completion_percentage > 0 ? 'Continue Learning' : 'Start Learning'}
                        <BookOpen className="h-5 w-5" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#02033a] to-[#0099cc] rounded-2xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    </Link>
                  )}
                </div>

                {/* Completion Badge */}
                {group.completion_percentage === 100 && (
                  <div className="absolute -top-3 -right-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white shadow-2xl border-2 border-white">
                      <Trophy className="h-5 w-5" />
                    </div>
                  </div>
                )}

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#03045e]/5 to-[#00bfe6]/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
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
        <div className="mt-16 bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#03045e] to-[#00bfe6] bg-clip-text text-transparent mb-2">
                Daily Goal
              </h3>
              <p className="text-gray-600">Keep your learning streak alive!</p>
            </div>
            <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-xl border border-blue-200">
              <Target className="h-6 w-6 text-[#00bfe6]" />
              <div className="text-right">
                <div className="text-2xl font-bold text-[#03045e]">{userStats.total_xp}</div>
                <div className="text-sm text-gray-600">/ {userStats.daily_goal} XP</div>
              </div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
            <motion.div
              className="h-4 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-full shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((userStats.total_xp / userStats.daily_goal) * 100, 100)}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
          
          <div className="mt-4 text-center">
            <p className={`text-lg font-semibold ${
              userStats.total_xp >= userStats.daily_goal 
                ? "text-green-600" 
                : "text-gray-600"
            }`}>
              {userStats.total_xp >= userStats.daily_goal 
                ? "🎉 Daily goal completed! Great job!" 
                : `${userStats.daily_goal - userStats.total_xp} XP needed to complete daily goal`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}