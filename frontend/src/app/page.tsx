'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Trophy, Leaf, Target, Users, Zap, Star, Heart, Sparkles, Award, Gamepad, Puzzle, Crown } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import PenguinMascot from '@/components/PenguinMascot'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const { isLoggedIn, user } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-[#03045e] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 overflow-hidden">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          {/* Floating bubbles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-br from-[#00bfe6] to-sky-400 opacity-20"
              style={{
                width: Math.random() * 60 + 20,
                height: Math.random() * 60 + 20,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 50 - 25, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 8 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
          
          {/* Floating emojis */}
          {['🎮', '🌟', '📚', '🏆', '🎨', '✨', '🎯', '🧩'].map((emoji, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -40, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center lg:text-left relative z-10"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-xl border-2 border-[#00bfe6]"
              >
                <div className="flex gap-1">
                  {['⭐', '🎯', '✨'].map((star, i) => (
                    <motion.span
                      key={i}
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                    >
                      {star}
                    </motion.span>
                  ))}
                </div>
                <span className="text-lg font-bold text-[#03045e]">The Fun Way to Learn English!</span>
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#03045e] mb-8 leading-tight">
                Learn English
                <motion.span 
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-[#03045e] to-[#00bfe6]"
                  animate={{ backgroundPosition: ['0%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
                  style={{ backgroundSize: '200% 200%' }}
                >
                  Through Play!
                </motion.span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-2xl leading-relaxed font-medium">
                Play exciting games, collect amazing rewards, and watch your magical world grow as you master English! Perfect for super kids! 🚀
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                {isLoggedIn ? (
                  <Link 
                    href="/groups" 
                    className="group relative bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white px-10 py-5 rounded-2xl font-black text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 transform flex items-center justify-center gap-3 shadow-xl border-4 border-white/30"
                  >
                    <Gamepad className="h-6 w-6" />
                    <span>CONTINUE PLAYING</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      🎯
                    </motion.div>
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/register" 
                      className="group relative bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white px-10 py-5 rounded-2xl font-black text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 transform flex items-center justify-center gap-3 shadow-xl border-4 border-white/30"
                    >
                      <Gamepad className="h-6 w-6" />
                      <span>SIGN UP AS STUDENT</span>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        🎮
                      </motion.div>
                    </Link>
                    <Link 
                      href="/login" 
                      className="group relative bg-white text-[#03045e] px-10 py-5 rounded-2xl font-black text-lg border-4 border-[#00bfe6] transition-all duration-300 hover:bg-blue-50 hover:shadow-xl hover:scale-105 transform flex items-center justify-center gap-3"
                    >
                      <Crown className="h-6 w-6" />
                      <span>LOGIN</span>
                    </Link>
                  </>
                )}
              </div>
              
              {/* Fun Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-16 flex flex-wrap justify-center lg:justify-start gap-8"
              >
                {[
                  { number: '10K+', label: 'Happy Kids', emoji: '😊' },
                  { number: '500+', label: 'Fun Games', emoji: '🎮' },
                  { number: '95%', label: 'Success Rate', emoji: '🏆' },
                  { number: '3000', label: 'Magic Words', emoji: '✨' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border-2 border-[#00bfe6]/20"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{stat.emoji}</span>
                      <div>
                        <div className="text-2xl font-black text-[#03045e]">{stat.number}</div>
                        <div className="text-sm font-medium text-gray-600">{stat.label}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Side - Character & Visuals */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              {/* Main Character Container */}
              <div className="relative mx-auto w-96 h-96">
                {/* Animated Background Circle */}
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ 
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                  className="absolute inset-0 bg-gradient-to-br from-[#03045e] via-[#00bfe6] to-sky-400 rounded-full shadow-2xl"
                  style={{
                    boxShadow: '0 25px 50px rgba(3, 4, 94, 0.4), 0 0 0 6px rgba(0, 191, 230, 0.3)'
                  }}
                />
                
                {/* Penguin Character */}
                <motion.div
                  animate={{ 
                    y: [0, -20, 0],
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-8 bg-blue-200 rounded-[35%] flex items-center justify-center text-9xl shadow-2xl border-4 border-[#03045e]"
                >
                  🐧
                </motion.div>
                
                {/* Floating Game Elements */}
                {[
                  { emoji: '🎮', size: 'w-20 h-20', position: '-top-6 -right-6', delay: 0 },
                  { emoji: '🏆', size: 'w-16 h-16', position: '-bottom-6 -left-6', delay: 0.5 },
                  { emoji: '⭐', size: 'w-14 h-14', position: 'top-1/2 -right-12', delay: 1 },
                  { emoji: '🎯', size: 'w-12 h-12', position: 'bottom-10 -left-12', delay: 1.5 }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className={`absolute ${item.position} ${item.size} bg-gradient-to-br from-[#00bfe6] to-sky-400 rounded-2xl flex items-center justify-center text-2xl shadow-lg border-4 border-white`}
                    animate={{
                      y: [0, -15, 0],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 3 + index,
                      repeat: Infinity,
                      delay: item.delay
                    }}
                  >
                    {item.emoji}
                  </motion.div>
                ))}
              </div>
              
              {/* Speech Bubble */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="absolute top-16 -left-10 bg-white rounded-3xl p-6 shadow-2xl max-w-xs border-4 border-[#00bfe6]"
              >
                <div className="text-lg font-bold text-[#03045e] flex items-center gap-2">
                  <span>Let's play and learn!</span>
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    🎉
                  </motion.span>
                </div>
                <div className="absolute -bottom-3 left-8 w-6 h-6 bg-white transform rotate-45 border-r-4 border-b-4 border-[#00bfe6]"></div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-black text-[#03045e] mb-8"
            >
              Why Kids Love
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#03045e] to-[#00bfe6] block">
                Learning Here!
              </span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl text-gray-700 max-w-3xl mx-auto font-medium"
            >
              We turn English learning into an exciting adventure full of games, rewards, and magical surprises! 🌈
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -15, scale: 1.05 }}
                className="group relative bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 border-4 border-transparent hover:border-[#00bfe6]"
              >
                {/* Animated Background */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#03045e] to-[#00bfe6] rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-[#03045e] mb-4 group-hover:text-[#00bfe6] transition-colors duration-500">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-gray-600 group-hover:text-gray-700 transition-colors duration-500 leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </div>
                
                {/* Floating emoji */}
                <motion.div
                  className="absolute -top-4 -right-4 text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {feature.emoji}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Preview Section */}
      <section className="py-20 bg-gradient-to-br from-[#03045e] to-[#00bfe6] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white text-4xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            >
              {['🎮', '🏆', '⭐', '🎯', '🧩'][i % 5]}
            </motion.div>
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              Amazing Games
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100">
                Await You!
              </span>
            </h2>
            <p className="text-2xl text-blue-100 max-w-3xl mx-auto font-medium">
              Discover hundreds of fun games that make learning English feel like playtime! 🎪
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {gameTypes.map((game, index) => (
              <motion.div
                key={game.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="group relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border-4 border-white/20 hover:border-white/40 transition-all duration-500"
              >
                <div className="text-6xl mb-6">{game.emoji}</div>
                <h3 className="text-3xl font-black text-white mb-4">{game.name}</h3>
                <p className="text-blue-100 text-lg font-medium">{game.description}</p>
                <motion.div
                  className="mt-4 text-2xl opacity-0 group-hover:opacity-100"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  👆
                </motion.div>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link 
              href={isLoggedIn ? "/games" : "/register"} 
              className="inline-block bg-white text-[#03045e] font-black py-6 px-12 rounded-2xl text-xl hover:bg-gray-50 transition-all duration-300 hover:shadow-2xl hover:scale-105 transform shadow-xl border-4 border-transparent hover:border-[#00bfe6]"
            >
              <span className="flex items-center gap-3">
                <Gamepad className="h-7 w-7" />
                EXPLORE ALL GAMES
                <span className="text-2xl">🎯</span>
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Progress Journey */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-black text-[#03045e] mb-6">
              Your Learning
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#03045e] to-[#00bfe6] block">
                Adventure Map!
              </span>
            </h2>
            <p className="text-2xl text-gray-700 max-w-3xl mx-auto font-medium">
              Start as a beginner and become an English superstar! Each level brings new surprises! 🗺️
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-16">
            {learningJourney.map((stage, index) => (
              <motion.div
                key={stage.name}
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -15, scale: 1.1 }}
                className="group relative text-center cursor-pointer"
              >
                <div className="relative mb-6">
                  <motion.div
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.5 }}
                    className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-[#03045e] to-[#00bfe6] rounded-3xl flex items-center justify-center mx-auto text-white text-4xl group-hover:shadow-2xl transition-all duration-500 shadow-xl border-4 border-white"
                  >
                    {stage.emoji}
                  </motion.div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#00bfe6] rounded-full flex items-center justify-center text-sm font-black text-white shadow-lg border-2 border-white">
                    {index + 1}
                  </div>
                </div>
                
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 group-hover:bg-white group-hover:shadow-2xl transition-all duration-500 border-2 border-transparent group-hover:border-[#00bfe6]">
                  <h3 className="text-xl font-black text-[#03045e] mb-3 group-hover:text-[#00bfe6] transition-colors duration-500">
                    {stage.name}
                  </h3>
                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-500 leading-relaxed font-medium">
                    {stage.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#03045e] to-[#00bfe6] relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white text-3xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -40, 0],
                rotate: [0, 360],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              {['⭐', '🎮', '🏆', '🎯', '✨'][i % 5]}
            </motion.div>
          ))}
        </div>
        
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-black text-white mb-6"
          >
            Ready to Start Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100">
              English Adventure?
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl text-blue-100 mb-10 font-medium"
          >
            Join thousands of super kids having fun while learning English! It's 100% FREE! 🚀
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link 
              href={isLoggedIn ? "/games" : "/register"} 
              className="inline-block bg-white text-[#03045e] font-black py-6 px-14 rounded-2xl text-xl hover:bg-gray-50 transition-all duration-300 hover:shadow-2xl hover:scale-105 transform shadow-2xl border-4 border-transparent hover:border-[#00bfe6]"
            >
              <span className="flex items-center gap-3">
                🎮 START PLAYING NOW
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  FREE
                </motion.span>
              </span>
            </Link>
          </motion.div>
          
          {/* Fun guarantee badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 inline-flex items-center gap-3 bg-yellow-400 text-[#03045e] px-6 py-3 rounded-full font-black text-lg"
          >
            <Star className="h-5 w-5 fill-current" />
            100% FUN GUARANTEED!
            <Star className="h-5 w-5 fill-current" />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-3 mb-6"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🐧
            </motion.div>
            <span className="text-3xl font-black">Lingo Adventure</span>
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              🎮
            </motion.div>
          </motion.div>
          <p className="text-blue-100 text-lg font-medium">
            © 2024 Lingo Adventure. Making English learning super fun for awesome kids! 🌟
          </p>
        </div>
      </footer>

      {/* Penguin Mascot */}
      <PenguinMascot />
    </div>
  )
}

// Updated features with emojis
const features = [
  {
    icon: Gamepad,
    title: 'Fun Learning Games',
    description: 'Play exciting games that make learning English vocabulary and grammar super fun!',
    emoji: '🎮'
  },
  {
    icon: Trophy,
    title: 'Earn Cool Rewards',
    description: 'Collect stars, badges, and special items as you complete lessons and challenges',
    emoji: '🏆'
  },
  {
    icon: Puzzle,
    title: 'Brain Puzzles',
    description: 'Solve fun puzzles and challenges that make your brain stronger in English!',
    emoji: '🧩'
  },
  {
    icon: Target,
    title: 'Daily Challenges',
    description: 'Complete fun daily challenges to earn extra rewards and level up faster!',
    emoji: '🎯'
  },
  {
    icon: Users,
    title: 'Progress Tracking',
    description: 'See how much you\'ve learned with colorful charts and achievement badges',
    emoji: '📊'
  },
  {
    icon: Zap,
    title: 'Oxford 3000 Words',
    description: 'Learn the most important English words through fun games and activities',
    emoji: '⚡'
  }
]

const gameTypes = [
  {
    name: 'Word Match',
    emoji: '🔤',
    description: 'Match words with pictures in this fast-paced memory game!'
  },
  {
    name: 'Sentence Builder',
    emoji: '🏗️',
    description: 'Build correct sentences and watch your grammar skills grow!'
  },
  {
    name: 'Vocabulary Race',
    emoji: '🏎️',
    description: 'Race against time to learn new words and beat your high score!'
  }
]

const learningJourney = [
  { 
    name: 'Beginner Explorer', 
    emoji: '🧭', 
    description: 'Start your adventure with basic words and fun games' 
  },
  { 
    name: 'Word Collector', 
    emoji: '📚', 
    description: 'Build your vocabulary and unlock new game levels' 
  },
  { 
    name: 'Sentence Master', 
    emoji: '🌟', 
    description: 'Learn to build sentences and express yourself' 
  },
  { 
    name: 'Grammar Hero', 
    emoji: '🦸', 
    description: 'Master grammar rules through exciting challenges' 
  },
  { 
    name: 'English Superstar', 
    emoji: '🏆', 
    description: 'Become a confident English speaker with amazing skills!' 
  }
]