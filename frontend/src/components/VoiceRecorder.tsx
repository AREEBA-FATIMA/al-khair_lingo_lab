'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Play, Pause, RotateCcw, CheckCircle, XCircle } from 'lucide-react'

// Type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent {
  error: string
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult
  length: number
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative
  length: number
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, transcript: string) => void
  onRecordingStart?: () => void
  onRecordingStop?: () => void
  isRecording?: boolean
  disabled?: boolean
  maxDuration?: number // in seconds
  targetText?: string // for pronunciation checking
}

export default function VoiceRecorder({
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  isRecording = false,
  disabled = false,
  maxDuration = 30,
  targetText = ''
}: VoiceRecorderProps) {
  const [isRecordingState, setIsRecordingState] = useState(isRecording)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const checkPronunciation = (transcript: string) => {
    if (!targetText) return

    // Simple pronunciation scoring based on word similarity
    const targetWords = targetText.toLowerCase().split(' ')
    const transcriptWords = transcript.toLowerCase().split(' ')
    
    let matches = 0
    targetWords.forEach(targetWord => {
      if (transcriptWords.some(word => 
        word.includes(targetWord) || targetWord.includes(word) || 
        calculateSimilarity(word, targetWord) > 0.7
      )) {
        matches++
      }
    })

    const score = Math.round((matches / targetWords.length) * 100)
    setPronunciationScore(score)
  }

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript
        setTranscript(transcript)
        checkPronunciation(transcript)
      }

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error)
        setError('Speech recognition failed. Please try again.')
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [checkPronunciation])

  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const editDistance = levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  const startRecording = async () => {
    try {
      setError('')
      setTranscript('')
      setPronunciationScore(null)
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' })
        setAudioBlob(audioBlob)
        
        // Start speech recognition
        if (recognitionRef.current) {
          recognitionRef.current.start()
        }
        
        onRecordingStop?.()
      }

      mediaRecorder.start()
      setIsRecordingState(true)
      setRecordingTime(0)
      onRecordingStart?.()

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording()
            return maxDuration
          }
          return prev + 1
        })
      }, 1000)

    } catch (error) {
      console.error('Error starting recording:', error)
      setError('Microphone access denied. Please allow microphone access and try again.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecordingState) {
      mediaRecorderRef.current.stop()
      setIsRecordingState(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }

  const playRecording = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob)
      audioRef.current = new Audio(audioUrl)
      audioRef.current.play()
      setIsPlaying(true)
      
      audioRef.current.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }
    }
  }

  const submitRecording = () => {
    if (audioBlob && transcript) {
      setIsProcessing(true)
      onRecordingComplete(audioBlob, transcript)
      setIsProcessing(false)
    }
  }

  const resetRecording = () => {
    setAudioBlob(null)
    setTranscript('')
    setPronunciationScore(null)
    setRecordingTime(0)
    setError('')
    
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsPlaying(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Recording Controls */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        {!isRecordingState && !audioBlob && (
          <button
            onClick={startRecording}
            disabled={disabled}
            className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-full font-medium transition-colors"
          >
            <Mic className="h-5 w-5" />
            <span>Start Recording</span>
          </button>
        )}

        {isRecordingState && (
          <button
            onClick={stopRecording}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-medium transition-colors animate-pulse"
          >
            <MicOff className="h-5 w-5" />
            <span>Stop Recording</span>
          </button>
        )}

        {audioBlob && !isRecordingState && (
          <div className="flex items-center space-x-2">
            <button
              onClick={playRecording}
              disabled={isPlaying}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isPlaying ? 'Playing' : 'Play'}</span>
            </button>

            <button
              onClick={resetRecording}
              className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>

      {/* Recording Timer */}
      {isRecordingState && (
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-red-500">
            {formatTime(recordingTime)}
          </div>
          <div className="text-sm text-gray-600">
            Max: {formatTime(maxDuration)}
          </div>
        </div>
      )}

      {/* Target Text */}
      {targetText && (
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Target Text:</h4>
          <p className="text-gray-700 italic">&quot;{targetText}&quot;</p>
        </div>
      )}

      {/* Transcript */}
      {transcript && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-2">You said:</h4>
          <p className="text-gray-700">&quot;{transcript}&quot;</p>
        </div>
      )}

      {/* Pronunciation Score */}
      {pronunciationScore !== null && (
        <div className="flex items-center justify-center space-x-2 mb-4">
          {pronunciationScore >= 70 ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <span className={`font-medium ${
            pronunciationScore >= 70 ? 'text-green-600' : 'text-red-600'
          }`}>
            Pronunciation: {pronunciationScore}%
          </span>
        </div>
      )}

      {/* Submit Button */}
      {audioBlob && transcript && (
        <div className="text-center">
          <button
            onClick={submitRecording}
            disabled={isProcessing}
            className="bg-gradient-to-r from-[#03045e] to-[#00bfe6] hover:from-[#02033a] hover:to-[#0099cc] disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-full font-bold transition-all duration-300 hover:shadow-lg"
          >
            {isProcessing ? 'Processing...' : 'Submit Answer'}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
