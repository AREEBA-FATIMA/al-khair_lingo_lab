'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfilePage() {
  const { user, isLoggedIn } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    if (isLoggedIn && user) {
      setIsLoading(false)
    } else {
      // Redirect to login if not logged in
      window.location.href = '/login'
    }
  }, [isLoggedIn, user])

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
      
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <div className="flex items-center space-x-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-full flex items-center justify-center text-3xl"
              >
                👤
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {user.username || 'User'}
                </h1>
                <p className="text-lg text-gray-600 mb-1">
                  {user.campusName || 'Campus Name'}
                </p>
                <p className="text-sm text-gray-500">
                  Member since {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'Recently'}
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
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-[#03045e] mb-2">
                  {user.level}
                </div>
                <div className="text-gray-600">Current Level</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-[#00bfe6] mb-2">
                  {user.groupsCompleted}
                </div>
                <div className="text-gray-600">Groups Completed</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">
                  {user.totalQuestions}
                </div>
                <div className="text-gray-600">Questions Answered</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500 mb-2">
                  {user.streak}
                </div>
                <div className="text-gray-600">Day Streak</div>
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  href="/groups"
                  className="block w-full bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white py-3 px-4 rounded-lg text-center font-medium hover:shadow-lg transition-all duration-300"
                >
                  Continue Learning
                </Link>
                <Link 
                  href="/progress"
                  className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg text-center font-medium hover:bg-gray-200 transition-all duration-300"
                >
                  View Progress
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Account Settings</h3>
              <div className="space-y-3">
                <button className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg text-center font-medium hover:bg-gray-200 transition-all duration-300">
                  Edit Profile
                </button>
                <button 
                  onClick={handleLogout}
                  className="block w-full bg-red-500 text-white py-3 px-4 rounded-lg text-center font-medium hover:bg-red-600 transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
// Profile page
