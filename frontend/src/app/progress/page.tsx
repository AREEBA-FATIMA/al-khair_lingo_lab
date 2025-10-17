'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Leaf, Trophy, Target, Clock, Star, TrendingUp, Calendar, Zap } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { apiService } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'

interface UserProgress {
  total_levels: number
  completed_levels: number
  completion_percentage: number
  total_xp: number
  total_questions: number
  accuracy_percentage: number
  current_streak: number
}

interface DailyProgress {
  date: string
  levels_completed: number
  questions_answered: number
  correct_answers: number
  xp_earned: number
  time_spent: number
  streak_maintained: boolean
}

export default function ProgressPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([])
  const [loading, setLoading] = useState(true)
  const { isLoggedIn } = useAuth()

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false)
      return
    }

    const fetchProgress = async () => {
      try {
        const response = await apiService.getProgressOverview()
        setProgress(response.overview)
        setDailyProgress(response.recent_activity || [])
      } catch (error) {
        console.error('Error fetching progress:', error)
        // Fallback to mock data if API fails
        const mockProgress: UserProgress = {
          total_levels: 1,
          completed_levels: 0,
          completion_percentage: 0,
          total_xp: 0,
          total_questions: 0,
          accuracy_percentage: 0,
          current_streak: 0
        }
        setProgress(mockProgress)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [isLoggedIn])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!progress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Progress not found</h1>
          <Link href="/groups" className="btn-primary">Start Learning</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card text-center"
          >
            <Trophy className="h-8 w-8 text-warning-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {progress.total_xp}
            </div>
            <div className="text-sm text-gray-600">Total XP</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="card text-center"
          >
            <Target className="h-8 w-8 text-success-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {progress.current_streak}
            </div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card text-center"
          >
            <Star className="h-8 w-8 text-primary-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {progress.total_levels_completed}
            </div>
            <div className="text-sm text-gray-600">Levels Completed</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card text-center"
          >
            <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {progress.overall_accuracy.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Accuracy</div>
          </motion.div>
        </div>

        {/* Weekly and Monthly Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">This Week</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {progress.weekly_levels_completed}
                </div>
                <div className="text-sm text-gray-600">Levels</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success-600">
                  {progress.weekly_xp_earned}
                </div>
                <div className="text-sm text-gray-600">XP Earned</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="card"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">This Month</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {progress.monthly_levels_completed}
                </div>
                <div className="text-sm text-gray-600">Levels</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success-600">
                  {progress.monthly_xp_earned}
                </div>
                <div className="text-sm text-gray-600">XP Earned</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Daily Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="card mb-8"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Daily Progress (Last 7 Days)</h3>
          <div className="grid grid-cols-7 gap-2">
            {dailyProgress.map((day, index) => (
              <div key={day.date} className="text-center">
                <div className="text-xs text-gray-600 mb-2">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`w-full h-16 rounded-lg flex items-end justify-center ${
                  day.levels_completed > 0 
                    ? 'bg-gradient-to-t from-success-400 to-success-500' 
                    : 'bg-gray-200'
                }`}>
                  <div className="text-white text-xs font-bold mb-1">
                    {day.levels_completed}
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {day.levels_completed} level{day.levels_completed !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Study Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="card text-center"
          >
            <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {progress.total_study_time}
            </div>
            <div className="text-sm text-gray-600">Total Study Time (min)</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="card text-center"
          >
            <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {progress.average_time_per_question}
            </div>
            <div className="text-sm text-gray-600">Avg Time per Question (sec)</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="card text-center"
          >
            <Calendar className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {progress.longest_streak}
            </div>
            <div className="text-sm text-gray-600">Longest Streak</div>
          </motion.div>
        </div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="card"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  achievement.unlocked 
                    ? 'border-success-200 bg-success-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    achievement.unlocked 
                      ? 'bg-success-100' 
                      : 'bg-gray-100'
                  }`}>
                    <span className={`text-xl ${
                      achievement.unlocked ? 'text-success-600' : 'text-gray-400'
                    }`}>
                      {achievement.emoji}
                    </span>
                  </div>
                  <div>
                    <h4 className={`font-semibold ${
                      achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {achievement.title}
                    </h4>
                    <p className={`text-sm ${
                      achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

const achievements = [
  {
    title: 'First Steps',
    description: 'Complete your first level',
    emoji: '🌱',
    unlocked: true
  },
  {
    title: 'Streak Master',
    description: 'Maintain a 7-day streak',
    emoji: '🔥',
    unlocked: true
  },
  {
    title: 'XP Collector',
    description: 'Earn 1000 XP',
    emoji: '⭐',
    unlocked: true
  },
  {
    title: 'Speed Demon',
    description: 'Complete a level in under 5 minutes',
    emoji: '⚡',
    unlocked: false
  },
  {
    title: 'Perfectionist',
    description: 'Get 100% accuracy on a level',
    emoji: '🎯',
    unlocked: false
  },
  {
    title: 'Group Master',
    description: 'Complete an entire group',
    emoji: '🏆',
    unlocked: false
  }
]
