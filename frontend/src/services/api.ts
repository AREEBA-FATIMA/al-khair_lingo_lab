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
  // Groups
  getGroups: async (): Promise<Group[]> => {
    const response = await api.get('/groups/')
    return response.data
  },

  getGroup: async (groupId: number): Promise<Group> => {
    const response = await api.get(`/groups/${groupId}/`)
    return response.data
  },

  // Levels
  getLevels: async (groupId: number): Promise<Level[]> => {
    const response = await api.get(`/groups/${groupId}/levels/`)
    return response.data
  },

  getLevel: async (groupId: number, levelId: number): Promise<Level> => {
    const response = await api.get(`/groups/${groupId}/levels/${levelId}/`)
    return response.data
  },

  // Questions
  getQuestions: async (groupId: number, levelId: number): Promise<Question[]> => {
    const response = await api.get(`/groups/${groupId}/levels/${levelId}/questions/`)
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
  }
}

export default api
