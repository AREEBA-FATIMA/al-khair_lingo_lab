'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface OverallStats {
  date: string
  campus_overview: {
    total_campuses: number
    total_grades: number
    total_classes: number
  }
  user_statistics: {
    total_users: number
    total_teachers: number
    total_students: number
    active_users_today: number
  }
  learning_progress: {
    total_levels: number
    total_groups: number
    levels_completed_today: number
    total_levels_completed: number
  }
  performance_metrics: {
    average_completion_rate: number
    average_xp_per_student: number
    total_xp_earned: number
  }
  engagement_metrics: {
    students_with_streak: number
    students_active_this_week: number
    students_active_this_month: number
  }
  top_performers: {
    top_student_xp: number
    top_student_streak: number
    top_class_completion: number
  }
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
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

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
      const [overallRes, campusRes, teacherRes, classRes] = await Promise.all([
        fetch('http://localhost:8000/api/analytics/overall/', { headers }),
        fetch('http://localhost:8000/api/analytics/campus/', { headers }),
        fetch('http://localhost:8000/api/analytics/teachers/', { headers }),
        fetch('http://localhost:8000/api/analytics/classes/', { headers })
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

    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">💰 Doner Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">System performance overview for donors</p>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {overallStats?.date ? new Date(overallStats.date).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: '📈' },
                { id: 'campus', name: 'Campus', icon: '🏫' },
                { id: 'teachers', name: 'Teachers', icon: '👨‍🏫' },
                { id: 'classes', name: 'Classes', icon: '🏛️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && overallStats && (
          <OverviewTab data={overallStats} />
        )}

        {activeTab === 'campus' && (
          <CampusTab data={campusData} />
        )}

        {activeTab === 'teachers' && (
          <TeachersTab data={teacherData} />
        )}

        {activeTab === 'classes' && (
          <ClassesTab data={classData} />
        )}
      </div>
    </div>
  )
}

// Overview Tab Component
function OverviewTab({ data }: { data: OverallStats }) {
  const stats = [
    {
      title: 'Total Users',
      value: data.user_statistics.total_users,
      icon: '👥',
      color: 'blue'
    },
    {
      title: 'Active Today',
      value: data.user_statistics.active_users_today,
      icon: '🟢',
      color: 'green'
    },
    {
      title: 'Levels Completed',
      value: data.learning_progress.total_levels_completed,
      icon: '✅',
      color: 'purple'
    },
    {
      title: 'Total XP Earned',
      value: data.performance_metrics.total_xp_earned,
      icon: '⭐',
      color: 'yellow'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-lg shadow-sm border p-6 ${
              stat.color === 'blue' ? 'border-blue-200' :
              stat.color === 'green' ? 'border-green-200' :
              stat.color === 'purple' ? 'border-purple-200' :
              'border-yellow-200'
            }`}
          >
            <div className="flex items-center">
              <div className="text-3xl mr-4">{stat.icon}</div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Statistics */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 User Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Teachers</span>
              <span className="font-semibold">{data.user_statistics.total_teachers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Students</span>
              <span className="font-semibold">{data.user_statistics.total_students}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Today</span>
              <span className="font-semibold text-green-600">{data.user_statistics.active_users_today}</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Performance Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Completion Rate</span>
              <span className="font-semibold">{data.performance_metrics.average_completion_rate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg XP per Student</span>
              <span className="font-semibold">{data.performance_metrics.average_xp_per_student}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total XP Earned</span>
              <span className="font-semibold text-blue-600">{data.performance_metrics.total_xp_earned.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Learning Progress */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Learning Progress</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Levels</span>
              <span className="font-semibold">{data.learning_progress.total_levels}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Groups</span>
              <span className="font-semibold">{data.learning_progress.total_groups}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed Today</span>
              <span className="font-semibold text-green-600">{data.learning_progress.levels_completed_today}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Completed</span>
              <span className="font-semibold text-blue-600">{data.learning_progress.total_levels_completed}</span>
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔥 Engagement Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Students with Streak</span>
              <span className="font-semibold text-orange-600">{data.engagement_metrics.students_with_streak}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active This Week</span>
              <span className="font-semibold text-green-600">{data.engagement_metrics.students_active_this_week}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active This Month</span>
              <span className="font-semibold text-blue-600">{data.engagement_metrics.students_active_this_month}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Campus Tab Component
function CampusTab({ data }: { data: CampusData[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">🏫 Campus Analytics</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campus</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teachers</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Today</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total XP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Completion</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((campus, index) => (
              <motion.tr
                key={campus.campus_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{campus.campus_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campus.total_teachers}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campus.total_students}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campus.total_classes}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{campus.active_students_today}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">{campus.total_xp_earned.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-semibold">{campus.average_class_completion}%</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Teachers Tab Component
function TeachersTab({ data }: { data: TeacherData[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">👨‍🏫 Teacher Analytics</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Today</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg XP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Top Student</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((teacher, index) => (
              <motion.tr
                key={teacher.teacher_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{teacher.teacher_name}</div>
                  <div className="text-sm text-gray-500">{teacher.teacher_code}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.assigned_class || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.total_students}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{teacher.active_students_today}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-semibold">{teacher.average_completion_rate}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">{teacher.average_xp_per_student}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.top_student_name || 'N/A'}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Classes Tab Component
function ClassesTab({ data }: { data: ClassData[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">🏛️ Class Analytics</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Today</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Levels Completed</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total XP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Streak</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((classroom, index) => (
              <motion.tr
                key={classroom.class_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{classroom.class_name}</div>
                  <div className="text-sm text-gray-500">{classroom.class_code}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{classroom.class_teacher || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{classroom.total_students}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{classroom.active_students_today}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">{classroom.total_levels_completed}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-semibold">{classroom.average_completion_rate}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-semibold">{classroom.total_xp_earned.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-semibold">{classroom.average_streak}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
