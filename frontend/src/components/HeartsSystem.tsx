'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Clock, Zap } from 'lucide-react'

interface HeartsSystemProps {
  hearts: number
  maxHearts?: number
  onHeartsChange?: (hearts: number) => void
}

export default function HeartsSystem({ 
  hearts, 
  maxHearts = 5, 
  onHeartsChange 
}: HeartsSystemProps) {
  const [timeUntilNextHeart, setTimeUntilNextHeart] = useState(0)
  const [isRegenerating, setIsRegenerating] = useState(false)

  useEffect(() => {
    if (hearts < maxHearts) {
      setIsRegenerating(true)
      // Hearts regenerate every 5 minutes (300 seconds)
      const timePerHeart = 5 * 60 * 1000 // 5 minutes in milliseconds
      const timeRemaining = timePerHeart - (Date.now() % timePerHeart)
      setTimeUntilNextHeart(timeRemaining)
    } else {
      setIsRegenerating(false)
    }
  }, [hearts, maxHearts])

  useEffect(() => {
    if (!isRegenerating) return

    const timer = setInterval(() => {
      setTimeUntilNextHeart(prev => {
        if (prev <= 1000) {
          // Heart regenerated
          if (onHeartsChange) {
            onHeartsChange(Math.min(hearts + 1, maxHearts))
          }
          return 0
        }
        return prev - 1000
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [hearts, maxHearts, onHeartsChange, isRegenerating])

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const loseHeart = () => {
    if (hearts > 0 && onHeartsChange) {
      onHeartsChange(hearts - 1)
    }
  }

  const gainHeart = () => {
    if (hearts < maxHearts && onHeartsChange) {
      onHeartsChange(hearts + 1)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Hearts Display */}
      <div className="flex items-center space-x-1">
        {[...Array(maxHearts)].map((_, index) => (
          <div key={index} className="relative">
            <Heart
              className={`h-5 w-5 ${
                index < hearts 
                  ? 'text-red-500 fill-current' 
                  : 'text-gray-300'
              } transition-colors duration-300`}
            />
            {index < hearts && (
              <motion.div
                className="absolute inset-0"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3 }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Hearts Count */}
      <span className="text-sm font-medium text-gray-700">
        {hearts}/{maxHearts}
      </span>

      {/* Regeneration Timer */}
      {isRegenerating && (
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>{formatTime(timeUntilNextHeart)}</span>
        </div>
      )}

      {/* Hearts Status */}
      {hearts === 0 && (
        <div className="flex items-center space-x-1 text-xs text-red-500">
          <Zap className="h-3 w-3" />
          <span>No hearts left!</span>
        </div>
      )}
    </div>
  )
}

// Hearts Context for global state management
import { createContext, useContext, useState as useStateContext } from 'react'

interface HeartsContextType {
  hearts: number
  maxHearts: number
  loseHeart: () => void
  gainHeart: () => void
  setHearts: (hearts: number) => void
}

const HeartsContext = createContext<HeartsContextType | undefined>(undefined)

export function HeartsProvider({ children }: { children: React.ReactNode }) {
  const [hearts, setHearts] = useStateContext(5)
  const maxHearts = 5

  const loseHeart = () => {
    setHearts(prev => Math.max(0, prev - 1))
  }

  const gainHeart = () => {
    setHearts(prev => Math.min(maxHearts, prev + 1))
  }

  return (
    <HeartsContext.Provider value={{ hearts, maxHearts, loseHeart, gainHeart, setHearts }}>
      {children}
    </HeartsContext.Provider>
  )
}

export function useHearts() {
  const context = useContext(HeartsContext)
  if (context === undefined) {
    throw new Error('useHearts must be used within a HeartsProvider')
  }
  return context
}
