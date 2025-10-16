'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, CheckCircle, Leaf, Star, Clock, Users, RefreshCw, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

interface Group {
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

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchGroups = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      setError(null)
      
      const response = await fetch('http://127.0.0.1:8000/api/groups/')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const responseData = await response.json()
      console.log('Groups API Response:', responseData)
      
      // Handle paginated response - data is in 'results' field
      const data = responseData.results || responseData
      console.log('Groups data:', data)
      
      // Check if data is an array
      if (!Array.isArray(data)) {
        throw new Error('Groups data is not an array')
      }
      
      // Transform API data to match our interface
      const transformedGroups = data.map((group: any, index: number) => {
        const progress = Math.random()
        const isUnlocked = index === 0 || progress > 0.3
        const completionPercentage = isUnlocked ? progress * 100 : 0
        const levelsCompleted = isUnlocked ? Math.floor(progress * group.level_count) : 0
        
        return {
          ...group,
          completion_percentage: completionPercentage,
          levels_completed: levelsCompleted,
          current_stage: getPlantStage(progress),
          is_wilting: progress > 0.8 && isUnlocked,
          is_unlocked: isUnlocked,
          unlock_condition: index === 0 ? 'complete_previous' : 'test_100_percent'
        }
      })
      
      setGroups(transformedGroups)
    } catch (error) {
      console.error('Error fetching groups:', error)
      setError('Failed to load groups. Please check your connection.')
      // Fallback to mock data if API fails
      setGroups(getMockGroups())
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const getPlantStage = (progress: number) => {
    if (progress < 0.2) return 'seed'
    if (progress < 0.4) return 'sprout'
    if (progress < 0.6) return 'sapling'
    if (progress < 0.8) return 'tree'
    return 'fruit_tree'
  }

  const getMockGroups = () => [
    {
      id: 1,
      group_number: 0,
      name: 'Basic English (Shuruati Angrezi)',
      description: 'Basic level for complete beginners',
      level_count: 20,
      plant_type: 'basic_seed',
      is_unlocked: true,
      unlock_condition: 'complete_previous',
      completion_percentage: 15,
      levels_completed: 3,
      current_stage: 'sprout',
      is_wilting: false
    },
    {
      id: 2,
      group_number: 1,
      name: 'Elementary English (Buniyadi Angrezi)',
      description: 'Elementary level English learning',
      level_count: 50,
      plant_type: 'flower_seed',
      is_unlocked: true,
      unlock_condition: 'test_100_percent',
      completion_percentage: 8,
      levels_completed: 4,
      current_stage: 'seed',
      is_wilting: false
    },
    {
      id: 3,
      group_number: 2,
      name: 'Pre-Intermediate (Pehle Darje Ka)',
      description: 'Pre-intermediate level English',
      level_count: 50,
      plant_type: 'herb_seed',
      is_unlocked: false,
      unlock_condition: 'test_100_percent',
      completion_percentage: 0,
      levels_completed: 0,
      current_stage: 'seed',
      is_wilting: false
    },
    {
      id: 4,
      group_number: 3,
      name: 'Intermediate (Darmiyani Darje)',
      description: 'Intermediate level English',
      level_count: 50,
      plant_type: 'vegetable_seed',
      is_unlocked: false,
      unlock_condition: 'test_100_percent',
      completion_percentage: 0,
      levels_completed: 0,
      current_stage: 'seed',
      is_wilting: false
    },
    {
      id: 5,
      group_number: 4,
      name: 'Upper-Intermediate (Ooncha Darje)',
      description: 'Upper-intermediate level English',
      level_count: 50,
      plant_type: 'fruit_seed',
      is_unlocked: false,
      unlock_condition: 'test_100_percent',
      completion_percentage: 0,
      levels_completed: 0,
      current_stage: 'seed',
      is_wilting: false
    },
    {
      id: 6,
      group_number: 5,
      name: 'Advanced (Aala Darje)',
      description: 'Advanced level English',
      level_count: 50,
      plant_type: 'tree_seed',
      is_unlocked: false,
      unlock_condition: 'test_100_percent',
      completion_percentage: 0,
      levels_completed: 0,
      current_stage: 'seed',
      is_wilting: false
    },
    {
      id: 7,
      group_number: 6,
      name: 'Expert (Mahir)',
      description: 'Expert level English',
      level_count: 50,
      plant_type: 'exotic_seed',
      is_unlocked: false,
      unlock_condition: 'test_100_percent',
      completion_percentage: 0,
      levels_completed: 0,
      current_stage: 'seed',
      is_wilting: false
    },
    {
      id: 8,
      group_number: 7,
      name: 'Master (Ustaad)',
      description: 'Master level English',
      level_count: 50,
      plant_type: 'legendary_seed',
      is_unlocked: false,
      unlock_condition: 'test_100_percent',
      completion_percentage: 0,
      levels_completed: 0,
      current_stage: 'seed',
      is_wilting: false
    }
  ]

  const getPlantEmoji = (stage: string) => {
    const stageEmojis: { [key: string]: string } = {
      'seed': '🌱',
      'sprout': '🌿',
      'sapling': '🌳',
      'tree': '🌲',
      'fruit_tree': '🍎'
    }
    return stageEmojis[stage] || '🌱'
  }

  const getPlantColor = (stage: string) => {
    const stageColors: { [key: string]: string } = {
      'seed': 'from-green-400 to-green-500',
      'sprout': 'from-green-500 to-green-600',
      'sapling': 'from-green-600 to-green-700',
      'tree': 'from-green-700 to-green-800',
      'fruit_tree': 'from-yellow-400 to-orange-500'
    }
    return stageColors[stage] || 'from-green-400 to-green-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Loading Groups...</h2>
          <p className="text-gray-500">Preparing your learning journey 🌱</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Choose Your Learning Group
              </h1>
              <p className="text-xl text-gray-600">
                {groups.length} groups available • Each group has {groups[0]?.level_count || 50} levels with 6 questions per level
              </p>
            </div>
            <motion.button
              onClick={() => fetchGroups(true)}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </motion.button>
          </div>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {groups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: group.is_unlocked ? 1.05 : 1,
                y: group.is_unlocked ? -5 : 0
              }}
              className={`card relative overflow-hidden transition-all duration-300 ${
                group.is_unlocked 
                  ? 'hover:shadow-2xl cursor-pointer border-2 border-transparent hover:border-primary-200' 
                  : 'opacity-60 cursor-not-allowed'
              } ${group.is_wilting ? 'ring-2 ring-red-300' : ''}`}
            >
              {/* Plant Status */}
              <div className="absolute top-4 right-4">
                <motion.div 
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${getPlantColor(group.current_stage)} flex items-center justify-center text-2xl shadow-lg`}
                  animate={{ 
                    scale: group.is_wilting ? [1, 0.9, 1] : 1,
                    rotate: group.is_wilting ? [0, -5, 5, 0] : 0
                  }}
                  transition={{ 
                    duration: group.is_wilting ? 2 : 0,
                    repeat: group.is_wilting ? Infinity : 0
                  }}
                >
                  {getPlantEmoji(group.current_stage)}
                </motion.div>
                {group.is_wilting && (
                  <motion.div 
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
                {group.completion_percentage > 0 && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">+</span>
                  </div>
                )}
              </div>

              {/* Lock Icon for locked groups */}
              {!group.is_unlocked && (
                <div className="absolute top-4 left-4">
                  <Lock className="h-6 w-6 text-gray-400" />
                </div>
              )}

              {/* Group Info */}
              <div className="pt-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Group {group.group_number}
                </h3>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  {group.name}
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  {group.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span className="font-semibold">{group.completion_percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${group.completion_percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{group.levels_completed} completed</span>
                    <span>{group.level_count - group.levels_completed} remaining</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <motion.div 
                    className="text-center p-3 bg-blue-50 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl font-bold text-blue-600">
                      {group.levels_completed}
                    </div>
                    <div className="text-xs text-blue-600 font-medium">Levels Done</div>
                  </motion.div>
                  <motion.div 
                    className="text-center p-3 bg-green-50 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl font-bold text-green-600">
                      {group.level_count}
                    </div>
                    <div className="text-xs text-green-600 font-medium">Total Levels</div>
                  </motion.div>
                </div>

                {/* Plant Growth Info */}
                <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Plant Stage</div>
                      <div className="text-lg font-bold text-green-600 capitalize">
                        {group.current_stage.replace('_', ' ')}
                      </div>
                    </div>
                    <div className="text-2xl">
                      {getPlantEmoji(group.current_stage)}
                    </div>
                  </div>
                  {group.is_wilting && (
                    <div className="mt-2 text-xs text-red-600 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                      Plant needs daily care!
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {group.is_unlocked ? (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link 
                      href={`/groups/${group.group_number}`}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold text-center block hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center">
                        {group.levels_completed > 0 ? (
                          <>
                            <span>Continue Learning</span>
                            <motion.span 
                              className="ml-2"
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              →
                            </motion.span>
                          </>
                        ) : (
                          <>
                            <span>Start Learning</span>
                            <motion.span 
                              className="ml-2"
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              🌱
                            </motion.span>
                          </>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative"
                  >
                    <button 
                      className="w-full bg-gray-300 text-gray-600 py-3 px-4 rounded-lg font-semibold text-center cursor-not-allowed"
                      disabled
                    >
                      <div className="flex items-center justify-center">
                        <Lock className="h-4 w-4 mr-2" />
                        {group.unlock_condition === 'test_100_percent' 
                          ? 'Pass Test to Unlock' 
                          : 'Complete Previous Group'
                        }
                      </div>
                    </button>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-xs">🔒</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <Star className="h-8 w-8 text-warning-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">6 Question Types</h3>
            <p className="text-sm text-gray-600">
              MCQ, Pronunciation, Fill-in-blank, Synonyms, Antonyms, and more
            </p>
          </div>
          <div className="card text-center">
            <Clock className="h-8 w-8 text-primary-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Daily Goals</h3>
            <p className="text-sm text-gray-600">
              Complete at least one level daily to keep your plant healthy
            </p>
          </div>
          <div className="card text-center">
            <Users className="h-8 w-8 text-success-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Group Jump Tests</h3>
            <p className="text-sm text-gray-600">
              Pass 100% tests to unlock higher groups and accelerate learning
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Learning Journey Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{groups.length}</div>
              <div className="text-sm text-gray-600">Total Groups</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {groups.reduce((sum, group) => sum + group.level_count, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Levels</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {groups.reduce((sum, group) => sum + group.level_count, 0) * 6}
              </div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {groups.filter(group => group.is_unlocked).length}
              </div>
              <div className="text-sm text-gray-600">Unlocked Groups</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
