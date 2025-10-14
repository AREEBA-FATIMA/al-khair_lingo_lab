'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, XCircle, Volume2, Mic, MicOff, Play, Pause } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Question {
  id: number
  question_text: string
  question_type: 'mcq' | 'text_to_speech' | 'fill_blank' | 'synonyms' | 'antonyms' | 'sentence_completion'
  options: string[]
  correct_answer: string
  explanation: string
  xp_value: number
  question_order: number
  difficulty: number
}

interface Level {
  id: number
  name: string
  description: string
  level_number: number
  questions_count: number
  xp_reward: number
  is_unlocked: boolean
  plant_growth_stage: string
  questions: Question[]
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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const fetchLevelData = async () => {
      try {
        // First get all groups to find the correct group by group_number
        const groupResponse = await fetch(`http://127.0.0.1:8000/api/groups/`)
        
        if (!groupResponse.ok) {
          throw new Error(`HTTP error! status: ${groupResponse.status}`)
        }
        
        const groupsResponse = await groupResponse.json()
        console.log('Groups API Response:', groupsResponse)
        
        // Handle paginated response - data is in 'results' field
        const groupsData = groupsResponse.results || groupsResponse
        console.log('Groups data:', groupsData)
        
        // Check if groupsData is an array
        if (!Array.isArray(groupsData)) {
          throw new Error('Groups data is not an array')
        }
        
        // Find the group by group_number
        const groupData = groupsData.find((g: any) => g.group_number === parseInt(groupId))
        
        if (!groupData) {
          throw new Error('Group not found')
        }
        
        // Now get levels for this specific group
        const levelsResponse = await fetch(`http://127.0.0.1:8000/api/groups/${groupData.id}/levels/`)
        
        if (!levelsResponse.ok) {
          throw new Error(`Levels API error! status: ${levelsResponse.status}`)
        }
        
        const levelsResponseData = await levelsResponse.json()
        console.log('Levels API Response:', levelsResponseData)
        
        // Handle paginated response - data is in 'results' field
        const levelsData = levelsResponseData.results || levelsResponseData
        console.log('Levels data:', levelsData)
        
        // Check if levelsData is an array
        if (!Array.isArray(levelsData)) {
          throw new Error('Levels data is not an array')
        }
        
        // Find the level by level_number (not ID)
        console.log('Looking for level_number:', parseInt(levelId))
        console.log('Available levels:', levelsData.map((l: any) => ({ id: l.id, level_number: l.level_number, name: l.name })))
        
        const targetLevel = levelsData.find((l: any) => l.level_number === parseInt(levelId))
        console.log('Found target level:', targetLevel)
        
        if (targetLevel) {
          // Get questions for this level
          const questionsResponse = await fetch(`http://127.0.0.1:8000/api/groups/${groupData.id}/levels/${targetLevel.id}/questions/`)
          
          if (!questionsResponse.ok) {
            throw new Error(`Questions API error! status: ${questionsResponse.status}`)
          }
          
          const questionsResponseData = await questionsResponse.json()
          console.log('Questions API Response:', questionsResponseData)
          
          // Handle paginated response - data is in 'results' field
          const questionsData = questionsResponseData.results || questionsResponseData
          console.log('Questions data:', questionsData)
          
          setLevel(targetLevel)
          setQuestions(Array.isArray(questionsData) ? questionsData : [])
        } else {
          throw new Error('Level not found')
        }
      } catch (error) {
        console.error('Error fetching level data:', error)
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
  }, [groupId, levelId])

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
      const response = await fetch('http://127.0.0.1:8000/api/groups/questions/submit-answer/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_id: questionId,
          answer: answer
        })
      })
      
      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error submitting answer:', error)
      return { is_correct: false, xp_earned: 0 }
    }
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setShowResult(false)
    } else {
      // Level completed - calculate accuracy
      const correctAnswers = Object.values(userAnswers).filter((answer, index) => 
        answer === questions[index]?.correct_answer
      ).length
      const accuracy = (correctAnswers / questions.length) * 100
      setScore(correctAnswers)
      
      // Level unlocks if accuracy >= 83%
      const levelUnlocked = accuracy >= 83
      
      // Show result with unlock status
      setShowResult(true)
      
      // TODO: Update backend with level completion status
      console.log(`Level completed! Accuracy: ${accuracy.toFixed(1)}%, Unlocked: ${levelUnlocked}`)
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

  if (!level || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Level not found</h2>
          <Link href="/groups" className="btn-primary">
            Back to Groups
          </Link>
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
            {currentQuestion.question_type === 'mcq' && (
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
              currentQuestion.question_type === 'sentence_completion') && (
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
              currentQuestion.question_type === 'antonyms') && (
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