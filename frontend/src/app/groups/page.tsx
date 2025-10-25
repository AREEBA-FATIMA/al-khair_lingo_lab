'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Lock, 
  Trophy, 
  Zap,
  BookOpen,
  Flame,
  Target,
  Award,
  Brain,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import ProgressManager from '@/utils/progressManager'
import { apiService, Group as APIGroup } from '@/services/api'

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
  const [isLoading, setIsLoading] = useState(true)
  const [userStats, setUserStats] = useState({
    total_xp: 0,
    current_streak: 0,
    hearts: 5,
    daily_goal: 50,
    total_levels_completed: 0,
    completion_percentage: 0,
    current_level: 1
  })
  
  const { isLoggedIn, loading: isAuthLoading } = useAuth()

  // Authentication check
  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      window.location.href = '/login'
    }
  }, [isLoggedIn, isAuthLoading])

  // Data fetching
  useEffect(() => {
    if (isLoggedIn) {
      loadUserData()
      setupEventListeners()
    }
  }, [isLoggedIn])

  const loadUserData = async () => {
    await Promise.all([
      fetchGroups(),
      fetchUserStats(),
      loadProgressFromLocalStorage()
    ])
    setIsLoading(false)
  }

  const setupEventListeners = () => {
    const handleLevelCompleted = () => {
      loadProgressFromLocalStorage()
    }

    window.addEventListener('levelCompleted', handleLevelCompleted)
    return () => window.removeEventListener('levelCompleted', handleLevelCompleted)
  }

  const loadProgressFromLocalStorage = () => {
    const progressManager = ProgressManager.getInstance()
    const userProgress = progressManager.getUserProgress()
    
    const totalLevels = 900
    const completionPercentage = totalLevels > 0 
      ? (userProgress.completedLevels.length / totalLevels) * 100 
      : 0
    
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
      const groupsData = await apiService.getGroups() as APIGroup[]
      
      const transformedGroups: Group[] = groupsData.map(apiGroup => ({
        id: apiGroup.id,
        group_number: apiGroup.group_number,
        name: apiGroup.name,
        description: apiGroup.description,
        difficulty: 1,
        is_unlocked: apiGroup.is_unlocked,
        completion_percentage: apiGroup.completion_percentage,
        levels_completed: apiGroup.levels_completed,
        total_levels: (apiGroup as any).total_levels ?? (apiGroup as any).level_count ?? 0,
        xp_earned: 0,
        plant_stage: (apiGroup as any).current_stage || '',
        track: 'beginner',
        topic_category: 'General',
        oxford_word_range_start: 1,
        oxford_word_range_end: 100,
        grammar_focus: []
      }))
      
      setGroups(transformedGroups)
      organizeGroupsIntoTracks(transformedGroups)
    } catch (error) {
      console.error('Error fetching groups:', error)
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

    // Calculate progress and unlock status
    tracksData.forEach((track, index) => {
      const completedGroups = track.groups.filter(g => g.completion_percentage === 100).length
      track.completed_groups = completedGroups
      track.progress_percentage = track.groups.length > 0 
        ? (completedGroups / track.groups.length) * 100 
        : 0
      
      // Unlock logic
      if (index === 0) track.is_unlocked = true
      else if (index === 1) track.is_unlocked = tracksData[0].completed_groups >= 6
      else if (index === 2) track.is_unlocked = tracksData[1].completed_groups >= 8
    })

    setTracks(tracksData)
  }

  const fetchUserStats = async () => {
    try {
      const data = await apiService.getProgressOverview()
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
      'from-green-400 to-green-600',
      'from-blue-400 to-blue-600', 
      'from-yellow-400 to-orange-500',
      'from-orange-400 to-red-500',
      'from-red-400 to-purple-600'
    ]
    return colors[difficulty - 1] || colors[0]
  }

  const getDifficultyName = (difficulty: number) => {
    const names = ['Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate', 'Advanced']
    return names[difficulty - 1] || 'Beginner'
  }

  if (isLoading || isAuthLoading) {
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

      {/* Header Section */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#03045e] to-[#00bfe6] bg-clip-text text-transparent mb-2">
                Learning Tracks
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                Choose your learning path and master English step by step
              </p>
              
              {/* Overall Progress */}
              <div className="w-full max-w-md">
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
            <div className="flex flex-wrap gap-4 justify-center lg:justify-end">
              <StatCard
                icon={Zap}
                value={userStats.total_xp}
                label="XP"
                gradient="from-yellow-50 to-orange-50"
                border="border-yellow-200"
                iconColor="text-yellow-500"
              />
              
              <StatCard
                icon={Flame}
                value={userStats.current_streak}
                label="day streak"
                gradient="from-orange-50 to-red-50"
                border="border-orange-200"
                iconColor="text-orange-500"
              />
                      
              <div className="flex items-center gap-3 bg-gradient-to-r from-red-50 to-pink-50 px-4 py-3 rounded-xl border border-red-200">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-5 h-5 rounded-full transition-colors ${
                        i < userStats.hearts 
                          ? 'bg-red-500 shadow-lg animate-pulse' 
                          : 'bg-gray-300'
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
            <TrackSection
              key={track.id}
              track={track}
              trackIndex={trackIndex}
              getPlantStage={getPlantStage}
              getDifficultyColor={getDifficultyColor}
              getDifficultyName={getDifficultyName}
            />
          ))}
        </div>

        {/* Daily Goal Progress */}
        <DailyGoalSection 
          totalXP={userStats.total_xp}
          dailyGoal={userStats.daily_goal}
        />
      </div>
    </div>
  )
}

// Component for stat cards
const StatCard = ({ 
  icon: Icon, 
  value, 
  label, 
  gradient, 
  border, 
  iconColor 
}: {
  icon: any
  value: number
  label: string
  gradient: string
  border: string
  iconColor: string
}) => (
  <div className={`flex items-center gap-3 bg-gradient-to-r ${gradient} px-4 py-3 rounded-xl border ${border}`}>
    <Icon className={`h-6 w-6 ${iconColor}`} />
    <div>
      <span className="font-bold text-2xl text-gray-900">{value}</span>
      <span className="text-gray-600 ml-1">{label}</span>
    </div>
  </div>
)

// Component for track sections
const TrackSection = ({ 
  track, 
  trackIndex, 
  getPlantStage, 
  getDifficultyColor, 
  getDifficultyName 
}: {
  track: Track
  trackIndex: number
  getPlantStage: (percentage: number) => any
  getDifficultyColor: (difficulty: number) => string
  getDifficultyName: (difficulty: number) => string
}) => {
  const progressManager = ProgressManager.getInstance()
  const userProgress = progressManager.getUserProgress()

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: trackIndex * 0.2 }}
      className={`relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-100 ${
        !track.is_unlocked ? 'opacity-60' : ''
      }`}
    >
      {/* Track Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-6">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 bg-gradient-to-br ${track.color} rounded-2xl flex items-center justify-center text-white shadow-xl`}>
            <track.icon className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{track.name}</h2>
            <p className="text-gray-600 text-lg">{track.description}</p>
          </div>
        </div>
        
        {/* Track Progress */}
        <div className="text-center lg:text-right">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {track.completed_groups}/{track.total_groups}
          </div>
          <div className="text-sm text-gray-600 mb-2">Groups Completed</div>
          <div className="w-32 bg-gray-200 rounded-full h-3 mx-auto lg:mx-0">
            <motion.div
              className={`h-3 bg-gradient-to-r ${track.color} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${track.progress_percentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Lock Overlay */}
      {!track.is_unlocked && (
        <div className="absolute inset-0 bg-gray-900/50 rounded-3xl flex items-center justify-center z-10 cursor-not-allowed">
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
          const groupLevels = userProgress.completedLevels.filter(levelId => 
            levelId >= (group.group_number * 25) && levelId < ((group.group_number + 1) * 25)
          )
          const groupProgress = Math.min(100, (groupLevels.length / 25) * 100)
          const plantStage = getPlantStage(groupProgress)
          const difficultyColor = getDifficultyColor(group.difficulty)
          const isLocked = group.group_number > 1 && 
            userProgress.completedLevels.length < (group.group_number - 1) * 25

          return (
            <GroupCard
              key={group.id}
              group={group}
              groupIndex={groupIndex}
              isLocked={isLocked}
              groupProgress={groupProgress}
              plantStage={plantStage}
              difficultyColor={difficultyColor}
              getDifficultyName={getDifficultyName}
            />
          )
        })}
      </div>

      {/* Track Completion Message */}
      {track.completed_groups === track.total_groups && track.groups.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Trophy className="h-12 w-12 text-green-500" />
            <div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">Track Completed! 🎉</h3>
              <p className="text-green-600">Congratulations! You've mastered the {track.name.toLowerCase()}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Component for individual group cards
const GroupCard = ({
  group,
  groupIndex,
  isLocked,
  groupProgress,
  plantStage,
  difficultyColor,
  getDifficultyName
}: {
  group: Group
  groupIndex: number
  isLocked: boolean
  groupProgress: number
  plantStage: any
  difficultyColor: string
  getDifficultyName: (difficulty: number) => string
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: groupIndex * 0.1 }}
      className={`group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-md transition-all duration-300 ${
        isLocked 
          ? 'opacity-60 grayscale cursor-not-allowed' 
          : 'hover:shadow-lg hover:-translate-y-1 hover:scale-105 hover:ring-1 hover:ring-[#00bfe6]/20 cursor-pointer'
      }`}
      onClick={handleCardClick}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 rounded-2xl ${
        isLocked
          ? 'bg-gradient-to-br from-gray-500/5 to-gray-600/5'
          : 'bg-gradient-to-r from-[#03045e]/10 to-[#00bfe6]/10'
      }`}></div>

      {/* Top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#03045e]/40 to-[#00bfe6]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Lock Icon */}
      {isLocked && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">Locked</span>
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
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500 py-3 px-4 rounded-xl font-semibold border border-gray-200 shadow-inner text-sm cursor-not-allowed">
            <Lock className="h-4 w-4 inline mr-1" />
            Complete previous group
          </div>
        ) : (
          <Link
            href={`/groups/${group.group_number}/levels`}
            className="group/btn relative inline-block w-full bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white py-3 px-4 rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:scale-105 shadow-md text-sm cursor-pointer"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {group.completion_percentage > 0 ? 'Continue' : 'Start'}
              <ChevronRight className="h-4 w-4" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
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
      <div className="absolute inset-0 bg-gradient-to-r from-[#03045e]/5 to-[#00bfe6]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </motion.div>
  )
}

// Component for daily goal section
const DailyGoalSection = ({ totalXP, dailyGoal }: { totalXP: number; dailyGoal: number }) => {
  const progressPercentage = Math.min((totalXP / dailyGoal) * 100, 100)
  const isGoalCompleted = totalXP >= dailyGoal

  return (
    <div className="mt-16 bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-100">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-6">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-[#03045e] to-[#00bfe6] bg-clip-text text-transparent mb-2">
            Daily Goal
          </h3>
          <p className="text-gray-600">Keep your learning streak alive!</p>
        </div>
        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-xl border border-blue-200">
          <Target className="h-6 w-6 text-[#00bfe6]" />
          <div className="text-right">
            <div className="text-2xl font-bold text-[#03045e]">{totalXP}</div>
            <div className="text-sm text-gray-600">/ {dailyGoal} XP</div>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
        <motion.div
          className="h-4 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-full shadow-lg"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>
      
      {/* Completion Message */}
      <div className="mt-4 text-center">
        <p className={`text-lg font-semibold ${
          isGoalCompleted ? "text-green-600" : "text-gray-600"
        }`}>
          {isGoalCompleted 
            ? "🎉 Daily goal completed! Great job!" 
            : `${dailyGoal - totalXP} XP needed to complete daily goal`
          }
        </p>
      </div>
    </div>
  )
}