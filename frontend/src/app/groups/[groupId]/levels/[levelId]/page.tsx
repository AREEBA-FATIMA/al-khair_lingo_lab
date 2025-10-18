'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Volume2, VolumeX, Trophy, Star } from 'lucide-react'

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

  // Refs
  const infoTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const savedUnlocked = localStorage.getItem('snake_highestUnlocked_v1')
    const savedXp = localStorage.getItem('snake_xp_v1')
    const savedSound = localStorage.getItem('snake_sound_v1')
    
    if (savedUnlocked) setHighestUnlocked(Number(savedUnlocked))
    if (savedXp) setXpTotal(Number(savedXp))
    if (savedSound !== null) setSoundOn(savedSound === 'true')
  }, [])

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
  const startLevelQuiz = (levelIndex: number) => {
    setCurrentLevelIndex(levelIndex)
    setQuestionPointer(0)
    setCorrectCount(0)
    setCurrentLevelQuestions(localLevels[levelIndex].questions)
    setShowModal(true)
    setSelectedOption(null)
    setQuestionFeedback('')
    setShowNext(false)
  }

  // Handle answer click
  const handleAnswerClick = (choiceIdx: number) => {
    if (selectedOption !== null) return // Already answered

    setSelectedOption(choiceIdx)
    const currentQuestion = currentLevelQuestions[questionPointer]
    const correctIndex = currentQuestion.correctIndex

    if (choiceIdx === correctIndex) {
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

  // Next question
  const handleNext = () => {
    if (questionPointer < currentLevelQuestions.length - 1) {
      setQuestionPointer(prev => prev + 1)
      setSelectedOption(null)
      setQuestionFeedback('')
      setShowNext(false)
    } else {
      finishLevelQuiz()
    }
  }

  // Finish quiz
  const finishLevelQuiz = () => {
    setShowModal(false)
    const levelIdx = currentLevelIndex!
    const total = currentLevelQuestions.length

    if (correctCount === total) {
      if (levelIdx === highestUnlocked + 1) {
        setHighestUnlocked(levelIdx)
        const metaXP = levelMeta[levelIdx] && /\d+/.test(levelMeta[levelIdx].xp) 
          ? parseInt(levelMeta[levelIdx].xp.replace('+', '')) 
          : 10
        setXpTotal(prev => prev + (metaXP || 10))
        persistState()
        
        // Confetti effect
        const rect = document.querySelector(`[data-level="${levelIdx}"]`)?.getBoundingClientRect()
        if (rect) {
          spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2)
        }
        
        playTing()
        flashHint('All correct — Level unlocked!')
      } else {
        flashHint('All correct — good review!')
        playTing()
      }
    } else {
      flashHint(`You answered ${correctCount}/${total} correct. Try again to unlock.`)
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
      <div className="max-w-md mx-auto relative">
        {/* Level Path SVG */}
        <svg className="absolute inset-0 w-full h-[1100px] z-0" viewBox="0 0 420 1100" preserveAspectRatio="xMidYMid meet">
          <path
            d="M210 60 C90 150, 330 240, 190 330 C70 420, 340 520, 190 620 C70 720, 350 800, 190 930"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M210 60 C90 150, 330 240, 190 330 C70 420, 340 520, 190 620 C70 720, 350 800, 190 930"
            stroke="#00ff88"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            filter="drop-shadow(0 0 12px rgba(0,255,136,0.25))"
            style={{
              strokeDasharray: '1000 1000',
              strokeDashoffset: Math.max(0, 1000 - (1000 * highestUnlocked) / 4)
            }}
          />
        </svg>

        {/* Levels */}
        {localLevels.map((level, idx) => (
          <motion.div
            key={level.id}
            data-level={idx}
            className={`absolute w-[74px] h-[74px] rounded-full flex items-center justify-center z-10 cursor-pointer transition-all duration-300 ${
              idx <= highestUnlocked
                ? 'bg-gradient-to-br from-green-400 to-green-600 text-green-900 shadow-lg hover:scale-110'
                : 'bg-gradient-to-br from-gray-500 to-gray-700 text-gray-400'
            }`}
            style={{
              top: `${26 + idx * 100}px`,
              left: idx % 2 === 0 ? '175px' : '60px',
              transform: idx % 2 === 1 ? 'translateX(-50%)' : 'none'
            }}
            onClick={() => handleLevelClick(idx)}
            onMouseEnter={() => showInfoFor(idx)}
            onMouseLeave={hideInfo}
            whileHover={{ scale: idx <= highestUnlocked ? 1.1 : 1 }}
            animate={idx <= highestUnlocked ? { y: [0, -8, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-8 h-8">
              {svgIcons[idx] || svgIcons[0]}
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2 top-20 text-xs px-2 py-1 rounded-lg bg-green-500/20 text-green-400 font-bold">
              {levelMeta[idx]?.xp || '+0'}
            </div>
          </motion.div>
        ))}

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
                {localLevels[currentLevelIndex!]?.title} — Question {questionPointer + 1} / {currentLevelQuestions.length}
              </h3>
              <p className="text-gray-300 mb-4">
                {currentLevelQuestions[questionPointer]?.question}
              </p>
              <div className="text-gray-400 text-sm font-bold mb-4">
                Question {questionPointer + 1} of {currentLevelQuestions.length}
              </div>

              <div className="space-y-3 mb-6">
                {currentLevelQuestions[questionPointer]?.options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    className={`w-full p-4 rounded-xl text-left font-semibold transition-all duration-200 ${
                      selectedOption === idx
                        ? idx === currentLevelQuestions[questionPointer].correctIndex
                          ? 'bg-green-500/20 border-green-500/30 text-green-100'
                          : 'bg-red-500/20 border-red-500/30 text-red-100'
                        : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10'
                    }`}
                    onClick={() => handleAnswerClick(idx)}
                    disabled={selectedOption !== null}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {option}
                  </motion.button>
                ))}
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
    </div>
  )
}