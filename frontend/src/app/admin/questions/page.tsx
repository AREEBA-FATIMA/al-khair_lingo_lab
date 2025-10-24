'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import apiService from '@/services/api'
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText
} from 'lucide-react'

interface Question {
  id: number
  question_order: number
  question_type: string
  question_text: string
  options: string
  correct_answer: string
  hint: string
  explanation: string
  difficulty: number
  xp_value: number
  time_limit_seconds: number
  audio_url: string
  image_url: string
  is_active: boolean
  level: {
    id: number
    level_number: number
    name: string
  }
  created_at: string
}

interface Level {
  id: number
  level_number: number
  name: string
}

export default function QuestionsList() {
  const { user, isLoggedIn, authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || '')
  const [selectedType, setSelectedType] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [showActiveOnly, setShowActiveOnly] = useState(false)

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
      fetchData()
    }
  }, [isLoggedIn, authLoading, user, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch questions
      const questions = await apiService.getQuestionsForAdmin()
      setQuestions(questions)
      
      // Fetch levels
      const levels = await apiService.getLevels()
      setLevels(levels)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.correct_answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = !selectedLevel || question.level.id.toString() === selectedLevel
    const matchesType = !selectedType || question.question_type === selectedType
    const matchesDifficulty = !selectedDifficulty || question.difficulty.toString() === selectedDifficulty
    const matchesActive = !showActiveOnly || question.is_active

    return matchesSearch && matchesLevel && matchesType && matchesDifficulty && matchesActive
  })

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    try {
      await apiService.deleteQuestion(questionId)
      setQuestions(prev => prev.filter(q => q.id !== questionId))
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('Failed to delete question')
    }
  }

  const handleToggleActive = async (questionId: number, currentStatus: boolean) => {
    try {
      await apiService.updateQuestion(questionId, { is_active: !currentStatus })
      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, is_active: !currentStatus } : q
      ))
    } catch (error) {
      console.error('Error updating question:', error)
      alert('Failed to update question status')
    }
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mcq': return '🔘'
      case 'fill_blank': return '📝'
      case 'true_false': return '✅'
      case 'matching': return '🔗'
      case 'audio': return '🎵'
      default: return '❓'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'mcq': return 'Multiple Choice'
      case 'fill_blank': return 'Fill in Blank'
      case 'true_false': return 'True/False'
      case 'matching': return 'Matching'
      case 'audio': return 'Audio'
      default: return type
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn || (user?.role !== 'admin' && !user?.is_staff)) {
    return null
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </button>
              <h1 className="text-4xl font-bold text-gray-900">❓ Questions Management</h1>
            </div>
            <button
              onClick={() => router.push('/admin/questions/create')}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Question</span>
            </button>
          </div>
          <p className="text-gray-600">Manage and organize questions across all levels</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🔍 Filters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search questions..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Levels</option>
                {levels.map(level => (
                  <option key={level.id} value={level.id}>
                    Level {level.level_number}: {level.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="mcq">Multiple Choice</option>
                <option value="fill_blank">Fill in Blank</option>
                <option value="true_false">True/False</option>
                <option value="matching">Matching</option>
                <option value="audio">Audio</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Difficulties</option>
                <option value="1">Easy</option>
                <option value="2">Medium</option>
                <option value="3">Hard</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showActiveOnly}
                  onChange={(e) => setShowActiveOnly(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Active Only</span>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Questions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Questions ({filteredQuestions.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    XP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuestions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {question.question_text}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Order: {question.question_order}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        Level {question.level.level_number}
                      </span>
                      <p className="text-xs text-gray-500">{question.level.name}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getTypeIcon(question.question_type)}</span>
                        <span className="text-sm text-gray-900">{getTypeText(question.question_type)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                        {getDifficultyText(question.difficulty)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {question.xp_value}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(question.id, question.is_active)}
                        className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                          question.is_active 
                            ? 'text-green-600 bg-green-100 hover:bg-green-200' 
                            : 'text-red-600 bg-red-100 hover:bg-red-200'
                        }`}
                      >
                        {question.is_active ? (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/admin/questions/${question.id}/edit`)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/questions/${question.id}/preview`)}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredQuestions.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedLevel || selectedType || selectedDifficulty || showActiveOnly
                  ? 'Try adjusting your filters to see more questions.'
                  : 'Get started by creating your first question.'}
              </p>
              <button
                onClick={() => router.push('/admin/questions/create')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Question
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
