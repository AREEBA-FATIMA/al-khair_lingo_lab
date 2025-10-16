'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Leaf, ArrowLeft, User, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface NavigationProps {
  showBackButton?: boolean
  backHref?: string
  backLabel?: string
}

export default function Navigation({ 
  showBackButton = false, 
  backHref = '/groups', 
  backLabel = 'Groups' 
}: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoggedIn, logout } = useAuth()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debug logging
  console.log('Navigation - isLoggedIn:', isLoggedIn, 'user:', user)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Link 
                href={backHref} 
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
            )}
            <div className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#03045e] to-[#00bfe6] bg-clip-text text-transparent">
                Lingo 
              </h1>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-2">
              <Link 
                href="/" 
                className="px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 text-gray-600 hover:text-[#03045e] hover:bg-gradient-to-r hover:from-[#03045e]/10 hover:to-[#00bfe6]/10 hover:shadow-md"
              >
                Home
              </Link>
              <Link 
                href="/progress" 
                className="px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 text-gray-600 hover:text-[#03045e] hover:bg-gradient-to-r hover:from-[#03045e]/10 hover:to-[#00bfe6]/10 hover:shadow-md"
              >
                Progress
              </Link>
            </nav>
            
            {/* Auth Buttons or User Menu */}
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsProfileOpen(!isProfileOpen)
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-[#03045e] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#00bfe6] focus:ring-opacity-50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{user?.username}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 py-3 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-lg truncate">{user?.username}</p>
                          <p className="text-sm text-gray-500 truncate">{user?.campusName}</p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-xl font-bold text-[#03045e]">{user?.level}</p>
                          <p className="text-xs text-gray-500">Level</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-xl font-bold text-[#00bfe6]">{user?.groupsCompleted}</p>
                          <p className="text-xs text-gray-500">Groups</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-xl font-bold text-green-500">{user?.streak}</p>
                          <p className="text-xs text-gray-500">Streak</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={async () => {
                          try {
                            setIsProfileOpen(false)
                            setIsNavigating(true)
                            await router.push('/profile')
                          } catch (error) {
                            console.error('Navigation error:', error)
                            window.location.href = '/profile'
                          } finally {
                            setIsNavigating(false)
                          }
                        }}
                        disabled={isNavigating}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-left disabled:opacity-50"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">View Profile</p>
                          <p className="text-xs text-gray-500">Manage your account</p>
                        </div>
                      </button>

                      <button
                        onClick={async () => {
                          try {
                            setIsProfileOpen(false)
                            setIsNavigating(true)
                            await router.push('/groups')
                          } catch (error) {
                            console.error('Navigation error:', error)
                            window.location.href = '/groups'
                          } finally {
                            setIsNavigating(false)
                          }
                        }}
                        disabled={isNavigating}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-left disabled:opacity-50"
                      >
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-lg">📚</span>
                        </div>
                        <div>
                          <p className="font-medium">Continue Learning</p>
                          <p className="text-xs text-gray-500">Resume your lessons</p>
                        </div>
                      </button>

                      <button
                        onClick={async () => {
                          try {
                            setIsProfileOpen(false)
                            setIsNavigating(true)
                            await router.push('/progress')
                          } catch (error) {
                            console.error('Navigation error:', error)
                            window.location.href = '/progress'
                          } finally {
                            setIsNavigating(false)
                          }
                        }}
                        disabled={isNavigating}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-left disabled:opacity-50"
                      >
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <span className="text-lg">📊</span>
                        </div>
                        <div>
                          <p className="font-medium">View Progress</p>
                          <p className="text-xs text-gray-500">Track your achievements</p>
                        </div>
                      </button>
                    </div>

                    {/* Logout Section */}
                    <div className="border-t border-gray-100 pt-2">
                      <button 
                        onClick={() => {
                          setIsProfileOpen(false)
                          logout()
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 text-left"
                      >
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <LogOut className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">Logout</p>
                          <p className="text-xs text-red-500">Sign out of your account</p>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link 
                  href="/login" 
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    pathname === '/login'
                      ? 'bg-[#03045e] text-white'
                      : 'text-[#03045e] border border-[#03045e] hover:bg-[#03045e] hover:text-white'
                  }`}
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    pathname === '/register'
                      ? 'bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white shadow-lg'
                      : 'bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white hover:shadow-lg'
                  }`}
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 text-gray-600 hover:text-[#03045e] hover:bg-gradient-to-r hover:from-[#03045e]/10 hover:to-[#00bfe6]/10 rounded-lg transition-all duration-300">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
