'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Trophy, Leaf, Target, Users, Zap } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">Lingo Master</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/groups" className="text-gray-600 hover:text-primary-600 transition-colors">
                Groups
              </Link>
              <Link href="/progress" className="text-gray-600 hover:text-primary-600 transition-colors">
                Progress
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-primary-600 transition-colors">
                Profile
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Learn English with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
                {' '}Plant Power
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Master English through 8 groups with 50 levels each. Watch your plant grow from seed to fruit tree as you progress!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/groups" className="btn-primary text-lg px-8 py-3">
                Start Learning
              </Link>
              <Link href="/about" className="btn-secondary text-lg px-8 py-3">
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Lingo Master?
            </h2>
            <p className="text-xl text-gray-600">
              A unique approach to English learning that makes education fun and engaging
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="card text-center hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plant Growth Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            Watch Your Plant Grow!
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {plantStages.map((stage, index) => (
              <motion.div
                key={stage.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl">
                  {stage.emoji}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{stage.name}</h3>
                <p className="text-sm text-gray-600">{stage.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Your English Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of learners who are mastering English with our plant-based system
          </p>
          <Link href="/groups" className="bg-white text-primary-600 font-semibold py-3 px-8 rounded-lg text-lg hover:bg-gray-100 transition-colors duration-200">
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Leaf className="h-6 w-6 text-primary-400" />
            <span className="text-xl font-bold">Lingo Master</span>
          </div>
          <p className="text-gray-400">
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
