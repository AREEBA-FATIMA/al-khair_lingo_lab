'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LearningContent {
  topic: string
  intro: string
  objectives: string[]
  practice: any[]
}

interface LearningModalProps {
  isOpen: boolean
  onClose: () => void
  learningContent: LearningContent
  onStartPractice: () => void
  onStartQuiz: () => void
  currentStep: 'intro' | 'practice' | 'quiz' | 'result'
  practiceStep: number
  onNextPractice: () => void
  onPreviousPractice: () => void
  children?: React.ReactNode
}

export default function LearningModal({
  isOpen,
  onClose,
  learningContent,
  onStartPractice,
  onStartQuiz,
  currentStep,
  practiceStep,
  onNextPractice,
  onPreviousPractice,
  children
}: LearningModalProps) {
  const [soundOn, setSoundOn] = useState(true)

  // Text-to-speech function
  const speakText = (text: string, rate: number = 0.7) => {
    if (!soundOn) return
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      utterance.lang = 'en-US'
      speechSynthesis.speak(utterance)
    }
  }

  const currentPractice = learningContent.practice[practiceStep]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#03045e] to-[#00bfe6] p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">📚</div>
                  <div>
                    <h2 className="text-xl font-bold">{learningContent.topic}</h2>
                    <p className="text-blue-100 text-sm">Interactive Learning</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {currentStep === 'intro' && (
                <div className="text-center space-y-6">
                  <div className="text-5xl mb-4">🎓</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    {learningContent.topic}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {learningContent.intro}
                  </p>
                  
                  <div className="bg-gradient-to-r from-[#03045e]/5 to-[#00bfe6]/5 rounded-xl p-6 border border-[#03045e]/10">
                    <h4 className="text-lg font-semibold text-[#03045e] mb-4">What you'll learn:</h4>
                    <ul className="text-left space-y-3">
                      {learningContent.objectives.map((objective, idx) => (
                        <li key={idx} className="flex items-center text-gray-700">
                          <span className="text-[#00bfe6] mr-3 text-xl">✓</span>
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => speakText("Hello, welcome to English learning!", 0.7)}
                      className="bg-gradient-to-r from-[#00bfe6] to-[#03045e] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#00bfe6]/90 hover:to-[#03045e]/90 transition-all duration-300 shadow-lg"
                    >
                      🔊 Test Voice
                    </button>
                    <button
                      onClick={onStartPractice}
                      className="bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white px-8 py-3 rounded-xl font-semibold hover:from-[#03045e]/90 hover:to-[#00bfe6]/90 transition-all duration-300 shadow-lg"
                    >
                      Start Learning 🚀
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 'practice' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-800">
                      Practice: {learningContent.topic}
                    </h3>
                    <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      Step {practiceStep + 1} of {learningContent.practice.length}
                    </div>
                  </div>
                  
                  {currentPractice?.type === 'pronunciation' && (
                    <div className="text-center space-y-6">
                      <div className="text-6xl mb-4">{currentPractice.image}</div>
                      <div className="bg-gradient-to-r from-[#03045e]/5 to-[#00bfe6]/5 rounded-xl p-6 border border-[#03045e]/10">
                        <h4 className="text-3xl font-bold text-gray-800 mb-2">{currentPractice.word}</h4>
                        <p className="text-2xl text-[#03045e] mb-2 font-mono">{currentPractice.phonetic}</p>
                        <p className="text-gray-600 mb-4">{currentPractice.meaning}</p>
                        <p className="text-[#00bfe6] italic text-lg">&quot;{currentPractice.example}&quot;</p>
                      </div>
                      
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={() => speakText(currentPractice.word, 0.7)}
                          className="bg-[#03045e] text-white px-6 py-3 rounded-xl hover:bg-[#03045e]/90 transition-colors shadow-lg"
                        >
                          🔊 Listen
                        </button>
                        <button
                          onClick={() => speakText(currentPractice.word, 0.4)}
                          className="bg-[#00bfe6] text-white px-6 py-3 rounded-xl hover:bg-[#00bfe6]/90 transition-colors shadow-lg"
                        >
                          🐌 Slow
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {currentPractice?.type === 'conversation' && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="text-5xl mb-4">{currentPractice.image}</div>
                        <h4 className="text-xl font-semibold text-[#03045e] mb-2">{currentPractice.scenario}</h4>
                      </div>
                      
                      <div className="bg-gradient-to-r from-[#03045e]/5 to-[#00bfe6]/5 rounded-xl p-6 border border-[#03045e]/10">
                        {currentPractice.dialogue.map((line: string, idx: number) => (
                          <div key={idx} className="mb-3 text-gray-700 text-lg">
                            {line}
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-center">
                        <button
                          onClick={async () => {
                            for (let i = 0; i < currentPractice.dialogue.length; i++) {
                              setTimeout(() => {
                                speakText(currentPractice.dialogue[i], 0.7)
                              }, i * 2000)
                            }
                          }}
                          className="bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white px-6 py-3 rounded-xl hover:from-[#03045e]/90 hover:to-[#00bfe6]/90 transition-all duration-300 shadow-lg"
                        >
                          🎭 Listen to Conversation
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {currentPractice?.type === 'colors' && (
                    <div className="space-y-6">
                      <h4 className="text-xl font-semibold text-center text-[#03045e]">Learn Colors</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {currentPractice.colors.map((color: any, idx: number) => (
                          <div key={idx} className="text-center">
                            <div 
                              className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-white shadow-lg"
                              style={{ backgroundColor: color.color }}
                            ></div>
                            <p className="text-gray-800 font-semibold text-lg">{color.name}</p>
                            <p className="text-3xl">{color.emoji}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-6 border-t border-gray-200">
                    <button
                      onClick={onClose}
                      className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-semibold"
                    >
                      Exit
                    </button>
                    <div className="flex gap-3">
                      {practiceStep > 0 && (
                        <button
                          onClick={onPreviousPractice}
                          className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors font-semibold"
                        >
                          ← Previous
                        </button>
                      )}
                      <button
                        onClick={practiceStep < learningContent.practice.length - 1 ? onNextPractice : onStartQuiz}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white hover:from-[#03045e]/90 hover:to-[#00bfe6]/90 transition-all duration-300 font-semibold shadow-lg"
                      >
                        {practiceStep < learningContent.practice.length - 1 ? 'Next →' : 'Start Quiz 🎯'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 'quiz' && children}

              {currentStep === 'result' && children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
