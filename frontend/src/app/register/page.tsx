'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import apiService from '@/services/api'
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Building2, 
  GraduationCap, 
  Clock, 
  UserCheck, 
  Copy, 
  Check,
  BookOpen,
  Users
} from 'lucide-react'

export default function StudentRegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fatherName: '',
    campus: '',
    grade: '',
    shift: 'morning'
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [campusOptions, setCampusOptions] = useState<{value: string, label: string}[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [generatedCode, setGeneratedCode] = useState('')
  const [copied, setCopied] = useState(false)

  // Grade options
  const gradeOptions = [
    { value: 'Nursery', label: 'Nursery' },
    { value: 'KG-I', label: 'KG-I' },
    { value: 'KG-II', label: 'KG-II' },
    { value: 'Grade 1', label: 'Grade 1' },
    { value: 'Grade 2', label: 'Grade 2' },
    { value: 'Grade 3', label: 'Grade 3' },
    { value: 'Grade 4', label: 'Grade 4' },
    { value: 'Grade 5', label: 'Grade 5' },
    { value: 'Grade 6', label: 'Grade 6' },
    { value: 'Grade 7', label: 'Grade 7' },
    { value: 'Grade 8', label: 'Grade 8' },
    { value: 'Grade 9', label: 'Grade 9' },
    { value: 'Grade 10', label: 'Grade 10' }
  ]

  const shiftOptions = [
    { value: 'morning', label: 'Morning' },
    { value: 'afternoon', label: 'Afternoon' }
  ]

  // Generate student code
  const generateStudentCode = (campus: string, grade: string, shift: string) => {
    const campusCode = campus ? `C${campus.padStart(2, '0')}` : 'C01'
    const shiftCode = shift === 'morning' ? 'M' : 'A'
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `${campusCode}-${shiftCode}-S-${randomNum}`
  }

  // Fetch campus options
  useEffect(() => {
    const fetchCampusOptions = async () => {
      try {
        setLoadingOptions(true)
        const campusResponse = await apiService.getCampusOptions()
        
        if (campusResponse.success) {
          setCampusOptions(campusResponse.data.map((campus: any) => ({
            value: campus.id,
            label: campus.campus_name
          })))
        } else {
          console.log('Campus API failed, using empty array')
          setCampusOptions([])
        }
      } catch (error: any) {
        console.error('Error fetching campus options:', error)
        setCampusOptions([])
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchCampusOptions()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required')
      return false
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required')
      return false
    }
    if (!formData.username.trim()) {
      setError('Username is required')
      return false
    }
    if (!formData.password) {
      setError('Password is required')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (!formData.fatherName.trim()) {
      setError('Father\'s name is required')
      return false
    }
    if (!formData.campus) {
      setError('Please select a campus')
      return false
    }
    if (!formData.grade) {
      setError('Please select a grade')
      return false
    }
    if (!formData.shift) {
      setError('Please select a shift')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    try {
      setIsLoading(true)
      
      const response = await apiService.register(
        formData.username,
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.fatherName,
        'student',
        formData.campus,
        formData.grade,
        formData.shift
      )
      
      console.log('Registration response:', response)
      
      // Use the student_id from backend response or generate one
      const studentCode = response.student_id || generateStudentCode(formData.campus, formData.grade, formData.shift)
      setGeneratedCode(studentCode)
      setSuccess(true)
      
    } catch (error: any) {
      console.error('Registration error:', error)
      console.error('Error response:', error.response?.data)
      
      if (error.response?.status === 403) {
        setError('Registration is currently restricted. Please contact your teacher.')
      } else if (error.response?.data?.error) {
        // Handle backend error messages
        if (error.response.data.error.includes('Username already exists')) {
          setError('This username is already taken. Please choose a different username.')
        } else if (error.response.data.error.includes('Email already exists')) {
          setError('This email address is already registered. Please use a different email.')
        } else {
          setError(error.response.data.error)
        }
      } else if (error.response?.data?.username) {
        setError('This username is already taken. Please choose a different username.')
      } else if (error.response?.data?.email) {
        setError('This email address is already registered. Please use a different email.')
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

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
        <Navigation />
        
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full space-y-8"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto h-20 w-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6"
              >
                <Check className="h-10 w-10 text-white" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Registration Successful! 🎉</h2>
              <p className="text-gray-600 mb-8">Your student account has been created successfully.</p>
              
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Your Student Code</h3>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-2">Save this code! You'll need it to login:</p>
                  <div className="flex items-center justify-center space-x-2">
                    <code className="text-xl font-mono font-bold text-blue-600 bg-white px-4 py-2 rounded border">
                      {generatedCode}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCode)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }}
                      className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                      title="Copy code"
                    >
                      {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p>✅ You can login using either your username or this student code</p>
                  <p>✅ Keep this code safe - you'll need it for future logins</p>
                  <p>✅ Contact your teacher if you lose this code</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 inline-block text-center"
                >
                  Login Now
                </Link>
                <Link
                  href="/"
                  className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors inline-block text-center"
                >
                  Go to Home
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      
      <div className="flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4"
            >
              <Users className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Student Registration</h1>
            <p className="text-lg text-gray-600">Join our learning community and start your English journey! 📚</p>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700 mb-2">
                    Father's Name *
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your father's name"
                    />
                  </div>
                </div>
              </div>

              {/* Account Information Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Lock className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
                </div>
                
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Choose a username"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="your.email@example.com (optional)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
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
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
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
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Confirm your password"
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
                <p className="text-sm text-gray-500">
                  Password must be at least 6 characters long and not entirely numeric.
                </p>
              </div>

              {/* Academic Information Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="campus" className="block text-sm font-medium text-gray-700 mb-2">
                      Campus *
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
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100 transition-all"
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
                  
                  <div>
                    <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                      Grade *
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        id="grade"
                        name="grade"
                        required
                        value={formData.grade}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all"
                      >
                        <option value="">Select Grade</option>
                        {gradeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-2">
                      Shift *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        id="shift"
                        name="shift"
                        required
                        value={formData.shift}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all"
                      >
                        {shiftOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4"
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
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {isLoading ? 'Creating Account...' : 'Create Student Account'}
              </motion.button>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
