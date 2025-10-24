'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import apiService from '@/services/api'
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  FileText, 
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2
} from 'lucide-react'

interface Level {
  id: number
  level_number: number
  name: string
}

interface ImportResult {
  success: boolean
  message: string
  imported_count?: number
  errors?: string[]
}

export default function BulkImport() {
  const { user, isLoggedIn, authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [levels, setLevels] = useState<Level[]>([])
  const [selectedLevel, setSelectedLevel] = useState('')
  const [fileFormat, setFileFormat] = useState<'csv' | 'json'>('csv')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setImportResult(null)
      
      // Auto-detect format based on extension
      const extension = file.name.split('.').pop()?.toLowerCase()
      if (extension === 'csv') {
        setFileFormat('csv')
      } else if (extension === 'json') {
        setFileFormat('json')
      }
    }
  }

  const handleImport = async () => {
    if (!selectedFile || !selectedLevel) {
      alert('Please select a file and level')
      return
    }

    try {
      setUploading(true)
      setImportResult(null)

      const formData = new FormData()
      formData.append('questions_file', selectedFile)
      formData.append('level_id', selectedLevel)
      formData.append('file_format', fileFormat)

      const result = await apiService.bulkImportQuestions(formData)
      setImportResult(result)

      if (result.success) {
        // Reset form
        setSelectedFile(null)
        setSelectedLevel('')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (error: any) {
      setImportResult({
        success: false,
        message: error.message || 'Network error. Please try again.'
      })
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = (format: 'csv' | 'json') => {
    const templates = {
      csv: `question_order,question_type,question_text,options,correct_answer,hint,explanation,difficulty,xp_value,time_limit_seconds,audio_url,image_url
1,mcq,"What is the capital of Pakistan?","Islamabad
Karachi
Lahore
Peshawar",Islamabad,"Think about the federal capital","Islamabad is the capital and seat of government of Pakistan",1,10,30,,
2,mcq,"Which is the largest city in Pakistan?","Karachi
Lahore
Islamabad
Faisalabad",Karachi,"Consider population size","Karachi is Pakistan's largest city by population",1,10,30,,
3,fill_blank,"Complete: The cat is ___ the table.","on
in
at
under",on,"Think about position","'On' indicates position above something",1,15,45,,
4,mcq,"Which word means 'beautiful' in Urdu?","خوبصورت
بدصورت
بڑا
چھوٹا",خوبصورت,"Positive adjective","خوبصورت means beautiful in Urdu",2,15,30,,`,
      json: JSON.stringify({
        questions: [
          {
            question_order: 1,
            question_type: "mcq",
            question_text: "What is the capital of Pakistan?",
            options: "Islamabad\nKarachi\nLahore\nPeshawar",
            correct_answer: "Islamabad",
            hint: "Think about the federal capital",
            explanation: "Islamabad is the capital and seat of government of Pakistan",
            difficulty: 1,
            xp_value: 10,
            time_limit_seconds: 30,
            audio_url: "",
            image_url: ""
          },
          {
            question_order: 2,
            question_type: "mcq",
            question_text: "Which is the largest city in Pakistan?",
            options: "Karachi\nLahore\nIslamabad\nFaisalabad",
            correct_answer: "Karachi",
            hint: "Consider population size",
            explanation: "Karachi is Pakistan's largest city by population",
            difficulty: 1,
            xp_value: 10,
            time_limit_seconds: 30,
            audio_url: "",
            image_url: ""
          }
        ]
      }, null, 2)
    }

    const blob = new Blob([templates[format]], { 
      type: format === 'csv' ? 'text/csv' : 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `questions_template.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn || (user?.role !== 'admin' && !user?.is_staff)) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-4xl font-bold text-gray-900">📥 Bulk Import Questions</h1>
          </div>
          <p className="text-gray-600">Import multiple questions from CSV or JSON files</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Import Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">📤 Import Questions</h2>
            
            <div className="space-y-6">
              {/* Level Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Level *
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a level...</option>
                  {levels.map(level => (
                    <option key={level.id} value={level.id}>
                      Level {level.level_number}: {level.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Format
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="csv"
                      checked={fileFormat === 'csv'}
                      onChange={(e) => setFileFormat(e.target.value as 'csv')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">CSV</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="json"
                      checked={fileFormat === 'json'}
                      onChange={(e) => setFileFormat(e.target.value as 'json')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">JSON</span>
                  </label>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Questions File *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center space-y-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Upload className="h-8 w-8" />
                    <span className="text-sm">
                      {selectedFile ? selectedFile.name : 'Click to select file'}
                    </span>
                  </button>
                </div>
                {selectedFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p><strong>File:</strong> {selectedFile.name}</p>
                    <p><strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
                    <p><strong>Type:</strong> {selectedFile.type || 'Unknown'}</p>
                  </div>
                )}
              </div>

              {/* Import Button */}
              <button
                onClick={handleImport}
                disabled={!selectedFile || !selectedLevel || uploading}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span>Import Questions</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Templates and Help */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Download Templates */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">📋 Download Templates</h2>
              <p className="text-gray-600 mb-4">
                Download sample templates to see the correct format for your questions file.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => downloadTemplate('csv')}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Download className="h-5 w-5" />
                  <span>Download CSV Template</span>
                </button>
                
                <button
                  onClick={() => downloadTemplate('json')}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Download className="h-5 w-5" />
                  <span>Download JSON Template</span>
                </button>
              </div>
            </div>

            {/* Format Guidelines */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">📝 Format Guidelines</h2>
              
              <div className="space-y-4 text-sm text-gray-600">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Required Fields:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>question_text - The question content</li>
                    <li>correct_answer - The correct answer</li>
                    <li>question_type - mcq, fill_blank, true_false, etc.</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Optional Fields:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>options - For MCQ (one per line)</li>
                    <li>hint - Helpful hint for students</li>
                    <li>explanation - Answer explanation</li>
                    <li>difficulty - 1 (Easy), 2 (Medium), 3 (Hard)</li>
                    <li>xp_value - Points awarded (default: 10)</li>
                    <li>time_limit_seconds - Time limit (0 = no limit)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Question Types:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>mcq - Multiple Choice Question</li>
                    <li>fill_blank - Fill in the Blank</li>
                    <li>true_false - True/False</li>
                    <li>matching - Matching Question</li>
                    <li>audio - Audio-based Question</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Import Result */}
            {importResult && (
              <div className={`rounded-xl shadow-lg p-6 ${
                importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {importResult.success ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <h2 className={`text-xl font-semibold ${
                    importResult.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {importResult.success ? 'Import Successful!' : 'Import Failed'}
                  </h2>
                </div>
                
                <p className={`text-sm ${
                  importResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {importResult.message}
                </p>
                
                {importResult.imported_count && (
                  <p className="text-sm text-green-700 mt-2">
                    Successfully imported {importResult.imported_count} questions.
                  </p>
                )}
                
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-3">
                    <h3 className="text-sm font-semibold text-red-800 mb-2">Errors:</h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      {importResult.errors.map((error, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
