'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiService } from '@/services/api'
import ProgressManager from '@/utils/progressManager'

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
  student_id?: string
  is_staff?: boolean
  is_superuser?: boolean
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string, firstName: string, lastName: string, fatherName: string, campus: string, grade: string, shift: string) => Promise<void>
  logout: () => void
  loading: boolean
  authLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on page load
    const token = localStorage.getItem('authToken')
    const savedUser = localStorage.getItem('user')
    
    console.log('DEBUG - AuthContext useEffect:', { token: !!token, savedUser: !!savedUser })
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        console.log('DEBUG - Parsed user data:', userData)
        console.log('DEBUG - User role from localStorage:', userData.role)
        setUser(userData)
        setIsLoggedIn(true)
        
        // Set user in ProgressManager
        const progressManager = ProgressManager.getInstance()
        progressManager.setCurrentUser(userData.id)
        
        console.log('DEBUG - User logged in from localStorage, role:', userData.role)
      } catch (error) {
        console.error('Error parsing saved user data:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('authToken')
      }
    } else {
      console.log('DEBUG - No saved login data found')
    }
    setLoading(false)
    setAuthLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    try {
      console.log('DEBUG - Starting login process:', { username })
      setLoading(true)
      const response = await apiService.login(username, password)
      console.log('DEBUG - Login API response:', response)
      
      if (response.tokens && response.user) {
        // Store token and user data
        localStorage.setItem('authToken', response.tokens.access)
        localStorage.setItem('user', JSON.stringify(response.user))
        
        setUser(response.user)
        setIsLoggedIn(true)
        
        // Set user in ProgressManager
        const progressManager = ProgressManager.getInstance()
        progressManager.setCurrentUser(response.user.id)
        
        console.log('DEBUG - Login successful, user set:', response.user)
        console.log('DEBUG - isLoggedIn set to:', true)
        console.log('DEBUG - User role:', response.user.role)
        
        // Redirect based on user role
        if (response.user.role === 'admin' || response.user.is_staff) {
          window.location.href = '/admin/dashboard'
        } else if (response.user.role === 'donor') {
          window.location.href = '/analytics'
        } else if (response.user.role === 'teacher') {
          window.location.href = '/teachers/dashboard'
        } else {
          window.location.href = '/groups'
        }
      } else {
        console.log('DEBUG - Invalid response structure:', response)
        throw new Error('Invalid response from server')
      }
    } catch (error: any) {
      console.error('DEBUG - Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (username: string, email: string, password: string, firstName: string, lastName: string, fatherName: string, campus: string, grade: string, shift: string) => {
    try {
      console.log('DEBUG - Starting student registration process:', { username, email })
      setLoading(true)
      const response = await apiService.register(username, email, password, firstName, lastName, fatherName, 'student', campus, grade, shift, '', '')
      console.log('DEBUG - Registration API response:', response)
      
      if (response.success) {
        // Auto-login after successful registration
        console.log('DEBUG - Starting auto-login after registration')
        const loginResponse = await apiService.login(username, password)
        console.log('DEBUG - Auto-login response:', loginResponse)
        
        if (loginResponse.tokens && loginResponse.user) {
          localStorage.setItem('authToken', loginResponse.tokens.access)
          localStorage.setItem('user', JSON.stringify(loginResponse.user))
          
          setUser(loginResponse.user)
          setIsLoggedIn(true)
          
          // Set user in ProgressManager
          const progressManager = ProgressManager.getInstance()
          progressManager.setCurrentUser(loginResponse.user.id)
          
          console.log('DEBUG - Student registration and auto-login successful:', loginResponse.user)
          
          // Students always go to groups page
          window.location.href = '/groups'
        }
      } else {
        throw new Error('Registration failed')
      }
    } catch (error: any) {
      console.error('DEBUG - Registration error:', error)
      console.error('DEBUG - Error details:', error.response?.data)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await apiService.logout()
    } catch (error: any) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setIsLoggedIn(false)
      localStorage.removeItem('user')
      localStorage.removeItem('authToken')
      // Redirect to home page after logout
      window.location.href = '/'
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, register, logout, loading, authLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

