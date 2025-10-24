'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  LogIn, 
  ArrowLeft,
  GraduationCap,
  Users,
  Shield,
  Crown
} from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, isLoggedIn, loading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      router.push('/')
    }
  }, [isLoggedIn, authLoading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.username || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    try {
      setIsLoading(true)
      await login(formData.username, formData.password)
      // Redirect will happen automatically in useEffect
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.response?.data?.message || error.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const roleCards = [
    {
      id: 'student',
      title: 'Student',
      description: 'Continue your English learning journey',
      icon: GraduationCap,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'teacher',
      title: 'Teacher',
      description: 'Manage your classes and students',
      icon: Users,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'english_coordinator',
      title: 'Coordinator',
      description: 'Oversee campus operations',
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'admin',
      title: 'Admin',
      description: 'System administration',
      icon: Crown,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ]

  if (isLoading || authLoading) {
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
      
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl w-full space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto h-16 w-16 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-full flex items-center justify-center mb-4"
            >
              <LogIn className="h-8 w-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900">Login to Your Account</h2>
            <p className="mt-2 text-gray-600">Select your role and enter your credentials</p>
          </div>

          {!selectedRole ? (
            /* Role Selection */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {roleCards.map((role) => {
                const IconComponent = role.icon
                return (
                  <motion.button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-6 rounded-xl border-2 ${role.bgColor} ${role.borderColor} hover:shadow-lg transition-all duration-200 text-left`}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`p-3 rounded-full bg-gradient-to-r ${role.color} text-white`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{role.title}</h3>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          ) : (
            /* Login Form */
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  {(() => {
                    const role = roleCards.find(r => r.id === selectedRole)
                    const IconComponent = role?.icon || User
                    return (
                      <div className={`p-2 rounded-full bg-gradient-to-r ${role?.color || 'from-gray-500 to-gray-600'} text-white`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                    )
                  })()}
                  <h3 className="text-xl font-semibold text-gray-900">
                    {roleCards.find(r => r.id === selectedRole)?.title} Login
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03045e] focus:border-transparent"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03045e] focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white py-3 px-4 rounded-lg font-semibold hover:from-[#03045e]/90 hover:to-[#00bfe6]/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Logging in...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Login
                    </>
                  )}
                </button>
              </form>

              {/* Back to Role Selection */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => setSelectedRole(null)}
                  className="text-sm text-[#03045e] hover:text-[#00bfe6] transition-colors"
                >
                  ← Back to role selection
                </button>
              </div>
            </motion.div>
          )}

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="text-[#03045e] hover:text-[#00bfe6] font-semibold transition-colors"
              >
                Sign up as a student
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center text-[#03045e] hover:text-[#00bfe6] transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/student-register" className="text-[#03045e] hover:text-[#02033a] font-medium">
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}