'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Clock,
  Users,
  Trophy,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'

interface TimePeriodData {
  levels_completed: number
  total_xp: number
  average_score: number
  active_students: number
}

interface TopPerformer {
  student_id: string
  name: string
  total_xp: number
  completed_levels: number
}

interface NeedsAttention {
  student_id: string
  name: string
  recent_activity: number
  total_xp: number
}

interface AnalyticsData {
  time_periods: {
    today: TimePeriodData
    this_week: TimePeriodData
    this_month: TimePeriodData
  }
  top_performers: TopPerformer[]
  needs_attention: NeedsAttention[]
}

export default function TeacherAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isLoggedIn, user } = useAuth()

  useEffect(() => {
    if (isLoggedIn && user?.role === 'teacher') {
      fetchAnalyticsData()
    } else {
      setError('Access denied. Teacher role required.')
      setLoading(false)
    }
  }, [isLoggedIn, user])

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch('http://localhost:8000/api/teachers/analytics/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      } else {
        setError('Failed to load analytics data')
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      setError('Error loading analytics data')
    } finally {
      setLoading(false)
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">{error}</p>
            <Link
              href="/"
              className="mt-4 inline-block bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <p className="text-red-500">Failed to load analytics data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/teachers/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Class Analytics</h1>
                <p className="text-gray-600">Detailed performance insights</p>
              </div>
            </div>
            
            <button
              onClick={fetchAnalyticsData}
              className="bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Period Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Performance Over Time
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Today */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h4 className="text-lg font-semibold text-blue-900 mb-2">Today</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Levels:</span>
                  <span className="font-semibold text-blue-900">{analyticsData.time_periods.today.levels_completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">XP:</span>
                  <span className="font-semibold text-blue-900">{analyticsData.time_periods.today.total_xp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Score:</span>
                  <span className="font-semibold text-blue-900">{analyticsData.time_periods.today.average_score}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Active:</span>
                  <span className="font-semibold text-blue-900">{analyticsData.time_periods.today.active_students}</span>
                </div>
              </div>
            </div>

            {/* This Week */}
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h4 className="text-lg font-semibold text-green-900 mb-2">This Week</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Levels:</span>
                  <span className="font-semibold text-green-900">{analyticsData.time_periods.this_week.levels_completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">XP:</span>
                  <span className="font-semibold text-green-900">{analyticsData.time_periods.this_week.total_xp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Score:</span>
                  <span className="font-semibold text-green-900">{analyticsData.time_periods.this_week.average_score}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Active:</span>
                  <span className="font-semibold text-green-900">{analyticsData.time_periods.this_week.active_students}</span>
                </div>
              </div>
            </div>

            {/* This Month */}
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <h4 className="text-lg font-semibold text-purple-900 mb-2">This Month</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-purple-700">Levels:</span>
                  <span className="font-semibold text-purple-900">{analyticsData.time_periods.this_month.levels_completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-purple-700">XP:</span>
                  <span className="font-semibold text-purple-900">{analyticsData.time_periods.this_month.total_xp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-purple-700">Score:</span>
                  <span className="font-semibold text-purple-900">{analyticsData.time_periods.this_month.average_score}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-purple-700">Active:</span>
                  <span className="font-semibold text-purple-900">{analyticsData.time_periods.this_month.active_students}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performers */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Performers
            </h3>
            
            <div className="space-y-4">
              {analyticsData.top_performers.length > 0 ? (
                analyticsData.top_performers.map((student, index) => (
                  <motion.div
                    key={student.student_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.completed_levels} levels completed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-yellow-600">{student.total_xp} XP</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No performance data available</p>
              )}
            </div>
          </motion.div>

          {/* Students Needing Attention */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Needs Attention
            </h3>
            
            <div className="space-y-4">
              {analyticsData.needs_attention.length > 0 ? (
                analyticsData.needs_attention.map((student, index) => (
                  <motion.div
                    key={student.student_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        !
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.recent_activity} levels this week</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">{student.total_xp} XP</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">All students are performing well!</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Performance Insights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg mt-8"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            Performance Insights
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-900">Weekly Growth</h4>
              <p className="text-sm text-blue-700">
                {analyticsData.time_periods.this_week.levels_completed > analyticsData.time_periods.today.levels_completed * 7 
                  ? 'Above average' 
                  : 'Below average'
                }
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-semibold text-green-900">Engagement</h4>
              <p className="text-sm text-green-700">
                {analyticsData.time_periods.this_week.active_students} active students
              </p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h4 className="font-semibold text-yellow-900">Consistency</h4>
              <p className="text-sm text-yellow-700">
                {analyticsData.time_periods.this_month.average_score > 70 ? 'Good' : 'Needs improvement'}
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Trophy className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h4 className="font-semibold text-purple-900">Class Ranking</h4>
              <p className="text-sm text-purple-700">
                {analyticsData.top_performers.length > 0 ? 'Top performers identified' : 'Building momentum'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
