'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, CheckCircle, Leaf, Target, Users, Zap, RefreshCw, AlertCircle } from 'lucide-react'
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
      
      setGroups(data)
    } catch (err) {
      console.error('Error fetching groups:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch groups')
      
      // Fallback to sample data
      setGroups([
        {
          id: 1,
          group_number: 0,
          name: 'Basic English',
          description: 'Basic level for complete beginners',
          level_count: 20,
          plant_type: 'basic_seed',
          is_unlocked: true,
          unlock_condition: 'always_unlocked',
          completion_percentage: 15,
          levels_completed: 3,
          current_stage: 'sprout',
          is_wilting: false
        },
        {
          id: 2,
          group_number: 1,
          name: 'Elementary English',
          description: 'Elementary level English learning',
          level_count: 50,
          plant_type: 'flower_seed',
          is_unlocked: true,
          unlock_condition: 'always_unlocked',
          completion_percentage: 8,
          levels_completed: 4,
          current_stage: 'seed',
          is_wilting: false
        },
        {
          id: 3,
          group_number: 2,
          name: 'Pre-Intermediate',
          description: 'Pre-intermediate level English',
          level_count: 50,
          plant_type: 'herb_seed',
          is_unlocked: false,
          unlock_condition: 'complete_groups_0_and_1',
          completion_percentage: 0,
          levels_completed: 0,
          current_stage: 'seed',
          is_wilting: false
        },
        {
          id: 4,
          group_number: 3,
          name: 'Intermediate',
          description: 'Intermediate level English',
          level_count: 50,
          plant_type: 'vegetable_seed',
          is_unlocked: false,
          unlock_condition: 'complete_groups_0_and_1',
          completion_percentage: 0,
          levels_completed: 0,
          current_stage: 'seed',
          is_wilting: false
        },
        {
          id: 5,
          group_number: 4,
          name: 'Upper-Intermediate',
          description: 'Upper-intermediate level English',
          level_count: 50,
          plant_type: 'fruit_seed',
          is_unlocked: false,
          unlock_condition: 'complete_groups_0_and_1',
          completion_percentage: 0,
          levels_completed: 0,
          current_stage: 'seed',
          is_wilting: false
        },
        {
          id: 6,
          group_number: 5,
          name: 'Advanced',
          description: 'Advanced level English',
          level_count: 50,
          plant_type: 'tree_seed',
          is_unlocked: false,
          unlock_condition: 'complete_groups_0_and_1',
          completion_percentage: 0,
          levels_completed: 0,
          current_stage: 'seed',
          is_wilting: false
        },
        {
          id: 7,
          group_number: 6,
          name: 'Expert',
          description: 'Expert level English',
          level_count: 50,
          plant_type: 'exotic_seed',
          is_unlocked: false,
          unlock_condition: 'complete_groups_0_and_1',
          completion_percentage: 0,
          levels_completed: 0,
          current_stage: 'seed',
          is_wilting: false
        },
        {
          id: 8,
          group_number: 7,
          name: 'Master',
          description: 'Master level English',
          level_count: 50,
          plant_type: 'legendary_seed',
          is_unlocked: false,
          unlock_condition: 'complete_groups_0_and_1',
          completion_percentage: 0,
          levels_completed: 0,
          current_stage: 'seed',
          is_wilting: false
        }
      ])
    } finally {
      setLoading(false)
      if (isRefresh) setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const getPlantColor = (stage: string) => {
    const colors = {
      'seed': 'from-green-400 to-green-600',
      'sprout': 'from-green-500 to-green-700',
      'sapling': 'from-green-600 to-green-800',
      'tree': 'from-green-700 to-green-900',
      'fruit_tree': 'from-yellow-500 to-orange-600'
    }
    return colors[stage as keyof typeof colors] || 'from-green-400 to-green-600'
  }

  const getPlantEmoji = (stage: string) => {
    const emojis = {
      'seed': '🌱',
      'sprout': '🌿',
      'sapling': '🌳',
      'tree': '🌲',
      'fruit_tree': '🍎'
    }
    return emojis[stage as keyof typeof emojis] || '🌱'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#00bfe6] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-4 space-y-4 sm:space-y-0">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Learning Groups
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600">
                {groups.length} groups • Group 0: 20 levels • Others: 50 levels each
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-3 gap-4 sm:gap-6">
          {groups.map((group, index) => (
            group.is_unlocked ? (
              <Link key={group.id} href={`/groups/${group.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    y: -2
                  }}
                  className={`relative overflow-hidden transition-all duration-300 bg-white rounded-2xl shadow-lg hover:shadow-xl cursor-pointer group ${group.is_wilting ? 'ring-2 ring-red-300' : ''}`}
                >
                  {/* Card Content */}
                  <div className="p-4 sm:p-6 lg:p-8">
                    {/* Top Section - Group Info & Progress */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
                      {/* Left Side - Icon & Title */}
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#03045e]/10 to-[#00bfe6]/10 rounded-lg flex items-center justify-center">
                          <div className="w-6 h-6 bg-gradient-to-br from-[#03045e] to-[#00bfe6] rounded-sm flex items-center justify-center">
                            <span className="text-white text-xs font-bold">📝</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-[#03045e] transition-colors duration-300 truncate">
                            Group {group.group_number}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">
                            {group.name} • {group.level_count} levels
                          </p>
                        </div>
                      </div>
                      
                      {/* Right Side - Circular Progress */}
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
                        <svg className="w-12 h-12 sm:w-16 sm:h-16 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-gray-200"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-[#00bfe6]"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            strokeDasharray={`${group.completion_percentage}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs sm:text-sm font-bold text-gray-900">{group.completion_percentage}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle Section - Progress Dots & Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                      {/* Progress Dots */}
                      <div className="flex space-x-2">
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < Math.floor((group.completion_percentage / 100) * 8)
                                ? 'bg-[#00bfe6]'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      
                      {/* Action Button */}
                      <div className="flex justify-center sm:justify-end">
                        <button className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white text-xs sm:text-sm font-semibold rounded-lg hover:from-[#02033a] hover:to-[#0099cc] transition-all duration-300 shadow-md hover:shadow-lg">
                          {group.completion_percentage > 0 ? 'Continue' : 'Start'}
                        </button>
                      </div>
                    </div>

                    {/* Bottom Section - Level Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-0">
                      <span>{group.levels_completed}/{group.level_count} levels</span>
                      <span>Next: Level {group.levels_completed + 1}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
                ) : (
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
                    className={`relative overflow-hidden transition-all duration-300 bg-gray-100 rounded-2xl shadow-lg opacity-60 cursor-not-allowed ${group.is_wilting ? 'ring-2 ring-red-300' : ''}`}
                  >
                    {/* Card Content */}
                    <div className="p-4 sm:p-6 lg:p-8">
                      {/* Top Section - Group Info & Progress */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
                        {/* Left Side - Icon & Title */}
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <div className="w-6 h-6 bg-gray-400 rounded-sm flex items-center justify-center">
                              <span className="text-white text-xs font-bold">🔒</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-600 truncate">
                              Group {group.group_number}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">
                              {group.name} • {group.level_count} levels
                            </p>
                          </div>
                        </div>
                        
                        {/* Right Side - Circular Progress */}
                        <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
                          <svg className="w-12 h-12 sm:w-16 sm:h-16 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-gray-200"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-gray-300"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="none"
                              strokeDasharray="0, 100"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs sm:text-sm font-bold text-gray-400">0%</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle Section - Progress Dots & Buttons */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                        {/* Progress Dots */}
                        <div className="flex space-x-2">
                          {[...Array(8)].map((_, i) => (
                            <div
                              key={i}
                              className="w-2 h-2 rounded-full bg-gray-200"
                            />
                          ))}
                        </div>
                        
                        {/* Action Button */}
                        <div className="flex justify-center sm:justify-end">
                          <button className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 text-gray-500 text-xs sm:text-sm font-semibold rounded-lg cursor-not-allowed">
                            Locked
                          </button>
                        </div>
                      </div>

                      {/* Bottom Section - Level Info */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-400 space-y-1 sm:space-y-0">
                        <span>0/{group.level_count} levels</span>
                        <span>Complete Groups 0 & 1</span>
                      </div>
                    </div>
                  </motion.div>
                )
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-12 bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-6 sm:mb-8">
            Learning Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Target className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Structured Learning</h3>
              <p className="text-sm sm:text-base text-gray-600">Progressive levels from basic to advanced</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Leaf className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Plant Growth</h3>
              <p className="text-sm sm:text-base text-gray-600">Watch your plant grow with progress</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Quick Progress</h3>
              <p className="text-sm sm:text-base text-gray-600">Efficient learning system</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}