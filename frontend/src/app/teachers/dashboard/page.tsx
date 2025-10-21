'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock, 
  Award,
  BarChart3,
  Activity,
  Eye,
  Calendar,
  Zap,
  BookOpen,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'

interface TeacherInfo {
  name: string
  teacher_id: string
  campus: string
  assigned_class: string
  shift: string
}

interface ClassOverview {
  total_students: number
  active_students: number
  class_average_score: number
  class_average_xp: number
  class_average_levels: number
  class_average_streak: number
}

interface StudentProgress {
  student_id: string
  name: string
  father_name: string
  grade: string
  section: string
  completed_levels: number
  total_xp: number
  average_score: number
  current_streak: number
  is_active: boolean
  last_activity: string | null
}

interface RecentActivity {
  student_name: string
  level_name: string
  level_number: number
  xp_earned: number
  score: number
  completed_at: string
}

interface DashboardData {
  teacher_info: TeacherInfo
  class_overview: ClassOverview
  student_progress: StudentProgress[]
  recent_activity: RecentActivity[]
}

export default function TeacherDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const { isLoggedIn, user } = useAuth()

  useEffect(() => {
    console.log('DEBUG - Teacher Dashboard useEffect:', { isLoggedIn, user, role: user?.role })
    
    // Check localStorage directly if auth context is not ready
    const token = localStorage.getItem('authToken')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        console.log('DEBUG - Direct localStorage check:', userData)
        
        if (userData.role === 'teacher') {
          fetchDashboardData()
        } else {
          console.log('DEBUG - Access denied - wrong role:', userData.role)
          setError('Access denied. Teacher role required.')
          setLoading(false)
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        setError('Authentication error.')
        setLoading(false)
      }
    } else if (isLoggedIn && user?.role === 'teacher') {
      fetchDashboardData()
    } else {
      console.log('DEBUG - Access denied:', { isLoggedIn, userRole: user?.role, token: !!token, savedUser: !!savedUser })
      setError('Access denied. Teacher role required.')
      setLoading(false)
    }
  }, [isLoggedIn, user])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch('http://localhost:8000/api/teachers/dashboard/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      } else {
        setError('Failed to load dashboard data')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Error loading dashboard data')
    } finally {
      setLoading(false)
    }
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

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 60) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#00bfe6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading teacher dashboard...</p>
          </div>
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

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <p className="text-red-500">Failed to load dashboard data</p>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
              <p className="text-gray-600">
                {dashboardData.teacher_info.name} - {dashboardData.teacher_info.assigned_class}
              </p>
              <p className="text-sm text-gray-500">
                {dashboardData.teacher_info.campus} • {dashboardData.teacher_info.shift}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Link
                href="/teachers/analytics"
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                Analytics
              </Link>
              <button
                onClick={fetchDashboardData}
                className="bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Class Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Students */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{dashboardData.class_overview.total_students}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Total Students</h3>
            <p className="text-gray-600 text-sm">{dashboardData.class_overview.active_students} active</p>
          </motion.div>

          {/* Class Average Score */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-green-400 to-green-600 rounded-xl">
                <Target className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{dashboardData.class_overview.class_average_score}%</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Class Average</h3>
            <p className="text-gray-600 text-sm">Overall performance</p>
          </motion.div>

          {/* Class Average XP */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{Math.round(dashboardData.class_overview.class_average_xp)}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Average XP</h3>
            <p className="text-gray-600 text-sm">Experience points</p>
          </motion.div>

          {/* Class Average Streak */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{Math.round(dashboardData.class_overview.class_average_streak)}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Average Streak</h3>
            <p className="text-gray-600 text-sm">Days in a row</p>
          </motion.div>
        </div>

        {/* Student Progress Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            Student Progress
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Grade</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Levels</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">XP</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Streak</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.student_progress.map((student, index) => (
                  <motion.tr
                    key={student.student_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.father_name}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                        {student.grade} - {student.section}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900">{student.completed_levels}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-yellow-600">{student.total_xp}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${getPerformanceColor(student.average_score)}`}>
                        {student.average_score}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-orange-600">{student.current_streak}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                        student.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          setSelectedStudent(student)
                          setShowStudentModal(true)
                        }}
                        className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Recent Activity
          </h3>
          
          <div className="space-y-4">
            {dashboardData.recent_activity.length > 0 ? (
              dashboardData.recent_activity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-full flex items-center justify-center text-white text-sm font-bold">
                      L
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.student_name}</p>
                      <p className="text-sm text-gray-600">
                        Completed {activity.level_name} (Level {activity.level_number})
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">+{activity.xp_earned} XP</p>
                    <p className="text-sm text-gray-600">{activity.score}% • {formatDate(activity.completed_at)}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Student Detail Modal */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-5">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl bg-white rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Student Details</h3>
              <button
                onClick={() => setShowStudentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedStudent.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Father Name</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedStudent.father_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Student ID</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedStudent.student_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Class</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedStudent.grade} - {selectedStudent.section}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-gray-500">Completed Levels</label>
                  <p className="text-2xl font-bold text-blue-600">{selectedStudent.completed_levels}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total XP</label>
                  <p className="text-2xl font-bold text-yellow-600">{selectedStudent.total_xp}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Average Score</label>
                  <p className={`text-2xl font-bold ${getPerformanceColor(selectedStudent.average_score)}`}>
                    {selectedStudent.average_score}%
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Current Streak</label>
                  <p className="text-2xl font-bold text-orange-600">{selectedStudent.current_streak}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
