'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Trophy, Leaf, Target, Users, Zap, BarChart3, TrendingUp, Building2, GraduationCap, Activity, Award } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import PenguinMascot from '@/components/PenguinMascot'
import { useAuth } from '@/contexts/AuthContext'


// Define main color variables for clean code
const PRIMARY_COLOR = '#03045e';
const SECONDARY_COLOR = '#00bfe6';
const GRADIENT_HERO = 'from-[#03045e] to-[#00bfe6]';
const GRADIENT_HOVER = 'from-[#02033a] to-[#0099cc]';
const GRADIENT_BG = 'from-slate-50 via-blue-50 to-indigo-50';

// Dummy data for plant stages (Using Emojis that represent growth stages)
const plantStages = [
  { name: 'Seedling', emoji: '🌰', description: 'Just starting, 0-10 levels.' },
  { name: 'Sprout', emoji: '🌱', description: 'Building basics, 11-30 levels.' },
  { name: 'Sapling', emoji: '🌳', description: 'Intermediate phase, 31-60 levels.' },
  { name: 'Flowering', emoji: '🌸', description: 'Advanced fluency, 61-90 levels.' },
  { name: 'Fruiting Tree', emoji: '🍎', description: 'Achieved mastery, 91+ levels.' },
];

// Features function
const features = (userRole: string) => userRole === 'doner' ? [
  {
    icon: BarChart3,
    title: 'System Overview',
    description: 'Monitor total users, teachers, students, and overall platform performance metrics'
  },
  {
    icon: TrendingUp,
    title: 'Performance Trends',
    description: 'Track daily, weekly, and monthly trends in user engagement and learning progress'
  },
  {
    icon: Building2,
    title: 'Campus Analytics',
    description: 'View detailed analytics for each campus including student progress and teacher performance'
  },
  {
    icon: GraduationCap,
    title: 'Teacher Insights',
    description: 'Performance and activity metrics for all teachers across the platform.'
  },
] : [
  {
    icon: Leaf,
    title: 'Gamified Learning',
    description: 'Watch your plant grow from a seed to a fruit tree as you complete levels.'
  },
  {
    icon: Award,
    title: 'Tracked Progress',
    description: 'Visualize your mastery across Beginner, Intermediate, and Advanced learning tracks.'
  },
  {
    icon: Zap,
    title: 'Interactive Lessons',
    description: 'Engaging, fun, and effective lessons designed by English experts.'
  },
  {
    icon: GraduationCap,
    title: 'Three Learning Tracks',
    description: 'Customized content for school classes (3-5, 6-10) and Fluency development.'
  },
];


export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const { isLoggedIn, user } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${GRADIENT_BG}`}>
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#00bfe6] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  // Helper for Link href based on role
  const getDashboardLink = () => {
    if (user?.role === 'donor') return '/analytics';
    if (user?.role === 'teacher') return '/teachers/dashboard';
    return '/groups';
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${GRADIENT_BG}`}>
      
      {/* Navigation */}
      <Navigation />

      {/* Hero Section (Enhanced UX/Readability) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#00bfe6]/20 to-[#03045e]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-[#03045e]/15 to-[#00bfe6]/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-[#00bfe6]/10 to-[#03045e]/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            
            {/* Left Side - 3D Characters (Unchanged) */}
            <div className="relative mb-8 lg:mb-0">
                {/* ... (Your existing 3D character animation code) ... */}
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
                    className={`w-full h-full bg-gradient-to-br ${GRADIENT_HERO} rounded-full flex items-center justify-center text-6xl md:text-7xl shadow-2xl`}
                    style={{
                      transform: 'perspective(1000px) rotateX(20deg) rotateY(-15deg)',
                      boxShadow: `0 25px 50px ${PRIMARY_COLOR}66, 0 0 0 2px ${SECONDARY_COLOR}4D, inset 0 0 20px ${SECONDARY_COLOR}1A`
                    }}
                  >
                    🌱
                  </motion.div>
                  {/* Floating particles around plant */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`absolute w-3 h-3 bg-[${SECONDARY_COLOR}] rounded-full`}
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
              {/* Welcome Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#03045e]/10 to-[#00bfe6]/10 px-4 py-2 rounded-full text-sm font-semibold text-[#03045e] mb-6 border border-[#00bfe6]/20"
              >
                <div className="w-2 h-2 bg-[#00bfe6] rounded-full animate-pulse"></div>
                {user?.role === 'doner' ? 'Analytics Dashboard' : 'English Learning Platform'}
              </motion.div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-8 leading-tight">
                {user?.role === 'doner' ? (
                  <>
                    Welcome to the 
                    <br />
                    <motion.span 
                      className={`text-transparent bg-clip-text bg-gradient-to-r ${GRADIENT_HERO} text-6xl md:text-7xl lg:text-8xl`}
                      animate={{ 
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      style={{
                        backgroundSize: '200% 200%'
                      }}
                    >
                      Analytics Dashboard!
                    </motion.span>
                  </>
                ) : (
                  <>
                    The free, fun, and effective way to learn
                    <br />
                    <motion.span 
                      className={`text-transparent bg-clip-text bg-gradient-to-r ${GRADIENT_HERO} text-6xl md:text-7xl lg:text-8xl`}
                      animate={{ 
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      style={{
                        backgroundSize: '200% 200%'
                      }}
                    >
                      English!
                    </motion.span>
                  </>
                )}
              </h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="text-xl md:text-2xl text-gray-700 mb-12 max-w-2xl leading-relaxed"
              >
                {user?.role === 'doner' 
                  ? 'Monitor system performance, track user engagement, and view comprehensive analytics for the English learning platform.'
                  : 'Master English through 3 learning tracks: Beginner (Class 3-5), Intermediate (Class 6-10), and Advanced (Fluency). Watch your plant grow as you progress!'
                }
              </motion.p>
              <div className="flex flex-col gap-4 justify-center items-center lg:items-start">
                {isLoggedIn ? (
                  <>
                    <div className="mb-4 text-center lg:text-left">
                       <p className="text-xl text-gray-800 mb-2">
                         Welcome back, <span className={`font-bold text-[${PRIMARY_COLOR}]`}>{user?.first_name}!</span> 🚀
                       </p>
                       <p className="text-base text-gray-600">
                         {user?.role === 'donor' 
                            ? 'View system performance and analytics data' 
                            : 'Ready to continue your English learning journey?'
                          }
                       </p>
                     </div>
                     <Link 
                       href={getDashboardLink()} 
                       className={`group relative bg-gradient-to-r ${GRADIENT_HERO} text-white text-lg px-10 py-5 rounded-full font-extrabold transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:${GRADIENT_HOVER} transform w-[80%] lg:w-[70%] text-center shadow-xl`}
                       style={{
                         boxShadow: `0 15px 30px ${PRIMARY_COLOR}66, 0 8px 16px ${SECONDARY_COLOR}4D, inset 0 2px 0 rgba(255, 255, 255, 0.3)`
                       }}
                     >
                       <span className="relative z-10 flex items-center justify-center gap-2">
                         ✨ {user?.role === 'donor' ? 'VIEW ANALYTICS' : user?.role === 'teacher' ? 'GO TO DASHBOARD' : 'CONTINUE LEARNING'}
                       </span>
                     </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/register" 
                      className={`group relative bg-gradient-to-r ${GRADIENT_HERO} text-white text-lg px-10 py-5 rounded-full font-extrabold transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:${GRADIENT_HOVER} transform w-[80%] lg:w-[70%] text-center shadow-xl`}
                      style={{
                        boxShadow: `0 15px 30px ${PRIMARY_COLOR}66, 0 8px 16px ${SECONDARY_COLOR}4D, inset 0 2px 0 rgba(255, 255, 255, 0.3)`
                      }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        🚀 GET STARTED
                      </span>
                    </Link>
                    <Link 
                      href="/login" 
                      className={`group relative bg-white text-[${PRIMARY_COLOR}] text-base px-10 py-4 rounded-full font-bold border-2 border-[${PRIMARY_COLOR}]/30 transition-all duration-300 hover:bg-[${PRIMARY_COLOR}] hover:text-white hover:shadow-xl hover:scale-[1.02] transform w-[80%] lg:w-[70%] text-center whitespace-nowrap shadow-md`}
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

      {/* Features Section - Modern Design (Improved Card Look) */}
      <section className="py-32 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
        
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[#00bfe6]/15 to-[#03045e]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-[#03045e]/15 to-[#00bfe6]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#00bfe6]/5 to-[#03045e]/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <span className={`text-sm font-semibold text-[${PRIMARY_COLOR}] bg-blue-100 px-4 py-2 rounded-full mb-6 inline-block transform hover:scale-105 transition-transform duration-300`}>
              ✨ {user?.role === 'doner' ? 'ANALYTICS FEATURES' : 'LEARNING FEATURES'}
            </span>
            
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Why Choose 
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${GRADIENT_HERO}`}>
                {' '}Al-Khair
              </span>
              <br />
              <span className="text-4xl md:text-5xl lg:text-6xl text-gray-700">Lingo Lab?</span>
            </h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
            >
              A revolutionary approach to English learning that makes education fun, engaging, and highly effective.
            </motion.p>
          </motion.div>

          {/* Features Grid - Modern 3D Card Look */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {features(user?.role || '').map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 80
                }}
                viewport={{ once: true }}
                className="group relative"
              >
                {/* Card */}
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-white/50 hover:border-[#00bfe6]/30 overflow-hidden cursor-pointer group-hover:bg-white/95">
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#03045e]/5 to-[#00bfe6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Icon Container (3D-ish) */}
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: [-8, 8, 0] }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 300 }}
                    className={`relative w-24 h-24 bg-gradient-to-br ${GRADIENT_HERO} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl transform rotate-3 transition-all duration-500 group-hover:rotate-0`}
                    style={{
                      boxShadow: `0 15px 35px ${PRIMARY_COLOR}40, 0 0 0 8px rgba(255, 255, 255, 0.8) inset`
                    }}
                  >
                    <feature.icon className={`h-12 w-12 text-white group-hover:text-[#00bfe6] transition-colors duration-300`} />
                  </motion.div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className={`text-2xl font-extrabold text-gray-900 mb-6 group-hover:text-[#03045e] transition-colors duration-300 leading-tight`}>
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 text-lg leading-relaxed mb-4">
                      {feature.description}
                    </p>
                    
                    
                  </div>
                  
                  {/* Bottom Accent Line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r ${GRADIENT_HERO} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-3xl`}></div>
                  
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      
      {/* Plant Growth Preview (Modern Step-by-Step UX) */}
      <section className="py-32 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
        
        {/* Background Waves */}
        <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-white to-gray-50/50"></div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-[#00bfe6]/20 to-[#03045e]/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-tl from-[#03045e]/15 to-[#00bfe6]/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#03045e]/10 to-[#00bfe6]/10 px-6 py-3 rounded-full text-sm font-semibold text-[#03045e] mb-8 border border-[#00bfe6]/20">
              <div className="w-2 h-2 bg-[#00bfe6] rounded-full animate-pulse"></div>
              Learning Journey
            </div>
            
            <h2 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-6">
              Your Learning 
              <motion.span 
                className={`text-transparent bg-clip-text bg-gradient-to-r ${GRADIENT_HERO}`}
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                style={{
                  backgroundSize: '200% 200%'
                }}
              >
                {' '}Milestones
              </motion.span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Track your journey from the first word to full English mastery. Each stage is a major achievement!
            </p>
          </motion.div>
          
          {/* Stages Grid - Linear/Step-by-Step Layout */}
          <div className="relative flex justify-between items-start pt-12">
            
            {/* Horizontal Connector Line */}
            <div className={`absolute top-[6.25rem] left-0 right-0 h-2 bg-gradient-to-r ${GRADIENT_HERO} mx-auto w-[80%] rounded-full opacity-50`}></div>

            {plantStages.map((stage, index) => (
              <motion.div
                key={stage.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2, type: "spring", stiffness: 80 }}
                viewport={{ once: true, amount: 0.5 }}
                className="group relative w-1/5 flex flex-col items-center cursor-pointer"
              >
                
                {/* Connector Dot */}
                <div className={`absolute top-0 w-5 h-5 bg-[${PRIMARY_COLOR}] rounded-full z-20 shadow-lg border-4 border-white transition-all duration-500 group-hover:scale-125`}></div>

                {/* Main Icon Circle */}
                <div className="relative mt-8 mb-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 0.5 }}
                    className={`w-28 h-28 bg-white border-4 border-[${SECONDARY_COLOR}] rounded-full flex items-center justify-center mx-auto text-4xl shadow-2xl transition-all duration-500 group-hover:border-[${PRIMARY_COLOR}]`}
                    style={{
                      boxShadow: `0 10px 20px ${PRIMARY_COLOR}33, 0 0 0 5px ${SECONDARY_COLOR}22 inset`
                    }}
                  >
                    {stage.emoji}
                  </motion.div>
                </div>
                
                {/* Stage Card */}
                <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 transform transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.05] group-hover:bg-white group-hover:border-b-4 group-hover:border-b-[#00bfe6]">
                  <h3 className={`text-xl font-extrabold text-gray-900 mb-3 group-hover:text-[#03045e] transition-colors duration-300`}>
                    {stage.name}
                  </h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    {stage.description}
                  </p>
                  
                  {/* Progress Indicator */}
                  {/* <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-[#03045e] to-[#00bfe6] h-2 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(index + 1) * 20}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                      viewport={{ once: true }}
                    />
                  </div> */}
                </div>
                
                {/* Stage Name on Top */}
                <div className={`absolute -top-10 text-base font-bold text-gray-700 transition-colors duration-300 group-hover:text-[${PRIMARY_COLOR}]`}>
                    Stage {index + 1}
                </div>
                
              </motion.div>
            ))}
          </div>
          
          {/* Information Box */}
          <div className={`mt-24 p-8 max-w-4xl mx-auto rounded-xl shadow-2xl bg-white border-t-4 border-[${PRIMARY_COLOR}]`}>
            <div className="flex items-center justify-center space-x-4">
              <BookOpen className={`h-8 w-8 text-[${PRIMARY_COLOR}]`} />
              <p className="text-lg font-semibold text-gray-700 leading-relaxed">
                Start your journey now and watch your plant **flourish** into the Fruiting Tree of mastery!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section (Using consistent gradients) */}
      <section className={`py-24 bg-gradient-to-r ${GRADIENT_HERO} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
              {user?.role === 'doner' 
                ? 'Ready to View System Analytics?'
                : 'Ready to Start Your English Journey?'
              }
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              The quickest and most fun way to master English starts right here.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {isLoggedIn ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    href={getDashboardLink()} 
                    className="group relative inline-block bg-white text-[#03045e] font-bold py-6 px-12 rounded-2xl text-xl hover:bg-gray-50 transition-all duration-300 hover:shadow-2xl transform shadow-2xl"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      {user?.role === 'donor' ? 'View Analytics' : user?.role === 'teacher' ? 'Go to Dashboard' : 'Continue Learning'}
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </span>
                  </Link>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      href="/register" 
                      className="group relative inline-block bg-white text-[#03045e] font-bold py-6 px-12 rounded-2xl text-xl hover:bg-gray-50 transition-all duration-300 hover:shadow-2xl transform shadow-2xl"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        Get Started Now
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          🚀
                        </motion.span>
                      </span>
                    </Link>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      href="/login" 
                      className="group relative inline-block bg-transparent text-white font-bold py-6 px-12 rounded-2xl text-xl border-2 border-white/50 hover:bg-white/10 transition-all duration-300 hover:border-white transform"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        I Already Have an Account
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                        >
                          👤
                        </motion.span>
                      </span>
                    </Link>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer (Enhanced) */}
      <footer className={`bg-gradient-to-r ${GRADIENT_HERO} text-white py-16 relative overflow-hidden`}>
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Leaf className="h-8 w-8 text-white" />
              </motion.div>
              <span className="text-3xl font-extrabold">Lingo Master</span>
            </div>
            
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Empowering students to master English through innovative, gamified learning experiences.
            </p>
            
            <div className="border-t border-white/20 pt-8">
              <p className="text-blue-100/80">
                © 2025 Al-Khair Lingo Lab. All rights reserved.
              </p>
            </div>
          </motion.div>
        </div>
      </footer>
      
      {/* Penguin Mascot */}
      <PenguinMascot />
    </div>
  )
}


