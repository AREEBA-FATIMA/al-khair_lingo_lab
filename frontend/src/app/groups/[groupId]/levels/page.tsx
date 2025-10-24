'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Leaf,
  Sparkles,
  Award,
  Brain,
  BookOpen,
  ChevronRight,
  Info,
  Crown,
  Gem
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import PenguinMascot from '@/components/PenguinMascot'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import ProgressManager from '@/utils/progressManager'

// --- Interface Definitions (Uncommented for clarity) ---
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

// --- COLOR PALETTE (Based on Original) ---
const PRIMARY_COLOR = '#03045e'; // Deep Navy Blue
const SECONDARY_COLOR = '#00bfe6'; // Bright Sky Blue
const LIGHT_BG_GRADIENT = 'from-slate-50 via-blue-50 to-indigo-50';
const SHADOW_ELEVATED = `0 15px 30px rgba(3, 4, 94, 0.1), 0 5px 15px rgba(0, 191, 230, 0.08)`;


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
  const [showTooltip, setShowTooltip] = useState<number | null>(null)
  const [showAchievement, setShowAchievement] = useState(false)
  const [achievementMessage, setAchievementMessage] = useState('')
  const [confettiActive, setConfettiActive] = useState(false)
  const [xpAnimation, setXpAnimation] = useState(false)
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null)
  const { isLoggedIn, user, loading: authLoading } = useAuth()

  const loadProgressFromLocalStorage = useCallback(() => {
    const progressManager = ProgressManager.getInstance()
    const userProgress = progressManager.getUserProgress()
    
    setUserStats(prev => ({
      ...prev,
      total_xp: userProgress.totalXP,
      current_streak: userProgress.currentStreak,
      hearts: userProgress.hearts
    }))
  }, [])

  const fetchGroupData = useCallback(async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/groups/${groupId}/`)
      const data = await response.json()
      console.log('Group data:', data) // Debug log
      setGroup(data)
    } catch (error) {
      console.error('Error fetching group:', error)
    }
  }, [groupId])

  const fetchLevels = useCallback(async () => {
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
  }, [groupId])

  const fetchUserStats = useCallback(async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/progress/overview/')
      const data = await response.json()
      // Only update if the fetched data is valid
      if(data.total_xp !== undefined) { 
        setUserStats(data)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }, [])

  useEffect(() => {
    // Check if user is logged in
    if (!authLoading && !isLoggedIn) {
      // Using router.push for Next.js routing instead of window.location.href
      router.push('/login')
      return
    }
    
    if (!authLoading && isLoggedIn) {
      fetchGroupData()
      fetchLevels()
      fetchUserStats()
      loadProgressFromLocalStorage()
    }

    // Listen for level completion events
    const handleLevelCompleted = () => {
      loadProgressFromLocalStorage()
      // Re-fetch levels to update their status immediately
      fetchLevels()
      
      // Trigger achievement and celebration
      setAchievementMessage("Level completed! Keep up the great work! 🎉")
      setShowAchievement(true)
      setConfettiActive(true)
      setXpAnimation(true)
      
      // Auto hide notifications
      setTimeout(() => {
        setShowAchievement(false)
        setConfettiActive(false)
        setXpAnimation(false)
      }, 4000)
    }

    window.addEventListener('levelCompleted', handleLevelCompleted)
    return () => window.removeEventListener('levelCompleted', handleLevelCompleted)
  }, [authLoading, isLoggedIn, fetchGroupData, fetchLevels, fetchUserStats, loadProgressFromLocalStorage, router])


  const getPlantStage = (completionPercentage: number) => {
    if (completionPercentage >= 90) return { emoji: '👑', name: 'Master Tree', color: 'from-purple-500 to-indigo-600' } // Max level reward
    if (completionPercentage >= 80) return { emoji: '🍎', name: 'Fruit Tree', color: 'from-green-400 to-green-600' }
    if (completionPercentage >= 60) return { emoji: '🌲', name: 'Tree', color: 'from-green-500 to-green-700' }
    if (completionPercentage >= 40) return { emoji: '🌳', name: 'Sapling', color: 'from-green-600 to-green-800' }
    if (completionPercentage >= 20) return { emoji: '🌿', name: 'Sprout', color: 'from-green-700 to-green-900' }
    return { emoji: '🌱', name: 'Seed', color: 'from-yellow-400 to-green-600' }
  }

  const getDifficultyColor = (difficulty: number) => {
    const colors = [
      'from-green-400 to-green-600',    // Beginner
      'from-blue-400 to-blue-600',      // Elementary
      'from-yellow-400 to-orange-500',  // Intermediate
      'from-orange-400 to-red-500',     // Upper Intermediate
      'from-red-400 to-purple-600'      // Advanced
    ]
    return colors[difficulty - 1] || colors[0]
  }

  const getDifficultyName = (difficulty: number) => {
    const names = ['Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate', 'Advanced']
    return names[difficulty - 1] || 'Beginner'
  }

  const handleLevelClick = (level: Level) => {
    const progressManager = ProgressManager.getInstance()
    // NOTE: isLevelUnlocked is a method based on the previous level number
    const isUnlocked = progressManager.isLevelUnlocked(level.level_number) 
    
    if (!isUnlocked) {
      alert(`Complete previous levels to unlock Level ${level.level_number}!`)
      return
    }
    
    router.push(`/groups/${groupId}/levels/${level.level_number}`)
  }

  // --- LOADING / REDIRECT LOGIC (Simplified and Cleaned) ---
  const LoadingScreen = () => (
    <div className={`min-h-screen bg-gradient-to-br ${LIGHT_BG_GRADIENT}`}>
      <Navigation />
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-t-4 border-t-transparent rounded-full animate-spin"
             style={{ borderColor: SECONDARY_COLOR, borderTopColor: 'transparent' }} 
        />
        <p className="mt-4 text-gray-600">Loading your progress...</p>
      </div>
    </div>
  )

  if (authLoading || !isLoggedIn) {
     // User will be redirected in useEffect, just show loading here
    return <LoadingScreen />
  }
  
  if (loading) {
    return <LoadingScreen />
  }

  if (!group) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${LIGHT_BG_GRADIENT}`}>
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <p className="text-xl text-red-600 font-semibold">Error: Learning Group not found.</p>
        </div>
      </div>
    )
  }

  const plantStage = getPlantStage(group.completion_percentage)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
     
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-[#03045e]/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#00bfe6]/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#03045e]/5 rounded-full blur-3xl"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#03045e]/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <Navigation />
      
      {/* Achievement Notification */}
      {showAchievement && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-white"
        >
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 1, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Trophy className="h-8 w-8 fill-white" />
            </motion.div>
            <div>
              <h3 className="font-bold text-lg">Achievement Unlocked! 🏆</h3>
              <p className="text-sm opacity-90">{achievementMessage}</p>
            </div>
            <motion.button
              onClick={() => setShowAchievement(false)}
              className="text-white/80 hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ✕
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Confetti Effect */}
      {confettiActive && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 10,
                rotate: 0
              }}
              animate={{ 
                y: -10,
                rotate: 360,
                opacity: [1, 1, 0]
              }}
              transition={{ 
                duration: 3,
                delay: Math.random() * 2,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}
      
      {/* Modern Glassmorphism Header */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-20 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          
          {/* Group Title & Back Button */}
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/groups"
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all duration-300 shadow-lg border border-gray-200"
              >
                <ArrowLeft className="h-6 w-6 text-gray-700" />
              </Link>
            </motion.div>
            <div>
              <motion.h1 
                className="text-2xl font-bold text-gray-900 leading-snug"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Group {group.group_number}: <span className="bg-gradient-to-r from-[#03045e] to-[#00bfe6] bg-clip-text text-transparent">{group.name}</span>
              </motion.h1>
              <motion.p 
                className="text-sm text-gray-600 font-medium"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {group.description}
              </motion.p>
            </div>
          </div>
          
          {/* Enhanced User Stats Bar */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center space-x-6 p-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50"
          >
            
            {/* XP with Animation */}
            <motion.div 
              className="flex items-center space-x-3"
              animate={xpAnimation ? { 
                scale: [1, 1.1, 1],
                boxShadow: ["0 4px 6px -1px rgba(0, 0, 0, 0.1)", "0 20px 25px -5px rgba(245, 158, 11, 0.4)", "0 4px 6px -1px rgba(0, 0, 0, 0.1)"]
              } : {}}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="h-6 w-6 text-yellow-500" />
              </motion.div>
              <div>
                <div className="font-extrabold text-gray-900 text-xl">{userStats.total_xp}</div>
                <div className="text-xs text-gray-600 font-medium">XP</div>
              </div>
            </motion.div>
            
            {/* Streak */}
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Flame className="h-6 w-6 text-orange-500" />
              </motion.div>
              <div>
                <div className="font-extrabold text-gray-900 text-xl">{userStats.current_streak}</div>
                <div className="text-xs text-gray-600 font-medium">STREAK</div>
              </div>
            </div>
            
            {/* Hearts */}
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`w-5 h-5 rounded-full border-2 border-gray-300 ${
                      i < userStats.hearts ? 'bg-red-500 shadow-lg' : 'bg-gray-200'
                    }`}
                    animate={i < userStats.hearts ? {
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    } : {}}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.1
                    }}
                    whileHover={{ scale: 1.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* --- Main Content Area --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Ultra Modern Group Progress Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 shadow-lg mb-10 relative overflow-hidden"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#03045e]/5 via-[#00bfe6]/5 to-[#03045e]/5 rounded-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-6">
                {/* Animated Plant Mascot */}
                <motion.div
                  className={`w-20 h-20 bg-gradient-to-br ${plantStage.color} rounded-3xl flex items-center justify-center text-4xl shadow-2xl border-2 border-white/30`}
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0],
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {plantStage.emoji}
                </motion.div>
                <div>
                  <motion.h2 
                    className="text-3xl font-bold text-gray-900 mb-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {plantStage.name}
                  </motion.h2>
                  <motion.p 
                    className="text-gray-600 font-medium text-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    Group Progress ({getDifficultyName(group.difficulty)})
                  </motion.p>
                </div>
              </div>
              
              <div className="text-right">
                <motion.div 
                  className="text-5xl font-extrabold bg-gradient-to-r from-[#03045e] to-[#00bfe6] bg-clip-text text-transparent mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                >
                  {Math.round(group.completion_percentage)}%
                </motion.div>
                <div className="text-gray-600 font-medium">
                  {group.levels_completed} of {group.total_levels} levels completed
                </div>
              </div>
            </div>
          
            {/* Enhanced Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border border-gray-300">
              <motion.div
                className="h-4 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-full relative"
                initial={{ width: 0 }}
                animate={{ width: `${group.completion_percentage}%` }}
                transition={{ duration: 2, delay: 0.8 }}
              >
                {/* Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        {/* Ultra Modern Levels Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {levels && levels.length > 0 ? levels.map((level, index) => {
            const progressManager = ProgressManager.getInstance()
            const isLocked = !progressManager.isLevelUnlocked(level.level_number)
            const isCompleted = progressManager.isLevelCompleted(level.level_number)
            const completionPercentage = progressManager.getLevelCompletionPercentage(level.level_number)
            const isTestLevel = level.is_test_level

            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                className={`group relative bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-6 transition-all duration-500 ${
                  isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer hover:bg-white shadow-lg'
                }`}
                whileHover={{ 
                  y: isLocked ? 0 : -10,
                  boxShadow: isLocked ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
                onMouseEnter={() => setHoveredLevel(level.level_number)}
                onMouseLeave={() => setHoveredLevel(null)}
                onClick={() => handleLevelClick(level)}
              >
                
                {/* Background Gradient */}
                <div className={`absolute inset-0 rounded-3xl ${
                  isCompleted 
                    ? 'bg-gradient-to-br from-green-500/10 to-emerald-600/10' 
                    : isLocked 
                      ? 'bg-gradient-to-br from-gray-500/5 to-gray-600/5' 
                      : 'bg-gradient-to-br from-[#03045e]/10 to-[#00bfe6]/10'
                }`}></div>

                {/* Level Number & Status */}
                <div className="relative z-10 flex items-center justify-between mb-6">
                  <motion.div 
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-extrabold shadow-2xl border-2 ${
                      isCompleted 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white border-green-400' 
                        : isLocked 
                          ? 'bg-gradient-to-br from-gray-400 to-gray-600 text-white border-gray-300' 
                          : 'bg-gradient-to-br from-[#03045e] to-[#00bfe6] text-white border-[#03045e]'
                    }`}
                    animate={hoveredLevel === level.level_number ? { 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {level.level_number}
                  </motion.div>
                  
                  <div className="flex items-center space-x-2">
                    {isLocked ? (
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Lock className="h-6 w-6 text-white/60" />
                      </motion.div>
                    ) : isCompleted ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      </motion.div>
                    ) : (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Play className="h-6 w-6 text-blue-400" />
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Level Info */}
                <div className="relative z-10 mb-4">
                  <motion.h3 
                    className="font-bold text-gray-900 text-xl mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    {level.name}
                  </motion.h3>
                  <div className="flex items-center space-x-4 text-gray-600 text-sm mb-3">
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{level.questions_count} Questions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{level.xp_reward} XP</span>
                    </div>
                  </div>
                  
                  {isTestLevel && (
                    <motion.div 
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-yellow-800 bg-yellow-100 border border-yellow-300"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Trophy className="h-3 w-3 mr-1" />
                      Test Level
                    </motion.div>
                  )}
                </div>

                {/* Enhanced Progress Bar */}
                {completionPercentage > 0 && (
                  <div className="relative z-10 mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden border border-gray-300">
                      <motion.div 
                        className="h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPercentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 mt-2 font-medium text-center">
                      {Math.round(completionPercentage)}% complete
                    </div>
                  </div>
                )}
                
                {/* Completion Badge */}
                {isCompleted && (
                  <motion.div 
                    className="absolute -top-4 -right-4 z-20"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white shadow-2xl border-2 border-white/30">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <CheckCircle className="h-6 w-6" />
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* Locked Tooltip */}
                {isLocked && hoveredLevel === level.level_number && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl border border-gray-700"
                  >
                    <div className="flex items-center space-x-2">
                      <Info className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium">
                        Complete previous levels to unlock!
                      </span>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </motion.div>
                )}
                
              </motion.div>
            )
          }) : (
            <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-lg">
              <div className="text-gray-500 text-lg">No levels available</div>
              <p className="text-gray-400 mt-2">Levels will appear here once they are created</p>
            </div>
          )}
        </div>

        {/* Group Jump Test CTA (Elevated and Prominent) */}
        {group.completion_percentage >= 80 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl p-6 shadow-2xl text-center"
            style={{ boxShadow: `0 15px 40px rgba(251, 191, 36, 0.4)` }}
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Trophy className="h-8 w-8 text-white animate-bounce-slow" />
              <h3 className="text-2xl font-extrabold text-white">Group Jump Test Available!</h3>
            </div>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              You've successfully completed **{Math.round(group.completion_percentage)}%** of this group. Prove your mastery and jump straight to the next group!
            </p>
            <button className={`bg-white text-lg font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300`}
              style={{ color: PRIMARY_COLOR }}
            >
              Take Jump Test Now
            </button>
          </motion.div>
        )}
      </div>

      {/* Penguin Mascot */}
      <PenguinMascot />
    </div>
  )
}

