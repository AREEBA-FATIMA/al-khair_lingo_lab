'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Droplets, Sun, Zap, Heart } from 'lucide-react'

interface PlantGrowthSystemProps {
  completionPercentage: number
  groupNumber: number
  isHealthy?: boolean
  lastWatered?: Date
  onWaterPlant?: () => void
  showCareOptions?: boolean
}

interface PlantStage {
  emoji: string
  name: string
  color: string
  bgColor: string
  description: string
  minPercentage: number
  maxPercentage: number
}

const plantStages: PlantStage[] = [
  {
    emoji: '🌱',
    name: 'Seed',
    color: 'from-yellow-400 to-green-600',
    bgColor: 'from-yellow-50 to-green-50',
    description: 'Just starting your journey!',
    minPercentage: 0,
    maxPercentage: 20
  },
  {
    emoji: '🌿',
    name: 'Sprout',
    color: 'from-green-700 to-green-900',
    bgColor: 'from-green-50 to-green-100',
    description: 'First signs of growth!',
    minPercentage: 20,
    maxPercentage: 40
  },
  {
    emoji: '🌳',
    name: 'Sapling',
    color: 'from-green-600 to-green-800',
    bgColor: 'from-green-100 to-green-200',
    description: 'Growing strong!',
    minPercentage: 40,
    maxPercentage: 60
  },
  {
    emoji: '🌲',
    name: 'Tree',
    color: 'from-green-500 to-green-700',
    bgColor: 'from-green-200 to-green-300',
    description: 'Almost there!',
    minPercentage: 60,
    maxPercentage: 80
  },
  {
    emoji: '🍎',
    name: 'Fruit Tree',
    color: 'from-green-400 to-green-600',
    bgColor: 'from-green-300 to-green-400',
    description: 'Group complete!',
    minPercentage: 80,
    maxPercentage: 100
  }
]

export default function PlantGrowthSystem({
  completionPercentage,
  groupNumber,
  isHealthy = true,
  lastWatered,
  onWaterPlant,
  showCareOptions = true
}: PlantGrowthSystemProps) {
  const [currentStage, setCurrentStage] = useState<PlantStage>(plantStages[0])
  const [isAnimating, setIsAnimating] = useState(false)
  const [showGrowthAnimation, setShowGrowthAnimation] = useState(false)
  const [needsWater, setNeedsWater] = useState(false)

  useEffect(() => {
    // Determine current plant stage based on completion percentage
    const stage = plantStages.find(
      s => completionPercentage >= s.minPercentage && completionPercentage < s.maxPercentage
    ) || plantStages[plantStages.length - 1]

    if (stage.name !== currentStage.name) {
      setIsAnimating(true)
      setShowGrowthAnimation(true)
      
      setTimeout(() => {
        setCurrentStage(stage)
        setIsAnimating(false)
      }, 500)
    } else {
      setCurrentStage(stage)
    }
  }, [completionPercentage])

  useEffect(() => {
    // Check if plant needs water (if not watered in last 24 hours)
    if (lastWatered) {
      const hoursSinceWatered = (Date.now() - lastWatered.getTime()) / (1000 * 60 * 60)
      setNeedsWater(hoursSinceWatered > 24)
    } else {
      setNeedsWater(true)
    }
  }, [lastWatered])

  const handleWaterPlant = () => {
    if (onWaterPlant) {
      onWaterPlant()
      setNeedsWater(false)
    }
  }

  const getHealthStatus = () => {
    if (!isHealthy) return { status: 'unhealthy', color: 'text-red-500', message: 'Plant is wilting!' }
    if (needsWater) return { status: 'thirsty', color: 'text-yellow-500', message: 'Needs water' }
    return { status: 'healthy', color: 'text-green-500', message: 'Healthy and growing!' }
  }

  const healthStatus = getHealthStatus()

  return (
    <div className={`bg-gradient-to-br ${currentStage.bgColor} rounded-2xl p-6 shadow-lg transition-all duration-500`}>
      {/* Plant Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Group {groupNumber} Plant
        </h3>
        <p className="text-gray-600 text-sm">{currentStage.description}</p>
      </div>

      {/* Plant Display */}
      <div className="relative mb-6">
        <motion.div
          className={`w-32 h-32 bg-gradient-to-br ${currentStage.color} rounded-full flex items-center justify-center text-6xl mx-auto shadow-2xl relative`}
          animate={isAnimating ? {
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0]
          } : {
            y: [0, -5, 0],
            rotate: [0, 2, -2, 0]
          }}
          transition={{
            duration: isAnimating ? 0.8 : 3,
            repeat: isAnimating ? 0 : Infinity,
            ease: "easeInOut"
          }}
        >
          {currentStage.emoji}
          
          {/* Growth Animation */}
          <AnimatePresence>
            {showGrowthAnimation && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.8 }}
                onAnimationComplete={() => setShowGrowthAnimation(false)}
              >
                <div className="text-4xl">✨</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Health Indicator */}
          <div className="absolute -top-2 -right-2">
            <motion.div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                healthStatus.status === 'healthy' ? 'bg-green-500' :
                healthStatus.status === 'thirsty' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {healthStatus.status === 'healthy' ? (
                <Heart className="h-3 w-3 text-white" />
              ) : healthStatus.status === 'thirsty' ? (
                <Droplets className="h-3 w-3 text-white" />
              ) : (
                <Leaf className="h-3 w-3 text-white" />
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Floating Particles */}
        {isHealthy && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-green-400 rounded-full"
                style={{
                  left: `${20 + i * 12}%`,
                  top: `${10 + i * 8}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.4, 1, 0.4],
                  scale: [0.6, 1.2, 0.6],
                }}
                transition={{
                  duration: 2.5 + i * 0.3,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Plant Info */}
      <div className="text-center mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-1">
          {currentStage.name}
        </h4>
        <p className={`text-sm font-medium ${healthStatus.color}`}>
          {healthStatus.message}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(completionPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className={`h-3 bg-gradient-to-r ${currentStage.color} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{currentStage.minPercentage}%</span>
          <span>{currentStage.maxPercentage}%</span>
        </div>
      </div>

      {/* Care Options */}
      {showCareOptions && (
        <div className="space-y-3">
          {/* Water Plant Button */}
          {needsWater && (
            <motion.button
              onClick={handleWaterPlant}
              className="w-full flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Droplets className="h-4 w-4" />
              <span>Water Plant</span>
            </motion.button>
          )}

          {/* Next Stage Info */}
          {completionPercentage < 100 && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Complete more levels to grow your plant!
              </p>
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <Zap className="h-3 w-3" />
                <span>
                  {Math.round((currentStage.maxPercentage - completionPercentage) * 0.2)} levels to next stage
                </span>
              </div>
            </div>
          )}

          {/* Completion Message */}
          {completionPercentage >= 100 && (
            <motion.div
              className="text-center bg-green-100 rounded-lg p-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-green-800 font-medium">
                🎉 Group Complete! Your plant is fully grown!
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* Plant Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            {Math.round(completionPercentage)}%
          </div>
          <div className="text-xs text-gray-600">Complete</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            {currentStage.name}
          </div>
          <div className="text-xs text-gray-600">Stage</div>
        </div>
      </div>
    </div>
  )
}
