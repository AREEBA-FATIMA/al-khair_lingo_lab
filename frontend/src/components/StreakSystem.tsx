'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flame, Clock, Trophy, Zap } from 'lucide-react'

interface StreakSystemProps {
  currentStreak: number
  longestStreak: number
  lastActivityDate?: string
  onStreakUpdate?: (streak: number) => void
}

export default function StreakSystem({ 
  currentStreak, 
  longestStreak, 
  lastActivityDate,
  onStreakUpdate 
}: StreakSystemProps) {
  const [streakStatus, setStreakStatus] = useState<'active' | 'at_risk' | 'broken'>('active')
  const [timeUntilReset, setTimeUntilReset] = useState(0)

  const checkStreakStatus = () => {
    if (!lastActivityDate) {
      setStreakStatus('broken')
      return
    }

    const lastActivity = new Date(lastActivityDate)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const isToday = lastActivity.toDateString() === today.toDateString()
    const isYesterday = lastActivity.toDateString() === yesterday.toDateString()

    if (isToday) {
      setStreakStatus('active')
    } else if (isYesterday) {
      setStreakStatus('at_risk')
    } else {
      setStreakStatus('broken')
    }
  }

  useEffect(() => {
    checkStreakStatus()
    calculateTimeUntilReset()
  }, [currentStreak, lastActivityDate, checkStreakStatus])

  const calculateTimeUntilReset = () => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const timeDiff = tomorrow.getTime() - now.getTime()
    setTimeUntilReset(timeDiff)
  }

  useEffect(() => {
    if (streakStatus === 'at_risk') {
      const timer = setInterval(() => {
        setTimeUntilReset(prev => {
          if (prev <= 1000) {
            // Streak broken
            if (onStreakUpdate) {
              onStreakUpdate(0)
            }
            return 0
          }
          return prev - 1000
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [streakStatus, onStreakUpdate])

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const getStreakColor = () => {
    switch (streakStatus) {
      case 'active':
        return 'text-orange-500'
      case 'at_risk':
        return 'text-yellow-500'
      case 'broken':
        return 'text-gray-400'
      default:
        return 'text-orange-500'
    }
  }

  const getStreakMessage = () => {
    switch (streakStatus) {
      case 'active':
        return 'Keep it up!'
      case 'at_risk':
        return 'Complete a level to maintain streak'
      case 'broken':
        return 'Start a new streak today!'
      default:
        return ''
    }
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Streak Icon */}
      <div className="relative">
        <Flame 
          className={`h-6 w-6 ${getStreakColor()} ${
            streakStatus === 'active' ? 'animate-pulse' : ''
          }`}
        />
        {streakStatus === 'active' && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>

      {/* Streak Info */}
      <div className="flex flex-col">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-gray-900">{currentStreak}</span>
          <span className="text-sm text-gray-600">day streak</span>
          {longestStreak > currentStreak && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Trophy className="h-3 w-3" />
              <span>Best: {longestStreak}</span>
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-600">
          {getStreakMessage()}
        </div>
      </div>

      {/* Countdown Timer */}
      {streakStatus === 'at_risk' && timeUntilReset > 0 && (
        <div className="flex items-center space-x-1 text-xs text-yellow-600">
          <Clock className="h-3 w-3" />
          <span>{formatTime(timeUntilReset)}</span>
        </div>
      )}

      {/* Streak Milestones */}
      {currentStreak > 0 && (
        <div className="flex items-center space-x-1">
          {currentStreak >= 7 && (
            <div className="w-2 h-2 bg-yellow-400 rounded-full" title="7 day milestone" />
          )}
          {currentStreak >= 30 && (
            <div className="w-2 h-2 bg-orange-400 rounded-full" title="30 day milestone" />
          )}
          {currentStreak >= 100 && (
            <div className="w-2 h-2 bg-red-400 rounded-full" title="100 day milestone" />
          )}
          {currentStreak >= 365 && (
            <div className="w-2 h-2 bg-purple-400 rounded-full" title="1 year milestone" />
          )}
        </div>
      )}
    </div>
  )
}

// Streak Context for global state management
import { createContext, useContext, useState as useStateContext } from 'react'

interface StreakContextType {
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
  updateStreak: () => void
  resetStreak: () => void
  setStreak: (streak: number) => void
}

const StreakContext = createContext<StreakContextType | undefined>(undefined)

export function StreakProvider({ children }: { children: React.ReactNode }) {
  const [currentStreak, setCurrentStreak] = useStateContext(0)
  const [longestStreak, setLongestStreak] = useStateContext(0)
  const [lastActivityDate, setLastActivityDate] = useStateContext<string | null>(null)

  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (lastActivityDate === today) {
      // Already updated today
      return
    }

    if (lastActivityDate === yesterdayStr) {
      // Consecutive day - increment streak
      const newStreak = currentStreak + 1
      setCurrentStreak(newStreak)
      setLongestStreak(prev => Math.max(prev, newStreak))
    } else if (lastActivityDate !== today) {
      // Streak broken - reset to 1
      setCurrentStreak(1)
    }

    setLastActivityDate(today)
  }

  const resetStreak = () => {
    setCurrentStreak(0)
    setLastActivityDate(null)
  }

  const setStreak = (streak: number) => {
    setCurrentStreak(streak)
    setLongestStreak(prev => Math.max(prev, streak))
  }

  return (
    <StreakContext.Provider value={{ 
      currentStreak, 
      longestStreak, 
      lastActivityDate, 
      updateStreak, 
      resetStreak, 
      setStreak 
    }}>
      {children}
    </StreakContext.Provider>
  )
}

export function useStreak() {
  const context = useContext(StreakContext)
  if (context === undefined) {
    throw new Error('useStreak must be used within a StreakProvider')
  }
  return context
}
