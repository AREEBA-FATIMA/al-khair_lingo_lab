'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Trophy, Leaf, Target, Users, Zap } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const { isLoggedIn, user } = useAuth()

  useEffect(() => {
    setMounted(true)
    
    // Redirect based on user role
    if (isLoggedIn) {
      if (user?.role === 'teacher') {
        window.location.href = '/teachers/dashboard'
      } else if (user?.role === 'doner') {
        window.location.href = '/analytics'
      } else {
        window.location.href = '/groups'
      }
    }
  }, [isLoggedIn])

  if (!mounted) {
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

      {/* Hero Section with 3D Animation */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-[80vh] flex items-center">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left Side - 3D Characters */}
            <div className="relative mb-8 lg:mb-0">
              {/* Main Plant Mascot */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative z-10"
              >
                <div className="w-40 h-40 md:w-48 md:h-48 mx-auto mb-12 relative">
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-full h-full bg-gradient-to-br from-[#03045e] to-[#00bfe6] rounded-full flex items-center justify-center text-6xl md:text-7xl shadow-2xl"
                    style={{
                      transform: 'perspective(1000px) rotateX(20deg) rotateY(-15deg)',
                      boxShadow: '0 25px 50px rgba(3, 4, 94, 0.4), 0 0 0 2px rgba(0, 191, 230, 0.3), inset 0 0 20px rgba(0, 191, 230, 0.1)'
                    }}
                  >
                    🌱
                  </motion.div>
                  {/* Floating particles around plant */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-3 h-3 bg-[#00bfe6] rounded-full"
                      style={{
                        left: `${15 + i * 12}%`,
                        top: `${5 + i * 8}%`,
                      }}
                      animate={{
                        y: [0, -30, 0],
                        opacity: [0.4, 1, 0.4],
                        scale: [0.6, 1.3, 0.6],
                        rotate: [0, 180, 360]
                      }}
                      transition={{
                        duration: 2.5 + i * 0.3,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Floating Characters */}
              <div className="relative">
                {/* Character 1 - Excited Learner */}
                <motion.div
                  initial={{ opacity: 0, x: -100, y: 50 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="absolute -top-6 -left-10 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-2xl md:text-3xl shadow-xl"
                  style={{
                    transform: 'perspective(1000px) rotateX(20deg) rotateY(-15deg)',
                    boxShadow: '0 10px 20px rgba(236, 72, 153, 0.3)'
                  }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    😊
                  </motion.div>
                </motion.div>

                {/* Character 2 - Confident Student */}
                <motion.div
                  initial={{ opacity: 0, x: 100, y: 30 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="absolute -top-4 -right-14 w-14 h-14 md:w-18 md:h-18 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-lg md:text-xl shadow-xl"
                  style={{
                    transform: 'perspective(1000px) rotateX(15deg) rotateY(20deg)',
                    boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    🎓
                  </motion.div>
                </motion.div>

                {/* Character 3 - Happy Graduate */}
                <motion.div
                  initial={{ opacity: 0, x: -80, y: 80 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                  className="absolute top-6 -left-18 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-sm md:text-lg shadow-xl"
                  style={{
                    transform: 'perspective(1000px) rotateX(25deg) rotateY(-25deg)',
                    boxShadow: '0 10px 20px rgba(34, 197, 94, 0.3)'
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    🌟
                  </motion.div>
                </motion.div>

                {/* Character 4 - Motivated Learner */}
                <motion.div
                  initial={{ opacity: 0, x: 80, y: 100 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.1 }}
                  className="absolute top-10 -right-10 w-11 h-11 md:w-14 md:h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-sm md:text-base shadow-xl"
                  style={{
                    transform: 'perspective(1000px) rotateX(20deg) rotateY(15deg)',
                    boxShadow: '0 10px 20px rgba(168, 85, 247, 0.3)'
                  }}
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    💪
                  </motion.div>
                </motion.div>

                {/* Character 5 - Curious Student */}
                <motion.div
                  initial={{ opacity: 0, x: -60, y: 120 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.3 }}
                  className="absolute top-18 -left-6 w-9 h-9 md:w-12 md:h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xs md:text-sm shadow-xl"
                  style={{
                    transform: 'perspective(1000px) rotateX(30deg) rotateY(-10deg)',
                    boxShadow: '0 10px 20px rgba(251, 191, 36, 0.3)'
                  }}
                >
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  >
                    🤔
                  </motion.div>
                </motion.div>

                {/* Character 6 - Success Celebrator */}
                <motion.div
                  initial={{ opacity: 0, x: 60, y: 140 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.5 }}
                  className="absolute top-22 -right-6 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center text-xs md:text-sm shadow-xl"
                  style={{
                    transform: 'perspective(1000px) rotateX(25deg) rotateY(20deg)',
                    boxShadow: '0 10px 20px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  <motion.div
                    animate={{ y: [0, -8, 0], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                  >
                    🎉
                  </motion.div>
                </motion.div>
              </div>

              {/* Floating Coins */}
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg"
                  style={{
                    left: `${5 + i * 10}%`,
                    top: `${50 + (i % 4) * 20}%`,
                  }}
                  animate={{
                    y: [0, -25, 0],
                    rotate: [0, 180, 360],
                    scale: [0.7, 1.4, 0.7],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{
                    duration: 2.5 + i * 0.2,
                    repeat: Infinity,
                    delay: i * 0.15
                  }}
                />
              ))}
            </div>

            {/* Right Side - Text Content */}
          <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center lg:text-left lg:pl-8"
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                The free, fun, and effective way to learn
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-4xl md:text-5xl lg:text-6xl font-extrabold">
                  English!
              </span>
            </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl leading-relaxed">
              Master English through 8 groups with 50 levels each. Watch your plant grow from seed to fruit tree as you progress!
            </p>
              <div className="flex flex-col gap-3 justify-center items-center lg:items-start">
                {isLoggedIn ? (
                  <Link 
                    href="/groups" 
                    className="group relative bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white text-sm sm:text-base px-6 sm:px-8 py-4 sm:py-5 rounded-full font-bold transition-all duration-300 hover:shadow-2xl hover:scale-110 hover:from-[#02033a] hover:to-[#0099cc] transform w-[70%] text-center shadow-xl"
                    style={{
                      boxShadow: '0 12px 24px rgba(3, 4, 94, 0.4), 0 6px 12px rgba(0, 191, 230, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      🚀 START LEARNING
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#02033a] to-[#0099cc] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/register" 
                      className="group relative bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white text-sm sm:text-base px-6 sm:px-8 py-4 sm:py-5 rounded-full font-bold transition-all duration-300 hover:shadow-2xl hover:scale-110 hover:from-[#02033a] hover:to-[#0099cc] transform w-[70%] text-center shadow-xl"
                      style={{
                        boxShadow: '0 12px 24px rgba(3, 4, 94, 0.4), 0 6px 12px rgba(0, 191, 230, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        🚀 GET STARTED
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#02033a] to-[#0099cc] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                    </Link>
                    <Link 
                      href="/login" 
                      className="group relative bg-white text-[#03045e] text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold border-2 border-[#03045e]/20 transition-all duration-300 hover:bg-[#03045e] hover:text-white hover:shadow-xl hover:scale-105 transform w-[70%] text-center whitespace-nowrap shadow-lg"
                    >
                      <span className="flex items-center justify-center gap-2">
                        👤 I ALREADY HAVE AN ACCOUNT
                      </span>
                    </Link>
                  </>
                )}
            </div>
          </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#03045e] to-[#00bfe6]">
                {' '}Lingo Master?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A unique approach to English learning that makes education fun and engaging
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-gray-100 hover:border-[#00bfe6]/30 hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-[#03045e]/10 to-[#00bfe6]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-[#03045e]/20 group-hover:to-[#00bfe6]/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <feature.icon className="h-10 w-10 text-[#03045e] group-hover:text-[#00bfe6] transition-colors duration-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#03045e] transition-colors duration-500">
                  {feature.title}
                </h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-500 leading-relaxed">
                  {feature.description}
                </p>
                <div className="absolute inset-0 bg-gradient-to-br from-[#03045e]/5 to-[#00bfe6]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-4 right-4 w-2 h-2 bg-[#00bfe6] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plant Growth Preview */}
      <section className="py-24 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Watch Your Plant 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#03045e] to-[#00bfe6]">
                {' '}Grow!
              </span>
          </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience the joy of learning as your virtual plant grows with every level you complete
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {plantStages.map((stage, index) => (
              <motion.div
                key={stage.name}
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative text-center cursor-pointer"
              >
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#03045e] to-[#00bfe6] rounded-2xl flex items-center justify-center mx-auto text-white text-3xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-500 group-hover:from-[#02033a] group-hover:to-[#0099cc] group-hover:rotate-3"
                    style={{
                      boxShadow: '0 8px 16px rgba(3, 4, 94, 0.2), 0 4px 8px rgba(0, 191, 230, 0.1)'
                    }}
                  >
                  {stage.emoji}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {index + 1}
                  </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 group-hover:bg-white group-hover:shadow-lg transition-all duration-500">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#03045e] transition-colors duration-500">
                    {stage.name}
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-500 leading-relaxed">
                    {stage.description}
                  </p>
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-br from-[#03045e]/5 to-[#00bfe6]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-16 bg-white/60 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              🌱 Your Learning Journey
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Each stage represents your progress in mastering English. Start as a seed and grow into a magnificent fruit tree as you complete levels and groups. The more you learn, the more your plant flourishes!
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#03045e] to-[#00bfe6] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#03045e]/90 to-[#00bfe6]/90"></div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Your English Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of learners who are mastering English with our plant-based system
          </p>
          {isLoggedIn ? (
            <Link 
              href="/groups" 
              className="group relative inline-block bg-white text-[#03045e] font-semibold py-4 px-8 rounded-lg text-lg hover:bg-gray-50 transition-all duration-300 hover:shadow-2xl hover:scale-105 transform"
            >
              <span className="relative z-10">Start Learning Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </Link>
          ) : (
            <Link 
              href="/register" 
              className="group relative inline-block bg-white text-[#03045e] font-semibold py-4 px-8 rounded-lg text-lg hover:bg-gray-50 transition-all duration-300 hover:shadow-2xl hover:scale-105 transform"
            >
              <span className="relative z-10">Get Started Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Leaf className="h-6 w-6 text-white" />
            <span className="text-xl font-bold">Lingo Master</span>
          </div>
          <p className="text-blue-100">
            © 2024 Lingo Master. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: BookOpen,
    title: '8 Learning Groups',
    description: 'From basic to master level, each group has 50 levels with 6 questions per level'
  },
  {
    icon: Leaf,
    title: 'Plant Growth System',
    description: 'Watch your plant grow from seed to fruit tree as you complete levels'
  },
  {
    icon: Target,
    title: 'Daily Goals',
    description: 'Complete at least one level daily to keep your plant healthy and growing'
  },
  {
    icon: Trophy,
    title: 'Group Jump Tests',
    description: 'Pass 100% tests to unlock higher groups and accelerate your learning'
  },
  {
    icon: Users,
    title: 'Progress Tracking',
    description: 'Track your learning journey with detailed analytics and achievements'
  },
  {
    icon: Zap,
    title: '6 Question Types',
    description: 'MCQ, Pronunciation, Fill-in-blank, Synonyms, Antonyms, and more'
  }
]

const plantStages = [
  { name: 'Seed', emoji: '🌱', description: 'Start your journey' },
  { name: 'Sprout', emoji: '🌿', description: 'First 20% complete' },
  { name: 'Sapling', emoji: '🌳', description: 'Halfway there!' },
  { name: 'Tree', emoji: '🌲', description: 'Almost there!' },
  { name: 'Fruit Tree', emoji: '🍎', description: 'Group complete!' }
]
