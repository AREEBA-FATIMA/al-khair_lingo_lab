'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft,
  Trophy,
  Target,
  Brain,
  Zap,
  Timer,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiService } from '@/services/api'

interface PlacementTest {
  id: number
  name: string
  description: string
  test_type: string
  difficulty_level: string
  target_track: string
  questions_count: number
  time_limit_minutes: number
  pass_threshold: number
  excellent_threshold: number
  xp_reward: number
}

interface Question {
  id: number
  question_text: string
  question_type: string
  options?: { [key: string]: string }
  correct_answer: string
  explanation?: string
  hint?: string
  xp_value: number
}

interface TestAttempt {
  id: number
  test: PlacementTest
  status: string
  started_at: string
  completed_at?: string
  time_taken_seconds: number
  score: number
  percentage: number
  passed: boolean
  excellent_score: boolean
  xp_earned: number
  skip_destination?: string
}

export default function PlacementTestPage() {
  const [tests, setTests] = useState<PlacementTest[]>([])
  const [selectedTest, setSelectedTest] = useState<PlacementTest | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isTestActive, setIsTestActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [testResult, setTestResult] = useState<TestAttempt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { isLoggedIn, user, loading: authLoading } = useAuth()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      window.location.href = '/login'
    }
  }, [isLoggedIn, authLoading])

  useEffect(() => {
    if (isLoggedIn) {
      fetchAvailableTests()
    }
  }, [isLoggedIn])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTestActive && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTestSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTestActive, isPaused, timeRemaining])

  const fetchAvailableTests = async () => {
    try {
      const data = await apiService.getAvailableTests()
      setTests(data)
    } catch (error) {
      console.error('Error fetching tests:', error)
      setError('Failed to load placement tests')
    } finally {
      setLoading(false)
    }
  }

  const startTest = async (test: PlacementTest) => {
    try {
      setLoading(true)
      const response = await apiService.startPlacementTest(test.id)
      setSelectedTest(test)
      setTimeRemaining(test.time_limit_minutes * 60)
      setIsTestActive(true)
      setIsPaused(false)
      setCurrentQuestionIndex(0)
      setUserAnswers({})
      setTestResult(null)
      
      // Load first question
      await loadQuestion(0)
    } catch (error) {
      console.error('Error starting test:', error)
      setError('Failed to start test')
    } finally {
      setLoading(false)
    }
  }

  const loadQuestion = async (questionIndex: number) => {
    try {
      // For demo purposes, we'll create sample questions
      // In real app, you'd fetch from API
      const sampleQuestions = generateSampleQuestions(selectedTest!)
      setCurrentQuestion(sampleQuestions[questionIndex])
    } catch (error) {
      console.error('Error loading question:', error)
    }
  }

  const generateSampleQuestions = (test: PlacementTest): Question[] => {
    const questions: Question[] = []
    for (let i = 0; i < test.questions_count; i++) {
      questions.push({
        id: i + 1,
        question_text: `Sample question ${i + 1} for ${test.name}?`,
        question_type: 'mcq',
        options: {
          'A': `Option A for question ${i + 1}`,
          'B': `Option B for question ${i + 1}`,
          'C': `Option C for question ${i + 1}`,
          'D': `Option D for question ${i + 1}`
        },
        correct_answer: 'A',
        explanation: `This is the explanation for question ${i + 1}`,
        hint: `Hint for question ${i + 1}`,
        xp_value: 10
      })
    }
    return questions
  }

  const handleAnswerSelect = (answer: string) => {
    if (!currentQuestion) return
    
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (selectedTest?.questions_count || 0) - 1) {
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)
      loadQuestion(nextIndex)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1
      setCurrentQuestionIndex(prevIndex)
      loadQuestion(prevIndex)
    }
  }

  const handleTestSubmit = async () => {
    if (!selectedTest) return
    
    try {
      setLoading(true)
      const timeTaken = (selectedTest.time_limit_minutes * 60) - timeRemaining
      const response = await apiService.submitPlacementTest(selectedTest.id, {
        answers: userAnswers,
        time_taken_seconds: timeTaken
      })
      
      setTestResult(response)
      setIsTestActive(false)
    } catch (error) {
      console.error('Error submitting test:', error)
      setError('Failed to submit test')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'A1': return 'from-green-400 to-green-600'
      case 'A2': return 'from-blue-400 to-blue-600'
      case 'B1': return 'from-yellow-400 to-orange-500'
      case 'B2': return 'from-orange-400 to-red-500'
      case 'C1': return 'from-red-400 to-purple-600'
      case 'C2': return 'from-purple-400 to-violet-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  const getTrackColor = (track: string) => {
    switch (track) {
      case 'beginner': return 'from-green-400 to-emerald-600'
      case 'intermediate': return 'from-blue-400 to-indigo-600'
      case 'advanced': return 'from-purple-400 to-violet-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  if (loading && !isTestActive || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#00bfe6] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (testResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100"
          >
            {/* Result Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                  testResult.excellent_score 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                    : testResult.passed 
                    ? 'bg-gradient-to-r from-green-400 to-green-600'
                    : 'bg-gradient-to-r from-red-400 to-red-600'
                }`}
              >
                {testResult.excellent_score ? (
                  <Trophy className="h-12 w-12 text-white" />
                ) : testResult.passed ? (
                  <CheckCircle className="h-12 w-12 text-white" />
                ) : (
                  <XCircle className="h-12 w-12 text-white" />
                )}
              </motion.div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {testResult.excellent_score ? 'Excellent!' : testResult.passed ? 'Great Job!' : 'Keep Practicing!'}
              </h1>
              
              <p className="text-xl text-gray-600 mb-6">
                {testResult.excellent_score 
                  ? 'Outstanding performance! You\'re ready for advanced content.'
                  : testResult.passed 
                  ? 'Good work! You\'ve passed the placement test.'
                  : 'Don\'t worry! Practice more and try again.'
                }
              </p>
            </div>

            {/* Score Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                <div className="flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-blue-500" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {testResult.percentage}%
                  </div>
                  <div className="text-gray-600 font-medium">Score</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                <div className="flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {testResult.xp_earned}
                  </div>
                  <div className="text-gray-600 font-medium">XP Earned</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-200">
                <div className="flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-purple-500" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {Math.floor(testResult.time_taken_seconds / 60)}m {testResult.time_taken_seconds % 60}s
                  </div>
                  <div className="text-gray-600 font-medium">Time Taken</div>
                </div>
              </div>
            </div>

            {/* Skip Destination */}
            {testResult.skip_destination && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200 mb-8">
                <div className="flex items-center justify-center mb-4">
                  <ArrowRight className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-yellow-800 mb-2">
                    🎉 Skip Unlocked!
                  </h3>
                  <p className="text-yellow-700">
                    You can now skip to: <strong>{testResult.skip_destination}</strong>
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/groups"
                className="group relative bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white py-4 px-8 rounded-2xl font-bold transition-all duration-300 hover:shadow-2xl hover:scale-105 shadow-lg"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Continue Learning
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Link>
              
              <button
                onClick={() => {
                  setTestResult(null)
                  setSelectedTest(null)
                  setIsTestActive(false)
                }}
                className="group relative bg-white text-[#03045e] py-4 px-8 rounded-2xl font-bold border-2 border-[#03045e] transition-all duration-300 hover:bg-[#03045e] hover:text-white hover:shadow-xl hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Try Another Test
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (isTestActive && selectedTest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        
        {/* Test Header */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedTest.name}</h1>
                <p className="text-gray-600">Question {currentQuestionIndex + 1} of {selectedTest.questions_count}</p>
              </div>
              
              <div className="flex items-center space-x-6">
                {/* Timer */}
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${
                  timeRemaining < 300 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  <Timer className="h-5 w-5" />
                  <span className="font-bold text-lg">{formatTime(timeRemaining)}</span>
                </div>
                
                {/* Pause Button */}
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-[#03045e] to-[#00bfe6] h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestionIndex + 1) / selectedTest.questions_count) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100"
            >
              {currentQuestion && (
                <>
                  {/* Question */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      {currentQuestion.question_text}
                    </h2>
                    
                    {/* Options */}
                    {currentQuestion.options && (
                      <div className="space-y-4">
                        {Object.entries(currentQuestion.options).map(([key, value]) => (
                          <button
                            key={key}
                            onClick={() => handleAnswerSelect(key)}
                            className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                              userAnswers[currentQuestion.id] === key
                                ? 'border-[#00bfe6] bg-blue-50 text-[#03045e]'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 font-bold ${
                                userAnswers[currentQuestion.id] === key
                                  ? 'bg-[#00bfe6] text-white'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {key}
                              </div>
                              <span className="text-lg">{value}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between items-center">
                    <button
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      <span>Previous</span>
                    </button>

                    <div className="flex space-x-2">
                      {Array.from({ length: selectedTest.questions_count }, (_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full ${
                            i === currentQuestionIndex
                              ? 'bg-[#00bfe6]'
                              : userAnswers[i + 1]
                              ? 'bg-green-400'
                              : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    {currentQuestionIndex === selectedTest.questions_count - 1 ? (
                      <button
                        onClick={handleTestSubmit}
                        className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg"
                      >
                        <span>Submit Test</span>
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuestion}
                        className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white hover:from-[#02033a] hover:to-[#0099cc] transition-all duration-300 shadow-lg"
                      >
                        <span>Next</span>
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#03045e] to-[#00bfe6] bg-clip-text text-transparent mb-4">
            Placement Tests
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Take a placement test to skip ahead or continue your learning journey. 
            Smart students can unlock higher levels based on their performance!
          </p>
        </div>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tests.map((test, index) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
            >
              {/* Test Header */}
              <div className="text-center mb-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${getDifficultyColor(test.difficulty_level)} rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-4`}>
                  <Brain className="h-8 w-8" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{test.name}</h3>
                <p className="text-gray-600 mb-4">{test.description}</p>
                
                {/* Difficulty Badge */}
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getDifficultyColor(test.difficulty_level)} shadow-lg`}>
                  <Target className="h-4 w-4 mr-2" />
                  {test.difficulty_level} Level
                </div>
              </div>

              {/* Test Details */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Questions:</span>
                  <span className="font-bold text-gray-900">{test.questions_count}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Time Limit:</span>
                  <span className="font-bold text-gray-900">{test.time_limit_minutes} minutes</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pass Threshold:</span>
                  <span className="font-bold text-gray-900">{test.pass_threshold}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">XP Reward:</span>
                  <span className="font-bold text-gray-900">{test.xp_reward}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Target Track:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getTrackColor(test.target_track)}`}>
                    {test.target_track.charAt(0).toUpperCase() + test.target_track.slice(1)}
                  </span>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={() => startTest(test)}
                disabled={loading}
                className="group/btn relative w-full bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white py-4 px-6 rounded-2xl font-bold transition-all duration-300 hover:shadow-2xl hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      Start Test
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#02033a] to-[#0099cc] rounded-2xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
              </button>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#03045e]/5 to-[#00bfe6]/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </motion.div>
          ))}
        </div>

        {/* Back to Groups */}
        <div className="text-center mt-12">
          <Link
            href="/groups"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-white text-[#03045e] border-2 border-[#03045e] hover:bg-[#03045e] hover:text-white transition-all duration-300 shadow-lg"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Learning Tracks</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

