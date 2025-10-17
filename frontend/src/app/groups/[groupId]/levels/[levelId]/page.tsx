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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link href={`/groups/${groupId}`} className="flex items-center text-gray-600 hover:text-primary-600">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Group
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">{level.name}</h1>
              <p className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {questions.length}</p>
            </div>
            <div className="w-20"></div> {/* Spacer */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showResult ? (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            {/* Question Type Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentQuestion.question_type.replace('_', ' ').toUpperCase()}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">XP: {currentQuestion.xp_value}</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">Difficulty: {currentQuestion.difficulty}</span>
                </div>
              </div>
              
              <p className="text-lg text-gray-700 mb-6">{currentQuestion.question_text}</p>
            </div>

            {/* Question Content */}
            {currentQuestion.question_type === 'mcq' && currentQuestion.options && (
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

            {currentQuestion.question_type === 'text_to_speech' && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-lg text-gray-600 mb-4">
                    Click the microphone to record your pronunciation
                  </p>
                  
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`p-4 rounded-full transition-colors ${
                        isRecording 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : 'bg-primary-500 text-white hover:bg-primary-600'
                      }`}
                    >
                      {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                    </button>
                    
                    {audioBlob && (
                      <button
                        onClick={isPlaying ? stopPlaying : playRecording}
                        className="p-4 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                      >
                        {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                      </button>
                    )}
                  </div>
                  
                  {isRecording && (
                    <div className="mt-4">
                      <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse mx-auto"></div>
                      <p className="text-sm text-red-600 mt-2">Recording... Click to stop</p>
                    </div>
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
              <div className="mt-8 text-center">
                <button
                  onClick={nextQuestion}
                  className="btn-primary px-8 py-3 text-lg"
                >
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Level'}
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          /* Results Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-lg p-8 text-center"
          >
            <div className="mb-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Level Completed!</h2>
              <p className="text-lg text-gray-600 mb-2">
                You scored {score} out of {questions.length} questions correctly
              </p>
              <p className="text-lg text-gray-600">
                Accuracy: {Math.round((score / questions.length) * 100)}%
              </p>
              {Math.round((score / questions.length) * 100) >= 83 ? (
                <p className="text-lg text-green-600 font-semibold mt-2">
                  ✅ Next Level Unlocked!
                </p>
              ) : (
                <p className="text-lg text-orange-600 font-semibold mt-2">
                  ⚠️ Need 83%+ accuracy to unlock next level
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{score}</div>
                <div className="text-sm text-blue-600">Correct</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{level.xp_reward}</div>
                <div className="text-sm text-green-600">XP Earned</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">{Math.round((score / questions.length) * 100)}%</div>
                <div className="text-sm text-purple-600">Accuracy</div>
              </div>
            </div>

            <div className="space-x-4">
              <Link href={`/groups/${groupId}`} className="btn-secondary">
                Back to Group
              </Link>
              {currentQuestionIndex < questions.length - 1 && (
                <button
                  onClick={() => {
                    setCurrentQuestionIndex(0)
                    setUserAnswers({})
                    setShowResult(false)
                    setScore(0)
                  }}
                  className="btn-primary"
                >
                  Retry Level
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}