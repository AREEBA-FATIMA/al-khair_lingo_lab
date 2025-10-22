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
  Flame,
  ArrowRight,
  Play,
  Award,
  Brain,
  Users,
  ChevronRight
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
  track: string
  topic_category: string
  oxford_word_range_start: number
  oxford_word_range_end: number
  grammar_focus: string[]
}

interface Track {
  id: string
  name: string
  description: string
  color: string
  icon: any
  groups: Group[]
  total_groups: number
  completed_groups: number
  progress_percentage: number
  is_unlocked: boolean
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [tracks, setTracks] = useState<Track[]>([])
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
    const totalLevels = 900 // Total levels in the system (200 + 300 + 400)
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
      console.log('Groups data:', data)
      const groupsData = data.results || data
      setGroups(groupsData)
      
      // Organize groups into tracks
      organizeGroupsIntoTracks(groupsData)
    } catch (error) {
      console.error('Error fetching groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const organizeGroupsIntoTracks = (groupsData: Group[]) => {
    const tracksData: Track[] = [
      {
        id: 'beginner',
        name: 'Beginner Track',
        description: 'Class 3-5 Level • Basic English Foundation',
        color: 'from-green-400 to-emerald-600',
        icon: BookOpen,
        groups: groupsData.filter(g => g.track === 'beginner' || g.group_number <= 8),
        total_groups: 8,
        completed_groups: 0,
        progress_percentage: 0,
        is_unlocked: true
      },
      {
        id: 'intermediate',
        name: 'Intermediate Track',
        description: 'Class 6-10 Level • Advanced Grammar & Vocabulary',
        color: 'from-blue-400 to-indigo-600',
        icon: Brain,
        groups: groupsData.filter(g => g.track === 'intermediate' || (g.group_number > 8 && g.group_number <= 18)),
        total_groups: 10,
        completed_groups: 0,
        progress_percentage: 0,
        is_unlocked: false
      },
      {
        id: 'advanced',
        name: 'Advanced Track',
        description: 'Fluency Level • Business & Academic English',
        color: 'from-purple-400 to-violet-600',
        icon: Award,
        groups: groupsData.filter(g => g.track === 'advanced' || g.group_number > 18),
        total_groups: 12,
        completed_groups: 0,
        progress_percentage: 0,
        is_unlocked: false
      }
    ]

    // Calculate progress for each track
    tracksData.forEach(track => {
      const completedGroups = track.groups.filter(g => g.completion_percentage === 100).length
      track.completed_groups = completedGroups
      track.progress_percentage = track.groups.length > 0 ? (completedGroups / track.groups.length) * 100 : 0
      
      // Unlock logic
      if (track.id === 'beginner') {
        track.is_unlocked = true
      } else if (track.id === 'intermediate') {
        track.is_unlocked = tracksData[0].completed_groups >= 6 // Unlock after 6 beginner groups
      } else if (track.id === 'advanced') {
        track.is_unlocked = tracksData[1].completed_groups >= 8 // Unlock after 8 intermediate groups
      }
    })

    setTracks(tracksData)
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
                Learning Tracks
              </h1>
              <p className="text-gray-600 text-lg">Choose your learning path and master English step by step</p>
              
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

      {/* Learning Tracks */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">
          {tracks.map((track, trackIndex) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: trackIndex * 0.2 }}
              className={`relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-100 ${
                !track.is_unlocked ? 'opacity-60' : ''
              }`}
            >
              {/* Track Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${track.color} rounded-2xl flex items-center justify-center text-white shadow-xl`}>
                    <track.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{track.name}</h2>
                    <p className="text-gray-600 text-lg">{track.description}</p>
                  </div>
                </div>
                
                {/* Track Progress */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {track.completed_groups}/{track.total_groups}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Groups Completed</div>
                  <div className="w-32 bg-gray-200 rounded-full h-3">
                    <motion.div
                      className={`h-3 bg-gradient-to-r ${track.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${track.progress_percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
              </div>

              {/* Lock Overlay for locked tracks */}
              {!track.is_unlocked && (
                <div className="absolute inset-0 bg-gray-900/50 rounded-3xl flex items-center justify-center z-10">
                  <div className="text-center text-white">
                    <Lock className="h-16 w-16 mx-auto mb-4 opacity-60" />
                    <h3 className="text-2xl font-bold mb-2">Track Locked</h3>
                    <p className="text-lg opacity-80">
                      Complete previous track to unlock this learning path
                    </p>
                  </div>
                </div>
              )}

              {/* Groups Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {track.groups.map((group, groupIndex) => {
                  const progressManager = ProgressManager.getInstance()
                  const userProgress = progressManager.getUserProgress()
                  
                  // Calculate group progress
                  const groupLevels = userProgress.completedLevels.filter(levelId => {
                    return levelId >= (group.group_number * 25) && levelId < ((group.group_number + 1) * 25)
                  })
                  const groupProgress = Math.min(100, (groupLevels.length / 25) * 100) // 25 levels per group
                  const plantStage = getPlantStage(groupProgress)
                  const difficultyColor = getDifficultyColor(group.difficulty)
                  const isLocked = group.group_number > 1 && userProgress.completedLevels.length < (group.group_number - 1) * 25
                  
                  return (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: groupIndex * 0.1 }}
                      className={`group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 ${
                        isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-2 hover:scale-105'
                      }`}
                    >
                      {/* Lock Icon for locked groups */}
                      {isLocked && (
                        <div className="absolute top-4 right-4">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                      )}

                      {/* Plant Stage */}
                      <div className="text-center mb-4">
                        <motion.div
                          className={`w-16 h-16 bg-gradient-to-br ${plantStage.color} rounded-full flex items-center justify-center text-3xl mx-auto shadow-lg border-2 border-white`}
                          animate={!isLocked ? { 
                            y: [0, -4, 0],
                            rotate: [0, 2, -2, 0],
                            scale: [1, 1.02, 1]
                          } : {}}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          {plantStage.emoji}
                        </motion.div>
                        <p className="text-xs font-semibold text-gray-700 mt-2 bg-gray-100 px-2 py-1 rounded-full inline-block">
                          {plantStage.name}
                        </p>
                      </div>

                      {/* Group Info */}
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          Group {group.group_number}
                        </h3>
                        <p className="text-gray-700 text-sm mb-2">{group.name}</p>
                        
                        {/* Topic Category */}
                        {group.topic_category && (
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                            {group.topic_category}
                          </div>
                        )}
                        
                        {/* Difficulty Badge */}
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${difficultyColor} shadow-md`}>
                          <Trophy className="h-3 w-3 mr-1" />
                          {getDifficultyName(group.difficulty)}
                        </div>
                      </div>

                      {/* Learning Stats */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-2 rounded-lg border border-green-100 text-center">
                          <div className="text-sm font-bold text-green-600">{group.levels_completed}</div>
                          <div className="text-xs text-gray-600">Completed</div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-2 rounded-lg border border-yellow-100 text-center">
                          <div className="text-sm font-bold text-yellow-600">{group.xp_earned}</div>
                          <div className="text-xs text-gray-600">XP</div>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <div className="text-center">
                        {isLocked ? (
                          <div className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500 py-3 px-4 rounded-xl font-semibold border border-gray-200 shadow-inner text-sm">
                            <Lock className="h-4 w-4 inline mr-1" />
                            Complete previous group
                          </div>
                        ) : (
                          <Link
                            href={`/groups/${group.group_number}/levels`}
                            className="group/btn relative inline-block w-full bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white py-3 px-4 rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:scale-105 shadow-md text-sm"
                          >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              {group.completion_percentage > 0 ? 'Continue' : 'Start'}
                              <ChevronRight className="h-4 w-4" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#02033a] to-[#0099cc] rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                          </Link>
                        )}
                      </div>

                      {/* Completion Badge */}
                      {group.completion_percentage === 100 && (
                        <div className="absolute -top-2 -right-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white">
                            <Trophy className="h-4 w-4" />
                          </div>
                        </div>
                      )}

                      {/* Hover Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#03045e]/5 to-[#00bfe6]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Track Completion Message */}
              {track.completed_groups === track.total_groups && track.groups.length > 0 && (
                <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Trophy className="h-12 w-12 text-green-500 mr-4" />
                    <div>
                      <h3 className="text-2xl font-bold text-green-800 mb-2">Track Completed! 🎉</h3>
                      <p className="text-green-600">Congratulations! You've mastered the {track.name.toLowerCase()}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
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