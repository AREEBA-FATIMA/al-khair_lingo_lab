'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, CheckCircle, Lock, Leaf, Star, Clock, Target } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Navigation from '@/components/Navigation'

interface Level {
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

interface Group {
  id: number
  group_number: number
  name: string
  description: string
  level_count: number
  plant_type: string
  completion_percentage: number
  levels_completed: number
  current_stage: string
  is_wilting: boolean
}

export default function GroupDetailPage() {
  const params = useParams()
  const groupId = params.groupId as string
  
  const [group, setGroup] = useState<Group | null>(null)
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [userProgress, setUserProgress] = useState({
    highestLevel: 0,
    completedLevels: 0,
    totalXP: 0
  })

  // Load user progress from database
  const loadUserProgress = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/progress/load/')
      if (response.ok) {
        const data = await response.json()
        setUserProgress({
          highestLevel: data.highest_level,
          completedLevels: data.completed_levels,
          totalXP: data.total_xp
        })
        console.log('User progress loaded:', data)
      }
    } catch (error) {
      console.error('Error loading user progress:', error)
    }
  }

  // Fetch group data function
  const fetchGroupData = async () => {
    try {
      // Fetch all groups first
      const response = await fetch(`http://127.0.0.1:8000/api/learning/`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const groupsResponse = await response.json()
      console.log('Groups API Response:', groupsResponse)
      
      // Handle paginated response - data is in 'results' field
      const groupsData = groupsResponse.results || groupsResponse
      console.log('Groups data:', groupsData)
      
      // Check if groupsData is an array
      if (!Array.isArray(groupsData)) {
        throw new Error('Groups data is not an array')
      }
      
      // Find the group by group_number
      console.log('Looking for group_number:', parseInt(groupId))
      console.log('Available groups:', groupsData.map((g: any) => ({ id: g.id, group_number: g.group_number, name: g.name })))
      
      const groupData = groupsData.find((g: any) => g.group_number === parseInt(groupId))
      console.log('Found group data:', groupData)
      
      if (!groupData) {
        throw new Error('Group not found')
      }
      
      // Get levels for this group
      const levelsResponse = await fetch(`http://127.0.0.1:8000/api/learning/${groupData.id}/levels/`)
      
      if (!levelsResponse.ok) {
        throw new Error(`Levels API error! status: ${levelsResponse.status}`)
      }
      
      const levelsResponseData = await levelsResponse.json()
      console.log('Levels API Response:', levelsResponseData)
      
      // Handle paginated response - data is in 'results' field
      const levelsData = levelsResponseData.results || levelsResponseData
      console.log('Levels data:', levelsData)
      
      // Check if levelsData is an array
      if (!Array.isArray(levelsData)) {
        throw new Error('Levels data is not an array')
      }
      
      // Transform API data to match our interface
      const transformedGroup: Group = {
        id: groupData.id,
        group_number: groupData.group_number,
        name: groupData.name,
        description: groupData.description,
        level_count: levelsData.length,
        plant_type: groupData.group_number === 0 ? 'basic_seed' : 
                   groupData.group_number === 1 ? 'flower_seed' :
                   groupData.group_number === 2 ? 'herb_seed' :
                   groupData.group_number === 3 ? 'vegetable_seed' :
                   groupData.group_number === 4 ? 'fruit_seed' :
                   groupData.group_number === 5 ? 'tree_seed' :
                   groupData.group_number === 6 ? 'exotic_seed' : 'legendary_seed',
        completion_percentage: 0, // Will be updated with user progress later
        levels_completed: 0, // Will be updated with user progress later
        current_stage: 'seed', // Will be updated with user progress later
        is_wilting: false // Will be updated with user progress later
      }
      
      // Transform levels data with proper unlocking logic
      const transformedLevels: Level[] = levelsData.map((level: any) => {
        // Level is unlocked if it's the first level (level 1) or if previous level is completed
        const isUnlocked = level.level_number === 1 || level.level_number <= (userProgress.highestLevel || 0) + 1
        
        return {
          id: level.id,
          level_number: level.level_number,
          name: level.name,
          description: level.description,
          questions_count: level.is_test_level ? level.test_questions_count : 6,
          xp_reward: level.xp_reward,
          is_unlocked: isUnlocked,
          plant_growth_stage: 'seed', // Will be updated with user progress later
          completion_percentage: 0, // Will be updated with user progress later
          questions_answered: 0, // Will be updated with user progress later
          correct_answers: 0, // Will be updated with user progress later
          is_completed: level.level_number <= (userProgress.highestLevel || 0) // Completed if level number <= highest completed
        }
      })
      
      setGroup(transformedGroup)
      setLevels(transformedLevels)
    } catch (error) {
      console.error('Error fetching group data:', error)
      // Fallback to mock data
      const mockGroup: Group = {
        id: parseInt(groupId),
        group_number: parseInt(groupId),
        name: `Group ${groupId} - ${groupId === '0' ? 'Basic English' : 'Advanced English'}`,
        description: `Level ${groupId} English learning with plant-based progression`,
        level_count: 10,
        plant_type: 'basic_seed',
        completion_percentage: 0,
        levels_completed: 0,
        current_stage: 'seed',
        is_wilting: false
      }

      const mockLevels: Level[] = Array.from({ length: mockGroup.level_count }, (_, i) => ({
        id: i + 1,
        level_number: i + 1,
        name: `Level ${i + 1}`,
        description: `Complete 6 questions to advance to the next level`,
        questions_count: 6,
        xp_reward: 10 + (i * 2),
        is_unlocked: i === 0, // Only first level unlocked initially
        plant_growth_stage: 'seed',
        completion_percentage: 0,
        questions_answered: 0,
        correct_answers: 0,
        is_completed: false
      }))

      setGroup(mockGroup)
      setLevels(mockLevels)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroupData()
  }, [groupId])

  useEffect(() => {
    // Load user progress first
    loadUserProgress()
  }, [])

  // Reload progress when userProgress changes
  useEffect(() => {
    if (userProgress.highestLevel > 0) {
      // Re-fetch group data to update level unlocking
      fetchGroupData()
    }
  }, [userProgress])

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

  const getLevelStatus = (level: Level) => {
    if (level.is_completed) return 'completed'
    if (level.is_unlocked) return 'unlocked'
    return 'locked'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Group not found</h1>
          <Link href="/groups" className="btn-primary">Back to Groups</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <Navigation showBackButton={true} backHref="/groups" backLabel="Groups" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Group Header */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getPlantColor(group.current_stage)} flex items-center justify-center text-3xl`}>
                {getPlantEmoji(group.current_stage)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                <p className="text-gray-600">{group.description}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 mb-1">
                {group.levels_completed}/{group.level_count}
              </div>
              <div className="text-sm text-gray-600">Levels Completed</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Group Progress</span>
              <span>{group.completion_percentage.toFixed(0)}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${group.completion_percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Levels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {levels.map((level, index) => {
            const status = getLevelStatus(level)
            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`card relative ${
                  status === 'completed' 
                    ? 'bg-success-50 border-success-200' 
                    : status === 'unlocked' 
                    ? 'hover:shadow-xl cursor-pointer' 
                    : 'opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Status Icons */}
                <div className="absolute top-4 right-4">
                  {status === 'completed' && (
                    <CheckCircle className="h-6 w-6 text-success-600" />
                  )}
                  {status === 'locked' && (
                    <Lock className="h-6 w-6 text-gray-400" />
                  )}
                  {status === 'unlocked' && (
                    <Play className="h-6 w-6 text-primary-600" />
                  )}
                </div>

                {/* Level Info */}
                <div className="pt-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {level.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {level.description}
                  </p>

                  {/* Progress for unlocked levels */}
                  {status === 'unlocked' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{level.completion_percentage.toFixed(0)}%</span>
                      </div>
                      <div className="progress-bar h-1">
                        <div 
                          className="progress-fill h-1"
                          style={{ width: `${level.completion_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                    <div className="text-center">
                      <div className="font-semibold text-primary-600">
                        {level.questions_answered}/6
                      </div>
                      <div className="text-gray-600">Questions</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-success-600">
                        {level.xp_reward}
                      </div>
                      <div className="text-gray-600">XP</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  {status === 'completed' ? (
                    <div className="btn-success w-full text-center block">
                      <CheckCircle className="h-4 w-4 inline mr-2" />
                      Completed
                    </div>
                  ) : status === 'unlocked' ? (
                    <Link 
                      href={`/groups/${groupId}/levels/${level.id}`}
                      className="btn-primary w-full text-center block"
                    >
                      {level.questions_answered > 0 ? 'Continue' : 'Start Level'}
                    </Link>
                  ) : (
                    <button 
                      className="btn-secondary w-full text-center block cursor-not-allowed"
                      disabled
                    >
                      Locked
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Info Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <Target className="h-8 w-8 text-primary-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">6 Questions Per Level</h3>
            <p className="text-sm text-gray-600">
              Each level has exactly 6 questions of different types
            </p>
          </div>
          <div className="card text-center">
            <Star className="h-8 w-8 text-warning-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">XP Rewards</h3>
            <p className="text-sm text-gray-600">
              Earn XP for each question answered correctly
            </p>
          </div>
          <div className="card text-center">
            <Clock className="h-8 w-8 text-success-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Daily Goals</h3>
            <p className="text-sm text-gray-600">
              Complete at least one level daily to keep your plant healthy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
