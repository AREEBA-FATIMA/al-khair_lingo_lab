'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  Target,
  Trophy,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Zap,
  Star,
  Eye,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Download,
  Filter,
  Search
} from 'lucide-react'
import AnalyticsCharts from '@/components/AnalyticsCharts'

interface OverallStats {
  date: string
  total_users: number
  total_teachers: number
  total_students: number
  active_users_today: number
  total_levels: number
  total_groups: number
  levels_completed_today: number
  total_levels_completed: number
  average_completion_rate: number
  average_xp_per_student: number
  total_xp_earned: number
  students_with_streak: number
  students_active_this_week: number
  students_active_this_month: number
  top_student_xp: number
  top_student_streak: number
  top_class_completion: number
}

interface CampusData {
  campus_id: number
  campus_name: string
  total_teachers: number
  total_students: number
  total_classes: number
  active_students_today: number
  total_xp_earned: number
  average_class_completion: number
}

interface TeacherData {
  teacher_id: number
  teacher_name: string
  teacher_code: string
  assigned_class: string | null
  total_students: number
  students_completed_levels: number
  active_students_today: number
  average_completion_rate: number
  average_xp_per_student: number
  top_student_name: string
  top_student_xp: number
  struggling_students: number
}

interface ClassData {
  class_id: number
  class_name: string
  class_code: string
  grade: string
  section: string
  class_teacher: string | null
  total_students: number
  active_students_today: number
  active_students_this_week: number
  total_levels_completed: number
  average_completion_rate: number
  total_xp_earned: number
  average_xp_per_student: number
  students_with_streak: number
  average_streak: number
  top_student_name: string
  top_student_xp: number
  struggling_students: number
}

export default function AnalyticsDashboard() {
  const { user, isLoggedIn, loading: authLoading } = useAuth()
  const router = useRouter()
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null)
  const [campusData, setCampusData] = useState<CampusData[]>([])
  const [teacherData, setTeacherData] = useState<TeacherData[]>([])
  const [classData, setClassData] = useState<ClassData[]>([])
  const [trendsData, setTrendsData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedCampus, setSelectedCampus] = useState<string>('all')
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all')
  const [dateRange, setDateRange] = useState('week')
  const [refreshKey, setRefreshKey] = useState(0)

  // Check authentication and redirect if not authorized
  useEffect(() => {
    if (!authLoading) {
      if (!isLoggedIn) {
        router.push('/login')
        return
      }
      
      // Only allow doner to access analytics
      if (user?.role !== 'doner') {
        router.push('/')
        return
      }
    }
  }, [isLoggedIn, user, authLoading, router])

  useEffect(() => {
    if (isLoggedIn && user?.role === 'doner') {
      fetchAnalyticsData()
    }
  }, [isLoggedIn, user])

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        console.error('No auth token found')
        return
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // Fetch all analytics data in parallel
      const [overallRes, campusRes, teacherRes, classRes, trendsRes] = await Promise.all([
        fetch('http://localhost:8000/api/analytics/overall/', { headers }),
        fetch('http://localhost:8000/api/analytics/campus/', { headers }),
        fetch('http://localhost:8000/api/analytics/teachers/', { headers }),
        fetch('http://localhost:8000/api/analytics/classes/', { headers }),
        fetch('http://localhost:8000/api/analytics/trends/', { headers })
      ])

      if (overallRes.ok) {
        const overallData = await overallRes.json()
        setOverallStats(overallData.data)
      }

      if (campusRes.ok) {
        const campusData = await campusRes.json()
        setCampusData(campusData.data)
      }

      if (teacherRes.ok) {
        const teacherData = await teacherRes.json()
        setTeacherData(teacherData.data)
      }

      if (classRes.ok) {
        const classData = await classRes.json()
        setClassData(classData.data)
      }

      if (trendsRes.ok) {
        const trendsData = await trendsRes.json()
        setTrendsData(trendsData.data)
      }

    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoggedIn) {
    return null // Will redirect to login
  }

  if (user?.role !== 'doner') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">This page is only accessible to donors.</p>
          <p className="text-sm text-gray-500">Please contact the administrator if you believe this is an error.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Analytics Dashboard...</p>
        </div>
      </div>
    )
  }

  const refreshData = () => {
    setRefreshKey(prev => prev + 1)
    fetchAnalyticsData()
  }

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit' 
    })
  }

  const getCurrentWeek = () => {
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
    return Math.ceil(days / 7)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-sm text-gray-500">{getCurrentDate()} · WEEK {getCurrentWeek()} · ENGLISH MASTER 2025</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                Dashboard
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Eye className="h-5 w-5" />
                </button>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={refreshData}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Data
              </button>
              <div className="text-sm text-gray-500">
                Last updated: {overallStats?.date ? new Date(overallStats.date).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Overall Progress Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Learning Progress</span>
                  <span className="font-semibold text-gray-900">
                    {overallStats?.total_levels_completed || 0}/{overallStats?.total_levels || 0} levels
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${overallStats ? (overallStats.total_levels_completed / Math.max(overallStats.total_levels, 1)) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{overallStats?.total_levels_completed || 0} completed</span>
                  <span>{overallStats?.total_levels || 0} total</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Activity</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Users</span>
                  <span className="font-semibold text-green-600">{overallStats?.active_users_today || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Levels Completed</span>
                  <span className="font-semibold text-blue-600">{overallStats?.levels_completed_today || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">XP Earned</span>
                  <span className="font-semibold text-purple-600">{overallStats?.total_xp_earned || 0}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Users</span>
                  <span className="font-semibold text-gray-900">{overallStats?.total_users || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Teachers</span>
                  <span className="font-semibold text-indigo-600">{overallStats?.total_teachers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Students</span>
                  <span className="font-semibold text-green-600">{overallStats?.total_students || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Today</h3>
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {overallStats?.levels_completed_today || 0}
            </div>
            <div className="text-sm text-gray-600">Levels Completed</div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">This Week</h3>
              <Calendar className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {overallStats?.students_active_this_week || 0}
            </div>
            <div className="text-sm text-gray-600">Active Students</div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">This Month</h3>
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {overallStats?.students_active_this_month || 0}
            </div>
            <div className="text-sm text-gray-600">Monthly Active</div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </motion.div>
        </div>

        {/* Detailed Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Campus Performance */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-500" />
                Campus Performance
              </h3>
              <button className="text-gray-400 hover:text-gray-600">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {campusData.length > 0 ? campusData.slice(0, 3).map((campus, index) => (
                <div key={campus.campus_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{campus.campus_name}</h4>
                    <p className="text-sm text-gray-600">{campus.total_students} students</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-indigo-600">{campus.total_teachers}</div>
                    <div className="text-sm text-gray-500">teachers</div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">No campus data available</div>
              )}
            </div>
          </motion.div>

          {/* Top Teachers */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Teachers
              </h3>
              <button className="text-gray-400 hover:text-gray-600">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {teacherData.length > 0 ? teacherData.slice(0, 3).map((teacher, index) => (
                <div key={teacher.teacher_id} className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{teacher.teacher_name}</h4>
                      <p className="text-sm text-gray-600">{teacher.total_students} students</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-yellow-600">{teacher.average_completion_rate}%</div>
                    <div className="text-sm text-gray-500">completion</div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">No teacher data available</div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Bottom Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Class Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Class Performance
              </h3>
              <button className="text-gray-400 hover:text-gray-600">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {classData.length > 0 ? classData.slice(0, 4).map((classItem, index) => (
                <div key={classItem.class_id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{classItem.class_name}</h4>
                    <p className="text-sm text-gray-600">{classItem.grade} - {classItem.section}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-blue-600">{classItem.total_students}</div>
                    <div className="text-xs text-gray-500">students</div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">No class data available</div>
              )}
            </div>
          </motion.div>

          {/* System Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                System Stats
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-600">Average Completion Rate</span>
                <span className="font-semibold text-green-600">{overallStats?.average_completion_rate || 0}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-gray-600">Average XP per Student</span>
                <span className="font-semibold text-purple-600">{overallStats?.average_xp_per_student || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-600">Students with Streaks</span>
                <span className="font-semibold text-blue-600">{overallStats?.students_with_streak || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-sm text-gray-600">Total XP Earned</span>
                <span className="font-semibold text-orange-600">{overallStats?.total_xp_earned || 0}</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-500" />
                Quick Actions
              </h3>
            </div>
            
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-200">
                <Download className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Export Report</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:shadow-md transition-all duration-200">
                <Filter className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Filter Data</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200 hover:shadow-md transition-all duration-200">
                <Search className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-900">Search Records</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200 hover:shadow-md transition-all duration-200">
                <RefreshCw className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-900">Refresh All</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}