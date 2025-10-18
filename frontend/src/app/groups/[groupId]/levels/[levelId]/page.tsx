'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, XCircle, Volume2, Mic, MicOff, Play, Pause, Leaf, Zap } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { apiService } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'

interface Question {
  id: number
  question_text: string
  question_type: 'mcq' | 'text_to_speech' | 'fill_blank' | 'synonyms' | 'antonyms' | 'sentence_completion' | 'listening' | 'reading' | 'writing' | 'grammar'
  options: string[] | null
  correct_answer: string | string[]
  explanation: string
  hint: string
  audio_url: string | null
  image_url: string | null
  xp_value: number
  question_order: number
  difficulty: number
  time_limit_seconds: number
}

interface Level {
  id: number
  name: string
  description: string
  level_number: number
  difficulty: number
  xp_reward: number
  is_active: boolean
  is_unlocked: boolean
  is_test_level: boolean
  test_questions_count: number
  test_pass_percentage: number
  test_time_limit_minutes: number
  questions_count: number
  questions: Question[]
  next_level: any
  previous_level: any
  created_at: string
  updated_at: string
}

export default function LevelPage() {
  const params = useParams()
  const groupId = params.groupId as string
  const levelId = params.levelId as string
  
  const [level, setLevel] = useState<Level | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({})
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [plantGrowth, setPlantGrowth] = useState<any>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const { isLoggedIn } = useAuth()

  useEffect(() => {
    console.log('DEBUG - useEffect called:', { isLoggedIn, levelId, groupId })
    if (!isLoggedIn) {
      console.log('DEBUG - User not logged in, skipping API calls')
      setLoading(false)
      return
    }

    const fetchLevelData = async () => {
      try {
        console.log('DEBUG - Starting API calls for level:', levelId)
        
        // Get level details and questions using level_number
        const levelResponse = await apiService.getLevel(parseInt(levelId))
        console.log('Level API Response:', levelResponse)
        
        // Get questions for this level
        const questionsResponse = await apiService.getLevelQuestions(parseInt(levelId))
        console.log('Questions API Response:', questionsResponse)
        console.log('Questions count:', questionsResponse?.results?.length || questionsResponse?.length || 0)
        
        // Get plant growth info
        const plantResponse = await apiService.getPlantGrowth()
        console.log('Plant growth response:', plantResponse)
        
        setLevel(levelResponse)
        
        // Handle questions response - it might be paginated
        const questionsData = questionsResponse?.results || questionsResponse || []
        console.log('DEBUG - Setting questions:', questionsData.length)
        setQuestions(questionsData)
        
        setPlantGrowth(plantResponse)
        
      } catch (error) {
        console.error('Error fetching level data:', error)
        console.log('DEBUG - Error details:', { error: error.message, levelId, groupId })
        // Fallback to mock data
        setLevel({
          id: parseInt(levelId),
          name: `Level ${levelId}`,
          description: 'Practice your English skills',
          level_number: parseInt(levelId),
          questions_count: 6,
          xp_reward: 100,
          is_unlocked: true,
          plant_growth_stage: 'sprout',
          questions: []
        })
        setQuestions([])
      } finally {
        setLoading(false)
      }
    }

    fetchLevelData()
  }, [isLoggedIn, groupId, levelId])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach(track => track.stop())
        
        // Automatically set answer for text-to-speech questions
        handleAnswer(currentQuestion.id, currentQuestion.correct_answer)
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Microphone access denied. Please allow microphone access to record audio.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const playRecording = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audioRef.current = audio
      audio.play()
      setIsPlaying(true)
      
      audio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }
    }
  }

  const stopPlaying = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }

  const handleAnswer = (questionId: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const submitAnswer = async (questionId: number, answer: string) => {
    try {
      const result = await apiService.submitAnswer(questionId, answer)
      return result
    } catch (error) {
      console.error('Error submitting answer:', error)
      return { is_correct: false, xp_earned: 0 }
    }
  }

  const nextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setShowResult(false)
    } else {
      // Level completed - submit to backend
      try {
        const answers = questions.map((question, index) => ({
          question_id: question.id,
          answer: userAnswers[question.id] || '',
          time_spent: 30 // Default time for now
        }))
        
        const result = await apiService.completeLevel(parseInt(levelId), answers)
        console.log('Level completion result:', result)
        
        setScore(result.correct_answers)
        setShowResult(true)
        
        // Show success message
        alert(`Level completed! You earned ${result.xp_earned} XP!`)
        
      } catch (error) {
        console.error('Error submitting level completion:', error)
        alert('Error submitting level completion. Please try again.')
      }
    }
  }

  const currentQuestion = questions[currentQuestionIndex]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!level) {
    console.log('DEBUG - Level not found:', { level, questions: questions.length })
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Level not found</h2>
          <p className="text-gray-600 mb-4">Debug: level={level ? 'exists' : 'null'}, questions={questions.length}</p>
          <Link href="/groups" className="btn-primary">
            Back to Groups
          </Link>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    console.log('DEBUG - No questions loaded:', { level, questions: questions.length })
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Questions...</h2>
          <p className="text-gray-600 mb-4">Please wait while we load the questions for this level.</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link 
              href={`/groups/${groupId}`} 
              className="flex items-center text-gray-600 hover:text-[#03045e] transition-colors duration-200 group"
            >
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="font-medium">Back to Group</span>
            </Link>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{level.name}</h1>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span>•</span>
                <span className="flex items-center">
                  <Leaf className="h-4 w-4 mr-1 text-green-500" />
                  {level.xp_reward} XP
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{currentQuestionIndex + 1}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showResult ? (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10"
          >
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Progress</span>
                <span className="text-sm font-medium text-gray-600">
                  {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-[#03045e] to-[#00bfe6] h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Question Type Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#03045e]/10 to-[#00bfe6]/10 rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-[#03045e]" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {currentQuestion.question_type.replace('_', ' ').toUpperCase()}
                    </h2>
                    <p className="text-sm text-gray-500">Question Type</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#03045e]">{currentQuestion.xp_value}</div>
                    <div className="text-xs text-gray-500">XP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-500">{currentQuestion.difficulty}</div>
                    <div className="text-xs text-gray-500">Difficulty</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <p className="text-lg sm:text-xl text-gray-800 leading-relaxed">{currentQuestion.question_text}</p>
              </div>
            </div>

            {/* Question Content */}
            {currentQuestion.question_type === 'mcq' && currentQuestion.options && (
              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(currentQuestion.id, option)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-6 text-left rounded-xl border-2 transition-all duration-300 group ${
                      userAnswers[currentQuestion.id] === option
                        ? 'border-[#03045e] bg-gradient-to-r from-[#03045e]/5 to-[#00bfe6]/5 text-[#03045e] shadow-lg'
                        : 'border-gray-200 hover:border-[#03045e]/30 hover:bg-gray-50 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        userAnswers[currentQuestion.id] === option
                          ? 'border-[#03045e] bg-[#03045e]'
                          : 'border-gray-300 group-hover:border-[#03045e]/50'
                      }`}>
                        {userAnswers[currentQuestion.id] === option && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className="text-lg font-medium">{option}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {currentQuestion.question_type === 'text_to_speech' && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-100 mb-6">
                    <p className="text-xl text-gray-700 mb-2 font-medium">
                      Record your pronunciation
                    </p>
                    <p className="text-gray-600">
                      Click the microphone button and speak clearly
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-6">
                    <motion.button
                      onClick={isRecording ? stopRecording : startRecording}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`p-6 rounded-full transition-all duration-300 shadow-lg ${
                        isRecording 
                          ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-200' 
                          : 'bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white hover:from-[#02033a] hover:to-[#0099cc] shadow-blue-200'
                      }`}
                    >
                      {isRecording ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
                    </motion.button>
                    
                    {audioBlob && (
                      <motion.button
                        onClick={isPlaying ? stopPlaying : playRecording}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg shadow-green-200"
                      >
                        {isPlaying ? <Pause className="h-10 w-10" /> : <Play className="h-10 w-10" />}
                      </motion.button>
                    )}
                  </div>
                  
                  {isRecording && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <p className="text-sm text-red-600 mt-3 font-medium">Recording... Click to stop</p>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {(currentQuestion.question_type === 'fill_blank' || 
              currentQuestion.question_type === 'sentence_completion') && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(currentQuestion.id, option)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                      userAnswers[currentQuestion.id] === option
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {(currentQuestion.question_type === 'synonyms' || 
              currentQuestion.question_type === 'antonyms') && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(currentQuestion.id, option)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                      userAnswers[currentQuestion.id] === option
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {/* Text input for fill_blank and other text-based questions */}
            {(currentQuestion.question_type === 'fill_blank' || 
              currentQuestion.question_type === 'sentence_completion' ||
              currentQuestion.question_type === 'writing' ||
              currentQuestion.question_type === 'grammar') && !currentQuestion.options && (
              <div className="space-y-4">
                <textarea
                  value={userAnswers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none resize-none"
                  rows={4}
                />
                {currentQuestion.hint && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700">
                      <strong>Hint:</strong> {currentQuestion.hint}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Audio for listening questions */}
            {currentQuestion.question_type === 'listening' && currentQuestion.audio_url && (
              <div className="space-y-4">
                <div className="text-center">
                  <button
                    onClick={isPlaying ? stopPlaying : playRecording}
                    className="p-4 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                  >
                    {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                  </button>
                  <p className="text-sm text-gray-600 mt-2">Click to play audio</p>
                </div>
                {currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(currentQuestion.id, option)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                          userAnswers[currentQuestion.id] === option
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reading comprehension */}
            {currentQuestion.question_type === 'reading' && (
              <div className="space-y-4">
                {currentQuestion.image_url && (
                  <div className="text-center">
                    <img 
                      src={currentQuestion.image_url} 
                      alt="Reading passage" 
                      className="max-w-full h-auto rounded-lg shadow-md"
                    />
                  </div>
                )}
                {currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(currentQuestion.id, option)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                          userAnswers[currentQuestion.id] === option
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            {userAnswers[currentQuestion.id] && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-10 text-center"
              >
                <motion.button
                  onClick={nextQuestion}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:from-[#02033a] hover:to-[#0099cc]"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>
                      {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Level'}
                    </span>
                    {currentQuestionIndex < questions.length - 1 ? (
                      <ArrowLeft className="h-5 w-5 rotate-180" />
                    ) : (
                      <CheckCircle className="h-5 w-5" />
                    )}
                  </span>
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* Results Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 text-center"
          >
            <div className="mb-10">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-32 h-32 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <CheckCircle className="h-16 w-16 text-green-500" />
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold text-gray-900 mb-4"
              >
                Level Completed!
              </motion.h2>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2 mb-6"
              >
                <p className="text-xl text-gray-700">
                  You scored <span className="font-bold text-[#03045e]">{score}</span> out of <span className="font-bold text-gray-900">{questions.length}</span> questions correctly
                </p>
                <p className="text-xl text-gray-700">
                  Accuracy: <span className="font-bold text-[#00bfe6]">{Math.round((score / questions.length) * 100)}%</span>
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold ${
                  Math.round((score / questions.length) * 100) >= 83
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-orange-100 text-orange-700 border border-orange-200'
                }`}
              >
                {Math.round((score / questions.length) * 100) >= 83 ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Next Level Unlocked!
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 mr-2" />
                    Need 83%+ accuracy to unlock next level
                  </>
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10"
            >
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">{score}</div>
                <div className="text-sm font-medium text-blue-700">Correct Answers</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-2">{level.xp_reward}</div>
                <div className="text-sm font-medium text-green-700">XP Earned</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="text-3xl font-bold text-purple-600 mb-2">{Math.round((score / questions.length) * 100)}%</div>
                <div className="text-sm font-medium text-purple-700">Accuracy</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link 
                href={`/groups/${groupId}`} 
                className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 hover:shadow-lg flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Group</span>
              </Link>
              
              {currentQuestionIndex < questions.length - 1 && (
                <motion.button
                  onClick={() => {
                    setCurrentQuestionIndex(0)
                    setUserAnswers({})
                    setShowResult(false)
                    setScore(0)
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white rounded-xl font-semibold hover:from-[#02033a] hover:to-[#0099cc] transition-all duration-300 hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <Zap className="h-5 w-5" />
                  <span>Retry Level</span>
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}