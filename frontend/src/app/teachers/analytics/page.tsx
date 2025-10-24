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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[#00bfe6]/15 to-[#03045e]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-[#03045e]/15 to-[#00bfe6]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <Navigation />
      
      {/* Modern Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-6">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/teachers/dashboard"
                  className="p-2 text-gray-600 hover:text-[#03045e] transition-all duration-300 hover:bg-[#00bfe6]/10 rounded-xl"
                >
                  <ArrowLeft className="h-6 w-6" />
                </Link>
              </motion.div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 bg-[#00bfe6] rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-[#03045e] bg-gradient-to-r from-[#03045e]/10 to-[#00bfe6]/10 px-3 py-1 rounded-full">
                    Teacher Analytics
                  </span>
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900">Class Performance</h1>
                <p className="text-lg text-gray-600 mt-1">Comprehensive insights and detailed analytics</p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchAnalyticsData}
              className="bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white px-8 py-3 rounded-2xl font-bold hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <span className="flex items-center gap-2">
                🔄 Refresh Data
              </span>
            </motion.button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Period Comparison - Modern Design */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl mb-10 border border-white/50 relative overflow-hidden"
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#03045e]/5 to-[#00bfe6]/5 opacity-50"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-2xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900">Performance Over Time</h3>
                <p className="text-gray-600">Track progress across different time periods</p>
              </div>
            </div>
          
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Today */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="group relative bg-gradient-to-br from-[#00bfe6]/10 to-[#03045e]/5 rounded-2xl p-6 border border-[#00bfe6]/20 hover:border-[#00bfe6]/40 transition-all duration-300 hover:shadow-xl"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#00bfe6] to-[#03045e] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-xl font-extrabold text-[#03045e] mb-4">Today</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Levels:</span>
                      <span className="font-bold text-[#03045e] text-lg">{analyticsData.time_periods.today.levels_completed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">XP:</span>
                      <span className="font-bold text-[#03045e] text-lg">{analyticsData.time_periods.today.total_xp}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Score:</span>
                      <span className="font-bold text-[#03045e] text-lg">{analyticsData.time_periods.today.average_score}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Active:</span>
                      <span className="font-bold text-[#03045e] text-lg">{analyticsData.time_periods.today.active_students}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* This Week */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="group relative bg-gradient-to-br from-[#03045e]/10 to-[#00bfe6]/5 rounded-2xl p-6 border border-[#03045e]/20 hover:border-[#03045e]/40 transition-all duration-300 hover:shadow-xl"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-xl font-extrabold text-[#03045e] mb-4">This Week</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Levels:</span>
                      <span className="font-bold text-[#03045e] text-lg">{analyticsData.time_periods.this_week.levels_completed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">XP:</span>
                      <span className="font-bold text-[#03045e] text-lg">{analyticsData.time_periods.this_week.total_xp}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Score:</span>
                      <span className="font-bold text-[#03045e] text-lg">{analyticsData.time_periods.this_week.average_score}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Active:</span>
                      <span className="font-bold text-[#03045e] text-lg">{analyticsData.time_periods.this_week.active_students}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* This Month */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="group relative bg-gradient-to-br from-[#00bfe6]/10 to-[#03045e]/5 rounded-2xl p-6 border border-[#00bfe6]/20 hover:border-[#00bfe6]/40 transition-all duration-300 hover:shadow-xl"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#00bfe6] to-[#03045e] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-xl font-extrabold text-[#03045e] mb-4">This Month</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Levels:</span>
                      <span className="font-bold text-[#03045e] text-lg">{analyticsData.time_periods.this_month.levels_completed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">XP:</span>
                      <span className="font-bold text-[#03045e] text-lg">{analyticsData.time_periods.this_month.total_xp}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Score:</span>
                      <span className="font-bold text-[#03045e] text-lg">{analyticsData.time_periods.this_month.average_score}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Active:</span>
                      <span className="font-bold text-[#03045e] text-lg">{analyticsData.time_periods.this_month.active_students}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Top Performers - Modern Design */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50 relative overflow-hidden"
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00bfe6]/5 to-[#03045e]/5 opacity-50"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-[#00bfe6] to-[#03045e] rounded-2xl flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">Top Performers</h3>
                  <p className="text-gray-600">Students excelling in their learning journey</p>
                </div>
              </div>
            
              <div className="space-y-4">
                {analyticsData.top_performers.length > 0 ? (
                  analyticsData.top_performers.map((student, index) => (
                    <motion.div
                      key={student.student_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-[#00bfe6]/10 to-[#03045e]/5 rounded-2xl border border-[#00bfe6]/20 hover:border-[#00bfe6]/40 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#00bfe6] to-[#03045e] rounded-2xl flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.completed_levels} levels completed</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#03045e] text-lg">{student.total_xp} XP</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Trophy className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">No performance data available</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Students Needing Attention - Modern Design */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50 relative overflow-hidden"
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#03045e]/5 to-[#00bfe6]/5 opacity-50"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-2xl flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">Needs Attention</h3>
                  <p className="text-gray-600">Students who may need extra support</p>
                </div>
              </div>
            
              <div className="space-y-4">
                {analyticsData.needs_attention.length > 0 ? (
                  analyticsData.needs_attention.map((student, index) => (
                    <motion.div
                      key={student.student_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-[#03045e]/10 to-[#00bfe6]/5 rounded-2xl border border-[#03045e]/20 hover:border-[#03045e]/40 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-2xl flex items-center justify-center text-white font-bold">
                          !
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.recent_activity} levels this week</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#03045e] text-lg">{student.total_xp} XP</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">All students are performing well!</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

       
      
      </div>
    </div>
  )
}
