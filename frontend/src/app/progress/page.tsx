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
  const { isLoggedIn, user, loading: authLoading } = useAuth()

  useEffect(() => {
    // Check if user is logged in and is a student
    if (!authLoading && !isLoggedIn) {
      window.location.href = '/login'
      return
    }
    
    if (!authLoading && isLoggedIn && user?.role !== 'student') {
      window.location.href = '/'
      return
    }

    if (!authLoading && isLoggedIn && user?.role === 'student') {
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
    }
  }, [authLoading, isLoggedIn, user])

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
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#00bfe6] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  // Redirect if not logged in or not a student
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#03045e]/10 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#00bfe6]/10 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-[#03045e]/5 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>
      
      <Navigation />
      
      {/* Ultra Modern Header */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-2xl flex items-center justify-center shadow-2xl border border-gray-200/50">
                  <Trophy className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
            <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-[#03045e] to-[#00bfe6] bg-clip-text text-transparent">
                    Your Progress
                  </h1>
                  <p className="text-gray-600 text-lg font-medium">Track your amazing learning journey</p>
                </div>
              </div>
              
              {/* Enhanced Progress Bar */}
              <div className="mt-6 w-full max-w-lg">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span className="font-semibold">Overall Progress</span>
                  <span className="font-black text-lg text-gray-900">{Math.round(userStats.completion_percentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                  <motion.div
                    className="bg-gradient-to-r from-[#03045e] to-[#00bfe6] h-4 rounded-full shadow-lg"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, userStats.completion_percentage)}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{ boxShadow: '0 0 20px rgba(3, 4, 94, 0.3)' }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>🌱 Beginner</span>
                  <span>🌳 Master</span>
              </div>
            </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
            <Link
              href="/groups"
                className="group relative bg-gradient-to-r from-[#03045e] to-[#00bfe6] hover:from-[#02033a] hover:to-[#0099cc] text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-[#03045e]/25 border border-gray-200/50 hover:-translate-y-1 inline-flex items-center justify-center w-auto"
              >
                <div className="flex items-center gap-3 ">
                  <BookOpen className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Continue Learning</span>
                  <motion.div
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
            </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Ultra Modern Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* XP Card */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.1,
              type: "spring",
              stiffness: 120,
              damping: 15
            }}
            className="group relative bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 hover:bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            whileHover={{ scale: 1.03, rotateY: 5 }}
            style={{ 
              background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)`,
              boxShadow: `0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)`
            }}
          >
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#03045e]/10 to-[#00bfe6]/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#03045e] to-[#00bfe6] flex items-center justify-center shadow-2xl border border-gray-200/50"
                  whileHover={{ rotate: 10, scale: 1.15 }}
                  transition={{ duration: 0.4, type: "spring" }}
                >
                  <Zap className="h-8 w-8 text-white drop-shadow-lg" />
                </motion.div>
                <motion.div 
                  className="text-4xl font-black text-gray-900 drop-shadow-lg"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  {userStats.total_xp}
                </motion.div>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Total XP</h3>
              <p className="text-gray-600 text-sm font-medium">Experience points earned</p>
              
              {/* XP Progress Indicator */}
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="h-2 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((userStats.total_xp / 1000) * 100, 100)}%` }}
                  transition={{ delay: 0.5, duration: 1 }}
                />
            </div>
            </div>
          </motion.div>

          {/* Streak Card */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.2,
              type: "spring",
              stiffness: 120,
              damping: 15
            }}
            className="group relative bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 hover:bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            whileHover={{ scale: 1.03, rotateY: 5 }}
            style={{ 
              background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)`,
              boxShadow: `0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)`
            }}
          >
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#03045e]/10 to-[#00bfe6]/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#03045e] to-[#00bfe6] flex items-center justify-center shadow-2xl border border-gray-200/50"
                  whileHover={{ rotate: 10, scale: 1.15 }}
                  transition={{ duration: 0.4, type: "spring" }}
                >
                  <Flame className="h-8 w-8 text-white drop-shadow-lg" />
                </motion.div>
                <motion.div 
                  className="text-4xl font-black text-gray-900 drop-shadow-lg"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                >
                  {userStats.current_streak}
                </motion.div>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Current Streak</h3>
              <p className="text-gray-600 text-sm font-medium">Days in a row</p>
              
              {/* Streak Fire Effect */}
              <div className="mt-4 flex items-center gap-2">
                <motion.div
                  className="text-2xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  🔥
                </motion.div>
                <span className="text-gray-600 text-sm font-medium">
                  {userStats.current_streak >= 7 ? "On Fire!" : "Keep Going!"}
                </span>
            </div>
            </div>
          </motion.div>

          {/* Levels Completed Card */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.3,
              type: "spring",
              stiffness: 120,
              damping: 15
            }}
            className="group relative bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 hover:bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            whileHover={{ scale: 1.03, rotateY: 5 }}
            style={{ 
              background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)`,
              boxShadow: `0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)`
            }}
          >
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#03045e]/10 to-[#00bfe6]/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#03045e] to-[#00bfe6] flex items-center justify-center shadow-2xl border border-gray-200/50"
                  whileHover={{ rotate: 10, scale: 1.15 }}
                  transition={{ duration: 0.4, type: "spring" }}
                >
                  <BookOpen className="h-8 w-8 text-white drop-shadow-lg" />
                </motion.div>
                <motion.div 
                  className="text-4xl font-black text-gray-900 drop-shadow-lg"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  {userStats.total_levels_completed}
                </motion.div>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Levels Completed</h3>
              <p className="text-gray-600 text-sm font-medium">Total levels finished</p>
              
              {/* Level Progress */}
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="h-2 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((userStats.total_levels_completed / 50) * 100, 100)}%` }}
                  transition={{ delay: 0.6, duration: 1 }}
                />
            </div>
            </div>
          </motion.div>

          {/* Average Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.4,
              type: "spring",
              stiffness: 120,
              damping: 15
            }}
            className="group relative bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 hover:bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            whileHover={{ scale: 1.03, rotateY: 5 }}
            style={{ 
              background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)`,
              boxShadow: `0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)`
            }}
          >
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#03045e]/10 to-[#00bfe6]/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#03045e] to-[#00bfe6] flex items-center justify-center shadow-2xl border border-gray-200/50"
                  whileHover={{ rotate: 10, scale: 1.15 }}
                  transition={{ duration: 0.4, type: "spring" }}
                >
                  <Target className="h-8 w-8 text-white drop-shadow-lg" />
                </motion.div>
                <motion.div 
                  className="text-4xl font-black text-gray-900 drop-shadow-lg"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                >
                  {userStats.average_score}%
                </motion.div>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Average Score</h3>
              <p className="text-gray-600 text-sm font-medium">Overall accuracy</p>
              
              {/* Score Rating */}
              <div className="mt-4 flex items-center gap-2">
                <motion.div
                  className="text-2xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {userStats.average_score >= 90 ? "🏆" : userStats.average_score >= 80 ? "⭐" : "🎯"}
                </motion.div>
                <span className="text-gray-600 text-sm font-medium">
                  {userStats.average_score >= 90 ? "Excellent!" : userStats.average_score >= 80 ? "Great!" : "Good!"}
                </span>
            </div>
            </div>
          </motion.div>
        </div>

        {/* Ultra Modern Plant Growth & Daily Goal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Plant Growth */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="group relative bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 hover:bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            style={{ 
              background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)`,
              boxShadow: `0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)`
            }}
          >
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#03045e]/10 to-[#00bfe6]/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <motion.div
                  className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#03045e] to-[#00bfe6] flex items-center justify-center"
                  whileHover={{ rotate: 10, scale: 1.15 }}
                  transition={{ duration: 0.4, type: "spring" }}
                >
                  <Leaf className="h-5 w-5 text-white" />
                </motion.div>
              Your Plant
            </h3>
            
              <div className="text-center mb-8">
              <motion.div
                  className="w-32 h-32 bg-gradient-to-br from-[#03045e] to-[#00bfe6] rounded-full flex items-center justify-center text-6xl mx-auto shadow-2xl border-4 border-gray-200/50"
                animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                }}
                transition={{ 
                    duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                  whileHover={{ scale: 1.1, rotate: 10 }}
              >
                {userStats.plant_stage === "Fruit Tree" ? "🌳" : 
                 userStats.plant_stage === "Tree" ? "🌲" : 
                 userStats.plant_stage === "Sapling" ? "🌿" : 
                 userStats.plant_stage === "Sprout" ? "🌱" : "🌱"}
              </motion.div>
                <motion.h4 
                  className="text-2xl font-black text-gray-900 mt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  {userStats.plant_stage}
                </motion.h4>
                <p className="text-gray-600 text-sm font-medium">Current stage</p>
            </div>
            
              <div className="space-y-4">
              <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-semibold">Overall Progress</span>
                  <span className="font-black text-gray-900 text-lg">{Math.round(userStats.completion_percentage)}%</span>
              </div>
                <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                <motion.div
                    className="h-3 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-full shadow-lg"
                  initial={{ width: 0 }}
                  animate={{ width: `${userStats.completion_percentage}%` }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                    style={{ boxShadow: '0 0 20px rgba(3, 4, 94, 0.3)' }}
                  />
                </div>
                
                {/* Plant Growth Stages */}
                <div className="flex justify-between text-xs text-gray-500 mt-3">
                  <span>🌱 Seed</span>
                  <span>🌿 Sprout</span>
                  <span>🌳 Tree</span>
                  <span>🍎 Fruit</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Daily Goal */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="group relative bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 hover:bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            style={{ 
              background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)`,
              boxShadow: `0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)`
            }}
          >
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#03045e]/10 to-[#00bfe6]/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <motion.div
                  className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#03045e] to-[#00bfe6] flex items-center justify-center"
                  whileHover={{ rotate: 10, scale: 1.15 }}
                  transition={{ duration: 0.4, type: "spring" }}
                >
                  <Target className="h-5 w-5 text-white" />
                </motion.div>
              Daily Goal
            </h3>
            
              <div className="text-center mb-8">
                <motion.div 
                  className="text-5xl font-black text-gray-900 mb-2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, type: "spring" }}
                >
                {userStats.total_xp} / {userStats.daily_goal}
                </motion.div>
                <p className="text-gray-600 text-lg font-medium">XP Today</p>
            </div>
            
              <div className="space-y-4">
              <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-semibold">Progress</span>
                  <span className="font-black text-gray-900 text-lg">
                  {Math.round((userStats.total_xp / userStats.daily_goal) * 100)}%
                </span>
              </div>
                <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                <motion.div
                    className="h-3 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-full shadow-lg"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((userStats.total_xp / userStats.daily_goal) * 100, 100)}%` }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                    style={{ boxShadow: '0 0 20px rgba(3, 4, 94, 0.3)' }}
                />
              </div>
              
              {userStats.total_xp >= userStats.daily_goal ? (
                  <motion.div
                    className="text-center mt-4"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, type: "spring" }}
                  >
                    <p className="text-green-600 text-lg font-black flex items-center justify-center gap-2">
                      <motion.span
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        🎉
                      </motion.span>
                      Daily goal completed!
                    </p>
                  </motion.div>
                ) : (
                  <div className="text-center mt-4">
                    <p className="text-gray-600 text-sm font-medium">
                  {userStats.daily_goal - userStats.total_xp} XP needed
                </p>
                    <motion.div
                      className="mt-2 text-2xl"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      🎯
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Ultra Modern Recent Activity & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="group relative bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 hover:bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            style={{ 
              background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)`,
              boxShadow: `0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)`
            }}
          >
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#03045e]/10 to-[#00bfe6]/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <motion.div
                  className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#03045e] to-[#00bfe6] flex items-center justify-center"
                  whileHover={{ rotate: 10, scale: 1.15 }}
                  transition={{ duration: 0.4, type: "spring" }}
                >
                  <Activity className="h-5 w-5 text-white" />
                </motion.div>
              Recent Activity
            </h3>
            
            <div className="space-y-4">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="group/item relative flex items-center justify-between p-4 bg-gray-50 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:bg-gray-100 transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-center space-x-4">
                        <motion.div
                          className="w-12 h-12 bg-gradient-to-br from-[#03045e] to-[#00bfe6] rounded-2xl flex items-center justify-center text-white font-bold shadow-lg border border-gray-200/50"
                          whileHover={{ rotate: 10, scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        >
                        {activity.type === 'level' ? 'L' : 'T'}
                        </motion.div>
                      <div>
                          <p className="font-bold text-gray-900 text-lg">{activity.level_name}</p>
                          <p className="text-gray-600 text-sm font-medium">{formatDate(activity.completed_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                        <motion.p
                          className="font-black text-gray-900 text-lg"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.9 + index * 0.1 }}
                        >
                          +{activity.xp_earned} XP
                        </motion.p>
                        <p className="text-gray-600 text-sm font-medium">{activity.score}%</p>
                    </div>
                    </motion.div>
                ))
              ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-gray-600 text-lg font-medium">No recent activity</p>
                    <p className="text-gray-500 text-sm mt-2">Complete some levels to see your progress!</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="group relative bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 hover:bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            style={{ 
              background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)`,
              boxShadow: `0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)`
            }}
          >
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#03045e]/10 to-[#00bfe6]/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <motion.div
                  className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#03045e] to-[#00bfe6] flex items-center justify-center"
                  whileHover={{ rotate: 10, scale: 1.15 }}
                  transition={{ duration: 0.4, type: "spring" }}
                >
                  <Award className="h-5 w-5 text-white" />
                </motion.div>
              Achievements
            </h3>
            
            <div className="space-y-4">
              {achievements && achievements.length > 0 ? (
                achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                      className={`group/achievement relative flex items-center space-x-4 p-5 rounded-2xl transition-all duration-500 hover:scale-105 ${
                      achievement.unlocked 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg hover:shadow-green-500/25' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {/* Achievement Icon */}
                      <motion.div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-2xl border border-gray-200/50 transition-all duration-300 ${
                      achievement.unlocked 
                            ? 'bg-gradient-to-br from-[#03045e] to-[#00bfe6] group-hover/achievement:scale-110 group-hover/achievement:rotate-12' 
                            : 'bg-gray-400'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                      {achievement.unlocked ? achievement.icon : '🔒'}
                      </motion.div>
                    
                    {/* Achievement Content */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className={`font-black text-xl ${
                          achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {achievement.name}
                        </p>
                        {achievement.unlocked && (
                            <motion.div
                              className="flex items-center space-x-2 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200"
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 1 + index * 0.1 }}
                            >
                              <span className="text-xs font-black text-yellow-800">+{achievement.xp_reward} XP</span>
                            </motion.div>
                        )}
                      </div>
                        <p className={`text-sm font-medium ${
                        achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {achievement.description}
                      </p>
                      {achievement.unlocked && achievement.unlocked_at && (
                          <motion.p
                            className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.1 + index * 0.1 }}
                          >
                            <CheckCircle className="h-3 w-3" />
                            Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                          </motion.p>
                      )}
                    </div>
                    
                    {/* Achievement Status Badge */}
                      <motion.div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      achievement.unlocked 
                            ? 'bg-green-500 shadow-lg' 
                            : 'bg-gray-500'
                        }`}
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.3 }}
                      >
                      {achievement.unlocked ? (
                          <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                          <Lock className="h-4 w-4 text-white" />
                      )}
                      </motion.div>
                  </motion.div>
                ))
              ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="h-10 w-10 text-gray-400" />
                  </div>
                    <p className="text-gray-600 text-lg font-medium">No achievements yet</p>
                    <p className="text-gray-500 text-sm mt-2">Complete levels to unlock achievements!</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}