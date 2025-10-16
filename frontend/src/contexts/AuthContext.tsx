'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  username: string
  campusName: string
  joinDate: string
  level: number
  groupsCompleted: number
  totalQuestions: number
  streak: number
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  login: (userData: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is logged in on page load
    const savedUser = localStorage.getItem('user')
    console.log('AuthContext - savedUser from localStorage:', savedUser)
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      console.log('AuthContext - parsed userData:', userData)
      setUser(userData)
      setIsLoggedIn(true)
    }
  }, [])

  const login = (userData: User) => {
    console.log('AuthContext - login called with:', userData)
    setUser(userData)
    setIsLoggedIn(true)
    localStorage.setItem('user', JSON.stringify(userData))
    console.log('AuthContext - user set and saved to localStorage')
  }

  const logout = () => {
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem('user')
    // Redirect to home page after logout
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
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

