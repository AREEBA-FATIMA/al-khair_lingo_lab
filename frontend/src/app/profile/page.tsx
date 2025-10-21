'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Trophy, 
  Star, 
  Target, 
  Calendar, 
  Award, 
  BookOpen, 
  Zap, 
  Crown,
  Edit3,
  Settings,
  LogOut,
  Camera,
  CheckCircle,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react'

export default function ProfilePage() {
  const { user, isLoggedIn } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [userStats, setUserStats] = useState({
    currentLevel: 2,
    groupsCompleted: 2,
    questionsAnswered: 156,
    dayStreak: 7,
    totalXP: 1250,
    accuracy: 87
  })
  const [achievements, setAchievements] = useState([
    { id: 1, name: "First Steps", description: "Complete your first level", icon: "🎯", unlocked: true },
    { id: 2, name: "Week Warrior", description: "7-day learning streak", icon: "🔥", unlocked: true },
    { id: 3, name: "Grammar Master", description: "Score 90%+ in grammar tests", icon: "📚", unlocked: false },
    { id: 4, name: "Speed Demon", description: "Complete 10 levels in one day", icon: "⚡", unlocked: false },
    { id: 5, name: "Perfect Score", description: "Get 100% on any test", icon: "💯", unlocked: true },
    { id: 6, name: "Group Champion", description: "Complete an entire group", icon: "🏆", unlocked: false }
  ])

  useEffect(() => {
    // Check if user is logged in
    if (isLoggedIn && user) {
      setIsLoading(false)
    } else {
      // Redirect to login if not logged in
      window.location.href = '/login'
    }
  }, [isLoggedIn, user])

  // Load saved avatar from localStorage (frontend-only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('profilePictureDataUrl')
      if (stored) setAvatarPreview(stored)
    } catch (e) {}
  }, [])

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      setAvatarPreview(url)
      try {
        localStorage.setItem('profilePictureDataUrl', url)
        // Notify Navigation and other listeners
        try {
          window.dispatchEvent(new CustomEvent('profilePictureUpdated', { detail: url }))
        } catch (_) {}
      } catch (err) {
        console.error('Failed to store avatar locally:', err)
      }
    }
    reader.readAsDataURL(file)
  }

  // Listen to updates from Navigation as well
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<string>
      if (typeof custom.detail === 'string') {
        setAvatarPreview(custom.detail)
      }
    }
    window.addEventListener('profilePictureUpdated', handler as EventListener)
    return () => window.removeEventListener('profilePictureUpdated', handler as EventListener)
  }, [])

  const handleLogout = () => {
    // Clear user data and redirect to home
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  // Show loading if user data is not available
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#00bfe6] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (isLoading) {
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
      <Navigation />
      
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Enhanced Profile Header */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#03045e]/5 to-[#00bfe6]/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00bfe6]/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#03045e]/10 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              <motion.label
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-[#00bfe6] bg-gradient-to-r from-[#03045e] to-[#00bfe6] flex items-center justify-center cursor-pointer group hover:ring-[#02033a] transition-all duration-300"
                title="Change photo"
              >
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                ) : (
                  <span className="text-white text-4xl group-hover:scale-110 transition-transform duration-300">👤</span>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </motion.label>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {user.username || 'User'}
                </h1>
                <p className="text-sm text-gray-500">
                  Member since Recently
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{userStats.currentLevel}</div>
              <div className="text-gray-600 text-sm">Current Level</div>
              <div className="mt-3 bg-gray-100 rounded-full h-2">
                <div className="bg-gradient-to-r from-[#03045e] to-[#00bfe6] h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{userStats.groupsCompleted}</div>
              <div className="text-gray-600 text-sm">Groups Completed</div>
              <div className="mt-3 text-xs text-green-600 font-semibold">+2 this month</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <Award className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{userStats.questionsAnswered}</div>
              <div className="text-gray-600 text-sm">Questions Answered</div>
              <div className="mt-3 text-xs text-blue-600 font-semibold">{userStats.accuracy}% accuracy</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <Crown className="h-5 w-5 text-orange-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{userStats.dayStreak}</div>
              <div className="text-gray-600 text-sm">Day Streak</div>
              <div className="mt-3 text-xs text-orange-600 font-semibold">Keep it up! 🔥</div>
            </motion.div>
          </div>

          {/* Achievements Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                    achievement.unlocked 
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 hover:shadow-lg' 
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-3xl mb-2 ${achievement.unlocked ? '' : 'grayscale'}`}>
                      {achievement.icon}
                    </div>
                    <h3 className={`font-semibold text-sm mb-1 ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                      {achievement.name}
                    </h3>
                    <p className={`text-xs ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.unlocked && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Enhanced Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-xl flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Learning Hub</h3>
              </div>
              <div className="space-y-3">
                <Link 
                  href="/groups"
                  className="block w-full bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white py-4 px-6 rounded-xl text-center font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Continue Learning
                </Link>
                <Link 
                  href="/progress"
                  className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl text-center font-medium hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  View Progress
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Account Settings</h3>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl text-center font-medium hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </button>
                <button 
                  onClick={handleLogout}
                  className="block w-full bg-red-500 text-white py-3 px-6 rounded-xl text-center font-medium hover:bg-red-600 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    defaultValue={user?.username || ''}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00bfe6] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    defaultValue={user?.first_name || ''}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00bfe6] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    defaultValue={user?.last_name || ''}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00bfe6] focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
