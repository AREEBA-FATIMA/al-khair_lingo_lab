'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Star, 
  Target, 
  Clock, 
  Zap, 
  Flame,
  TrendingUp,
  Calendar,
  Award,
  BookOpen,
  Leaf,
  BarChart3,
  Activity,
  CheckCircle,
  Lock
} from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import ProgressManager from '@/utils/progressManager'

interface UserStats {
  total_xp: number
  current_streak: number
  longest_streak: number
  hearts: number
  daily_goal: number
  total_levels_completed: number
  total_groups_completed: number
  average_score: number
  time_spent_minutes: number
  current_level: number
  plant_stage: string
  completion_percentage: number
}

interface RecentActivity {
  id: number
  type: string
  level_name: string
  xp_earned: number
  completed_at: string
  score: number
}

interface Achievement {
  id: number
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlocked_at?: string
  xp_reward: number
}

export default function ProgressPage() {
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const { isLoggedIn, user } = useAuth()

  useEffect(() => {
    // Check if user is logged in and is a student
    if (!isLoggedIn) {
      window.location.href = '/login'
      return
    }
    
    if (user?.role !== 'student') {
      window.location.href = '/'
      return
    }

    fetchUserStats()
    fetchRecentActivity()
    fetchAchievements()
    loadProgressFromLocalStorage()

    // Listen for level completion events
    const handleLevelCompleted = () => {
      loadProgressFromLocalStorage()
      fetchUserStats()
    }

    const handleProgressUpdated = () => {
      loadProgressFromLocalStorage()
      fetchUserStats()
    }

    window.addEventListener('levelCompleted', handleLevelCompleted)
    window.addEventListener('progressUpdated', handleProgressUpdated)
    return () => {
      window.removeEventListener('levelCompleted', handleLevelCompleted)
      window.removeEventListener('progressUpdated', handleProgressUpdated)
    }
  }, [isLoggedIn, user])

  const loadProgressFromLocalStorage = () => {
    const progressManager = ProgressManager.getInstance()
    const userProgress = progressManager.getUserProgress()
    
    // Calculate proper completion percentage based on total levels
    const totalLevels = 370 // Total levels in the system
    const completionPercentage = totalLevels > 0 ? (userProgress.completedLevels.length / totalLevels) * 100 : 0
    
    // Calculate plant stage based on completion
    let plantStage = "Seed"
    let plantEmoji = "🌱"
    if (completionPercentage >= 80) {
      plantStage = "Fruit Tree"
      plantEmoji = "🌳"
    } else if (completionPercentage >= 60) {
      plantStage = "Tree"
      plantEmoji = "🌲"
    } else if (completionPercentage >= 40) {
      plantStage = "Sapling"
      plantEmoji = "🌿"
    } else if (completionPercentage >= 20) {
      plantStage = "Sprout"
      plantEmoji = "🌱"
    }
    
    setUserStats(prev => ({
      ...prev,
      total_xp: userProgress.totalXP,
      current_streak: userProgress.currentStreak,
      hearts: userProgress.hearts,
      total_levels_completed: userProgress.completedLevels.length,
      completion_percentage: Math.round(completionPercentage),
      plant_stage: plantStage,
      current_level: userProgress.highestUnlockedLevel,
      average_score: userProgress.completedLevels.length > 0 ? 85 : 0, // Default average score
      daily_goal: 50,
      time_spent_minutes: userProgress.completedLevels.length * 5, // Estimate 5 minutes per level
      total_groups_completed: Math.floor(userProgress.completedLevels.length / 20), // Assuming 20 levels per group
      longest_streak: userProgress.currentStreak // Use current streak as longest for now
    }))
  }

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        console.log('No auth token found, using local progress')
        return
      }

      const response = await fetch('http://127.0.0.1:8000/api/progress/overview/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserStats(data)
        // Merge authoritative backend stats into local progress
        const pm = ProgressManager.getInstance()
        pm.setStatsFromBackend({
          total_xp: data.total_xp,
          current_streak: data.current_streak,
          hearts: data.hearts
        })
        console.log('Progress loaded from backend:', data)
      } else {
        console.error('Failed to load progress from backend:', response.status)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      // Generate recent activity from ProgressManager
      const progressManager = ProgressManager.getInstance()
      const userProgress = progressManager.getUserProgress()
      
      // Create mock recent activity based on completed levels
      const mockActivity: RecentActivity[] = userProgress.completedLevels.slice(-5).map((levelId, index) => ({
        id: levelId,
        type: 'level',
        level_name: `Level ${levelId}`,
        xp_earned: Math.floor(Math.random() * 20) + 10, // Random XP between 10-30
        completed_at: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toISOString(), // Last 5 days
        score: Math.floor(Math.random() * 30) + 70 // Random score between 70-100
      }))
      
      setRecentActivity(mockActivity)
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      // Fallback to empty array
      setRecentActivity([])
    }
  }

  const fetchAchievements = async () => {
    try {
      // Generate achievements based on user progress
      const progressManager = ProgressManager.getInstance()
      const userProgress = progressManager.getUserProgress()
      
      const mockAchievements: Achievement[] = []
      
      // First Level Achievement
      if (userProgress.completedLevels.length >= 1) {
        mockAchievements.push({
          id: 1,
          name: 'First Steps',
          description: 'Completed your first level',
          icon: '🌱',
          unlocked: true,
          unlocked_at: new Date().toISOString(),
          xp_reward: 50
        })
      }
      
      // Level 5 Achievement
      if (userProgress.completedLevels.length >= 5) {
        mockAchievements.push({
          id: 2,
          name: 'Getting Started',
          description: 'Completed 5 levels',
          icon: '🌿',
          unlocked: true,
          unlocked_at: new Date().toISOString(),
          xp_reward: 100
        })
      }
      
      // Level 10 Achievement
      if (userProgress.completedLevels.length >= 10) {
        mockAchievements.push({
          id: 3,
          name: 'On a Roll',
          description: 'Completed 10 levels',
          icon: '🌳',
          unlocked: true,
          unlocked_at: new Date().toISOString(),
          xp_reward: 200
        })
      }
      
      // Level 20 Achievement
      if (userProgress.completedLevels.length >= 20) {
        mockAchievements.push({
          id: 4,
          name: 'Level Master',
          description: 'Completed 20 levels',
          icon: '🏆',
          unlocked: true,
          unlocked_at: new Date().toISOString(),
          xp_reward: 300
        })
      }
      
      // Streak Achievements
      if (userProgress.currentStreak >= 3) {
        mockAchievements.push({
          id: 5,
          name: 'Streak Master',
          description: 'Maintained a 3-day streak',
          icon: '🔥',
          unlocked: true,
          unlocked_at: new Date().toISOString(),
          xp_reward: 150
        })
      }
      
      if (userProgress.currentStreak >= 7) {
        mockAchievements.push({
          id: 6,
          name: 'Week Warrior',
          description: 'Maintained a 7-day streak',
          icon: '⚡',
          unlocked: true,
          unlocked_at: new Date().toISOString(),
          xp_reward: 300
        })
      }
      
      // XP Achievements
      if (userProgress.totalXP >= 500) {
        mockAchievements.push({
          id: 7,
          name: 'XP Collector',
          description: 'Earned 500+ XP',
          icon: '⭐',
          unlocked: true,
          unlocked_at: new Date().toISOString(),
          xp_reward: 100
        })
      }
      
      if (userProgress.totalXP >= 1000) {
        mockAchievements.push({
          id: 8,
          name: 'XP Legend',
          description: 'Earned 1000+ XP',
          icon: '💎',
          unlocked: true,
          unlocked_at: new Date().toISOString(),
          xp_reward: 500
        })
      }
      
      // Add locked achievements for motivation
      if (userProgress.completedLevels.length < 5) {
        mockAchievements.push({
          id: 9,
          name: 'Getting Started',
          description: 'Complete 5 levels',
          icon: '🌿',
          unlocked: false,
          unlocked_at: '',
          xp_reward: 100
        })
      }
      
      if (userProgress.currentStreak < 3) {
        mockAchievements.push({
          id: 10,
          name: 'Streak Master',
          description: 'Maintain a 3-day streak',
          icon: '🔥',
          unlocked: false,
          unlocked_at: '',
          xp_reward: 150
        })
      }
      
      setAchievements(mockAchievements)
    } catch (error) {
      console.error('Error fetching achievements:', error)
      // Fallback to empty array
      setAchievements([])
    }
  }

  const getPlantStage = (completionPercentage: number) => {
    if (completionPercentage >= 80) return { emoji: '🍎', name: 'Fruit Tree', color: 'from-green-400 to-green-600' }
    if (completionPercentage >= 60) return { emoji: '🌲', name: 'Tree', color: 'from-green-500 to-green-700' }
    if (completionPercentage >= 40) return { emoji: '🌳', name: 'Sapling', color: 'from-green-600 to-green-800' }
    if (completionPercentage >= 20) return { emoji: '🌿', name: 'Sprout', color: 'from-green-700 to-green-900' }
    return { emoji: '🌱', name: 'Seed', color: 'from-yellow-400 to-green-600' }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Show loading while checking authentication
  if (!isLoggedIn || user?.role !== 'student') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#00bfe6] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
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

  if (!userStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <p className="text-red-500">Failed to load progress data</p>
        </div>
      </div>
    )
  }

  const plantStage = getPlantStage(userStats.completion_percentage)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>
              <p className="text-gray-600">Track your learning journey</p>
              
              {/* Overall Progress Bar */}
              <div className="mt-3 w-full max-w-md">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Overall Progress</span>
                  <span>{Math.round(userStats.completion_percentage)}%</span>
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
            
            <Link
              href="/groups"
              className="bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
            >
              Continue Learning
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* XP Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{userStats.total_xp}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Total XP</h3>
            <p className="text-gray-600 text-sm">Experience points earned</p>
          </motion.div>

          {/* Streak Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{userStats.current_streak}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Current Streak</h3>
            <p className="text-gray-600 text-sm">Days in a row</p>
          </motion.div>

          {/* Levels Completed Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{userStats.total_levels_completed}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Levels Completed</h3>
            <p className="text-gray-600 text-sm">Total levels finished</p>
          </motion.div>

          {/* Average Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-green-400 to-green-600 rounded-xl">
                <Target className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{userStats.average_score}%</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Average Score</h3>
            <p className="text-gray-600 text-sm">Overall accuracy</p>
          </motion.div>
        </div>

        {/* Plant Growth & Daily Goal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Plant Growth */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-500" />
              Your Plant
            </h3>
            
            <div className="text-center mb-6">
              <motion.div
                className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-4xl mx-auto shadow-lg"
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
                {userStats.plant_stage === "Fruit Tree" ? "🌳" : 
                 userStats.plant_stage === "Tree" ? "🌲" : 
                 userStats.plant_stage === "Sapling" ? "🌿" : 
                 userStats.plant_stage === "Sprout" ? "🌱" : "🌱"}
              </motion.div>
              <h4 className="text-lg font-semibold text-gray-900 mt-3">{userStats.plant_stage}</h4>
              <p className="text-gray-600 text-sm">Current stage</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Overall Progress</span>
                <span className="font-semibold">{Math.round(userStats.completion_percentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className={`h-2 bg-gradient-to-r ${plantStage.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${userStats.completion_percentage}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </motion.div>

          {/* Daily Goal */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-[#00bfe6]" />
              Daily Goal
            </h3>
            
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {userStats.total_xp} / {userStats.daily_goal}
              </div>
              <p className="text-gray-600">XP Today</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold">
                  {Math.round((userStats.total_xp / userStats.daily_goal) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="h-2 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((userStats.total_xp / userStats.daily_goal) * 100, 100)}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              
              {userStats.total_xp >= userStats.daily_goal ? (
                <p className="text-green-600 text-sm font-medium text-center mt-2">
                  🎉 Daily goal completed!
                </p>
              ) : (
                <p className="text-gray-600 text-sm text-center mt-2">
                  {userStats.daily_goal - userStats.total_xp} XP needed
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Recent Activity
            </h3>
            
            <div className="space-y-4">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {activity.type === 'level' ? 'L' : 'T'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{activity.level_name}</p>
                        <p className="text-sm text-gray-600">{formatDate(activity.completed_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">+{activity.xp_earned} XP</p>
                      <p className="text-sm text-gray-600">{activity.score}%</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Achievements
            </h3>
            
            <div className="space-y-4">
              {achievements && achievements.length > 0 ? (
                achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`group relative flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg hover:shadow-xl' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {/* Achievement Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all duration-300 ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 group-hover:scale-110' 
                        : 'bg-gray-300'
                    }`}>
                      {achievement.unlocked ? achievement.icon : '🔒'}
                    </div>
                    
                    {/* Achievement Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`font-bold text-lg ${
                          achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {achievement.name}
                        </p>
                        {achievement.unlocked && (
                          <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full">
                            <span className="text-xs font-bold text-yellow-800">+{achievement.xp_reward} XP</span>
                          </div>
                        )}
                      </div>
                      <p className={`text-sm ${
                        achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {achievement.description}
                      </p>
                      {achievement.unlocked && achievement.unlocked_at && (
                        <p className="text-xs text-green-600 font-medium mt-1">
                          ✓ Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    {/* Achievement Status Badge */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      achievement.unlocked 
                        ? 'bg-green-500' 
                        : 'bg-gray-400'
                    }`}>
                      {achievement.unlocked ? (
                        <CheckCircle className="h-4 w-4 text-white" />
                      ) : (
                        <Lock className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">No achievements yet</p>
                  <p className="text-gray-400 text-sm mt-1">Complete levels to unlock achievements!</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}