'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Volume2, VolumeX, Trophy, CheckCircle, X, RotateCcw, BookOpen, HelpCircle, Lightbulb } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

// Types
interface Question {
  question: string
  options: string[]
  correctIndex: number
}

interface LevelData {
  id: number
  title: string
  description: string
  xp: number
  questions: Question[]
}

// Local fallback data
const localLevels: LevelData[] = [
  {
    id: 1,
    title: "HTML Basics",
    description: "Basic HTML tags (headings, p, a, img).",
    xp: 10,
    questions: [
      { question: "What does HTML stand for?", options: ["HyperText Markup Language", "Home Tool Markup Language", "Hyperlinks Text Makeup Language", "HyperText Machine Language"], correctIndex: 0 },
      { question: "Which tag is used for a paragraph?", options: ["<p>", "<para>", "<pg>", "<text>"], correctIndex: 0 },
      { question: "Which tag creates a link?", options: ["<a>", "<link>", "<href>", "<url>"], correctIndex: 0 },
      { question: "Which attribute sets an image source?", options: ["src", "href", "link", "img"], correctIndex: 0 },
      { question: "Which tag defines the document title?", options: ["<title>", "<head>", "<name>", "<caption>"], correctIndex: 0 },
      { question: "Which element contains the main content?", options: ["<main>", "<content>", "<body>", "<section>"], correctIndex: 2 }
    ]
  },
  {
    id: 2,
    title: "Include CSS",
    description: "Attach CSS using link or style tags.",
    xp: 12,
    questions: [
      { question: "Which tag includes an external CSS file?", options: ["<link rel='stylesheet' href='style.css'>", "<script src='style.css'>", "<css src='style.css'>", "<style href='style.css'>"], correctIndex: 0 },
      { question: "Where should link to CSS be placed?", options: ["In the head", "In the body", "At end of body", "In the footer"], correctIndex: 0 },
      { question: "Which attribute specifies media for link?", options: ["media", "type", "rel", "href"], correctIndex: 0 },
      { question: "To write internal CSS which tag is used?", options: ["<style>", "<css>", "<link>", "<script>"], correctIndex: 0 },
      { question: "Inline CSS uses which attribute?", options: ["style", "css", "inline", "class"], correctIndex: 0 },
      { question: "External CSS keeps markup and styles:", options: ["Separated", "Combined", "Conflicting", "Merged"], correctIndex: 0 }
    ]
  },
  {
    id: 3,
    title: "CSS Backgrounds",
    description: "Change background colors and images.",
    xp: 15,
    questions: [
      { question: "Which property changes background color?", options: ["background-color", "bg", "color-bg", "backColor"], correctIndex: 0 },
      { question: "How to set background image in CSS?", options: ["background-image:url('x')", "img-bg:url('x')", "bg:url('x')", "image:url('x')"], correctIndex: 0 },
      { question: "To make background cover entire area use:", options: ["background-size:cover", "background-fit:all", "cover-background:true", "bg-size:100%"], correctIndex: 0 },
      { question: "Transparent background value is:", options: ["transparent", "#0000", "none", "hide"], correctIndex: 0 },
      { question: "Background shorthand property is:", options: ["background", "bg", "backgroundAll", "backgroundProp"], correctIndex: 0 },
      { question: "To repeat background use property:", options: ["background-repeat", "repeat-bg", "bg-repeat", "repeat"], correctIndex: 0 }
    ]
  },
  {
    id: 4,
    title: "JS Comments",
    description: "Comments in JS and code readability.",
    xp: 18,
    questions: [
      { question: "Single-line comment in JS is:", options: ["// comment", "<!-- -->", "/* */", "# comment"], correctIndex: 0 },
      { question: "Multi-line comment uses:", options: ["/* comment */", "// comment", "# comment", "<-- -->"], correctIndex: 0 },
      { question: "Comments are used for:", options: ["Readability", "Execution", "Styling", "Linking"], correctIndex: 0 },
      { question: "Which is NOT comment syntax?", options: ["# comment", "// comment", "/* */", "<!-- -->"], correctIndex: 3 },
      { question: "Good comments explain:", options: ["Why code exists", "Everything verbatim", "Repeat code", "Hide code"], correctIndex: 0 },
      { question: "Comments are ignored by:", options: ["The JS engine", "User", "Editor", "Terminal"], correctIndex: 0 }
    ]
  },
  {
    id: 5,
    title: "Variables (let)",
    description: "Declare variables with let/const.",
    xp: 0,
    questions: [
      { question: "Which declares a block-scoped variable (ES6)?", options: ["let x = 5;", "var x = 5;", "int x = 5;", "v x = 5;"], correctIndex: 0 },
      { question: "Constant declaration uses:", options: ["const", "letconst", "immutable", "final"], correctIndex: 0 },
      { question: "Reassignable variable uses:", options: ["let", "const", "static", "immutable"], correctIndex: 0 },
      { question: "Which is valid identifier?", options: ["myVar", "1var", "my-var", "my var"], correctIndex: 0 },
      { question: "To declare multiple: let a=1, b=2;", options: ["valid", "invalid", "error", "deprecated"], correctIndex: 0 },
      { question: "Var is function-scoped while let is:", options: ["block-scoped", "global", "module", "none"], correctIndex: 0 }
    ]
  }
]

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const { groupId, levelId } = params
  const { isLoggedIn, user, loading: authLoading } = useAuth()

  // State
  const [currentLevel, setCurrentLevel] = useState<LevelData | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [incorrectAnswers, setIncorrectAnswers] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const [xpTotal, setXpTotal] = useState(0)

  // Load level data
  useEffect(() => {
    // Check if user is logged in
    if (!authLoading && !isLoggedIn) {
      window.location.href = '/login'
      return
    }
    
    if (!authLoading && isLoggedIn) {
      const levelIndex = Number(levelId)
      if (levelIndex >= 0 && levelIndex < localLevels.length) {
        setCurrentLevel(localLevels[levelIndex])
      }

      // Load XP from localStorage
      const savedXp = localStorage.getItem('snake_xp_v1')
      if (savedXp) setXpTotal(Number(savedXp))
    }
  }, [authLoading, isLoggedIn, levelId])

  // Audio functions
  const playTing = () => {
    if (!soundOn) return
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = 880
      g.gain.value = 0.0001
      o.connect(g)
      g.connect(ctx.destination)
      const now = ctx.currentTime
      g.gain.setValueAtTime(0.0001, now)
      g.gain.exponentialRampToValueAtTime(0.12, now + 0.01)
      o.start(now)
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.28)
      o.stop(now + 0.3)
    } catch (e) {}
  }

  const playBuzz = () => {
    if (!soundOn) return
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'square'
      o.frequency.value = 180
      o.connect(g)
      g.connect(ctx.destination)
      const now = ctx.currentTime
      g.gain.setValueAtTime(0.0001, now)
      g.gain.exponentialRampToValueAtTime(0.08, now + 0.02)
      o.start(now)
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.14)
      o.stop(now + 0.16)
    } catch (e) {}
  }

  // Handle answer selection
  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return

    setSelectedAnswer(answerIndex)
    const isCorrect = answerIndex === currentLevel?.questions[currentQuestionIndex].correctIndex

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1)
      playTing()
    } else {
      setIncorrectAnswers(prev => prev + 1)
      playBuzz()
    }

    // Auto advance after 1.5 seconds
    setTimeout(() => {
      if (currentQuestionIndex < (currentLevel?.questions.length || 0) - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
        setSelectedAnswer(null)
      } else {
        // Quiz completed
        setShowResult(true)
        // Update XP
        const newXp = xpTotal + (currentLevel?.xp || 0)
        setXpTotal(newXp)
        localStorage.setItem('snake_xp_v1', String(newXp))
      }
    }, 1500)
  }

  // Restart quiz
  const restartQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setCorrectAnswers(0)
    setIncorrectAnswers(0)
    setShowResult(false)
  }

  // Go back to levels
  const goBackToLevels = () => {
    router.push(`/groups/${groupId}/levels/${levelId}`)
  }

  // Go back to groups
  const goBackToGroups = () => {
    router.push(`/groups/${groupId}`)
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Redirect if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  if (!currentLevel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading quiz...</p>
        </div>
      </div>
    )
  }

  const currentQuestion = currentLevel.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / currentLevel.questions.length) * 100
  const percentage = Math.round((correctAnswers / (correctAnswers + incorrectAnswers)) * 100) || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={goBackToGroups}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors group"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600 group-hover:text-slate-900" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{currentLevel.title}</h1>
                <p className="text-slate-600 text-sm">{currentLevel.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
                <Trophy className="h-4 w-4 text-white" />
                <span className="font-bold text-white">{xpTotal} XP</span>
              </div>
              <button
                onClick={() => setSoundOn(!soundOn)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors group"
                title="Toggle sound"
              >
                {soundOn ? <Volume2 className="h-5 w-5 text-slate-600 group-hover:text-slate-900" /> : <VolumeX className="h-5 w-5 text-slate-400" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {!showResult ? (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
            {/* Progress Bar */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-semibold text-green-600">{correctAnswers}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="h-5 w-5 text-red-500" />
                    <span className="font-semibold text-red-600">{incorrectAnswers}</span>
                  </div>
                </div>
                <div className="text-sm font-medium text-slate-600">
                  {currentQuestionIndex + 1} / {currentLevel.questions.length}
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Choose the correct answer</h2>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-medium text-slate-900 mb-6 leading-relaxed">
                  {currentQuestion.question}
                </h3>

                <div className="grid gap-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === index
                    const isCorrect = index === currentQuestion.correctIndex
                    const isWrong = isSelected && !isCorrect

                    return (
                      <motion.button
                        key={index}
                        className={`p-4 rounded-xl text-left font-medium transition-all duration-200 border-2 ${
                          isSelected
                            ? isCorrect
                              ? 'bg-green-50 border-green-300 text-green-800'
                              : 'bg-red-50 border-red-300 text-red-800'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={selectedAnswer !== null}
                        whileHover={{ scale: selectedAnswer === null ? 1.02 : 1 }}
                        whileTap={{ scale: selectedAnswer === null ? 0.98 : 1 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? isCorrect
                                ? 'border-green-500 bg-green-500'
                                : 'border-red-500 bg-red-500'
                              : 'border-slate-300'
                          }`}>
                            {isSelected && (
                              <CheckCircle className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <span className="font-semibold text-slate-600">{String.fromCharCode(65 + index)}.</span>
                          <span>{option}</span>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Result Modal */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8 max-w-md mx-auto"
          >
            {/* Progress Circle */}
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                    fill="none"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: '0 251.2' }}
                    animate={{ strokeDasharray: `${(percentage / 100) * 251.2} 251.2` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-blue-600">{percentage}%</span>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="text-center mb-8">
              <div className="flex justify-center gap-8 mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-semibold text-green-600">Correct: {correctAnswers}</span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="h-5 w-5 text-red-500" />
                  <span className="font-semibold text-red-600">Incorrect: {incorrectAnswers}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={restartQuiz}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                CHECK YOUR ANSWER
              </button>
              
              <button
                onClick={restartQuiz}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-5 w-5" />
                TAKE THE TEST AGAIN
              </button>
              
              <button
                onClick={goBackToLevels}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                FINISH
              </button>
            </div>

            {/* Next Exercise Button */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  const nextLevel = Number(levelId) + 1
                  if (nextLevel < localLevels.length) {
                    router.push(`/groups/${groupId}/levels/${nextLevel}/quiz`)
                  } else {
                    goBackToLevels()
                  }
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-xl transition-colors flex items-center gap-2 mx-auto"
              >
                Next Exercise {String(Number(levelId) + 1).padStart(2, '0')}
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
