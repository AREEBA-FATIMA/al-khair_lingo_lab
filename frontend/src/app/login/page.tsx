'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import { X, GraduationCap, Users, LogIn, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleRoleSelect = (role: 'student' | 'teacher') => {
    setSelectedRole(role)
    setFormData(prev => ({ ...prev, role }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      console.log('DEBUG - Login page: Starting login process', { 
        username: formData.username, 
        role: selectedRole,
        hasPassword: !!formData.password 
      })
      
      // Use the actual password from form
      await login(formData.username, formData.password)
      
      console.log('DEBUG - Login page: Login successful, redirecting...')
      // Redirect to groups page on successful login
      window.location.href = '/groups'
    } catch (error: any) {
      console.error('DEBUG - Login page error:', error)
      console.error('DEBUG - Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      setError(error.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      
      <div className="flex items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-4xl"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-8"></div>
                <h1 className="text-3xl font-bold text-gray-900">Log In</h1>
                <Link 
                  href="/"
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </Link>
              </div>
            </div>

            {!selectedRole ? (
              /* Role Selection */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Student Option */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-center"
                >
                  <div className="mb-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <div className="text-6xl">🎓</div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Student</h3>
                    <p className="text-gray-600 text-sm">Access your learning dashboard and continue your progress</p>
                  </div>
                  <motion.button
                    onClick={() => handleRoleSelect('student')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white shadow-lg py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <span>Log In as a Student</span>
                    <span>»</span>
                  </motion.button>
                </motion.div>

                {/* Teacher Option */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-center"
                >
                  <div className="mb-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <div className="text-6xl">👩‍🏫</div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Instructor/Admin</h3>
                    <p className="text-gray-600 text-sm">Access your teaching dashboard and manage courses</p>
                  </div>
                  <motion.button
                    onClick={() => handleRoleSelect('teacher')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white shadow-lg py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <span>Log In as an Instructor/Admin</span>
                    <span>»</span>
                  </motion.button>
                </motion.div>
              </div>
            ) : (
              /* Login Form */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <button
                      onClick={() => setSelectedRole(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <div className="flex items-center space-x-2">
                      {selectedRole === 'student' ? (
                        <>
                          <GraduationCap className="h-6 w-6 text-blue-500" />
                          <h2 className="text-2xl font-bold text-gray-900">Student Login</h2>
                        </>
                      ) : (
                        <>
                          <Users className="h-6 w-6 text-purple-500" />
                          <h2 className="text-2xl font-bold text-gray-900">Teacher Login</h2>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600">
                    {selectedRole === 'student' 
                      ? 'Welcome back! Continue your learning journey' 
                      : 'Welcome back! Access your teaching dashboard'
                    }
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {selectedRole === 'student' ? 'Student ID / Username / Name' : 'Username / Email'}
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bfe6] focus:border-transparent transition-all duration-300"
                      placeholder={selectedRole === 'student' ? 'Enter Student ID, Username, or Name' : 'Enter your username or email'}
                    />
                  </motion.div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  {selectedRole === 'teacher' && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bfe6] focus:border-transparent transition-all duration-300"
                        placeholder="Enter your password"
                      />
                    </motion.div>
                  )}
                  
                  {selectedRole === 'student' && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-700">
                          <strong>Student Login:</strong> You can login using any of these:
                        </p>
                        <ul className="text-xs text-blue-600 mt-2 space-y-1">
                          <li>• Student ID: C01-M-G01-A-0001</li>
                          <li>• Username: student123</li>
                          <li>• First Name: John</li>
                          <li>• Last Name: Doe</li>
                        </ul>
                        <p className="text-xs text-blue-600 mt-2">
                          No password required for students!
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex items-center justify-between"
                  >
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-[#00bfe6] focus:ring-[#00bfe6]" />
                      <span className="ml-2 text-sm text-gray-600">Remember me</span>
                    </label>
                    <Link 
                      href="/forgot-password" 
                      className="text-sm text-[#00bfe6] hover:text-[#03045e] transition-colors duration-300"
                    >
                      Forgot password?
                    </Link>
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white py-4 px-6 rounded-lg font-bold text-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5" />
                        <span>Log In</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* Register Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="text-center mt-6"
            >
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link 
                  href="/register" 
                  className="text-[#00bfe6] hover:text-[#03045e] font-semibold transition-colors duration-300"
                >
                  Create Account
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
