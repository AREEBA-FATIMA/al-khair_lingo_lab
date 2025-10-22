import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Types
export interface Group {
  id: number
  group_number: number
  name: string
  description: string
  level_count: number
  plant_type: string
  is_unlocked: boolean
  unlock_condition: string
  completion_percentage: number
  levels_completed: number
  current_stage: string
  is_wilting: boolean
}

export interface Level {
  id: number
  level_number: number
  name: string
  description: string
  questions_count: number
  xp_reward: number
  is_unlocked: boolean
  plant_growth_stage: string
  completion_percentage: number
  questions_answered: number
  correct_answers: number
  is_completed: boolean
}

export interface Question {
  id: number
  question_text: string
  question_type: 'mcq' | 'text_to_speech' | 'fill_blank' | 'synonyms' | 'antonyms' | 'sentence_completion'
  options?: { [key: string]: string }
  correct_answer: string
  audio_url?: string
  hint?: string
  explanation?: string
  xp_value: number
  question_order: number
}

export interface UserProgress {
  total_xp: number
  current_streak: number
  longest_streak: number
  total_levels_completed: number
  total_groups_completed: number
}

// API Functions
export const apiService = {
  // Authentication
  login: async (username: string, password: string) => {
    console.log('DEBUG - API Service: Making login request', { username })
    try {
      const response = await api.post('/users/auth/login/', {
        username,
        password
      })
      console.log('DEBUG - API Service: Login response received', response.data)
      return response.data
    } catch (error) {
      console.error('DEBUG - API Service: Login error', error)
      throw error
    }
  },

  register: async (username: string, email: string, password: string, firstName: string, lastName: string) => {
    console.log('DEBUG - API Service: Making registration request', { username, email })
    try {
      const requestData = {
        username,
        email,
        password,
        password_confirm: password, // Add password confirmation
        first_name: firstName,
        last_name: lastName
      }
      console.log('DEBUG - API Service: Request data:', requestData)
      console.log('DEBUG - API Service: Request URL:', `${API_BASE_URL}/users/auth/register/`)
      
      const response = await api.post('/users/auth/register/', requestData)
      console.log('DEBUG - API Service: Registration response received', response.data)
      return response.data
    } catch (error) {
      console.error('DEBUG - API Service: Registration error', error)
      console.error('DEBUG - API Service: Error response:', error.response?.data)
      console.error('DEBUG - API Service: Error status:', error.response?.status)
      console.error('DEBUG - API Service: Error headers:', error.response?.headers)
      throw error
    }
  },

  logout: async () => {
    const response = await api.post('/users/auth/logout/')
    return response.data
  },

  getProfile: async () => {
    const response = await api.get('/users/profile/')
    return response.data
  },

  // Progress
  getProgressOverview: async () => {
    const response = await api.get('/progress/overview/')
    return response.data
  },

  submitLevelCompletion: async (levelId: number, answers: any[]) => {
    const response = await api.post('/progress/levels/complete/', {
      level_id: levelId,
      answers: answers
    })
    return response.data
  },

  // Groups
  getGroups: async (): Promise<Group[]> => {
    const response = await api.get('/groups/')
    return response.data
  },

  // Levels - Updated to use correct endpoints
  getLevel: async (levelNumber: number) => {
    const response = await api.get(`/levels/${levelNumber}/`)
    return response.data
  },

  getLevelQuestions: async (levelNumber: number) => {
    const response = await api.get(`/levels/${levelNumber}/questions/`)
    return response.data
  },

  // Submit answer for a question
  submitAnswer: async (questionId: number, answer: string) => {
    const response = await api.post('/levels/submit-answer/', {
      question_id: questionId,
      answer: answer
    })
    return response.data
  },

  // Complete a level
  completeLevel: async (levelId: number, answers: any[]) => {
    const response = await api.post('/levels/complete-level/', {
      level: levelId,
      score: answers.filter(a => a.is_correct).length,
      total_questions: answers.length,
      correct_answers: answers.filter(a => a.is_correct).length,
      time_taken_seconds: answers.reduce((total, a) => total + (a.time_spent || 30), 0),
      started_at: new Date().toISOString(),
      user_answers: answers.reduce((acc, a) => {
        acc[a.question_id] = a.answer
        return acc
      }, {})
    })
    return response.data
  },

  // Teacher Dashboard
  getTeacherDashboard: async () => {
    const response = await api.get('/teachers/dashboard/')
    return response.data
  },

  getStudentDetail: async (studentId: number) => {
    const response = await api.get(`/teachers/students/${studentId}/`)
    return response.data
  },

  getClassAnalytics: async () => {
    const response = await api.get('/teachers/analytics/')
    return response.data
  },

  getGroup: async (groupId: number): Promise<Group> => {
    const response = await api.get(`/groups/${groupId}/`)
    return response.data
  },

  // Get levels for a specific group
  getLevels: async (groupId: number): Promise<Level[]> => {
    const response = await api.get(`/groups/${groupId}/levels/`)
    return response.data
  },

  // Progress
  getUserProgress: async (): Promise<UserProgress> => {
    const response = await api.get('/progress/')
    return response.data
  },

  updateLevelProgress: async (groupId: number, levelId: number, data: {
    questions_answered: number
    correct_answers: number
    time_spent: number
    answers: { [key: number]: string }
  }) => {
    const response = await api.post(`/groups/${groupId}/levels/${levelId}/progress/`, data)
    return response.data
  },

  // Group Jump Tests
  getGroupJumpTest: async (groupId: number) => {
    const response = await api.get(`/groups/${groupId}/jump-test/`)
    return response.data
  },

  submitGroupJumpTest: async (groupId: number, data: {
    answers: { [key: number]: string }
    time_taken: number
  }) => {
    const response = await api.post(`/groups/${groupId}/jump-test/submit/`, data)
    return response.data
  },

  // Plant Progress
  getPlantProgress: async (groupId: number) => {
    const response = await api.get(`/groups/${groupId}/plant-progress/`)
    return response.data
  },

  updatePlantProgress: async (groupId: number, data: {
    current_level: number
    total_xp: number
  }) => {
    const response = await api.post(`/groups/${groupId}/plant-progress/`, data)
    return response.data
  },

  // Daily Progress
  getDailyProgress: async () => {
    const response = await api.get('/progress/daily/')
    return response.data
  },

  updateDailyProgress: async (data: {
    levels_completed: number
    questions_answered: number
    correct_answers: number
    xp_earned: number
    time_spent: number
  }) => {
    const response = await api.post('/progress/daily/', data)
    return response.data
  },

  // Vocabulary API
  getVocabulary: async (params?: {
    difficulty_level?: string
    part_of_speech?: string
    is_oxford_3000?: boolean
    search?: string
  }) => {
    const response = await api.get('/vocabulary/', { params })
    return response.data
  },

  getVocabularyById: async (id: number) => {
    const response = await api.get(`/vocabulary/${id}/`)
    return response.data
  },

  reviewVocabulary: async (vocabularyId: number, data: {
    is_correct: boolean
    response_time?: number
    user_answer?: string
  }) => {
    const response = await api.post(`/vocabulary/review/${vocabularyId}/`, data)
    return response.data
  },

  getReviewWords: async (limit?: number) => {
    const response = await api.get('/vocabulary/review-words/', { 
      params: { limit: limit || 20 } 
    })
    return response.data
  },

  getVocabularyStats: async () => {
    const response = await api.get('/vocabulary/stats/')
    return response.data
  },

  // Grammar API
  getGrammarRules: async (params?: {
    difficulty_level?: string
    category?: string
    is_essential?: boolean
    search?: string
  }) => {
    const response = await api.get('/grammar/grammar-rules/', { params })
    return response.data
  },

  getGrammarRuleById: async (id: number) => {
    const response = await api.get(`/grammar/grammar-rules/${id}/`)
    return response.data
  },

  practiceGrammar: async (grammarRuleId: number, data: {
    is_correct: boolean
    response_time?: number
    user_answer?: string
  }) => {
    const response = await api.post(`/grammar/practice/${grammarRuleId}/`, data)
    return response.data
  },

  getPracticeRules: async (difficultyLevel?: string, limit?: number) => {
    const response = await api.get('/grammar/practice-rules/', { 
      params: { 
        difficulty_level: difficultyLevel || 'A1',
        limit: limit || 10 
      } 
    })
    return response.data
  },

  getGrammarStats: async () => {
    const response = await api.get('/grammar/stats/')
    return response.data
  },

  // Placement Test API
  getPlacementTests: async (params?: {
    test_type?: string
    difficulty_level?: string
    target_track?: string
  }) => {
    const response = await api.get('/placement/placement-tests/', { params })
    return response.data
  },

  getPlacementTestById: async (id: number) => {
    const response = await api.get(`/placement/placement-tests/${id}/`)
    return response.data
  },

  startPlacementTest: async (testId: number) => {
    const response = await api.post(`/placement/start/${testId}/`)
    return response.data
  },

  submitPlacementTest: async (testId: number, data: {
    answers: { [key: number]: string }
    time_taken_seconds: number
  }) => {
    const response = await api.post(`/placement/submit/${testId}/`, data)
    return response.data
  },

  getAvailableTests: async () => {
    const response = await api.get('/placement/available/')
    return response.data
  },

  getPlacementStats: async () => {
    const response = await api.get('/placement/stats/')
    return response.data
  }
}

export default api
