'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Volume2, VolumeX, Trophy, Star } from 'lucide-react'
import ProgressManager from '@/utils/progressManager'

// Types
interface Question {
  id: number
  question_text: string
  question_type: string
  options: string[]
  correct_answer: string
  hint: string
  explanation: string
  difficulty: number
  xp_value: number
  question_order: number
  time_limit_seconds: number
  is_active: boolean
}

interface LevelData {
  id: number
  level_number: number
  name: string
  description: string
  xp_reward: number
  is_unlocked: boolean
  is_test_level: boolean
  test_questions_count: number
  questions: Question[]
}

interface LevelMeta {
  name: string
  desc: string
  xp: string
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

const levelMeta: LevelMeta[] = [
  { name: "HTML Basics", desc: "Basic HTML tags: headings, p, a, img.", xp: "+10" },
  { name: "Include CSS", desc: "Attach CSS using link or style.", xp: "+12" },
  { name: "CSS Backgrounds", desc: "Background images/colors.", xp: "+15" },
  { name: "JS Comments", desc: "Single-line & multi-line comments.", xp: "+18" },
  { name: "Variables (let)", desc: "Declare variables using let/const.", xp: "Reward" }
]

// SVG Icons for levels
const svgIcons = [
  <svg key="arrows" viewBox="0 0 24 24" width="34" height="34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 7L3 12l5 5" stroke="#071109" strokeWidth="1.6"/>
    <path d="M16 7l5 5-5 5" stroke="#071109" strokeWidth="1.6"/>
  </svg>,
  <svg key="code" viewBox="0 0 24 24" width="34" height="34">
    <path d="M3 21c4-1 6-4 7-7 1-3 4-6 6-6 3 0 5 3 6 6 0 1 0 2-1 3-2 3-6 3-8 5-2 2-6 0-10 0z" stroke="#071109" strokeWidth="1.2"/>
  </svg>,
  <svg key="lightning" viewBox="0 0 24 24" width="34" height="34">
    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" stroke="#071109" strokeWidth="1.3"/>
  </svg>,
  <svg key="grid" viewBox="0 0 24 24" width="34" height="34">
    <rect x="4" y="4" width="16" height="16" stroke="#071109" strokeWidth="1.4" rx="2"/>
    <path d="M4 10h16M10 4v16" stroke="#071109" strokeWidth="1.4"/>
  </svg>,
  <svg key="database" viewBox="0 0 24 24" width="34" height="34">
    <rect x="3" y="8" width="18" height="11" rx="1.5" stroke="#071109" strokeWidth="1.3"/>
    <path d="M3 11h18" stroke="#071109" strokeWidth="1.3"/>
  </svg>
]

export default function QuizGame() {
  const params = useParams()
  const router = useRouter()
  const { groupId, levelId } = params

  // State
  const [highestUnlocked, setHighestUnlocked] = useState(0)
  const [xpTotal, setXpTotal] = useState(0)
  const [userProgress, setUserProgress] = useState({
    totalLevels: 0,
    completedLevels: 0,
    totalXP: 0,
    highestLevel: 0
  })
  const [soundOn, setSoundOn] = useState(true)
  const [currentLevelQuestions, setCurrentLevelQuestions] = useState<Question[]>([])
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number | null>(null)
  const [questionPointer, setQuestionPointer] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [showInfoPanel, setShowInfoPanel] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [questionFeedback, setQuestionFeedback] = useState('')
  const [showNext, setShowNext] = useState(false)
  const [hintMessage, setHintMessage] = useState('')
  const [fillBlankAnswer, setFillBlankAnswer] = useState('')
  const [levelData, setLevelData] = useState<LevelData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [quizResult, setQuizResult] = useState<{
    score: number
    total: number
    percentage: number
    passed: boolean
    xpEarned: number
  } | null>(null)

  // Refs
  const infoTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load from localStorage and database on mount
  useEffect(() => {
    const savedUnlocked = localStorage.getItem('snake_highestUnlocked_v1')
    const savedXp = localStorage.getItem('snake_xp_v1')
    const savedSound = localStorage.getItem('snake_sound_v1')
    
    if (savedUnlocked) setHighestUnlocked(Number(savedUnlocked))
    if (savedXp) setXpTotal(Number(savedXp))
    if (savedSound !== null) setSoundOn(savedSound === 'true')
    
    // Load progress from database
    loadProgressFromDatabase()
  }, [])

  // Fetch level data from API
  useEffect(() => {
    const fetchLevelData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch level details
        const levelResponse = await fetch(`http://127.0.0.1:8000/api/levels/levels/${levelId}/`)
        if (!levelResponse.ok) {
          throw new Error(`Level not found: ${levelResponse.status}`)
        }
        const levelData = await levelResponse.json()
        
        // Fetch questions for this level
        const questionsResponse = await fetch(`http://127.0.0.1:8000/api/levels/levels/${levelId}/questions/`)
        if (!questionsResponse.ok) {
          throw new Error(`Questions not found: ${questionsResponse.status}`)
        }
        const questionsData = await questionsResponse.json()
        
        // Transform API data
        const questionsArray = questionsData.results || questionsData || []
        const transformedLevel: LevelData = {
          id: levelData.id,
          level_number: levelData.level_number,
          name: levelData.name,
          description: levelData.description,
          xp_reward: levelData.xp_reward,
          is_unlocked: levelData.is_unlocked,
          is_test_level: levelData.is_test_level,
          test_questions_count: levelData.test_questions_count,
          questions: questionsArray.map((q: any) => ({
            id: q.id,
            question_text: q.question_text,
            question_type: q.question_type,
            options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
            correct_answer: q.correct_answer,
            hint: q.hint,
            explanation: q.explanation,
            difficulty: q.difficulty,
            xp_value: q.xp_value,
            question_order: q.question_order,
            time_limit_seconds: q.time_limit_seconds,
            is_active: q.is_active
          }))
        }
        
        setLevelData(transformedLevel)
        setCurrentLevelQuestions(transformedLevel.questions)
        
      } catch (err) {
        console.error('Error fetching level data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch level data')
        
        // Fallback to mock data
        setLevelData({
          id: parseInt(levelId as string),
          level_number: parseInt(levelId as string),
          name: `Level ${levelId}`,
          description: `Level ${levelId} English learning`,
          xp_reward: 10,
          is_unlocked: true,
          is_test_level: false,
          test_questions_count: 0,
          questions: localLevels[0]?.questions.map((q, idx) => ({
            id: idx + 1,
            question_text: q.question,
            question_type: 'mcq',
            options: q.options,
            correct_answer: q.options[q.correctIndex],
            hint: `Hint for question ${idx + 1}`,
            explanation: `Explanation for question ${idx + 1}`,
            difficulty: 1,
            xp_value: 2,
            question_order: idx + 1,
            time_limit_seconds: 30,
            is_active: true
          })) || []
        })
        const fallbackQuestions = localLevels[0]?.questions.map((q, idx) => ({
          id: idx + 1,
          question_text: q.question,
          question_type: 'mcq',
          options: q.options,
          correct_answer: q.options[q.correctIndex],
          hint: `Hint for question ${idx + 1}`,
          explanation: `Explanation for question ${idx + 1}`,
          difficulty: 1,
          xp_value: 2,
          question_order: idx + 1,
          time_limit_seconds: 30,
          is_active: true
        })) || []
        
        setCurrentLevelQuestions(fallbackQuestions)
      } finally {
        setLoading(false)
      }
    }

    if (levelId) {
      fetchLevelData()
    }
  }, [levelId])

  // Save to localStorage
  const persistState = () => {
    localStorage.setItem('snake_highestUnlocked_v1', String(highestUnlocked))
    localStorage.setItem('snake_xp_v1', String(xpTotal))
    localStorage.setItem('snake_sound_v1', String(soundOn))
  }

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

  // Confetti effect
  const spawnConfetti = (x: number, y: number) => {
    const confettiColors = ["#ff4b5c", "#ffcd3c", "#00d9ff", "#4cff88", "#ff7af5"]
    for (let i = 0; i < 28; i++) {
      const confetti = document.createElement('div')
      confetti.style.position = 'fixed'
      confetti.style.width = (6 + Math.random() * 8) + 'px'
      confetti.style.height = (6 + Math.random() * 10) + 'px'
      confetti.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)]
      confetti.style.borderRadius = Math.random() > 0.5 ? '2px' : '50%'
      confetti.style.left = (x + (Math.random() - 0.5) * 30) + 'px'
      confetti.style.top = (y + (Math.random() - 0.5) * 12) + 'px'
      confetti.style.zIndex = '240'
      confetti.style.pointerEvents = 'none'
      document.body.appendChild(confetti)

      const dx = (Math.random() - 0.5) * 260
      const dy = -(80 + Math.random() * 260)
      const rot = (Math.random() - 0.5) * 720

      confetti.animate([
        { transform: `translate(0px,0px) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`, opacity: 0 }
      ], {
        duration: 900 + Math.random() * 500,
        easing: 'cubic-bezier(.2,.7,.2,1)'
      })

      setTimeout(() => confetti.remove(), 1500)
    }
  }

  // Show hint message
  const flashHint = (msg: string) => {
    setHintMessage(msg)
    setTimeout(() => setHintMessage(''), 2200)
  }

  // Start level quiz
  const startLevelQuiz = () => {
    if (!levelData) return
    
    setCurrentLevelIndex(0)
    setQuestionPointer(0)
    setCorrectCount(0)
    setCurrentLevelQuestions(levelData.questions)
    setShowModal(true)
    setSelectedOption(null)
    setQuestionFeedback('')
    setShowNext(false)
    setFillBlankAnswer('') // Reset fill blank answer
  }

  // Handle answer click
  const handleAnswerClick = (choiceIdx: number) => {
    if (selectedOption !== null) return // Already answered

    setSelectedOption(choiceIdx)
    const currentQuestion = currentLevelQuestions[questionPointer]
    const selectedAnswer = currentQuestion.options[choiceIdx]
    const correctAnswer = currentQuestion.correct_answer

    if (selectedAnswer === correctAnswer) {
      playTing()
      setQuestionFeedback('Correct!')
      setCorrectCount(prev => prev + 1)
      setShowNext(true)
    } else {
      playBuzz()
      setQuestionFeedback('Wrong — try again')
      setTimeout(() => {
        setSelectedOption(null)
        setQuestionFeedback('')
      }, 900)
    }
  }

  // Handle fill in the blank submit
  const handleFillBlankSubmit = () => {
    if (selectedOption !== null) return // Already answered

    const currentQuestion = currentLevelQuestions[questionPointer]
    const userAnswer = fillBlankAnswer.trim().toLowerCase()
    const correctAnswer = currentQuestion.correct_answer.toLowerCase()

    setSelectedOption(0) // Mark as answered

    if (userAnswer === correctAnswer) {
      playTing()
      setQuestionFeedback('Correct!')
      setCorrectCount(prev => prev + 1)
      setShowNext(true)
    } else {
      playBuzz()
      setQuestionFeedback(`Wrong — correct answer: ${currentQuestion.correct_answer}`)
      setTimeout(() => {
        setSelectedOption(null)
        setQuestionFeedback('')
        setFillBlankAnswer('')
      }, 2000)
    }
  }

  // Next question
  const handleNext = () => {
    if (questionPointer < currentLevelQuestions.length - 1) {
      setQuestionPointer(prev => prev + 1)
      setSelectedOption(null)
      setQuestionFeedback('')
      setShowNext(false)
      setFillBlankAnswer('') // Reset fill blank answer
    } else {
      finishLevelQuiz()
    }
  }

  // Save progress to database
  const saveProgressToDatabase = async (result: any) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/progress/save/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level_id: levelData?.id,
          score: result.score,
          total: result.total,
          xp_earned: result.xpEarned,
          passed: result.passed
        })
      })
      
      if (response.ok) {
        console.log('Progress saved to database')
      } else {
        console.error('Failed to save progress to database')
      }
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }

  // Load progress from database
  const loadProgressFromDatabase = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/progress/load/')
      
      if (response.ok) {
        const data = await response.json()
        setUserProgress({
          totalLevels: data.total_levels,
          completedLevels: data.completed_levels,
          totalXP: data.total_xp,
          currentLevel: data.highest_level + 1
        })
        
        // Update local state
        setHighestUnlocked(data.highest_level)
        setXpTotal(data.total_xp)
        persistState()
        
        console.log('Progress loaded from database:', {
          highestLevel: data.highest_level,
          completedLevels: data.completed_levels,
          totalXP: data.total_xp
        })
      }
    } catch (error) {
      console.error('Error loading progress:', error)
    }
  }

  // Finish quiz
  const finishLevelQuiz = async () => {
    setShowModal(false)
    const total = currentLevelQuestions.length
    const percentage = Math.round((correctCount / total) * 100)
    const passed = percentage >= 80 // 80% pass rate
    const xpEarned = passed ? levelData?.xp_reward || 10 : 0

    // Calculate result
    const result = {
      score: correctCount,
      total: total,
      percentage: percentage,
      passed: passed,
      xpEarned: xpEarned
    }

    setQuizResult(result)
    setShowResult(true)

    // Save progress using ProgressManager
    const progressManager = ProgressManager.getInstance()
    const levelProgress = await progressManager.completeLevel(
      levelData?.level_number || 1, // Use level_number instead of id
      correctCount,
      total,
      xpEarned
    )

    // Update local state
    const userProgress = progressManager.getUserProgress()
    setXpTotal(userProgress.totalXP)
    setUserProgress({
      totalLevels: 0, // This will be updated from backend
      completedLevels: userProgress.completedLevels.length,
      totalXP: userProgress.totalXP,
      highestLevel: userProgress.highestUnlockedLevel
    })

    // Trigger a page refresh to update progress on other pages
    if (passed) {
      // Dispatch a custom event to notify other components
      window.dispatchEvent(new CustomEvent('levelCompleted', { 
        detail: { levelId: levelData?.id, xpEarned } 
      }))
    }

    // Save to database
    await saveProgressToDatabase(result)

    if (passed) {
      // Confetti effect
      spawnConfetti(window.innerWidth / 2, window.innerHeight / 2)
      playTing()
    } else {
      playBuzz()
    }
  }

  // Show info panel
  const showInfoFor = (idx: number) => {
    if (infoTimeoutRef.current) {
      clearTimeout(infoTimeoutRef.current)
    }
    setShowInfoPanel(true)
  }

  const hideInfo = () => {
    infoTimeoutRef.current = setTimeout(() => setShowInfoPanel(false), 300)
  }

  // Level click handler
  const handleLevelClick = (idx: number) => {
    if (idx <= highestUnlocked) {
      startLevelQuiz(idx)
    } else if (idx === highestUnlocked + 1) {
      startLevelQuiz(idx)
    } else {
      flashHint("Unlock previous levels first")
    }
  }

  // Sound toggle
  const toggleSound = () => {
    setSoundOn(prev => !prev)
  }

  useEffect(() => {
    persistState()
  }, [highestUnlocked, xpTotal, soundOn])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-100">Loading level...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!levelData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Level not found</p>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-auto p-7">
      {/* Top Bar */}
      <div className="fixed right-6 top-5 flex gap-3 items-center z-50">
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 px-3 py-2 rounded-xl flex gap-2 items-center border border-white/5 shadow-lg">
          <Trophy className="h-4 w-4 text-green-400" />
          <span className="font-bold text-green-100">XP: {xpTotal}</span>
        </div>
        <button
          onClick={toggleSound}
          className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900 border border-white/5 cursor-pointer hover:bg-slate-700 transition-colors"
          title="Toggle sound"
        >
          {soundOn ? <Volume2 className="h-5 w-5 text-green-100" /> : <VolumeX className="h-5 w-5 text-gray-400" />}
        </button>
      </div>

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="fixed left-6 top-5 z-50 p-2 hover:bg-white/10 rounded-lg transition-colors"
      >
        <ArrowLeft className="h-6 w-6 text-white" />
      </button>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto relative">
        {/* Level Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-100 mb-2">{levelData.name}</h1>
          <p className="text-gray-300 text-lg mb-4">{levelData.description}</p>
          <div className="flex justify-center gap-4 text-sm">
            <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg font-bold">
              +{levelData.xp_reward} XP
            </div>
            <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg font-bold">
              {levelData.questions.length} Questions
            </div>
            {levelData.is_test_level && (
              <div className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-lg font-bold">
                Test Level
              </div>
            )}
          </div>
        </div>

        {/* Start Quiz Button */}
        <div className="text-center mb-8">
          <motion.button
            onClick={startLevelQuiz}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-green-900 font-bold text-xl rounded-xl hover:from-green-400 hover:to-green-500 transition-all shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Quiz
          </motion.button>
        </div>

        {/* Questions Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {levelData.questions.map((question, idx) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-800/50 rounded-lg p-4 border border-white/10"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-green-500 text-green-900 rounded-full flex items-center justify-center text-sm font-bold">
                  {idx + 1}
                </div>
                <span className="text-green-100 font-semibold">Question {idx + 1}</span>
              </div>
              <p className="text-gray-300 text-sm mb-2">{question.question_text}</p>
              <div className="flex gap-2 text-xs">
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                  {question.question_type}
                </span>
                <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                  +{question.xp_value} XP
                </span>
                <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                  {question.time_limit_seconds}s
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Progress Tree */}
        <div className="text-center mb-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-green-100 mb-4">Your Learning Tree</h3>
            <div className="flex justify-center items-end gap-2 mb-4">
              {/* Tree stages based on progress */}
              {Array.from({ length: 5 }, (_, i) => {
                const stage = Math.min(Math.floor((highestUnlocked / 10) * 5), 4)
                const isActive = i <= stage
                return (
                  <motion.div
                    key={i}
                    className={`w-12 h-16 rounded-t-full flex items-center justify-center text-2xl ${
                      isActive ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                    animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  >
                    {i === 0 ? '🌱' : i === 1 ? '🌿' : i === 2 ? '🌳' : i === 3 ? '🌲' : '🌳'}
                  </motion.div>
                )
              })}
            </div>
            <div className="text-sm text-gray-300">
              Level {highestUnlocked} completed • {Math.round((highestUnlocked / 50) * 100)}% Progress
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <AnimatePresence>
          {showInfoPanel && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="fixed right-5 top-24 w-64 bg-slate-800/95 rounded-xl p-4 z-40 border border-white/5 shadow-xl"
            >
              <h4 className="text-green-100 font-semibold text-lg mb-2">Level 1</h4>
              <p className="text-gray-300 text-sm mb-3">Short description about this level goes here.</p>
              <div className="flex justify-between items-center">
                <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg font-bold text-sm">+10</div>
                <div className="text-xs text-gray-400">Click to start quiz</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint Message */}
        <AnimatePresence>
          {hintMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed left-4 bottom-5 bg-slate-800/60 px-3 py-2 rounded-lg border border-white/5 text-green-100 font-semibold text-sm z-50"
            >
              {hintMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quiz Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-5"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl p-6 border border-white/5 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-green-100 mb-2">
                {levelData?.name} — Question {questionPointer + 1} / {currentLevelQuestions.length}
              </h3>
              <p className="text-gray-300 mb-4">
                {currentLevelQuestions[questionPointer]?.question_text}
              </p>
              <div className="text-gray-400 text-sm font-bold mb-4">
                Question {questionPointer + 1} of {currentLevelQuestions.length}
              </div>

              <div className="space-y-3 mb-6">
                {currentLevelQuestions[questionPointer]?.question_type === 'fill_blank' ? (
                  // Fill in the blank input field
                  <div className="space-y-4">
                    <div className="text-gray-300 text-lg leading-relaxed">
                      {currentLevelQuestions[questionPointer]?.question_text.split('___').map((part, idx, array) => (
                        <span key={idx}>
                          {part}
                          {idx < array.length - 1 && (
                            <input
                              type="text"
                              value={fillBlankAnswer}
                              onChange={(e) => setFillBlankAnswer(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && fillBlankAnswer.trim()) {
                                  handleFillBlankSubmit()
                                }
                              }}
                              className="mx-2 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all duration-200 min-w-[120px]"
                              placeholder="Type here..."
                              disabled={selectedOption !== null}
                              autoFocus
                            />
                          )}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-center">
                      <motion.button
                        className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                          fillBlankAnswer.trim() && selectedOption === null
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                        onClick={() => handleFillBlankSubmit()}
                        disabled={!fillBlankAnswer.trim() || selectedOption !== null}
                        whileHover={{ scale: fillBlankAnswer.trim() && selectedOption === null ? 1.05 : 1 }}
                        whileTap={{ scale: fillBlankAnswer.trim() && selectedOption === null ? 0.95 : 1 }}
                      >
                        Submit Answer
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  // MCQ options
                  currentLevelQuestions[questionPointer]?.options.map((option, idx) => {
                    const isCorrect = option === currentLevelQuestions[questionPointer].correct_answer
                    return (
                      <motion.button
                        key={idx}
                        className={`w-full p-4 rounded-xl text-left font-semibold transition-all duration-200 border ${
                          selectedOption === idx
                            ? isCorrect
                              ? 'bg-green-500/20 border-green-500/30 text-green-100'
                              : 'bg-red-500/20 border-red-500/30 text-red-100'
                            : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10'
                        }`}
                        onClick={() => handleAnswerClick(idx)}
                        disabled={selectedOption !== null}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold">
                            {String.fromCharCode(65 + idx)}
                          </div>
                          {option}
                        </div>
                      </motion.button>
                    )
                  })
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className={`font-bold ${questionFeedback.includes('Correct') ? 'text-green-400' : 'text-red-400'}`}>
                  {questionFeedback}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg bg-transparent text-gray-400 border border-white/10 hover:bg-white/5 transition-colors"
                  >
                    Close
                  </button>
                  {showNext && (
                    <button
                      onClick={handleNext}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-green-900 font-bold hover:from-green-400 hover:to-green-500 transition-all"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz Result Modal */}
      <AnimatePresence>
        {showResult && quizResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-5"
            onClick={(e) => e.target === e.currentTarget && setShowResult(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl p-6 border border-white/5 shadow-2xl text-center"
            >
              {/* Result Icon */}
              <div className="text-6xl mb-4">
                {quizResult.passed ? '🎉' : '😔'}
              </div>

              {/* Result Title */}
              <h2 className={`text-2xl font-bold mb-2 ${
                quizResult.passed ? 'text-green-400' : 'text-red-400'
              }`}>
                {quizResult.passed ? 'Congratulations!' : 'Try Again!'}
              </h2>

              {/* Score */}
              <div className="text-4xl font-bold text-white mb-2">
                {quizResult.score}/{quizResult.total}
              </div>

              {/* Percentage */}
              <div className={`text-xl font-semibold mb-4 ${
                quizResult.passed ? 'text-green-400' : 'text-red-400'
              }`}>
                {quizResult.percentage}%
              </div>

              {/* XP Earned */}
              {quizResult.passed && (
                <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg mb-4">
                  +{quizResult.xpEarned} XP Earned!
                </div>
              )}

              {/* Progress Update */}
              {quizResult.passed && (
                <div className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg mb-4">
                  Level {levelData?.level_number} Completed!
                </div>
              )}

              {/* Tree Growth Animation */}
              <div className="mb-6">
                <div className="text-lg font-semibold text-green-100 mb-2">Your Tree Grows!</div>
                <div className="flex justify-center items-end gap-1">
                  {Array.from({ length: 5 }, (_, i) => {
                    const stage = Math.min(Math.floor((highestUnlocked / 10) * 5), 4)
                    const isActive = i <= stage
                    return (
                      <motion.div
                        key={i}
                        className={`w-8 h-10 rounded-t-full flex items-center justify-center text-lg ${
                          isActive ? 'bg-green-500' : 'bg-gray-600'
                        }`}
                        animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                      >
                        {i === 0 ? '🌱' : i === 1 ? '🌿' : i === 2 ? '🌳' : i === 3 ? '🌲' : '🌳'}
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResult(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-transparent text-gray-400 border border-white/10 hover:bg-white/5 transition-colors"
                >
                  Continue
                </button>
                {!quizResult.passed && (
                  <button
                    onClick={() => {
                      setShowResult(false)
                      startLevelQuiz()
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-green-900 font-bold hover:from-green-400 hover:to-green-500 transition-all"
                  >
                    Retry
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}