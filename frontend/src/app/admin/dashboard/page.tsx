'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import apiService from '@/services/api'
import { 
  BookOpen, 
  Plus, 
  Upload, 
  BarChart3, 
  Users, 
  Settings,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'

interface LevelStats {
  id: number
  level_number: number
  name: string
  question_count: number
  active_question_count: number
  difficulty: number
}

interface QuestionStats {
  total: number
  active: number
  by_type: Array<{ question_type: string; count: number }>
  by_difficulty: Array<{ difficulty: number; count: number }>
}

export default function AdminDashboard() {
  const { user, isLoggedIn, authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<{
    totalLevels: number
    totalQuestions: number
    activeQuestions: number
    levelStats: LevelStats[]
    questionStats: QuestionStats
  } | null>(null)

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login')
      return
    }

    if (!authLoading && isLoggedIn && user?.role !== 'admin' && !user?.is_staff) {
      router.push('/')
      return
    }

    if (isLoggedIn && (user?.role === 'admin' || user?.is_staff)) {
      fetchStats()
    }
  }, [isLoggedIn, authLoading, user, router])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const stats = await apiService.adminDashboardStats()
      setStats(stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn || (user?.role !== 'admin' && !user?.is_staff)) {
    return null
  }

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'text-green-600 bg-green-100'
      case 2: return 'text-orange-600 bg-orange-100'
      case 3: return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'Easy'
      case 2: return 'Medium'
      case 3: return 'Hard'
      default: return 'Unknown'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📚 Admin Dashboard</h1>
          <p className="text-gray-600">Manage questions, levels, and content</p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <button
            onClick={() => router.push('/admin/questions/create')}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-4"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Add Question</h3>
              <p className="text-sm text-gray-600">Create new question</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/questions/import')}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-4"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Upload className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Bulk Import</h3>
              <p className="text-sm text-gray-600">Import questions from file</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/levels')}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-4"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Manage Levels</h3>
              <p className="text-sm text-gray-600">Edit levels and content</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/analytics')}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-4"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Analytics</h3>
              <p className="text-sm text-gray-600">View system statistics</p>
            </div>
          </button>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Levels</p>
                <p className="text-3xl font-bold">{stats?.totalLevels || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Questions</p>
                <p className="text-3xl font-bold">{stats?.totalQuestions || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Active Questions</p>
                <p className="text-3xl font-bold">{stats?.activeQuestions || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Avg Questions/Level</p>
                <p className="text-3xl font-bold">
                  {stats?.totalLevels ? Math.round((stats?.totalQuestions / stats?.totalLevels) * 10) / 10 : 0}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-200" />
            </div>
          </div>
        </motion.div>

        {/* Level Statistics Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Level Statistics</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Level</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Total Questions</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Active Questions</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Difficulty</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats?.levelStats?.map((level) => (
                  <tr key={level.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-bold text-lg">#{level.level_number}</span>
                    </td>
                    <td className="py-3 px-4">{level.name}</td>
                    <td className="py-3 px-4">{level.question_count}</td>
                    <td className="py-3 px-4">
                      <span className="flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{level.active_question_count}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(level.difficulty)}`}>
                        {getDifficultyText(level.difficulty)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/admin/questions?level=${level.id}`)}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-sm hover:bg-blue-200 transition-colors"
                        >
                          View Questions
                        </button>
                        <button
                          onClick={() => router.push(`/admin/questions/create?level=${level.id}`)}
                          className="px-3 py-1 bg-green-100 text-green-600 rounded-md text-sm hover:bg-green-200 transition-colors"
                        >
                          Add Question
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Question Type Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">❓ Question Type Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats?.questionStats?.by_type?.map((type) => (
              <div key={type.question_type} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {type.question_type === 'mcq' ? 'Multiple Choice' : 
                       type.question_type === 'fill_blank' ? 'Fill in Blank' :
                       type.question_type === 'true_false' ? 'True/False' :
                       type.question_type}
                    </h3>
                    <p className="text-2xl font-bold text-blue-600">{type.count}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {stats?.questionStats?.total ? 
                        Math.round((type.count / stats?.questionStats?.total) * 100) : 0}%
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
