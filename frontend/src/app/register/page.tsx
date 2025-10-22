'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import apiService from '@/services/api'
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, Building2, GraduationCap, Clock, UserCheck } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    fatherName: '',
    campus: '',
    grade: '',
    shift: 'morning'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [campusOptions, setCampusOptions] = useState<{value: string, label: string}[]>([])
  const [gradeOptions, setGradeOptions] = useState<{value: string, label: string}[]>([])
  const [shiftOptions, setShiftOptions] = useState<{value: string, label: string}[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const { register } = useAuth()

  // Fetch dynamic options on component mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true)
        console.log('DEBUG - Starting to fetch options...')
        console.log('DEBUG - API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api')
        
        const [campusResponse, gradeResponse, shiftResponse] = await Promise.all([
          apiService.getCampusOptions(),
          apiService.getGradeOptions(),
          apiService.getShiftOptions()
        ])

        console.log('DEBUG - All responses received:', { campusResponse, gradeResponse, shiftResponse })

        if (campusResponse.success) {
          console.log('DEBUG - Campus data received:', campusResponse.data)
          setCampusOptions(campusResponse.data.map((campus: any) => ({
            value: campus.id,
            label: campus.campus_name
          })))
        } else {
          console.log('DEBUG - Campus API failed:', campusResponse)
        }

        if (gradeResponse.success) {
          console.log('DEBUG - Grade data received:', gradeResponse.data)
          setGradeOptions(gradeResponse.data.map((grade: any) => ({
            value: grade.grade,
            label: grade.grade
          })))
        } else {
          console.log('DEBUG - Grade API failed:', gradeResponse)
        }

        if (shiftResponse.success) {
          console.log('DEBUG - Shift data received:', shiftResponse.data)
          setShiftOptions(shiftResponse.data)
        } else {
          console.log('DEBUG - Shift API failed:', shiftResponse)
        }
      } catch (error: any) {
        console.error('Error fetching options:', error)
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config
        })
        // No fallback - let the form show empty options
        console.log('DEBUG - API failed, showing empty options')
        setCampusOptions([])
        setGradeOptions([])
        setShiftOptions([])
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    try {
      setIsLoading(true)
      console.log('DEBUG - Form data:', formData)
      await register(
        formData.username,
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.fatherName,
        formData.campus,
        formData.grade,
        formData.shift
      )
      // Redirect will happen automatically in AuthContext
    } catch (error: any) {
      console.error('Registration error:', error)
      console.error('Error response:', error.response?.data)
      
      // Handle specific error cases
      if (error.response?.data?.email) {
        setError('This email address is already registered. Please use a different email.')
      } else if (error.response?.data?.username) {
        setError('This username is already taken. Please choose a different username.')
      } else if (error.response?.data?.password) {
        setError('Password requirements not met. Please check your password.')
      } else if (error.response?.data?.non_field_errors) {
        setError(error.response.data.non_field_errors[0])
      } else {
        setError(error.response?.data?.message || error.message || 'Registration failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto h-16 w-16 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-full flex items-center justify-center mb-4"
            >
              <User className="h-8 w-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="mt-2 text-gray-600">Start your English learning journey</p>
                </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                          </label>
                          <input
                    id="firstName"
                    name="firstName"
                            type="text"
                            required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03045e] focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                          </label>
                          <input
                    id="lastName"
                    name="lastName"
                            type="text"
                            required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03045e] focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
                      </div>

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
                            required
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03045e] focus:border-transparent"
                    placeholder="johndoe"
                  />
                </div>
                      </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                          </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                    id="email"
                    name="email"
                    type="email"
                            required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03045e] focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
                      </div>

              {/* Father's Name */}
              <div>
                <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700 mb-1">
                  Father's Name
                </label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="fatherName"
                    name="fatherName"
                    type="text"
                    required
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03045e] focus:border-transparent"
                    placeholder="Father's Name"
                  />
                </div>
              </div>

              {/* Campus Selection */}
              <div>
                <label htmlFor="campus" className="block text-sm font-medium text-gray-700 mb-1">
                  Campus
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    id="campus"
                    name="campus"
                    required
                    value={formData.campus}
                    onChange={handleInputChange}
                    disabled={loadingOptions}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03045e] focus:border-transparent appearance-none bg-white disabled:bg-gray-100"
                  >
                    <option value="">{loadingOptions ? 'Loading...' : campusOptions.length === 0 ? 'No campus available' : 'Select Campus'}</option>
                    {campusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grade Selection */}
              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                  Grade
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    id="grade"
                    name="grade"
                    required
                    value={formData.grade}
                    onChange={handleInputChange}
                    disabled={loadingOptions}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03045e] focus:border-transparent appearance-none bg-white disabled:bg-gray-100"
                  >
                    <option value="">{loadingOptions ? 'Loading...' : gradeOptions.length === 0 ? 'No grade available' : 'Select Grade'}</option>
                    {gradeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Shift Selection */}
              <div>
                <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-1">
                  Shift
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    id="shift"
                    name="shift"
                    required
                    value={formData.shift}
                    onChange={handleInputChange}
                    disabled={loadingOptions}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03045e] focus:border-transparent appearance-none bg-white disabled:bg-gray-100"
                  >
                    <option value="">{loadingOptions ? 'Loading...' : shiftOptions.length === 0 ? 'No shift available' : 'Select Shift'}</option>
                    {shiftOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03045e] focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 6 characters long and not entirely numeric.
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                          </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                            required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03045e] focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
                      </div>

            {/* Error Message */}
            {error && (
                        <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3"
              >
                <p className="text-red-600 text-sm">{error}</p>
                        </motion.div>
                  )}

            {/* Submit Button */}
                  <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white py-3 px-4 rounded-lg font-medium hover:from-[#02033a] hover:to-[#0099cc] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
                  </motion.button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-[#03045e] hover:text-[#02033a] font-medium">
                  Sign in
                </Link>
              </p>
          </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  )
}
