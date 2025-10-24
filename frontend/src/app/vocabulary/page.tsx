'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  Brain, 
  Target, 
  Zap, 
  Clock, 
  CheckCircle, 
  XCircle,
  RotateCcw,
  Play,
  Pause,
  ArrowRight,
  ArrowLeft,
  Star,
  TrendingUp,
  BarChart3,
  Filter,
  Search,
  Shuffle,
  Volume2,
  VolumeX
} from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiService } from '@/services/api'

interface Vocabulary {
  id: number
  word: string
  translation_urdu: string
  pronunciation: string
  oxford_rank: number
  is_oxford_3000: boolean
  difficulty_level: string
  part_of_speech: string
  definition: string
  definition_urdu: string
  example_sentence: string
  example_sentence_urdu: string
  audio_url?: string
  image_url?: string
  synonyms: string[]
  antonyms: string[]
  common_phrases: string[]
  collocations: string[]
  difficulty_score: number
  learning_frequency: number
  is_active: boolean
  is_essential: boolean
}

interface VocabularyProgress {
  id: number
  vocabulary: Vocabulary
  is_learned: boolean
  mastery_level: number
  next_review_date: string
  review_interval_days: number
  review_count: number
  correct_count: number
  incorrect_count: number
  first_learned_at?: string
  last_reviewed_at?: string
  average_response_time: number
  personal_difficulty: number
}

interface VocabularyStats {
  total_words: number
  learned_words: number
  words_in_progress: number
  words_to_review: number
  mastery_distribution: { [key: string]: number }
  average_response_time: number
  accuracy: number
  learning_progress: number
}

export default function VocabularyPage() {
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([])
  const [reviewWords, setReviewWords] = useState<VocabularyProgress[]>([])
  const [currentWord, setCurrentWord] = useState<VocabularyProgress | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isReviewMode, setIsReviewMode] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [stats, setStats] = useState<VocabularyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState({
    difficulty_level: '',
    part_of_speech: '',
    is_oxford_3000: false,
    search: ''
  })
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const { isLoggedIn, user } = useAuth()

  const fetchVocabulary = async () => {
    try {
      const data = await apiService.getVocabulary(filter)
      setVocabulary(data)
    } catch (error) {
      console.error('Error fetching vocabulary:', error)
      setError('Failed to load vocabulary')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVocabulary()
    fetchStats()
  }, [fetchVocabulary])

  useEffect(() => {
    if (isReviewMode && reviewWords.length > 0) {
      setCurrentWord(reviewWords[currentIndex])
    }
  }, [isReviewMode, reviewWords, currentIndex])

  const fetchReviewWords = async () => {
    try {
      const data = await apiService.getReviewWords(20)
      setReviewWords(data)
    } catch (error) {
      console.error('Error fetching review words:', error)
      setError('Failed to load review words')
    }
  }

  const fetchStats = async () => {
    try {
      const data = await apiService.getVocabularyStats()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const startReview = async () => {
    try {
      setLoading(true)
      await fetchReviewWords()
      setIsReviewMode(true)
      setCurrentIndex(0)
      setShowAnswer(false)
      setUserAnswer('')
    } catch (error) {
      console.error('Error starting review:', error)
      setError('Failed to start review')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSubmit = async (correct: boolean) => {
    if (!currentWord) return

    try {
      const response = await apiService.reviewVocabulary(currentWord.vocabulary.id, {
        is_correct: correct,
        response_time: 0, // You can implement timing
        user_answer: userAnswer
      })

      setIsCorrect(correct)
      setShowAnswer(true)

      // Move to next word after a delay
      setTimeout(() => {
        if (currentIndex < reviewWords.length - 1) {
          setCurrentIndex(prev => prev + 1)
          setShowAnswer(false)
          setUserAnswer('')
          setIsFlipped(false)
        } else {
          // Review completed
          setIsReviewMode(false)
          fetchStats() // Refresh stats
        }
      }, 2000)
    } catch (error) {
      console.error('Error submitting answer:', error)
      setError('Failed to submit answer')
    }
  }

  const playAudio = () => {
    if (currentWord?.vocabulary.audio_url) {
      setIsAudioPlaying(true)
      const audio = new Audio(currentWord.vocabulary.audio_url)
      audio.play()
      audio.onended = () => setIsAudioPlaying(false)
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'A1': return 'from-green-400 to-green-600'
      case 'A2': return 'from-blue-400 to-blue-600'
      case 'B1': return 'from-yellow-400 to-orange-500'
      case 'B2': return 'from-orange-400 to-red-500'
      case 'C1': return 'from-red-400 to-purple-600'
      case 'C2': return 'from-purple-400 to-violet-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  const getMasteryColor = (level: number) => {
    if (level >= 4) return 'from-green-400 to-green-600'
    if (level >= 3) return 'from-blue-400 to-blue-600'
    if (level >= 2) return 'from-yellow-400 to-orange-500'
    if (level >= 1) return 'from-orange-400 to-red-500'
    return 'from-gray-400 to-gray-600'
  }

  if (loading && !isReviewMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#00bfe6] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (isReviewMode && currentWord) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        
        {/* Review Header */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vocabulary Review</h1>
                <p className="text-gray-600">Word {currentIndex + 1} of {reviewWords.length}</p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Progress */}
                <div className="flex space-x-1">
                  {Array.from({ length: reviewWords.length }, (_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i < currentIndex ? 'bg-green-400' : i === currentIndex ? 'bg-[#00bfe6]' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <button
                  onClick={() => setIsReviewMode(false)}
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-[#03045e] to-[#00bfe6] h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / reviewWords.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            className="relative w-full h-96 perspective-1000"
            style={{ perspective: '1000px' }}
          >
            <motion.div
              className="relative w-full h-full preserve-3d cursor-pointer"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6 }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {/* Front of card */}
              <div className="absolute inset-0 w-full h-full backface-hidden">
                <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 h-full flex flex-col justify-center items-center">
                  <div className="text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                      {currentWord.vocabulary.word}
                    </h2>
                    
                    <div className="flex items-center justify-center space-x-4 mb-6">
                      <div className={`px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getDifficultyColor(currentWord.vocabulary.difficulty_level)}`}>
                        {currentWord.vocabulary.difficulty_level}
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getMasteryColor(currentWord.mastery_level)}`}>
                        Level {currentWord.mastery_level}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-lg mb-4">
                      {currentWord.vocabulary.part_of_speech}
                    </p>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        playAudio()
                      }}
                      className="p-3 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                    >
                      {isAudioPlaying ? (
                        <VolumeX className="h-6 w-6 text-blue-600" />
                      ) : (
                        <Volume2 className="h-6 w-6 text-blue-600" />
                      )}
                    </button>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">Tap to reveal answer</p>
                  </div>
                </div>
              </div>

              {/* Back of card */}
              <div className="absolute inset-0 w-full h-full backface-hidden" style={{ transform: 'rotateY(180deg)' }}>
                <div className="bg-gradient-to-br from-[#03045e] to-[#00bfe6] rounded-3xl p-8 shadow-2xl text-white h-full flex flex-col justify-center">
                  <div className="text-center">
                    <h3 className="text-3xl font-bold mb-4">
                      {currentWord.vocabulary.translation_urdu}
                    </h3>
                    
                    <p className="text-xl mb-4">
                      {currentWord.vocabulary.definition}
                    </p>
                    
                    <div className="bg-white/20 rounded-2xl p-4 mb-6">
                      <p className="text-lg font-medium mb-2">Example:</p>
                      <p className="text-sm">{currentWord.vocabulary.example_sentence}</p>
                      <p className="text-sm mt-2 opacity-80">{currentWord.vocabulary.example_sentence_urdu}</p>
                    </div>
                    
                    {currentWord.vocabulary.synonyms.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Synonyms:</p>
                        <p className="text-sm">{currentWord.vocabulary.synonyms.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Answer Buttons */}
          {showAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex justify-center space-x-4"
            >
              <button
                onClick={() => handleAnswerSubmit(false)}
                className="flex items-center space-x-2 px-8 py-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all duration-300 shadow-lg hover:scale-105"
              >
                <XCircle className="h-5 w-5" />
                <span>I Don&apos;t Know</span>
              </button>
              
              <button
                onClick={() => handleAnswerSubmit(true)}
                className="flex items-center space-x-2 px-8 py-4 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold transition-all duration-300 shadow-lg hover:scale-105"
              >
                <CheckCircle className="h-5 w-5" />
                <span>I Know This</span>
              </button>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
            >
              <RotateCcw className="h-5 w-5" />
              <span>Flip Card</span>
            </button>

            <button
              onClick={() => setCurrentIndex(prev => Math.min(reviewWords.length - 1, prev + 1))}
              disabled={currentIndex === reviewWords.length - 1}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
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
            Vocabulary Review
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Master English vocabulary with spaced repetition. Review words you&apos;ve learned and discover new ones!
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.total_words}</div>
                  <div className="text-sm text-gray-600">Total Words</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.learned_words}</div>
                  <div className="text-sm text-gray-600">Learned</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Target className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.words_to_review}</div>
                  <div className="text-sm text-gray-600">To Review</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.accuracy}%</div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={startReview}
            disabled={loading}
            className="group relative bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white py-4 px-8 rounded-2xl font-bold transition-all duration-300 hover:shadow-2xl hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                  Start Review
                </>
              )}
            </span>
          </button>

          <Link
            href="/groups"
            className="group relative bg-white text-[#03045e] py-4 px-8 rounded-2xl font-bold border-2 border-[#03045e] transition-all duration-300 hover:bg-[#03045e] hover:text-white hover:shadow-xl hover:scale-105 shadow-lg"
          >
            <span className="flex items-center justify-center gap-2">
              <ArrowLeft className="h-5 w-5" />
              Back to Learning
            </span>
          </Link>
        </div>

        {/* Vocabulary List */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Vocabulary Words</h2>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search words..."
                  value={filter.search}
                  onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00bfe6] focus:border-transparent"
                />
              </div>
              
              <select
                value={filter.difficulty_level}
                onChange={(e) => setFilter(prev => ({ ...prev, difficulty_level: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00bfe6] focus:border-transparent"
              >
                <option value="">All Levels</option>
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vocabulary.map((word, index) => (
              <motion.div
                key={word.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#03045e] transition-colors">
                    {word.word}
                  </h3>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getDifficultyColor(word.difficulty_level)}`}>
                    {word.difficulty_level}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{word.translation_urdu}</p>
                
                <p className="text-sm text-gray-500 mb-4">{word.definition}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{word.part_of_speech}</span>
                  
                  {word.is_oxford_3000 && (
                    <div className="flex items-center space-x-1 text-yellow-500">
                      <Star className="h-4 w-4" />
                      <span className="text-xs font-medium">Oxford 3000</span>
                    </div>
                  )}
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#03045e]/5 to-[#00bfe6]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

