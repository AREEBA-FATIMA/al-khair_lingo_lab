'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import apiService from '@/services/api'
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Plus, 
  Trash2,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface Level {
  id: number
  level_number: number
  name: string
}

interface QuestionFormData {
  level: number
  question_order: number
  question_type: 'mcq' | 'fill_blank' | 'true_false' | 'matching' | 'audio'
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
}

export default function CreateQuestion() {
  const { user, isLoggedIn, authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [levels, setLevels] = useState<Level[]>([])
  const [formData, setFormData] = useState<QuestionFormData>({
    level: parseInt(searchParams.get('level') || '0'),
    question_order: 1,
    question_type: 'mcq',
    question_text: '',
    options: '',
    correct_answer: '',
    hint: '',
    explanation: '',
    difficulty: 1,
    xp_value: 10,
    time_limit_seconds: 0,
    audio_url: '',
    image_url: '',
    is_active: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewMode, setPreviewMode] = useState(false)

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
      fetchLevels()
    }
  }, [isLoggedIn, authLoading, user, router])

  const fetchLevels = async () => {
    try {
      setLoading(true)
      const data = await apiService.getLevels()
      setLevels(data)
      
      // Set default level if specified in URL
      const levelId = searchParams.get('level')
      if (levelId && !formData.level) {
        setFormData(prev => ({ ...prev, level: parseInt(levelId) }))
      }
    } catch (error) {
      console.error('Error fetching levels:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseInt(value) || 0 : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.level) newErrors.level = 'Level is required'
    if (!formData.question_text.trim()) newErrors.question_text = 'Question text is required'
    if (!formData.correct_answer.trim()) newErrors.correct_answer = 'Correct answer is required'
    
    if (formData.question_type === 'mcq') {
      if (!formData.options.trim()) newErrors.options = 'Options are required for MCQ questions'
      else {
        const optionList = formData.options.split('\n').filter(opt => opt.trim())
        if (optionList.length < 2) newErrors.options = 'At least 2 options are required'
        if (!optionList.includes(formData.correct_answer)) {
          newErrors.correct_answer = 'Correct answer must be one of the provided options'
        }
      }
    }

    if (formData.xp_value < 1) newErrors.xp_value = 'XP value must be at least 1'
    if (formData.time_limit_seconds < 0) newErrors.time_limit_seconds = 'Time limit cannot be negative'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setSaving(true)
      await apiService.createQuestion(formData)
      router.push('/admin/dashboard')
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to create question' })
    } finally {
      setSaving(false)
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-4xl font-bold text-gray-900">❓ Create New Question</h1>
          </div>
          <p className="text-gray-600">Add a new question to the learning system</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">📝 Basic Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Level *
                      </label>
                      <select
                        name="level"
                        value={formData.level}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.level ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value={0}>Select a level...</option>
                        {levels.map(level => (
                          <option key={level.id} value={level.id}>
                            Level {level.level_number}: {level.name}
                          </option>
                        ))}
                      </select>
                      {errors.level && <p className="text-red-500 text-sm mt-1">{errors.level}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Order
                      </label>
                      <input
                        type="number"
                        name="question_order"
                        value={formData.question_order}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Type *
                    </label>
                    <select
                      name="question_type"
                      value={formData.question_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="mcq">Multiple Choice Question</option>
                      <option value="fill_blank">Fill in the Blank</option>
                      <option value="true_false">True/False</option>
                      <option value="matching">Matching</option>
                      <option value="audio">Audio Question</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text *
                    </label>
                    <textarea
                      name="question_text"
                      value={formData.question_text}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Enter the question text that students will see..."
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.question_text ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.question_text && <p className="text-red-500 text-sm mt-1">{errors.question_text}</p>}
                  </div>
                </div>

                {/* Answer Configuration */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">🎯 Answer Configuration</h2>
                  
                  {formData.question_type === 'mcq' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options * (one per line)
                      </label>
                      <textarea
                        name="options"
                        value={formData.options}
                        onChange={handleInputChange}
                        rows={6}
                        placeholder="Option A&#10;Option B&#10;Option C&#10;Option D"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.options ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.options && <p className="text-red-500 text-sm mt-1">{errors.options}</p>}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correct Answer *
                    </label>
                    <input
                      type="text"
                      name="correct_answer"
                      value={formData.correct_answer}
                      onChange={handleInputChange}
                      placeholder="Enter the correct answer..."
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.correct_answer ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.correct_answer && <p className="text-red-500 text-sm mt-1">{errors.correct_answer}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hint (Optional)
                    </label>
                    <textarea
                      name="hint"
                      value={formData.hint}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Optional hint to help students..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Explanation (Optional)
                    </label>
                    <textarea
                      name="explanation"
                      value={formData.explanation}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Explanation shown after answering..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">⚙️ Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty
                      </label>
                      <select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={1}>Easy</option>
                        <option value={2}>Medium</option>
                        <option value={3}>Hard</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        XP Value
                      </label>
                      <input
                        type="number"
                        name="xp_value"
                        value={formData.xp_value}
                        onChange={handleInputChange}
                        min="1"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.xp_value ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.xp_value && <p className="text-red-500 text-sm mt-1">{errors.xp_value}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Limit (seconds)
                      </label>
                      <input
                        type="number"
                        name="time_limit_seconds"
                        value={formData.time_limit_seconds}
                        onChange={handleInputChange}
                        min="0"
                        placeholder="0 = no limit"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.time_limit_seconds ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.time_limit_seconds && <p className="text-red-500 text-sm mt-1">{errors.time_limit_seconds}</p>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Active (question will be shown to students)
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex space-x-4 pt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="h-5 w-5" />
                    <span>{saving ? 'Creating...' : 'Create Question'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Eye className="h-5 w-5" />
                    <span>{previewMode ? 'Hide Preview' : 'Show Preview'}</span>
                  </button>
                </div>

                {errors.submit && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5" />
                      <span>{errors.submit}</span>
                    </div>
                  </div>
                )}
              </form>
            </motion.div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">👁️ Preview</h2>
              
              {previewMode && formData.question_text ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Question:</h3>
                    <p className="text-gray-700">{formData.question_text}</p>
                  </div>

                  {formData.question_type === 'mcq' && formData.options && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Options:</h4>
                      {formData.options.split('\n').filter(opt => opt.trim()).map((option, index) => (
                        <div key={index} className="p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                          {String.fromCharCode(65 + index)}. {option.trim()}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-1">Correct Answer:</h4>
                    <p className="text-green-700">{formData.correct_answer}</p>
                  </div>

                  {formData.hint && (
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-1">Hint:</h4>
                      <p className="text-yellow-700">{formData.hint}</p>
                    </div>
                  )}

                  {formData.explanation && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-800 mb-1">Explanation:</h4>
                      <p className="text-purple-700">{formData.explanation}</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(formData.difficulty)}`}>
                      {getDifficultyText(formData.difficulty)}
                    </span>
                    <span>XP: {formData.xp_value}</span>
                    {formData.time_limit_seconds > 0 && (
                      <span>Time: {formData.time_limit_seconds}s</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Fill in the form to see a preview</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
