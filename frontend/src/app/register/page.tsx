'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import { X, GraduationCap, User, BookOpen, Users, ArrowLeft } from 'lucide-react'

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    class: '',
    section: '',
    classTeacher: '',
    campusName: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    email: '',
    teacherId: '',
    role: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const campusOptions = [
    'Compus 1',
    'Compus 2',
    'Compus 3',
    'Compus 4',
    'Compus 5',
    'Compus 6',
    'Compus 7',
    'Compus 8',
  ]

  const handleRoleSelect = (role: 'student' | 'teacher') => {
    setSelectedRole(role)
    setFormData(prev => ({ ...prev, role }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // For now, just simulate successful registration
      console.log('Registration Data:', {
        role: selectedRole,
        formData: formData
      })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // For demo purposes, just redirect to groups
      // In real implementation, you would call registration API first
      console.log('Registration successful, redirecting to groups...')
      
      // Redirect to groups page
      window.location.href = '/groups'
      
    } catch (error) {
      console.error('Registration error:', error)
      // Handle error here
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

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
                <h1 className="text-3xl font-bold text-gray-900">Sign Up</h1>
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
                    <p className="text-gray-600 text-sm">Learn English through interactive lessons and track your progress</p>
                  </div>
                  <motion.button
                    onClick={() => handleRoleSelect('student')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white shadow-lg text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <span>Sign Up as a Student</span>
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
                    <p className="text-gray-600 text-sm">Manage courses, create content, and monitor student progress</p>
                  </div>
                  <motion.button
                    onClick={() => handleRoleSelect('teacher')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white shadow-lg text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <span>Sign Up as an Instructor/Admin</span>
                    <span>»</span>
                  </motion.button>
                </motion.div>
              </div>
            ) : (
              /* Registration Form */
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
                          <h2 className="text-2xl font-bold text-gray-900">Student Sign Up</h2>
                        </>
                      ) : (
                        <>
                          <Users className="h-6 w-6 text-purple-500" />
                          <h2 className="text-2xl font-bold text-gray-900">Teacher Sign Up</h2>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600">
                    {selectedRole === 'student' 
                      ? 'Join as a student and start learning English' 
                      : 'Join as an instructor and manage your courses'
                    }
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {selectedRole === 'student' ? (
                    /* Student Form */
                    <>
                      {/* Name and Father Name Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bfe6] focus:border-transparent transition-all duration-300"
                            placeholder="Enter your full name"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Father's Name *
                          </label>
                          <input
                            type="text"
                            name="fatherName"
                            value={formData.fatherName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bfe6] focus:border-transparent transition-all duration-300"
                            placeholder="Enter father's name"
                          />
                        </motion.div>
                      </div>

                      {/* Class and Section Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Class *
                          </label>
                          <select
                            name="class"
                            value={formData.class}
                            onChange={handleSelectChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bfe6] focus:border-transparent transition-all duration-300"
                          >
                            <option value="">Select Class</option>
                            <option value="1">Class 1</option>
                            <option value="2">Class 2</option>
                            <option value="3">Class 3</option>
                            <option value="4">Class 4</option>
                            <option value="5">Class 5</option>
                            <option value="6">Class 6</option>
                            <option value="7">Class 7</option>
                            <option value="8">Class 8</option>
                            <option value="9">Class 9</option>
                            <option value="10">Class 10</option>
                            <option value="11">Class 11</option>
                            <option value="12">Class 12</option>
                            </select>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Section *
                          </label>
                          <input
                            type="text"
                            name="section"
                            value={formData.section}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bfe6] focus:border-transparent transition-all duration-300"
                            placeholder="e.g., A, B, C"
                          />
                        </motion.div>
                      </div>

                      {/* Class Teacher and Student ID Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.5 }}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Class Teacher *
                          </label>
                          <input
                            type="text"
                            name="classTeacher"
                            value={formData.classTeacher}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bfe6] focus:border-transparent transition-all duration-300"
                            placeholder="Enter class teacher's name"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.6 }}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Student ID *
                          </label>
                          <input
                            type="text"
                            name="studentId"
                            value={formData.studentId}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bfe6] focus:border-transparent transition-all duration-300"
                            placeholder="Enter your student ID"
                          />
                        </motion.div>
                      </div>

                      {/* Campus Selection */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Campus *
                        </label>
                        <select
                          name="campusName"
                          value={formData.campusName}
                          onChange={handleSelectChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bfe6] focus:border-transparent transition-all duration-300"
                        >
                          <option value="">Select Campus</option>
                          {campusOptions.map((campus, index) => (
                            <option key={index} value={campus}>
                              {campus}
                            </option>
                          ))}
                        </select>
                      </motion.div>

                      {/* Password Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.8 }}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password *
                          </label>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bfe6] focus:border-transparent transition-all duration-300"
                            placeholder="Create a password"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.9 }}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password *
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bfe6] focus:border-transparent transition-all duration-300"
                            placeholder="Confirm your password"
                          />
                        </motion.div>
                      </div>
                    </>
                  ) : (
                    /* Teacher Form */
                    <>
                      {/* Name and Father Name Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bfe6] focus:border-transparent transition-all duration-300"
                            placeholder="Enter your full name"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Father's Name *
                          </label>
                          <input
                            type="text"
                            name="fatherName"
                            value={formData.fatherName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bfe6] focus:border-transparent transition-all duration-300"
                            placeholder="Enter father's name"
                          />
                        </motion.div>
                      </div>

                      {/* Class and Campus Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Class *
                          </label>
                          <select
                            name="class"
                            value={formData.class}
                            onChange={handleSelectChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bfe6] focus:border-transparent transition-all duration-300"
                          >
                            <option value="">Select Class</option>
                            <option value="1">Class 1</option>
                            <option value="2">Class 2</option>
                            <option value="3">Class 3</option>
                            <option value="4">Class 4</option>
                            <option value="5">Class 5</option>
                            <option value="6">Class 6</option>
                            <option value="7">Class 7</option>
                            <option value="8">Class 8</option>
                            <option value="9">Class 9</option>
                            <option value="10">Class 10</option>
                            <option value="11">Class 11</option>
                            <option value="12">Class 12</option>
                          </select>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Campus *
                          </label>
                          <select
                            name="campusName"
                            value={formData.campusName}
                            onChange={handleSelectChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bfe6] focus:border-transparent transition-all duration-300"
                          >
                            <option value="">Select Campus</option>
                            {campusOptions.map((campus, index) => (
                              <option key={index} value={campus}>
                                {campus}
                              </option>
                            ))}
                          </select>
                        </motion.div>
                      </div>

                      {/* Password and Email Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.5 }}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password *
                          </label>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bfe6] focus:border-transparent transition-all duration-300"
                            placeholder="Create a password"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.6 }}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bfe6] focus:border-transparent transition-all duration-300"
                            placeholder="Enter your email"
                          />
                        </motion.div>
                      </div>

                      {/* Teacher ID and Confirm Password Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.7 }}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Teacher ID *
                          </label>
                          <input
                            type="text"
                            name="teacherId"
                            value={formData.teacherId}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bfe6] focus:border-transparent transition-all duration-300"
                            placeholder="Enter your teacher ID"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.8 }}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password *
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00bfe6] focus:border-transparent transition-all duration-300"
                            placeholder="Confirm your password"
                          />
                        </motion.div>
                      </div>
                    </>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white py-4 px-6 rounded-lg font-bold text-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Creating Account...
                      </div>
                    ) : (
                      `Create ${selectedRole === 'student' ? 'Student' : 'Teacher'} Account`
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* Login Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="text-center mt-6"
            >
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-[#00bfe6] hover:text-[#03045e] font-semibold transition-colors duration-300"
                >
                  login In
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
