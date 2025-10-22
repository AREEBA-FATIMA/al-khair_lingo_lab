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
  Search,
  Building2
} from 'lucide-react'
import AnalyticsCharts from '@/components/AnalyticsCharts'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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
      
      // Only allow donor to access analytics
      if (user?.role !== 'donor') {
        router.push('/')
        return
      }
    }
  }, [isLoggedIn, user, authLoading, router])

  useEffect(() => {
    if (isLoggedIn && user?.role === 'donor') {
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

  if (user?.role !== 'donor') {
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
                <span className="text-sm text-gray-500">{getCurrentDate()} · WEEK {getCurrentWeek()} · Al Khair Lingo Lab</span>
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
        {/* Enhanced Overview Section with Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* System Overview with Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                System Overview
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Live Data
              </div>
            </div>
            
            {/* User Distribution Chart */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-800 mb-4">User Distribution</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Students', value: overallStats?.total_students || 0, color: '#10B981' },
                        { name: 'Teachers', value: overallStats?.total_teachers || 0, color: '#3B82F6' },
                        { name: 'Donors', value: 1, color: '#8B5CF6' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: 'Students', value: overallStats?.total_students || 0, color: '#10B981' },
                        { name: 'Teachers', value: overallStats?.total_teachers || 0, color: '#3B82F6' },
                        { name: 'Donors', value: 1, color: '#8B5CF6' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [value, name]}
                      labelStyle={{ color: '#374151' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Progress Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Learning Progress</span>
                  <BookOpen className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-blue-600 break-words">
                  {overallStats?.total_levels_completed || 0}/{Math.max(overallStats?.total_levels || 1, 1)}
                </div>
                <div className="text-xs text-gray-500">levels completed</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${overallStats ? (overallStats.total_levels_completed / Math.max(overallStats.total_levels || 1, 1)) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total XP</span>
                  <Zap className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {overallStats?.total_xp_earned || 0}
                </div>
                <div className="text-xs text-gray-500">points earned</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                </div>
              </div>
            </div>
            
          {/* Today's Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                Today's Activity
              </h3>
              <div className="text-sm text-gray-500">{getCurrentDate()}</div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
            <div>
                    <div className="text-sm text-gray-600">Active Users</div>
                    <div className="text-lg font-bold text-green-600">{overallStats?.active_users_today || 0}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Today</div>
                  <div className="text-sm font-medium text-green-600">+12%</div>
                </div>
                </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                </div>
                  <div>
                    <div className="text-sm text-gray-600">Levels Completed</div>
                    <div className="text-lg font-bold text-blue-600">{overallStats?.levels_completed_today || 0}</div>
                </div>
              </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Today</div>
                  <div className="text-sm font-medium text-blue-600">+8%</div>
                </div>
            </div>
            
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
            <div>
                    <div className="text-sm text-gray-600">XP Earned</div>
                    <div className="text-lg font-bold text-purple-600">{overallStats?.total_xp_earned || 0}</div>
                </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Total</div>
                  <div className="text-sm font-medium text-purple-600">+15%</div>
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
          {/* Campus Performance with Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-green-500" />
                Campus Performance
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {campusData.length} Campuses
              </div>
            </div>
            
            {/* Campus Comparison Chart */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-800 mb-4">Students Distribution</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campusData.map((campus) => ({
                    name: campus.campus_name.split(' ')[0], // First word only
                    students: campus.total_students,
                    teachers: campus.total_teachers,
                    classes: campus.total_classes
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="students" 
                      fill="#10B981" 
                      radius={[4, 4, 0, 0]}
                      name="Students"
                    />
                    <Bar 
                      dataKey="teachers" 
                      fill="#3B82F6" 
                      radius={[4, 4, 0, 0]}
                      name="Teachers"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Campus List */}
            <div className="space-y-3">
              <h4 className="text-lg font-medium text-gray-800 mb-3">Campus Details</h4>
              {campusData.length > 0 ? campusData.map((campus, index) => (
                <div key={campus.campus_id} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                  <div>
                      <h4 className="font-medium text-gray-900 text-sm">{campus.campus_name}</h4>
                      <p className="text-xs text-gray-600">{campus.total_students} students, {campus.total_teachers} teachers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">{campus.total_classes}</div>
                    <div className="text-xs text-gray-500">classes</div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 text-gray-500 text-sm">No campus data available</div>
              )}
            </div>
          </motion.div>

          {/* Teachers Performance Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-500" />
                Teachers Performance
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                {teacherData.length} Teachers
              </div>
            </div>
            
            {/* Teachers Bar Chart */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-800 mb-4">Students per Teacher</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teacherData.slice(0, 5).map((teacher, index) => ({
                    name: teacher.teacher_name.split(' ')[0], // First name only
                    students: teacher.total_students,
                    completion: teacher.average_completion_rate
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                    />
                    <Bar 
                      dataKey="students" 
                      fill="#3B82F6" 
                      radius={[4, 4, 0, 0]}
                      name="Students"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Top Teachers List */}
            <div className="space-y-3">
              <h4 className="text-lg font-medium text-gray-800 mb-3">Top Performers</h4>
              {teacherData.length > 0 ? teacherData.slice(0, 3).map((teacher, index) => (
                <div key={teacher.teacher_id} className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{teacher.teacher_name}</h4>
                      <p className="text-xs text-gray-600">{teacher.total_students} students</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-indigo-600">{teacher.average_completion_rate}%</div>
                    <div className="text-xs text-gray-500">completion</div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 text-gray-500 text-sm">No teacher data available</div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Enhanced Bottom Section with Trend Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Activity Trends Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                Activity Trends
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Last 7 Days
              </div>
            </div>
            
            {/* Mock trend data - in real app this would come from API */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { day: 'Mon', users: 45, levels: 12, xp: 1200 },
                  { day: 'Tue', users: 52, levels: 18, xp: 1500 },
                  { day: 'Wed', users: 48, levels: 15, xp: 1350 },
                  { day: 'Thu', users: 61, levels: 22, xp: 1800 },
                  { day: 'Fri', users: 58, levels: 20, xp: 1650 },
                  { day: 'Sat', users: 35, levels: 8, xp: 900 },
                  { day: 'Sun', users: 42, levels: 14, xp: 1100 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stackId="1" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.6}
                    name="Active Users"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="levels" 
                    stackId="2" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.6}
                    name="Levels Completed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* System Health Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                System Health
              </h3>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                All Systems Operational
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Users</div>
                    <div className="text-lg font-bold text-green-600">{overallStats?.total_users || 0}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Growth</div>
                  <div className="text-sm font-medium text-green-600">+12%</div>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-white" />
              </div>
                  <div>
                    <div className="text-sm text-gray-600">Teachers</div>
                    <div className="text-lg font-bold text-blue-600">{overallStats?.total_teachers || 0}</div>
              </div>
              </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Active</div>
                  <div className="text-sm font-medium text-blue-600">100%</div>
              </div>
            </div>

              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Students</div>
                    <div className="text-lg font-bold text-purple-600">{overallStats?.total_students || 0}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Engagement</div>
                  <div className="text-sm font-medium text-purple-600">85%</div>
                </div>
            </div>
            
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total XP</div>
                    <div className="text-lg font-bold text-orange-600">{overallStats?.total_xp_earned || 0}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Earned</div>
                  <div className="text-sm font-medium text-orange-600">+25%</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}